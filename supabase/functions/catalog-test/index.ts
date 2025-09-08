import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[catalog-test] Start');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) throw new Error('Missing Supabase credentials');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    const RAPIDAPI_HOST = Deno.env.get('RAPIDAPI_HOST') || 'asos-scraper.p.rapidapi.com';
    const RAPIDAPI_BASE_URL = Deno.env.get('RAPIDAPI_BASE_URL') || 'https://asos-scraper.p.rapidapi.com';
    
    // Diagnostic logging
    console.log('[catalog-test] RAPIDAPI_KEY set?', Boolean(!!RAPIDAPI_KEY));
    console.log('[catalog-test] RAPIDAPI_HOST:', RAPIDAPI_HOST);
    console.log('[catalog-test] RAPIDAPI_BASE_URL:', RAPIDAPI_BASE_URL);
    
    if (!RAPIDAPI_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'Missing RAPIDAPI_KEY secret' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const urls: string[] = Array.isArray(body?.urls) && body.urls.length
      ? body.urls
      : [
          'https://www.asos.com/dk/asos-design/asos-design-sort-ttsdidende-t-shirt-med-rund-hals/prd/2023921724?colourWayId=2023921725'
        ];

    const endpoint = `${RAPIDAPI_BASE_URL}/api/ecommerce/asos-scraper/products`;
    console.log('[catalog-test] Fetching from:', endpoint, 'urls:', urls);

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(urls.map((url) => ({ url }))),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('[catalog-test] RapidAPI error:', resp.status, text);
      return new Response(JSON.stringify({ success: false, error: `RapidAPI error: ${resp.status}`, details: text }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const scraped = await resp.json();
    const products = Array.isArray(scraped) ? scraped : [];

    // Map to catalog_items schema
    const catalogItems = products.map((p: any, i: number) => ({
      source_product_id: String(p.id || `scraped-${i}`),
      source: 'ASOS',
      title: p.name || p.title || 'ASOS Product',
      price: typeof p.price === 'number' ? p.price : Number(p.current_price) || null,
      currency: p.currency || 'GBP',
      brand: p.brand || 'ASOS',
      category: p.category || 'clothing',
      gender: p.gender || null,
      color: p.color || null,
      images: p.image ? [p.image] : p.images || [],
      sizes: p.sizes || [],
      url: p.url || urls[i] || null,
      available: p.available ?? true,
      materials: p.materials || null,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('catalog_items')
      .insert(catalogItems)
      .select();

    if (insertError) {
      console.error('[catalog-test] Insert error:', insertError);
      return new Response(JSON.stringify({ success: false, error: 'DB insert failed', details: insertError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: latest } = await supabase
      .from('catalog_items')
      .select('*')
      .eq('source', 'ASOS')
      .order('created_at', { ascending: false })
      .limit(10);

    return new Response(JSON.stringify({
      success: true,
      saved_items: inserted?.length || 0,
      sample_saved_item: inserted?.[0] || null,
      latest_items: latest || [],
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[catalog-test] Unexpected error:', err?.message || err);
    return new Response(JSON.stringify({ success: false, error: err?.message || 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});