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
    console.log('[catalog-test] Starting ASOS API test');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get RapidAPI key
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!rapidApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing RAPIDAPI_KEY secret' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Test ASOS API call
    const url = new URL('https://asos2.p.rapidapi.com/products/v2/list');
    url.searchParams.set('store', 'ROW');
    url.searchParams.set('offset', '0');
    url.searchParams.set('categoryId', '4209'); // Women tops
    url.searchParams.set('limit', '5'); // Just get 5 items for testing
    url.searchParams.set('q', 'women shirt');

    console.log('[catalog-test] Calling ASOS API:', url.toString());

    const resp = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'asos2.p.rapidapi.com',
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('[catalog-test] ASOS error:', resp.status, text);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `ASOS API error: ${resp.status}`,
        details: text
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await resp.json();
    console.log('[catalog-test] ASOS response received, products count:', data?.products?.length || 0);

    const products = (data?.products || []) as any[];
    
    if (products.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No products returned from ASOS API',
        asos_response: data
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Transform and save to catalog_items
    const catalogItems = products.map((p) => ({
      source_product_id: String(p.id),
      source: 'ASOS',
      title: p.name,
      price: p.price?.current?.value || null,
      currency: p.price?.currency || 'GBP',
      brand: p.brandName || 'ASOS',
      category: 'tops',
      gender: 'women',
      color: p.colour || null,
      images: p.imageUrl ? [p.imageUrl] : [],
      sizes: p.variants?.map((v: any) => v.size).filter(Boolean) || [],
      url: p.url,
      available: p.isInStock !== false,
      materials: p.productType || null,
    }));

    console.log('[catalog-test] Saving', catalogItems.length, 'items to catalog_items table');

    // Insert to catalog_items table
    const { data: insertData, error: insertError } = await supabase
      .from('catalog_items')
      .insert(catalogItems)
      .select();

    if (insertError) {
      console.error('[catalog-test] Insert error:', insertError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to save to database',
        db_error: insertError,
        items_attempted: catalogItems
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[catalog-test] Successfully saved', insertData?.length || 0, 'items');

    // Verify data was saved by reading back
    const { data: verifyData, error: verifyError } = await supabase
      .from('catalog_items')
      .select('*')
      .eq('source', 'ASOS')
      .order('created_at', { ascending: false })
      .limit(10);

    if (verifyError) {
      console.error('[catalog-test] Verify error:', verifyError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully processed ${products.length} ASOS products`,
      saved_items: insertData?.length || 0,
      latest_items_in_db: verifyData?.length || 0,
      sample_saved_item: insertData?.[0] || null,
      latest_items: verifyData || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('[catalog-test] Unexpected error:', err?.message || err);
    return new Response(JSON.stringify({ 
      success: false, 
      error: err?.message || 'Unexpected error',
      stack: err?.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});