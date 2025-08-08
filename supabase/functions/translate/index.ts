// Supabase Edge Function: translate
// Calls LibreTranslate to translate text client-side without secrets
// Note: This uses a public endpoint and may be rate limited. Swap with a paid provider + secret for production.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });

  try {
    const { text, target } = await req.json();
    if (!text || !target) {
      return new Response(JSON.stringify({ error: "Missing text or target language" }), { status: 400, headers });
    }

    const resp = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: "auto", target, format: "text" }),
    });

    if (!resp.ok) {
      const body = await resp.text();
      return new Response(JSON.stringify({ error: "Translation API error", details: body }), { status: 500, headers });
    }

    const data = await resp.json();
    const translatedText = data.translatedText || data.translated_text || "";

    return new Response(JSON.stringify({ translatedText }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Unexpected error", details: String(e) }), { status: 500, headers });
  }
});
