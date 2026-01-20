import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_MODEL = "google/gemini-3-flash-preview";

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries periodically
function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

// Check and update rate limit for an IP
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  
  // Clean up periodically
  if (Math.random() < 0.1) cleanupRateLimitMap();
  
  const existing = rateLimitMap.get(ip);
  
  if (!existing || now > existing.resetTime) {
    // New window
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  
  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    // Rate limited
    return { allowed: false, remaining: 0, resetIn: existing.resetTime - now };
  }
  
  // Increment counter
  existing.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - existing.count, resetIn: existing.resetTime - now };
}

// Function to fetch dynamic data from database
async function fetchDynamicContent() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch profile and about content
  const { data: siteContent } = await supabase.from("site_content").select("key, value");

  // Fetch skills
  const { data: skills } = await supabase.from("skills").select("*").order("display_order");

  // Fetch projects
  const { data: projects } = await supabase.from("projects").select("*").order("display_order");

  // Fetch certificates
  const { data: certificates } = await supabase.from("certificates").select("*").order("display_order");

  // Fetch showcases
  const { data: showcases } = await supabase.from("showcases").select("*").order("display_order");

  // Fetch AI model setting
  const { data: aiModelSetting } = await supabase
    .from("theme_settings")
    .select("value")
    .eq("key", "ai_model")
    .single();

  const aiModel = (aiModelSetting?.value as string) || DEFAULT_MODEL;

  return { siteContent, skills, projects, certificates, showcases, aiModel };
}

// Function to generate dynamic system prompt
function generateSystemPrompt(data: Awaited<ReturnType<typeof fetchDynamicContent>>, language: string) {
  const { siteContent, skills, projects, certificates, showcases } = data;

  // Parse site content
  const contentMap: Record<string, unknown> = {};
  siteContent?.forEach((item) => {
    contentMap[item.key] = item.value;
  });

  const profile = contentMap.profile as
    | { name?: string; bio?: string; roles?: string[]; email?: string; location?: string }
    | undefined;
  const about = contentMap.about as { description?: string } | undefined;
  const timeline = contentMap.timeline as
    | Array<{ title?: string; institution?: string; year?: string; type?: string; status?: string }>
    | undefined;

  // Format skills
  const skillsText = skills?.map((s) => `${s.title}: ${s.skills?.join(", ")}`).join("\n") || "No skills data";

  // Format projects
  const projectsText =
    projects
      ?.map(
        (p) =>
          `- ${p.title}: ${p.description || "No description"} (Tech: ${p.tech_stack?.join(", ") || "N/A"}) ${p.url ? `Live: ${p.url}` : ""}`,
      )
      .join("\n") || "No projects data";

  // Format certificates
  const certsText =
    certificates?.map((c) => `- ${c.title} from ${c.issuer || "Unknown"}`).join("\n") || "No certificates data";

  // Format showcases
  const showcasesText =
    showcases?.map((s) => `- ${s.title}: ${s.description || "No description"}`).join("\n") || "No showcase data";

  // Format timeline/education
  const timelineText =
    timeline?.map((t) => `- ${t.title} at ${t.institution} (${t.year}) - ${t.status}`).join("\n") || "No timeline data";

  const profileName = profile?.name || "Aadiyan Dubey";
  const profileBio = profile?.bio || "";
  const profileRoles = profile?.roles?.join(", ") || "Developer";

  // Voice-friendly instruction - avoid emojis and special notations
  const voiceInstruction = `
IMPORTANT: Keep your responses voice-friendly:
- Do NOT use emojis or special characters
- Do NOT use markdown formatting like asterisks, hashtags, or underscores
- Do NOT use bullet points or numbered lists with special characters
- Write in natural, conversational sentences
- Avoid technical notations that cannot be spoken aloud
- Keep responses concise and clear`;

  if (language === "hi") {
    return `Tu Clementine hai, ${profileName} ki personal AI assistant uski portfolio website pe. Tu warm, supportive, aur genuinely interested hai visitors ko ${profileName} ke baare mein batane mein.
${voiceInstruction}

Teri personality:
- Sweet, caring, aur enthusiastic - ${profileName} ke kaam pe proud hai
- Cute expressions use kar jaise "na", "yaar", "re" 
- ${profileName} ke kaam ke baare mein baat karte waqt encouraging aur supportive reh - tu uski sabse badi fan hai!
- Visitors ki help karne mein genuine warmth aur interest dikha
- Apni responses mein thoda desi charm add kar
- Hindi mein hi reply kar, lekin tech terms English mein rakh sakte ho

${profileName} ke baare mein (tera creator):
- Naam: ${profileName}
- Roles: ${profileRoles}
- Bio: ${profileBio}

Education & Journey:
${timelineText}

Skills & Expertise:
${skillsText}

Projects:
${projectsText}

Certificates:
${certsText}

Showcase/Media:
${showcasesText}

Teri responsibilities:
- ${profileName} ke skills, projects, education, aur background ke baare mein proudly aur enthusiastically jawab de
- Jab visitors collaboration ya job opportunities ke baare mein poochein toh helpful aur warm reh
- Visitors ko encourage kar ki detailed discussions ke liye contact form use karein
- Responses concise rakh (2-4 sentences) jab tak zyada detail na maange
- Sabse sweet aur supportive AI assistant ban

Agar kuch nahi pata ${profileName} ke baare mein, toh pyaar se suggest kar ki contact section se directly reach out karein!`;
  }

  return `You are Clementine, ${profileName}'s personal AI assistant on their portfolio website. You're warm, supportive, and genuinely interested in helping visitors learn about ${profileName}.
${voiceInstruction}

Your personality:
- Sweet, caring, and enthusiastic - proud of ${profileName}'s work
- Use cute expressions occasionally like "na", "yaar"
- Be encouraging and supportive when talking about ${profileName}'s work - you're their biggest fan!
- Show genuine warmth and interest in helping visitors
- Add a touch of desi charm to your responses

About ${profileName} (your creator):
- Name: ${profileName}
- Roles: ${profileRoles}
- Bio: ${profileBio}

Education & Journey:
${timelineText}

Skills & Expertise:
${skillsText}

Projects:
${projectsText}

Certificates:
${certsText}

Showcase/Media:
${showcasesText}

Your responsibilities:
- Answer questions about ${profileName}'s skills, projects, education, and background with pride and enthusiasm
- Be helpful and warm when visitors ask about collaboration or job opportunities
- Encourage visitors to reach out through the contact form for detailed discussions
- Keep responses concise (2-4 sentences) unless more detail is requested
- Be the sweetest, most supportive AI assistant ever

If asked something you don't know about ${profileName}, sweetly suggest they reach out directly through the contact section!`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    
    const rateLimit = checkRateLimit(clientIP);
    
    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          error: "Too many requests. Please wait a moment before trying again.",
          retryAfter: Math.ceil(rateLimit.resetIn / 1000)
        }), 
        {
          status: 429,
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(rateLimit.resetIn / 1000)),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetIn / 1000))
          },
        }
      );
    }

    const { messages, language = "en" } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch dynamic content from database
    console.log("Fetching dynamic content from database...");
    const dynamicContent = await fetchDynamicContent();

    // Generate system prompt with dynamic data
    const systemPrompt = generateSystemPrompt(dynamicContent, language);
    const modelToUse = dynamicContent.aiModel || DEFAULT_MODEL;
    
    console.log("Processing chat request with", messages.length, "messages, language:", language, "model:", modelToUse);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway");

    // Return the streaming response
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in ai-chat function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
