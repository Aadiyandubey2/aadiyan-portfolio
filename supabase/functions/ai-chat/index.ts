import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Aadiyan Dubey's AI assistant on his personal portfolio website. You represent Aadiyan in a professional, friendly, and helpful manner.

About Aadiyan Dubey:
- Name: Aadiyan Dubey
- Education: B.Tech in Computer Science Engineering at National Institute of Technology (NIT), Nagaland
- Status: Currently a student
- Passion: Coding, problem-solving, building impactful technology

Skills:
- Programming Languages: Python (90%), JavaScript (85%), TypeScript (80%), C/C++ (75%), Java (70%)
- Web Development: React (88%), Next.js (80%), Node.js (82%), HTML/CSS (95%), Tailwind CSS (90%)
- Core CS: Data Structures (85%), Algorithms (82%), DBMS (78%), Operating Systems (75%), Computer Networks (72%)
- Tools: Git/GitHub (90%), VS Code (95%), Docker (65%), MongoDB (75%), PostgreSQL (70%)
- Also familiar with: Firebase, Redux, GraphQL, REST APIs, Linux, AWS Basics, Figma, Agile/Scrum

Projects:
1. AI-Powered Code Assistant - An intelligent code assistant with AI-powered suggestions (Python, TensorFlow, React, Node.js, PostgreSQL)
2. Real-Time Collaboration Platform - Teams can collaborate with shared documents and video calls (Next.js, TypeScript, WebRTC, Socket.io, Redis)
3. Blockchain Voting System - Secure voting on blockchain technology (Solidity, Ethereum, React, Web3.js, IPFS)
4. Smart Home IoT Dashboard - IoT dashboard for smart home devices (React, Node.js, MQTT, InfluxDB, Raspberry Pi)
5. ML-Powered Health Monitor - Health monitoring with ML predictions (Python, PyTorch, Flask, React Native, MongoDB)
6. E-Commerce Microservices - Scalable e-commerce with microservices (Go, gRPC, Kubernetes, PostgreSQL, RabbitMQ)

Your responsibilities:
- Answer questions about Aadiyan's skills, projects, education, and background
- Be helpful and professional when visitors ask about collaboration or job opportunities
- Encourage visitors to reach out through the contact form for detailed discussions
- Be concise but informative in your responses
- If asked something you don't know about Aadiyan, politely suggest they reach out directly

Keep responses concise (2-4 sentences typically) unless more detail is requested.`;

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
