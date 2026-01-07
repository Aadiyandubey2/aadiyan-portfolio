import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const errorToMessage = (err: unknown) => {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, secretCode, data } = await req.json();
    console.log(`Admin API called with action: ${action}`);

    // Verify secret code for all actions except 'verify'
    if (action !== 'verify') {
      const { data: adminData, error: adminError } = await supabase
        .from('admin_settings')
        .select('secret_code')
        .single();

      if (adminError || !adminData || adminData.secret_code !== secretCode) {
        console.log('Invalid secret code attempt');
        return new Response(
          JSON.stringify({ error: 'Invalid secret code' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Verify action - just check if code is correct
    if (action === 'verify') {
      const { data: adminData, error: adminError } = await supabase
        .from('admin_settings')
        .select('secret_code')
        .single();

      if (adminError || !adminData || adminData.secret_code !== secretCode) {
        return new Response(
          JSON.stringify({ valid: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ valid: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update site content
    if (action === 'updateContent') {
      const { key, value } = data;
      console.log(`Updating site content: ${key}`);
      
      const { error } = await supabase
        .from('site_content')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

      if (error) {
        console.error('Error updating content:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update skills
    if (action === 'updateSkill') {
      const { id, ...skillData } = data;
      console.log(`Updating skill: ${id}`);

      if (id) {
        const { error } = await supabase
          .from('skills')
          .update(skillData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('skills')
          .insert(skillData);
        if (error) throw error;
      }
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete skill
    if (action === 'deleteSkill') {
      const { id } = data;
      console.log(`Deleting skill: ${id}`);
      
      const { error } = await supabase.from('skills').delete().eq('id', id);
      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update project
    if (action === 'updateProject') {
      const { id, ...projectData } = data;
      console.log(`Updating project: ${id || 'new'}`);

      if (id) {
        const { error } = await supabase
          .from('projects')
          .update({ ...projectData, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('projects')
          .insert(projectData);
        if (error) throw error;
      }
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete project
    if (action === 'deleteProject') {
      const { id } = data;
      console.log(`Deleting project: ${id}`);
      
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update resume URL
    if (action === 'updateResume') {
      const { file_url, file_name } = data;
      console.log(`Updating resume: ${file_name}`);
      
      // Delete old resumes
      await supabase.from('resume').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert new
      const { error } = await supabase
        .from('resume')
        .insert({ file_url, file_name });
      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload image to storage
    if (action === 'uploadImage') {
      const { fileName, fileData, contentType, folder = 'projects' } = data;
      console.log(`Uploading image: ${fileName} to folder: ${folder}`);
      
      // Decode base64 file data
      const bytes = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));
      
      const { data: uploadData, error } = await supabase.storage
        .from('portfolio-images')
        .upload(`${folder}/${Date.now()}-${fileName}`, bytes, {
          contentType: contentType || 'image/png',
          upsert: true
        });
      
      if (error) {
        console.error('Upload error:', error);
        throw error;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(uploadData.path);
      
      console.log(`Image uploaded: ${urlData.publicUrl}`);
      return new Response(
        JSON.stringify({ success: true, url: urlData.publicUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Change secret code
    if (action === 'changeCode') {
      const { newCode } = data;
      console.log('Changing admin secret code');
      
      const { error } = await supabase
        .from('admin_settings')
        .update({ secret_code: newCode })
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload file to specific bucket (certificates/showcases)
    if (action === 'uploadFile') {
      const { fileName, fileData, contentType, bucket } = data;
      console.log(`Uploading file: ${fileName} to bucket: ${bucket}`);

      const allowedBuckets = ['certificates', 'showcases'];
      if (!allowedBuckets.includes(bucket)) {
        return new Response(
          JSON.stringify({ error: 'Invalid bucket' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const bytes = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));
      
      const { data: uploadData, error } = await supabase.storage
        .from(bucket)
        .upload(`${Date.now()}-${fileName}`, bytes, {
          contentType: contentType,
          upsert: true
        });
      
      if (error) {
        console.error('Upload error:', error);
        throw error;
      }
      
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);
      
      console.log(`File uploaded: ${urlData.publicUrl}`);
      return new Response(
        JSON.stringify({ success: true, url: urlData.publicUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create/Update certificate
    if (action === 'updateCertificate') {
      const { id, ...certData } = data;
      console.log(`Updating certificate: ${id || 'new'}`);

      const normalized = {
        ...certData,
        issuer: certData.issuer || null,
        issue_date: certData.issue_date || null,
        image_url: certData.image_url || null,
        display_order: certData.display_order ?? 0,
      };

      if (id) {
        const { error } = await supabase
          .from('certificates')
          .update(normalized)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('certificates')
          .insert(normalized);
        if (error) throw error;
      }
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete certificate
    if (action === 'deleteCertificate') {
      const { id } = data;
      console.log(`Deleting certificate: ${id}`);
      
      const { error } = await supabase.from('certificates').delete().eq('id', id);
      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create/Update showcase
    if (action === 'updateShowcase') {
      const { id, ...showcaseData } = data;
      console.log(`Updating showcase: ${id || 'new'}`);

      const normalized = {
        ...showcaseData,
        description: showcaseData.description || null,
        video_url: showcaseData.video_url || null,
        thumbnail_url: showcaseData.thumbnail_url || null,
        display_order: showcaseData.display_order ?? 0,
        media_type: showcaseData.media_type || 'video',
        external_url: showcaseData.external_url || null,
      };

      if (id) {
        const { error } = await supabase
          .from('showcases')
          .update(normalized)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('showcases')
          .insert(normalized);
        if (error) throw error;
      }
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete showcase
    if (action === 'deleteShowcase') {
      const { id } = data;
      console.log(`Deleting showcase: ${id}`);
      
      const { error } = await supabase.from('showcases').delete().eq('id', id);
      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update theme settings
    if (action === 'updateTheme') {
      const { key, value } = data;
      const { error } = await supabase
        .from('theme_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = errorToMessage(error);
    console.error('Admin API error:', errorMessage);
    console.error('Admin API raw error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
