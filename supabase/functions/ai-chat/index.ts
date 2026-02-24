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

      // Best-effort log body (may not be JSON)
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

  // Fallback: should not happen
  return lastResp ?? new Response("Upstream error", { status: 502 });
}

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

  // Fetch AI settings
  const { data: aiSettings } = await supabase
    .from("theme_settings")
    .select("key, value")
    .in("key", ["ai_model", "custom_api_enabled", "custom_api_provider", "custom_api_base_url", "custom_api_model", "custom_api_key"]);

  const settingsMap: Record<string, unknown> = {};
  aiSettings?.forEach(setting => {
    settingsMap[setting.key] = setting.value;
  });

  const aiModel = (settingsMap.ai_model as string) || DEFAULT_MODEL;
  const useCustomApi = settingsMap.custom_api_enabled === true || settingsMap.custom_api_enabled === "true";
  const customProvider = (settingsMap.custom_api_provider as string) || "";
  const customBaseUrl = (settingsMap.custom_api_base_url as string) || "";
  const customModel = (settingsMap.custom_api_model as string) || "";
  const customApiKey = (settingsMap.custom_api_key as string) || "";

  return { 
    siteContent, 
    skills, 
    projects, 
    certificates, 
    showcases, 
    aiModel,
    useCustomApi,
    customProvider,
    customBaseUrl,
    customModel,
    customApiKey
  };
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

    const { messages, language = "en", testMode = false, testConfig, mode = "chat", userModel } = await req.json();

    // ===== IMAGE GENERATION MODE =====
    if (mode === "image-gen") {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return new Response(JSON.stringify({ error: "AI Gateway not configured" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userPrompt = messages?.[0]?.content || "a beautiful landscape";
      console.log("Image gen mode, prompt:", userPrompt);

      try {
        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: userPrompt }],
            modalities: ["image", "text"],
          }),
        });

        if (!resp.ok) {
          if (resp.status === 429) {
            return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (resp.status === 402) {
            return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
              status: 402,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          const errText = await resp.text().catch(() => "");
          console.error("Image gen error:", resp.status, errText);
          return new Response(JSON.stringify({ error: "Image generation failed" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const data = await resp.json();
        const textContent = data.choices?.[0]?.message?.content || "";
        const images = data.choices?.[0]?.message?.images?.map(
          (img: { image_url: { url: string } }) => img.image_url.url
        ) || [];

        return new Response(JSON.stringify({ text: textContent, images }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        console.error("Image gen error:", e);
        return new Response(JSON.stringify({ error: "Image generation failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ===== SUGGEST MODE: generate follow-up questions =====
    if (mode === "suggest") {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return new Response(JSON.stringify({ suggestions: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const last4 = (messages || []).slice(-4);
      const convoSnippet = last4.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join("\n");

      const suggestPrompt = language === "hi"
        ? `Niche ek conversation hai Aadiyan Dubey ki portfolio website pe. 3 chhote follow-up sawaal suggest kar jo visitor pooch sakta hai. Har sawaal 8 words se kam ho. Sirf JSON array return kar, koi explanation nahi. No emoji. Hindi mein likh lekin tech terms English mein rakh.\n\nConversation:\n${convoSnippet}`
        : `Below is a conversation on Aadiyan Dubey's portfolio website. Suggest 3 short follow-up questions a visitor might ask next. Each question must be under 8 words. Return ONLY a JSON array of strings, no explanation, no emoji.\n\nConversation:\n${convoSnippet}`;

      try {
        console.log("Suggest mode: fetching suggestions...");
        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-5-nano",
            messages: [{ role: "user", content: suggestPrompt }],
          }),
        });

        console.log("Suggest mode response status:", resp.status);

        if (!resp.ok) {
          const errText = await resp.text().catch(() => "");
          console.error("Suggest mode AI error:", resp.status, errText);
          return new Response(JSON.stringify({ suggestions: [] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const data = await resp.json();
        const raw = data.choices?.[0]?.message?.content || "[]";
        console.log("Suggest mode raw response:", raw);
        // Extract JSON array from response
        const match = raw.match(/\[.*\]/s);
        const suggestions = match ? JSON.parse(match[0]) : [];

        return new Response(JSON.stringify({ suggestions: suggestions.slice(0, 3) }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        console.error("Suggest mode error:", e);
        return new Response(JSON.stringify({ suggestions: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ===== EXTRACT MODE: Multi-tool deep analysis pipeline =====
    if (mode === "extract") {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return new Response(JSON.stringify({ error: "AI Gateway not configured" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const personQuery = messages?.[messages.length - 1]?.content || "";
      console.log("Extract mode (multi-tool) for:", personQuery);

      const gatewayUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
      const gatewayHeaders = {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      };

      // Helper: non-streaming call to a model
      async function analysisTool(model: string, systemPrompt: string, userContent: string): Promise<string> {
        const resp = await fetchWithRetry(gatewayUrl, {
          method: "POST",
          headers: gatewayHeaders,
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent },
            ],
          }),
        }, { attempts: 2, retryOnStatuses: [500, 502, 503], backoffMs: 300, label: `tool-${model}` });

        if (!resp.ok) {
          console.error(`Analysis tool ${model} failed:`, resp.status);
          return "[Analysis unavailable]";
        }
        const data = await resp.json();
        return data.choices?.[0]?.message?.content || "[No data returned]";
      }

      try {
        // ── STEP 1: Run 10 parallel deep analysis tools ──
        console.log("Running 10 parallel analysis tools...");

        const [bioIntel, techIntel, socialIntel, careerIntel, eduIntel, mediaIntel, reputationIntel, contentIntel, networkIntel, psychoIntel] = await Promise.all([
          // Tool 1: Identity & Biography (GPT-5.2)
          analysisTool("openai/gpt-5.2",
            `You are a biographical intelligence analyst. Extract EVERY identity detail about this person:
- Full legal name, aliases, nicknames, online handles, username patterns
- Date of birth, age, zodiac, nationality, ethnicity, hometown, current city
- Family: parents (names, professions), siblings, spouse, children
- Physical description if public figure
- Languages spoken, religion if public
- Net worth, salary if public
Be exhaustive. Mark uncertain data as [UNVERIFIED].`,
            personQuery
          ),

          // Tool 2: Technical Skills Deep Scan (Gemini 2.5 Pro)
          analysisTool("google/gemini-2.5-pro",
            `You are a technical skills analyst. Extract ALL technical capabilities:
- Programming languages with proficiency level
- Frameworks, libraries, tools, platforms
- Cloud platforms: AWS, GCP, Azure certifications
- DevOps: CI/CD, Docker, Kubernetes, Terraform
- Databases: SQL, NoSQL, graph databases
- AI/ML: models used, papers, frameworks
- Mobile development, embedded systems
- Security certifications and skills
- System design and architecture expertise
- API design, microservices, monolith experience
Be exhaustive. Mark uncertain as [UNVERIFIED].`,
            personQuery
          ),

          // Tool 3: Social Media & Digital Footprint (Gemini 3 Flash)
          analysisTool("google/gemini-3-flash-preview",
            `You are a digital footprint analyst. Map COMPLETE online presence:
- LinkedIn, Twitter/X, GitHub, Instagram, Facebook, YouTube, TikTok, Reddit, Medium, Dev.to, Hashnode, Substack, Mastodon, Bluesky, Threads, Discord, Telegram
- For each: username, follower count, join date, activity level, bio text
- Personal websites, blogs, portfolio URLs
- Email addresses and phone numbers (public only)
- Profile photos: GitHub avatar (https://github.com/USERNAME.png), Gravatar
- Domain registrations
Be exhaustive. Mark uncertain as [UNVERIFIED].`,
            personQuery
          ),

          // Tool 4: Career & Professional Timeline (GPT-5)
          analysisTool("openai/gpt-5",
            `You are a career intelligence analyst. Build a complete professional timeline:
- Every job: company, role, start date, end date, responsibilities
- Promotions, lateral moves, career pivots
- Startup experience: founded, co-founded, advisory roles
- Freelance/consulting clients if known
- Industry specialization and domain expertise
- Leadership roles, team sizes managed
- Key projects delivered at each company
- Reason for leaving each role if known
- Professional references or endorsements
- Salary progression if publicly available
Be exhaustive. Mark uncertain as [UNVERIFIED].`,
            personQuery
          ),

          // Tool 5: Education & Academic Record (Gemini 2.5 Flash)
          analysisTool("google/gemini-2.5-flash",
            `You are an academic intelligence analyst. Extract ALL education details:
- Schools, universities, degrees, majors, minors, GPA, honors
- Thesis/dissertation topics and advisors
- Research papers, publications with titles, journals, dates, citations
- Patents filed or granted
- Google Scholar profile, h-index, citation count
- Academic collaborators and co-authors
- Teaching experience, courses taught
- Textbooks authored
- Academic awards, scholarships, fellowships
- Conference presentations with venue and date
Be exhaustive. Mark uncertain as [UNVERIFIED].`,
            personQuery
          ),

          // Tool 6: Media & Public Appearances (GPT-5-mini)
          analysisTool("openai/gpt-5-mini",
            `You are a media intelligence analyst. Find ALL public appearances:
- News articles mentioning this person (publication, date, headline)
- Podcast appearances as guest or host (name, episode, date)
- YouTube videos, channels, notable videos
- TV/radio interviews
- Conference talks, keynotes (event name, title, date)
- Webinars and online events
- Documentaries or films featuring them
- Quotes attributed to them in media
- Press releases mentioning them
- Blog interviews or Q&A features
Be exhaustive. Mark uncertain as [UNVERIFIED].`,
            personQuery
          ),

          // Tool 7: Reputation & Community Standing (Gemini 2.5 Flash Lite)
          analysisTool("google/gemini-2.5-flash-lite",
            `You are a reputation analyst. Assess community standing:
- Stack Overflow reputation, badges, top answers
- GitHub stars total, popular repos, contribution streaks
- Open source maintainer roles
- Community moderator roles
- Awards: industry awards, hackathon wins, competitions
- Certifications with issuing body and date
- Professional memberships and organizations
- Volunteer work, mentorship programs
- Recommendations and endorsements received
- Controversies or public disputes if any
Be exhaustive. Mark uncertain as [UNVERIFIED].`,
            personQuery
          ),

          // Tool 8: Content & Thought Leadership (GPT-5-nano)
          analysisTool("openai/gpt-5-nano",
            `You are a content intelligence analyst. Find ALL content created by this person:
- Blog posts with titles and URLs
- Technical articles on Medium, Dev.to, Hashnode
- Newsletter/Substack content
- Tutorial series or courses created
- Books authored or contributed to
- Open source documentation written
- Video tutorials or screencasts
- Slide decks on SlideShare/SpeakerDeck
- Code samples or gists
- Forum answers and guides
Be exhaustive. Mark uncertain as [UNVERIFIED].`,
            personQuery
          ),

          // Tool 9: Network & Associations (Gemini 3 Pro)
          analysisTool("google/gemini-3-pro-preview",
            `You are a network intelligence analyst. Map professional and personal networks:
- Known collaborators and co-founders
- Frequent co-authors on papers
- Company affiliations and board positions
- Investment activities: angel investing, VC
- Advisory board memberships
- Nonprofit involvement
- Political affiliations or donations if public
- Alumni networks and groups
- Professional communities (YC, Techstars, etc.)
- Mutual connections with notable figures
Be exhaustive. Mark uncertain as [UNVERIFIED].`,
            personQuery
          ),

          // Tool 10: Behavioral & Interest Profile (Gemini 2.5 Flash)
          analysisTool("google/gemini-2.5-flash",
            `You are a behavioral intelligence analyst. Profile interests and patterns:
- Hobbies and personal interests
- Sports, fitness activities
- Travel patterns, countries visited
- Music, art, entertainment preferences
- Reading interests, book recommendations made
- Side projects unrelated to main career
- Gaming profiles if known
- Pet ownership
- Dietary preferences if public (vegan, etc.)
- Philosophy, values expressed publicly
- Causes supported, activism
Be exhaustive. Mark uncertain as [UNVERIFIED].`,
            personQuery
          ),
        ]);

        console.log("All 10 analysis tools completed. Synthesizing final report...");

        // ── STEP 2: Synthesize all intelligence into final streamed report ──
        const synthesisPrompt = `You are a senior OSINT intelligence report compiler. You have received data from 10 specialized analysis tools about "${personQuery}". Synthesize ALL findings into one comprehensive intelligence report.

RAW INTELLIGENCE DATA:

=== TOOL 1: IDENTITY & BIOGRAPHY ===
${bioIntel}

=== TOOL 2: TECHNICAL SKILLS ===
${techIntel}

=== TOOL 3: DIGITAL FOOTPRINT & SOCIAL MEDIA ===
${socialIntel}

=== TOOL 4: CAREER & PROFESSIONAL TIMELINE ===
${careerIntel}

=== TOOL 5: EDUCATION & ACADEMIC RECORD ===
${eduIntel}

=== TOOL 6: MEDIA & PUBLIC APPEARANCES ===
${mediaIntel}

=== TOOL 7: REPUTATION & COMMUNITY STANDING ===
${reputationIntel}

=== TOOL 8: CONTENT & THOUGHT LEADERSHIP ===
${contentIntel}

=== TOOL 9: NETWORK & ASSOCIATIONS ===
${networkIntel}

=== TOOL 10: BEHAVIORAL & INTEREST PROFILE ===
${psychoIntel}

INSTRUCTIONS:
1. Merge and deduplicate ALL data from 10 sources
2. Cross-reference facts — if 3+ tools agree mark ✅ Confirmed, if 2 tools agree mark ⚠️ Likely, if only 1 tool reports mark ❓ Unverified
3. Resolve contradictions by noting both versions
4. Include EVERY detail found — do not summarize or omit anything
5. For profile image: use https://github.com/USERNAME.png if GitHub username found

FORMAT YOUR REPORT AS:

## 🔍 Deep Intelligence Report: [Full Name]
**Analysis Depth:** 10 specialized AI analysts (parallel multi-tool pipeline)
**Tools Used:** Identity • Skills • Social • Career • Education • Media • Reputation • Content • Network • Behavioral
**Confidence Score:** [High/Medium/Low]

### 📸 Profile Image
![Profile Photo](BEST_AVAILABLE_IMAGE_URL)

---

### 👤 Identity & Personal Details
(all personal info with confidence markers)

---

### 💼 Career & Professional Timeline
(chronological career history with exact dates)

---

### 🎓 Education & Academic Record
(complete education, research, publications)

---

### 🛠️ Technical Profile & Skills Matrix
| Category | Skills | Proficiency |
|----------|--------|-------------|
(table format)

---

### 💻 Open Source & Projects
(repos, contributions, notable projects)

---

### 🌐 Complete Digital Footprint
| Platform | Handle/URL | Followers | Activity |
|----------|-----------|-----------|----------|
(every platform found)

---

### 🏆 Achievements, Awards & Certifications
(all awards, certs, honors with dates)

---

### 📰 Media & Public Appearances
(articles, podcasts, talks, interviews)

---

### ✍️ Content & Publications
(blogs, articles, books, tutorials, courses)

---

### 🤝 Network & Associations
(collaborators, organizations, advisory roles)

---

### 🎯 Interests & Behavioral Profile
(hobbies, interests, values, causes)

---

### 📧 Contact & Location
(publicly available contact info)

---

### 🔎 Deep Search Links
- [Google](https://www.google.com/search?q=${encodeURIComponent(personQuery)})
- [Google Images](https://www.google.com/search?q=${encodeURIComponent(personQuery)}&tbm=isch)
- [LinkedIn](https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(personQuery)})
- [GitHub](https://github.com/search?q=${encodeURIComponent(personQuery)}&type=users)
- [Twitter/X](https://twitter.com/search?q=${encodeURIComponent(personQuery)})
- [Google Scholar](https://scholar.google.com/scholar?q=${encodeURIComponent(personQuery)})
- [Reddit](https://www.reddit.com/search/?q=${encodeURIComponent(personQuery)})
- [YouTube](https://www.youtube.com/results?search_query=${encodeURIComponent(personQuery)})
- [Stack Overflow](https://stackoverflow.com/search?q=${encodeURIComponent(personQuery)})
- [Medium](https://medium.com/search?q=${encodeURIComponent(personQuery)})
- [Dev.to](https://dev.to/search?q=${encodeURIComponent(personQuery)})

---

*📊 Report generated using 10-tool deep analysis pipeline (10 parallel AI analysts + synthesis engine)*
*⚠️ All information sourced from AI training data. Verify critical details independently.*`;

        // Stream the final synthesis
        const resp = await fetchWithRetry(gatewayUrl, {
          method: "POST",
          headers: gatewayHeaders,
          body: JSON.stringify({
            model: userModel || "openai/gpt-5.2",
            messages: [
              { role: "system", content: synthesisPrompt },
              { role: "user", content: `Compile the complete intelligence report for: ${personQuery}` },
            ],
            stream: true,
          }),
        }, { attempts: 2, retryOnStatuses: [500, 502, 503], backoffMs: 300, label: "extract-synthesis" });

        if (!resp.ok) {
          const errText = await resp.text().catch(() => "");
          console.error("Extract synthesis error:", resp.status, errText);
          return new Response(JSON.stringify({ error: "Data extraction failed" }), {
            status: resp.status >= 500 ? 503 : resp.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(resp.body, {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      } catch (e) {
        console.error("Extract error:", e);
        return new Response(JSON.stringify({ error: "Data extraction failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ===== CHAT MODE =====
    // Fetch dynamic content from database
    console.log("Fetching dynamic content from database...");
    const dynamicContent = await fetchDynamicContent();

    // For test mode, use provided test config instead of saved settings
    const apiConfig = testConfig ? {
      useCustomApi: true,
      customProvider: testConfig.provider,
      customBaseUrl: testConfig.baseUrl,
      customModel: testConfig.model,
      customApiKey: testConfig.apiKey,
    } : {
      useCustomApi: dynamicContent.useCustomApi,
      customProvider: dynamicContent.customProvider,
      customBaseUrl: dynamicContent.customBaseUrl,
      customModel: dynamicContent.customModel,
      customApiKey: dynamicContent.customApiKey,
    };

    // Generate system prompt with dynamic data
    const systemPrompt = testMode 
      ? "You are a test assistant. Respond with just 'test' to confirm the connection works."
      : generateSystemPrompt(dynamicContent, language);

    let response: Response | null = null;

    // Check if using custom API with valid config
    if (apiConfig.useCustomApi && apiConfig.customApiKey && apiConfig.customModel && apiConfig.customBaseUrl) {
      console.log("Using custom API:", apiConfig.customProvider, "model:", apiConfig.customModel, "url:", apiConfig.customBaseUrl);
      
      // Determine the API endpoint and headers based on provider
      let apiUrl = apiConfig.customBaseUrl;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      let body: Record<string, unknown>;

      if (apiConfig.customProvider === "anthropic") {
        // Anthropic has a different API format
        apiUrl = apiConfig.customBaseUrl.endsWith('/messages') 
          ? apiConfig.customBaseUrl 
          : `${apiConfig.customBaseUrl.replace(/\/$/, '')}/messages`;
        headers["x-api-key"] = apiConfig.customApiKey;
        headers["anthropic-version"] = "2023-06-01";
        
        body = {
          model: apiConfig.customModel,
          max_tokens: testMode ? 50 : 1024,
          system: systemPrompt,
          messages: messages.map((m: { role: string; content: string }) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
          stream: true,
        };
      } else if (apiConfig.customProvider === "google") {
        // Google Gemini API format
        apiUrl = `${apiConfig.customBaseUrl.replace(/\/$/, '')}/models/${apiConfig.customModel}:streamGenerateContent?key=${apiConfig.customApiKey}`;
        
        body = {
          contents: [
            { role: "user", parts: [{ text: systemPrompt }] },
            ...messages.map((m: { role: string; content: string }) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
          ],
          generationConfig: testMode ? { maxOutputTokens: 50 } : undefined,
        };
      } else {
        // OpenAI-compatible format (OpenAI, OpenRouter, Groq, custom)
        // Ensure URL ends with /chat/completions
        const baseUrl = apiConfig.customBaseUrl.replace(/\/$/, '');
        apiUrl = baseUrl.endsWith('/chat/completions') 
          ? baseUrl 
          : `${baseUrl}/chat/completions`;
        headers["Authorization"] = `Bearer ${apiConfig.customApiKey}`;
        
        body = {
          model: apiConfig.customModel,
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream: true,
          max_tokens: testMode ? 50 : undefined,
        };
      }

      try {
        response = await fetch(apiUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        return new Response(JSON.stringify({ 
          error: `Network error: Unable to connect to ${apiUrl}. Please check the API endpoint.` 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Use built-in AI Gateway
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        throw new Error("Built-in AI Gateway is not configured");
      }

      const preferredModel = userModel || (dynamicContent.aiModel as string) || DEFAULT_MODEL;
      // Fallback models for transient 5xx issues
      const candidateModels = Array.from(
        new Set([
          preferredModel,
          "google/gemini-2.5-flash",
          "google/gemini-2.5-flash-lite",
        ]),
      );

      const gatewayUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
      const gatewayHeaders = {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      };

      let lastGatewayResp: Response | null = null;
      for (const modelToUse of candidateModels) {
        console.log("Using built-in AI Gateway, model:", modelToUse);

      // Build messages with multimodal support
      const formattedMessages = messages.map((m: { role: string; content: string; images?: string[] }) => {
        if (m.images && m.images.length > 0) {
          return {
            role: m.role,
            content: [
              { type: "text", text: m.content },
              ...m.images.map((imgUrl: string) => ({
                type: "image_url",
                image_url: { url: imgUrl },
              })),
            ],
          };
        }
        return { role: m.role, content: m.content };
      });

      const init: RequestInit = {
          method: "POST",
          headers: gatewayHeaders,
          body: JSON.stringify({
            model: modelToUse,
            messages: [{ role: "system", content: systemPrompt }, ...formattedMessages],
            stream: true,
          }),
        };

        const resp = await fetchWithRetry(gatewayUrl, init, {
          attempts: 2,
          retryOnStatuses: [500, 502, 503, 504],
          backoffMs: 250,
          label: `AI gateway (${modelToUse})`,
        });

        // If OK, great. If non-5xx (like 429/402), return immediately.
        if (resp.ok || resp.status < 500) {
          response = resp;
          lastGatewayResp = null;
          break;
        }

        // 5xx: try next model.
        lastGatewayResp = resp;
      }

      if (!response) {
        // Shouldn't happen, but keep it safe.
        response = lastGatewayResp ?? new Response("Upstream error", { status: 502 });
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      // Parse error for more specific messages
      let specificError = "Failed to get AI response";
      
      if (response.status === 401) {
        specificError = "Invalid API key - authentication failed. Please check your API key.";
      } else if (response.status === 403) {
        specificError = "Access forbidden - your API key may not have permission for this model.";
      } else if (response.status === 404) {
        specificError = "Model not found - please check the model name is correct for your provider.";
      } else if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required - please check your API credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else if (response.status >= 500) {
        specificError = "Provider server error - the AI service is temporarily unavailable.";
      }

      // Try to extract error message from response
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          specificError = errorJson.error.message;
        } else if (errorJson.message) {
          specificError = errorJson.message;
        }
      } catch {
        // Response wasn't JSON, use the specific error we determined
      }

      // Don't bubble raw upstream 5xx back to the client; treat as temporary outage.
      const clientStatus = response.status >= 500 ? 503 : response.status;
      return new Response(JSON.stringify({ error: specificError, status: response.status }), {
        status: clientStatus,
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
