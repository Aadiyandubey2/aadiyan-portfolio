import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactSubmission = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing contact submission from:", name, email);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert the submission into database
    const { data, error } = await supabase
      .from("contact_submissions")
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw new Error("Failed to save submission");
    }

    console.log("Contact submission saved successfully:", data.id);

    // Send email notification via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      
      try {
        const emailResponse = await resend.emails.send({
          from: "Portfolio Contact <onboarding@resend.dev>",
          to: ["impofficialhere@gmail.com"],
          subject: `New Contact Form: ${subject.trim()}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f; color: #ffffff; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 32px; border: 1px solid #00d4ff33; }
                .header { text-align: center; margin-bottom: 32px; }
                .header h1 { color: #00d4ff; margin: 0; font-size: 24px; }
                .header p { color: #888; margin-top: 8px; }
                .field { margin-bottom: 24px; }
                .label { color: #00d4ff; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
                .value { background: #0a0a0f; padding: 16px; border-radius: 8px; border-left: 3px solid #00d4ff; }
                .message-box { background: #0a0a0f; padding: 20px; border-radius: 8px; border: 1px solid #333; white-space: pre-wrap; line-height: 1.6; }
                .footer { text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #333; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🚀 New Contact Message</h1>
                  <p>Someone reached out through your portfolio!</p>
                </div>
                
                <div class="field">
                  <div class="label">From</div>
                  <div class="value"><strong>${name.trim()}</strong></div>
                </div>
                
                <div class="field">
                  <div class="label">Email</div>
                  <div class="value"><a href="mailto:${email.trim()}" style="color: #00d4ff; text-decoration: none;">${email.trim()}</a></div>
                </div>
                
                <div class="field">
                  <div class="label">Subject</div>
                  <div class="value">${subject.trim()}</div>
                </div>
                
                <div class="field">
                  <div class="label">Message</div>
                  <div class="message-box">${message.trim()}</div>
                </div>
                
                <div class="footer">
                  <p>Sent from your portfolio contact form</p>
                  <p>Reply directly to this email to respond to ${name.trim()}</p>
                </div>
              </div>
            </body>
            </html>
          `,
          reply_to: email.trim(),
        });

        console.log("Email sent successfully:", emailResponse);
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the request if email fails - the submission is already saved
      }
    } else {
      console.warn("RESEND_API_KEY not configured - skipping email notification");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Your message has been received! I'll get back to you soon.",
        id: data.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in contact-submit function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
