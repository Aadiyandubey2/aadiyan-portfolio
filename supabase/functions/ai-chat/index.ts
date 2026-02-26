import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_MODEL = "google/gemini-3-flash-preview";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  {
    attempts,
    retryOnStatuses,
    backoffMs,
    label,
  }: {
    attempts: number;
    retryOnStatuses: number[];
    backoffMs: number;
    label: string;
  },
): Promise<Response> {
  let lastResp: Response | null = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const resp = await fetch(url, init);
      lastResp = resp;

      if (!retryOnStatuses.includes(resp.status) || attempt === attempts) {
        return resp;
      }

      const errText = await resp.text().catch(() => "");
      console.warn(
        `${label} attempt ${attempt}/${attempts} got ${resp.status}. Retrying...`,
        errText ? errText.slice(0, 500) : "",
      );
    } catch (e) {
      console.error(`${label} attempt ${attempt}/${attempts} network error:`, e);
      if (attempt === attempts) throw e;
    }

    await sleep(backoffMs * attempt);
  }

  return lastResp ?? new Response("Upstream error", { status: 502 });
}

// Rate limiting
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) rateLimitMap.delete(ip);
  }
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  if (Math.random() < 0.1) cleanupRateLimitMap();
  const existing = rateLimitMap.get(ip);
  if (!existing || now > existing.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetIn: existing.resetTime - now };
  }
  existing.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - existing.count, resetIn: existing.resetTime - now };
}

// ── Fallback API type ──
interface FallbackConfig {
  id: string;
  label: string;
  provider: string;
  baseUrl: string;
  model: string;
  apiKey: string;
  enabled: boolean;
}

// Fetch dynamic content from database
async function fetchDynamicContent() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: siteContent } = await supabase.from("site_content").select("key, value");
  const { data: skills } = await supabase.from("skills").select("*").order("display_order");
  const { data: projects } = await supabase.from("projects").select("*").order("display_order");
  const { data: certificates } = await supabase.from("certificates").select("*").order("display_order");
  const { data: showcases } = await supabase.from("showcases").select("*").order("display_order");

  // Fetch AI settings
  const { data: aiSettings } = await supabase
    .from("theme_settings")
    .select("key, value")
    .or("key.eq.ai_model,key.eq.custom_api_enabled,key.eq.custom_api_fallbacks,key.like.custom_api_key_%");

  const settingsMap: Record<string, unknown> = {};
  aiSettings?.forEach(setting => {
    settingsMap[setting.key] = setting.value;
  });

  const aiModel = (settingsMap.ai_model as string) || DEFAULT_MODEL;
  const useCustomApi = settingsMap.custom_api_enabled === true || settingsMap.custom_api_enabled === "true";

  // Parse fallback chain
  let fallbacks: FallbackConfig[] = [];
  try {
    const raw = settingsMap.custom_api_fallbacks;
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) {
      fallbacks = parsed
        .filter((f: Record<string, unknown>) => f.enabled !== false)
        .map((f: Record<string, unknown>) => ({
          id: f.id as string,
          label: (f.label as string) || "",
          provider: (f.provider as string) || "openai",
          baseUrl: (f.baseUrl as string) || "",
          model: (f.model as string) || "",
          apiKey: (settingsMap[`custom_api_key_${f.id}`] as string) || "",
          enabled: true,
        }))
        .filter((f: FallbackConfig) => f.apiKey && f.model && f.baseUrl);
    }
  } catch {
    console.error("Failed to parse fallback chain");
  }

  // Legacy single-key support
  if (fallbacks.length === 0 && useCustomApi) {
    const legacyKey = (settingsMap.custom_api_key as string) || "";
    const legacyProvider = (settingsMap.custom_api_provider as string) || "";
    const legacyBaseUrl = (settingsMap.custom_api_base_url as string) || "";
    const legacyModel = (settingsMap.custom_api_model as string) || "";
    if (legacyKey && legacyModel && legacyBaseUrl) {
      fallbacks = [{ id: "legacy", label: "Legacy", provider: legacyProvider, baseUrl: legacyBaseUrl, model: legacyModel, apiKey: legacyKey, enabled: true }];
    }
  }

  return { siteContent, skills, projects, certificates, showcases, aiModel, useCustomApi, fallbacks };
}

