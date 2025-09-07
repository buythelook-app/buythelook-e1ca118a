import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls } = await req.json();

    if (!Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'urls array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    const RAPIDAPI_HOST = Deno.env.get('RAPIDAPI_HOST') || 'asos-scraper.p.rapidapi.com';
    const RAPIDAPI_BASE_URL = Deno.env.get('RAPIDAPI_BASE_URL') || 'https://asos-scraper.p.rapidapi.com';

    if (!RAPIDAPI_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing RAPIDAPI_KEY secret' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const endpoint = `${RAPIDAPI_BASE_URL}/api/ecommerce/asos-scraper/products`;

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(urls.map((url: string) => ({ url })))
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('[asos-proxy] RapidAPI error:', resp.status, text);
      return new Response(JSON.stringify({ success: false, error: `RapidAPI error: ${resp.status}`, details: text }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await resp.json();

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[asos-proxy] Unexpected error:', err?.message || err);
    return new Response(JSON.stringify({ success: false, error: err?.message || 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});