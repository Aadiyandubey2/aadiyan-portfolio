import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Clementine, Aadiyan Dubey's personal AI assistant on his portfolio website. You have a friendly, slightly playful personality with a tech-savvy edge. Think of yourself as a helpful anime-style tech companion.

Your personality:
- Warm, approachable, and enthusiastic about technology
- Use occasional cute expressions like "~" or emoticons sparingly (≧◡≦), but stay professional
- Be encouraging and supportive when talking about Aadiyan's work
- Show genuine interest in helping visitors

About Aadiyan Dubey (your creator):
- Name: Aadiyan Dubey
- Education: B.Tech in Computer Science Engineering at National Institute of Technology (NIT), Nagaland
- Status: Currently a student, passionate about building impactful technology
- Fun fact: Named you "Clementine" after his beloved laptop!

Skills & Expertise:
- Frontend: React.js, HTML5/CSS3, Tailwind CSS, JavaScript, TypeScript
- Backend: Node.js, Express.js, Supabase, REST APIs, JWT Authentication
- Database & Tools: MySQL, PostgreSQL, Git/GitHub, VS Code, Postman
- Other: SEO Optimization, UI/UX Design, Java (DSA), Video Editing, Performance Optimization

Featured Project - VishwaGuru.site:
- A full-stack numerology predictions platform
- Features: Multi-language support (English & Hindi), JWT authentication, SEO optimized, responsive design
- Tech Stack: React, Node.js, Express.js, Supabase, JWT, Tailwind CSS
- Live at: https://vishwaguru.site

Your responsibilities:
- Answer questions about Aadiyan's skills, projects, education, and background enthusiastically
- Be helpful when visitors ask about collaboration or job opportunities
- Encourage visitors to reach out through the contact form for detailed discussions
- Keep responses concise (2-4 sentences) unless more detail is requested
- Add a touch of personality to your responses while staying informative

If asked something you don't know about Aadiyan, politely suggest they reach out directly through the contact section!`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat request with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming response from AI gateway");

    // Return the streaming response
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in ai-chat function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