// Generate system prompt
function generateSystemPrompt(data: Awaited<ReturnType<typeof fetchDynamicContent>>, language: string) {
  const { siteContent, skills, projects, certificates, showcases } = data;

  const contentMap: Record<string, unknown> = {};
  siteContent?.forEach((item) => { contentMap[item.key] = item.value; });

  const profile = contentMap.profile as { name?: string; bio?: string; roles?: string[]; email?: string; location?: string } | undefined;
  const about = contentMap.about as { description?: string } | undefined;
  const timeline = contentMap.timeline as Array<{ title?: string; institution?: string; year?: string; type?: string; status?: string }> | undefined;

  const skillsText = skills?.map((s) => `${s.title}: ${s.skills?.join(", ")}`).join("\n") || "No skills data";
  const projectsText = projects?.map((p) => `- ${p.title}: ${p.description || "No description"} (Tech: ${p.tech_stack?.join(", ") || "N/A"}) ${p.url ? `Live: ${p.url}` : ""}`).join("\n") || "No projects data";
  const certsText = certificates?.map((c) => `- ${c.title} from ${c.issuer || "Unknown"}`).join("\n") || "No certificates data";
  const showcasesText = showcases?.map((s) => `- ${s.title}: ${s.description || "No description"}`).join("\n") || "No showcase data";
  const timelineText = timeline?.map((t) => `- ${t.title} at ${t.institution} (${t.year}) - ${t.status}`).join("\n") || "No timeline data";

  const profileName = profile?.name || "Aadiyan Dubey";
  const profileBio = profile?.bio || "";
  const profileRoles = profile?.roles?.join(", ") || "Developer";

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

// ── Build custom API request for a given provider ──
function buildCustomRequest(
  config: FallbackConfig,
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  testMode: boolean,
): { url: string; init: RequestInit } {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  let apiUrl = config.baseUrl;
  let body: Record<string, unknown>;

  if (config.provider === "anthropic") {
    apiUrl = config.baseUrl.endsWith('/messages') ? config.baseUrl : `${config.baseUrl.replace(/\/$/, '')}/messages`;
    headers["x-api-key"] = config.apiKey;
    headers["anthropic-version"] = "2023-06-01";
    body = {
      model: config.model,
      max_tokens: testMode ? 50 : 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
      stream: true,
    };
  } else if (config.provider === "google") {
    apiUrl = `${config.baseUrl.replace(/\/$/, '')}/models/${config.model}:streamGenerateContent?key=${config.apiKey}`;
    body = {
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
      ],
      generationConfig: testMode ? { maxOutputTokens: 50 } : undefined,
    };
  } else {
    const baseUrl = config.baseUrl.replace(/\/$/, '');
    apiUrl = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
    headers["Authorization"] = `Bearer ${config.apiKey}`;
    body = {
      model: config.model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
      max_tokens: testMode ? 50 : undefined,
    };
  }

  return { url: apiUrl, init: { method: "POST", headers, body: JSON.stringify(body) } };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a moment before trying again.", retryAfter: Math.ceil(rateLimit.resetIn / 1000) }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(Math.ceil(rateLimit.resetIn / 1000)) } }
      );
    }

    const { messages, language = "en", testMode = false, testConfig, mode = "chat", userModel } = await req.json();

    // ===== IMAGE GENERATION MODE =====
    if (mode === "image-gen") {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return new Response(JSON.stringify({ error: "AI Gateway not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const userPrompt = messages?.[0]?.content || "a beautiful landscape";
      try {
        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "google/gemini-2.5-flash-image", messages: [{ role: "user", content: userPrompt }], modalities: ["image", "text"] }),
        });
        if (!resp.ok) {
          const status = resp.status;
          if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          return new Response(JSON.stringify({ error: "Image generation failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        const data = await resp.json();
        const textContent = data.choices?.[0]?.message?.content || "";
        const images = data.choices?.[0]?.message?.images?.map((img: { image_url: { url: string } }) => img.image_url.url) || [];
        return new Response(JSON.stringify({ text: textContent, images }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (e) {
        console.error("Image gen error:", e);
        return new Response(JSON.stringify({ error: "Image generation failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // ===== VIDEO GENERATION MODE =====
    if (mode === "video-gen") {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return new Response(JSON.stringify({ error: "AI Gateway not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const userPrompt = messages?.[0]?.content || "a beautiful landscape animation";
      try {
        // First generate a starting frame image
        const imageResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "google/gemini-3-pro-image-preview", messages: [{ role: "user", content: `Generate a high quality cinematic image for this video concept: ${userPrompt}. Make it photorealistic and suitable as a starting frame for a video.` }], modalities: ["image", "text"] }),
        });

        let startingFrameUrl = "";
        if (imageResp.ok) {
          const imageData = await imageResp.json();
          const images = imageData.choices?.[0]?.message?.images?.map((img: { image_url: { url: string } }) => img.image_url.url) || [];
          if (images.length > 0) startingFrameUrl = images[0];
        }

        // Use the AI to generate a descriptive video prompt
        const promptResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "openai/gpt-5-nano", messages: [{ role: "user", content: `Create a detailed, cinematic video generation prompt (2-3 sentences) for: "${userPrompt}". Include camera movement, lighting, and motion details. Return ONLY the prompt text, nothing else.` }] }),
        });
        let enhancedPrompt = userPrompt;
        if (promptResp.ok) {
          const promptData = await promptResp.json();
          enhancedPrompt = promptData.choices?.[0]?.message?.content?.trim() || userPrompt;
        }

        // Return the data for the client to display
        // Since we can't run server-side video gen here, return the image as a "video frame" with instructions
        const responseData: Record<string, unknown> = {
          text: `Video concept generated for: "${userPrompt}"\n\nEnhanced prompt: ${enhancedPrompt}`,
          videoUrl: startingFrameUrl || "",
          prompt: enhancedPrompt,
        };

        if (startingFrameUrl) {
          responseData.text = `Here is your generated video concept with a starting frame.\n\nPrompt: ${enhancedPrompt}`;
          responseData.videoUrl = startingFrameUrl;
        }

        return new Response(JSON.stringify(responseData), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (e) {
        console.error("Video gen error:", e);
        return new Response(JSON.stringify({ error: "Video generation failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // ===== SUGGEST MODE =====
    if (mode === "suggest") {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) return new Response(JSON.stringify({ suggestions: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const last4 = (messages || []).slice(-4);
      const convoSnippet = last4.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join("\n");
      const suggestPrompt = language === "hi"
        ? `Niche ek conversation hai Aadiyan Dubey ki portfolio website pe. 3 chhote follow-up sawaal suggest kar jo visitor pooch sakta hai. Har sawaal 8 words se kam ho. Sirf JSON array return kar, koi explanation nahi. No emoji. Hindi mein likh lekin tech terms English mein rakh.\n\nConversation:\n${convoSnippet}`
        : `Below is a conversation on Aadiyan Dubey's portfolio website. Suggest 3 short follow-up questions a visitor might ask next. Each question must be under 8 words. Return ONLY a JSON array of strings, no explanation, no emoji.\n\nConversation:\n${convoSnippet}`;
      try {
        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "openai/gpt-5-nano", messages: [{ role: "user", content: suggestPrompt }] }),
        });
        if (!resp.ok) return new Response(JSON.stringify({ suggestions: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        const data = await resp.json();
        const raw = data.choices?.[0]?.message?.content || "[]";
        const match = raw.match(/\[.*\]/s);
        const suggestions = match ? JSON.parse(match[0]) : [];
        return new Response(JSON.stringify({ suggestions: suggestions.slice(0, 3) }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch {
        return new Response(JSON.stringify({ suggestions: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // ===== EXTRACT MODE =====
    if (mode === "extract") {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) return new Response(JSON.stringify({ error: "AI Gateway not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const personQuery = messages?.[messages.length - 1]?.content || "";
      const gatewayUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
      const gatewayHeaders = { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" };

      async function analysisTool(model: string, systemPrompt: string, userContent: string): Promise<string> {
        const resp = await fetchWithRetry(gatewayUrl, {
          method: "POST", headers: gatewayHeaders,
          body: JSON.stringify({ model, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userContent }] }),
        }, { attempts: 2, retryOnStatuses: [500, 502, 503], backoffMs: 300, label: `tool-${model}` });
        if (!resp.ok) return "[Analysis unavailable]";
        const data = await resp.json();
        return data.choices?.[0]?.message?.content || "[No data returned]";
      }

      try {
        const [bioIntel, techIntel, socialIntel, careerIntel, eduIntel, mediaIntel, reputationIntel, contentIntel, networkIntel, psychoIntel] = await Promise.all([
          analysisTool("openai/gpt-5.2", `You are a biographical intelligence analyst. Extract EVERY identity detail about this person: Full legal name, aliases, nicknames, online handles, username patterns, Date of birth, age, zodiac, nationality, ethnicity, hometown, current city, Family: parents, siblings, spouse, children, Languages spoken, Net worth if public. Be exhaustive. Mark uncertain data as [UNVERIFIED].`, personQuery),
          analysisTool("google/gemini-2.5-pro", `You are a technical skills analyst. Extract ALL technical capabilities: Programming languages with proficiency, Frameworks, tools, platforms, Cloud platforms, DevOps, Databases, AI/ML, Security certifications. Be exhaustive. Mark uncertain as [UNVERIFIED].`, personQuery),
          analysisTool("google/gemini-3-flash-preview", `You are a digital footprint analyst. Map COMPLETE online presence: LinkedIn, Twitter/X, GitHub, Instagram, YouTube, TikTok, Reddit, Medium, Dev.to, personal websites, blogs. For each: username, follower count, activity level. Be exhaustive. Mark uncertain as [UNVERIFIED].`, personQuery),
          analysisTool("openai/gpt-5", `You are a career intelligence analyst. Build a complete professional timeline: Every job with company, role, dates, responsibilities. Startups, freelance, consulting. Be exhaustive. Mark uncertain as [UNVERIFIED].`, personQuery),
          analysisTool("google/gemini-2.5-flash", `You are an academic intelligence analyst. Extract ALL education details: Schools, universities, degrees, GPA, honors, Research papers, patents, Google Scholar profile. Be exhaustive. Mark uncertain as [UNVERIFIED].`, personQuery),
          analysisTool("openai/gpt-5-mini", `You are a media intelligence analyst. Find ALL public appearances: News articles, podcast appearances, YouTube videos, conference talks, webinars. Be exhaustive. Mark uncertain as [UNVERIFIED].`, personQuery),
          analysisTool("google/gemini-2.5-flash-lite", `You are a reputation analyst. Assess community standing: Stack Overflow, GitHub stars, open source roles, awards, hackathons, certifications, volunteer work. Be exhaustive. Mark uncertain as [UNVERIFIED].`, personQuery),
          analysisTool("openai/gpt-5-nano", `You are a content intelligence analyst. Find ALL content created: Blog posts, technical articles, newsletters, courses, books, video tutorials. Be exhaustive. Mark uncertain as [UNVERIFIED].`, personQuery),
          analysisTool("google/gemini-3-pro-preview", `You are a network intelligence analyst. Map professional and personal networks: Collaborators, co-founders, co-authors, board positions, investments, advisory roles, nonprofits, alumni networks. Be exhaustive. Mark uncertain as [UNVERIFIED].`, personQuery),
          analysisTool("google/gemini-2.5-flash", `You are a behavioral intelligence analyst. Profile interests and patterns: Hobbies, sports, travel, music, reading, side projects, gaming, causes supported. Be exhaustive. Mark uncertain as [UNVERIFIED].`, personQuery),
        ]);

        const synthesisPrompt = `You are a senior OSINT intelligence report compiler. You have received data from 10 specialized analysis tools about "${personQuery}". Synthesize ALL findings into one comprehensive intelligence report.

RAW INTELLIGENCE DATA:

=== IDENTITY & BIOGRAPHY === ${bioIntel}
=== TECHNICAL SKILLS === ${techIntel}
=== DIGITAL FOOTPRINT === ${socialIntel}
=== CAREER TIMELINE === ${careerIntel}
=== EDUCATION === ${eduIntel}
=== MEDIA APPEARANCES === ${mediaIntel}
=== REPUTATION === ${reputationIntel}
=== CONTENT === ${contentIntel}
=== NETWORK === ${networkIntel}
=== BEHAVIORAL PROFILE === ${psychoIntel}

INSTRUCTIONS: Merge, deduplicate, cross-reference. If 3+ tools agree mark Confirmed, if 2 agree mark Likely, if 1 reports mark Unverified. Include EVERY detail found. Use profile image from GitHub if available.

FORMAT as a comprehensive intelligence report with sections for Identity, Career, Education, Skills, Digital Footprint, Achievements, Media, Content, Network, Interests, Contact, and Deep Search Links.`;

        const resp = await fetchWithRetry(gatewayUrl, {
          method: "POST", headers: gatewayHeaders,
          body: JSON.stringify({ model: userModel || "openai/gpt-5.2", messages: [{ role: "system", content: synthesisPrompt }, { role: "user", content: `Compile the complete intelligence report for: ${personQuery}` }], stream: true }),
        }, { attempts: 2, retryOnStatuses: [500, 502, 503], backoffMs: 300, label: "extract-synthesis" });

        if (!resp.ok) return new Response(JSON.stringify({ error: "Data extraction failed" }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(resp.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } });
      } catch (e) {
        console.error("Extract error:", e);
        return new Response(JSON.stringify({ error: "Data extraction failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // ===== CHAT MODE =====
    console.log("Fetching dynamic content from database...");
    const dynamicContent = await fetchDynamicContent();

    // For test mode, use provided test config
    const isTestWithConfig = testMode && testConfig;

    const systemPrompt = testMode
      ? "You are a test assistant. Respond with just 'test' to confirm the connection works."
      : generateSystemPrompt(dynamicContent, language);

    let response: Response | null = null;

    // ── Try custom API fallback chain ──
    if (isTestWithConfig) {
      // Test a specific config
      const config: FallbackConfig = {
        id: "test",
        label: "Test",
        provider: testConfig.provider,
        baseUrl: testConfig.baseUrl,
        model: testConfig.model,
        apiKey: testConfig.apiKey || "",
        enabled: true,
      };

      const { url, init } = buildCustomRequest(config, systemPrompt, messages, true);
      try {
        response = await fetch(url, init);
      } catch (fetchError) {
        console.error("Test fetch error:", fetchError);
        return new Response(JSON.stringify({ error: `Network error: Unable to connect to ${url}` }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (dynamicContent.useCustomApi && dynamicContent.fallbacks.length > 0) {
      // Try each fallback in order
      for (const fb of dynamicContent.fallbacks) {
        console.log(`Trying custom API fallback: ${fb.label} (${fb.provider}/${fb.model})`);
        const { url, init } = buildCustomRequest(fb, systemPrompt, messages, false);
        try {
          const resp = await fetch(url, init);
          if (resp.ok) {
            console.log(`Custom API ${fb.label} succeeded`);
            response = resp;
            break;
          }
          // Any non-OK: log and try next
          const errText = await resp.text().catch(() => "");
          console.warn(`Custom API ${fb.label} returned ${resp.status}: ${errText.slice(0, 200)}`);
          // Continue to next fallback
        } catch (e) {
          console.error(`Custom API ${fb.label} network error:`, e);
        }
      }

      // If all custom APIs failed, fall through to built-in gateway
      if (!response) {
        console.log("All custom APIs failed, falling back to built-in gateway");
      }
    }

    // ── Built-in AI Gateway (default or final fallback) ──
    if (!response) {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        throw new Error("Built-in AI Gateway is not configured");
      }

      // Only use models that are valid on the Lovable AI gateway
      const VALID_GATEWAY_MODELS = [
        "google/gemini-3-flash-preview", "google/gemini-2.5-flash", "google/gemini-2.5-flash-lite",
        "google/gemini-2.5-pro", "google/gemini-3-pro-preview",
        "openai/gpt-5-nano", "openai/gpt-5-mini", "openai/gpt-5", "openai/gpt-5.2",
      ];
      const rawModel = userModel || (dynamicContent.aiModel as string) || DEFAULT_MODEL;
      const preferredModel = VALID_GATEWAY_MODELS.includes(rawModel) ? rawModel : DEFAULT_MODEL;
      const candidateModels = Array.from(new Set([preferredModel, "google/gemini-2.5-flash", "google/gemini-2.5-flash-lite"]));
      const gatewayUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
      const gatewayHeaders = { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" };

      let lastGatewayResp: Response | null = null;
      for (const modelToUse of candidateModels) {
        console.log("Using built-in AI Gateway, model:", modelToUse);

        const formattedMessages = messages.map((m: { role: string; content: string; images?: string[] }) => {
          if (m.images && m.images.length > 0) {
            return {
              role: m.role,
              content: [
                { type: "text", text: m.content },
                ...m.images.map((imgUrl: string) => ({ type: "image_url", image_url: { url: imgUrl } })),
              ],
            };
          }
          return { role: m.role, content: m.content };
        });

        const resp = await fetchWithRetry(gatewayUrl, {
          method: "POST", headers: gatewayHeaders,
          body: JSON.stringify({ model: modelToUse, messages: [{ role: "system", content: systemPrompt }, ...formattedMessages], stream: true }),
        }, { attempts: 2, retryOnStatuses: [500, 502, 503, 504], backoffMs: 250, label: `AI gateway (${modelToUse})` });

        if (resp.ok || resp.status < 500) {
          response = resp;
          lastGatewayResp = null;
          break;
        }
        lastGatewayResp = resp;
      }

      if (!response) {
        response = lastGatewayResp ?? new Response("Upstream error", { status: 502 });
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);

      let specificError = "Failed to get AI response";
      if (response.status === 401) specificError = "Invalid API key - authentication failed.";
      else if (response.status === 403) specificError = "Access forbidden - check API key permissions.";
      else if (response.status === 404) specificError = "Model not found - check the model name.";
      else if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      else if (response.status === 402) return new Response(JSON.stringify({ error: "Payment required - check API credits." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      else if (response.status >= 500) specificError = "Provider temporarily unavailable.";

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) specificError = errorJson.error.message;
        else if (errorJson.message) specificError = errorJson.message;
      } catch { /* not JSON */ }

      const clientStatus = response.status >= 500 ? 503 : response.status;
      return new Response(JSON.stringify({ error: specificError, status: response.status }), { status: clientStatus, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch (error) {
    console.error("Error in ai-chat function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
