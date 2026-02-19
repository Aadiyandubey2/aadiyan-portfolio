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

// Fire-and-forget translation trigger
async function triggerTranslation(items: { source_table: string; record_id: string; field_name: string; text: string }[]) {
  if (items.length === 0) return;
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  try {
    console.log(`Triggering auto-translation for ${items.length} items...`);
    await fetch(`${supabaseUrl}/functions/v1/auto-translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ items }),
    });
  } catch (e) {
    console.error('Translation trigger failed (non-blocking):', e);
  }
}

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

      // Auto-translate site content
      const translateItems: { source_table: string; record_id: string; field_name: string; text: string }[] = [];
      if (key === 'profile' && typeof value === 'object' && value) {
        const v = value as Record<string, unknown>;
        if (v.tagline) translateItems.push({ source_table: 'site_content', record_id: 'profile', field_name: 'tagline', text: String(v.tagline) });
        if (v.bio) translateItems.push({ source_table: 'site_content', record_id: 'profile', field_name: 'bio', text: String(v.bio) });
        if (Array.isArray(v.roles)) v.roles.forEach((r, i) => translateItems.push({ source_table: 'site_content', record_id: 'profile', field_name: `role_${i}`, text: String(r) }));
      }
      if (key === 'about' && typeof value === 'object' && value) {
        const v = value as Record<string, unknown>;
        if (v.description) translateItems.push({ source_table: 'site_content', record_id: 'about', field_name: 'description', text: String(v.description) });
        if (Array.isArray(v.stats)) v.stats.forEach((s: { label?: string }, i: number) => {
          if (s.label) translateItems.push({ source_table: 'site_content', record_id: 'about', field_name: `stat_label_${i}`, text: String(s.label) });
        });
      }
      if (key === 'timeline' && Array.isArray(value)) {
        value.forEach((item: { title?: string; description?: string; institution?: string }, i: number) => {
          if (item.title) translateItems.push({ source_table: 'site_content', record_id: `timeline_${i}`, field_name: 'title', text: String(item.title) });
          if (item.description) translateItems.push({ source_table: 'site_content', record_id: `timeline_${i}`, field_name: 'description', text: String(item.description) });
          if (item.institution) translateItems.push({ source_table: 'site_content', record_id: `timeline_${i}`, field_name: 'institution', text: String(item.institution) });
        });
      }
      triggerTranslation(translateItems);

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
      // Auto-translate project
      const projectId = id || 'new';
      const translateItems: { source_table: string; record_id: string; field_name: string; text: string }[] = [];
      if (projectData.title) translateItems.push({ source_table: 'projects', record_id: projectId, field_name: 'title', text: projectData.title });
      if (projectData.description) translateItems.push({ source_table: 'projects', record_id: projectId, field_name: 'description', text: projectData.description });
      triggerTranslation(translateItems);

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

    // Upload file to specific bucket (certificates/showcases/orbit-icons/portfolio-images)
    if (action === 'uploadFile') {
      const { fileName, fileData, contentType, bucket } = data;
      console.log(`Uploading file: ${fileName} to bucket: ${bucket}`);

      const allowedBuckets = ['certificates', 'showcases', 'orbit-icons', 'portfolio-images'];
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

    // Update gallery item
    if (action === 'updateGalleryItem') {
      const { id, ...itemData } = data;
      console.log(`Updating gallery item: ${id}`);

      const { error } = await supabase
        .from('gallery_items')
        .update({
          ...itemData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
      // Auto-translate gallery item
      const galTranslate: { source_table: string; record_id: string; field_name: string; text: string }[] = [];
      if (itemData.title) galTranslate.push({ source_table: 'gallery_items', record_id: id, field_name: 'title', text: itemData.title });
      if (itemData.subtitle) galTranslate.push({ source_table: 'gallery_items', record_id: id, field_name: 'subtitle', text: itemData.subtitle });
      triggerTranslation(galTranslate);

      return new Response(
        JSON.stringify({ success: true }),
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
      // Auto-translate certificate
      const certId = id || 'new';
      const certTranslate: { source_table: string; record_id: string; field_name: string; text: string }[] = [];
      if (certData.title) certTranslate.push({ source_table: 'certificates', record_id: certId, field_name: 'title', text: certData.title });
      if (certData.issuer) certTranslate.push({ source_table: 'certificates', record_id: certId, field_name: 'issuer', text: certData.issuer });
      triggerTranslation(certTranslate);

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
      // Auto-translate showcase
      const showId = id || 'new';
      const showTranslate: { source_table: string; record_id: string; field_name: string; text: string }[] = [];
      if (showcaseData.title) showTranslate.push({ source_table: 'showcases', record_id: showId, field_name: 'title', text: showcaseData.title });
      if (showcaseData.description) showTranslate.push({ source_table: 'showcases', record_id: showId, field_name: 'description', text: showcaseData.description });
      triggerTranslation(showTranslate);

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

    // Update orbit skill
    if (action === 'updateOrbitSkill') {
      const { id, ...skillData } = data;
      console.log(`Updating orbit skill: ${id || 'new'}`);

      // Check if id is a temp id (starts with 'new-')
      const isNew = !id || id.startsWith('new-');

      if (isNew) {
        // Remove temp id before inserting
        const { error } = await supabase
          .from('orbit_skills')
          .insert({
            name: skillData.name,
            icon: skillData.icon,
            icon_url: skillData.icon_url || null,
            color: skillData.color,
            orbit_index: skillData.orbit_index,
            display_order: skillData.display_order,
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('orbit_skills')
          .update({
            name: skillData.name,
            icon: skillData.icon,
            icon_url: skillData.icon_url || null,
            color: skillData.color,
            orbit_index: skillData.orbit_index,
            display_order: skillData.display_order,
          })
          .eq('id', id);
        if (error) throw error;
      }
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete orbit skill
    if (action === 'deleteOrbitSkill') {
      const { id } = data;
      console.log(`Deleting orbit skill: ${id}`);
      
      const { error } = await supabase.from('orbit_skills').delete().eq('id', id);
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
