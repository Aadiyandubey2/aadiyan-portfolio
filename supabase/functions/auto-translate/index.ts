import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslationRequest {
  items: {
    source_table: string;
    record_id: string;
    field_name: string;
    text: string;
  }[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not found");
      return new Response(
        JSON.stringify({ error: "Translation service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { items } = await req.json() as TranslationRequest;

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ success: true, translated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter out empty texts
    const validItems = items.filter(i => i.text && i.text.trim().length > 0);
    if (validItems.length === 0) {
      return new Response(
        JSON.stringify({ success: true, translated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Batch translate: send all texts in one AI call
    const textsToTranslate = validItems.map((item, i) => `[${i}] ${item.text}`).join('\n');

    const prompt = `Translate the following English texts to Hindi (Devanagari script). Keep technical terms, proper nouns, brand names, and programming language names in English. Return ONLY a JSON array of translated strings in the same order, nothing else. No explanations.

Texts:
${textsToTranslate}`;

    console.log(`Translating ${validItems.length} items...`);

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text().catch(() => "");
      console.error("AI translation error:", aiResp.status, errText);
      return new Response(
        JSON.stringify({ error: "Translation failed" }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResp.json();
    const raw = aiData.choices?.[0]?.message?.content || "[]";
    console.log("AI translation raw response:", raw.slice(0, 500));

    // Extract JSON array from response
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error("Could not parse translation response:", raw);
      return new Response(
        JSON.stringify({ error: "Could not parse translations" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const translations: string[] = JSON.parse(match[0]);

    // Upsert translations into database
    const upsertData = validItems.map((item, i) => ({
      source_table: item.source_table,
      record_id: item.record_id,
      field_name: item.field_name,
      language: 'hi',
      original_text: item.text,
      translated_text: translations[i] || item.text,
      updated_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from('translations')
      .upsert(upsertData, { onConflict: 'source_table,record_id,field_name,language' });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      return new Response(
        JSON.stringify({ error: upsertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully translated ${translations.length} items`);
    return new Response(
      JSON.stringify({ success: true, translated: translations.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Auto-translate error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
