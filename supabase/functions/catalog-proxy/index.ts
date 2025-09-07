import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Provider = 'rapidapi-asos' | 'rapidapi-asos-scraper';

type RequestBody = {
  provider?: Provider;
  query?: string;
  gender?: 'women' | 'men';
  category?: string;
  limit?: number;
  urls?: string[];
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider = 'rapidapi-asos', query = 'women shirts', gender = 'women', category = 'tops', limit = 12, urls } = (await req.json()) as RequestBody;

    console.log('[catalog-proxy] provider:', provider, 'query:', query, 'gender:', gender, 'category:', category, 'limit:', limit, 'urls:', urls);

    if (provider === 'rapidapi-asos') {
      const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
      if (!rapidApiKey) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing RAPIDAPI_KEY secret. Please add it in Supabase > Settings > Functions.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const url = new URL('https://asos2.p.rapidapi.com/products/v2/list');
      // Minimal required params for ASOS list endpoint
      url.searchParams.set('store', 'ROW');
      url.searchParams.set('offset', '0');
      url.searchParams.set('categoryId', '4209'); // 4209 = women tops (example)
      url.searchParams.set('limit', String(Math.min(36, Math.max(1, limit))));
      url.searchParams.set('q', query);

      const resp = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': 'asos2.p.rapidapi.com',
        },
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error('[catalog-proxy] ASOS error:', resp.status, text);
        return new Response(JSON.stringify({ success: false, error: `ASOS API error: ${resp.status}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await resp.json();
      const products = (data?.products || []) as any[];
      const items = products.map((p) => ({
        id: String(p.id),
        title: p.name,
        imageUrl: p.imageUrl ? `https://${p.imageUrl.replace(/^https?:\/\//, '')}` : undefined,
        thumbnailUrl: p.imageUrl ? `https://${p.imageUrl.replace(/^https?:\/\//, '')}` : undefined,
        source: 'ASOS',
        link: p.url ? `https://${p.url.replace(/^https?:\/\//, '')}` : '#',
        estimatedPrice: p.price?.current?.text || null,
        category: category,
      }));

      return new Response(JSON.stringify({ success: true, items, totalResults: items.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
      });
    }

    if (provider === 'rapidapi-asos-scraper') {
      const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
      if (!rapidApiKey) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing RAPIDAPI_KEY secret. Please add it in Supabase > Settings > Functions.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!urls || urls.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'URLs array is required for rapidapi-asos-scraper provider' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const baseUrl = Deno.env.get('RAPIDAPI_BASE_URL') || 'https://asos-scraper.p.rapidapi.com';
      const rapidApiHost = Deno.env.get('RAPIDAPI_HOST') || 'asos-scraper.p.rapidapi.com';

      const response = await fetch(`${baseUrl}/api/ecommerce/asos-scraper/products`, {
        method: 'POST',
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': rapidApiHost,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(urls.map(url => ({ url })))
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('[catalog-proxy] ASOS Scraper error:', response.status, text);
        return new Response(JSON.stringify({ success: false, error: `ASOS Scraper API error: ${response.status}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();
      console.log('[catalog-proxy] ASOS Scraper response:', data);
      
      // Transform the response data to match our standard format
      const items = Array.isArray(data) ? data.map((product, index) => ({
        id: product.id || `scraped-${index}`,
        title: product.name || product.title || 'ASOS Product',
        imageUrl: product.image || product.imageUrl,
        thumbnailUrl: product.image || product.imageUrl,
        source: 'ASOS',
        link: urls[index] || '#',
        estimatedPrice: product.price || product.current_price || null,
        category: product.category || 'clothing',
      })) : [];

      return new Response(JSON.stringify({ success: true, items, totalResults: items.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
      });
    }

    return new Response(JSON.stringify({ success: false, error: `Unsupported provider: ${provider}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[catalog-proxy] Unexpected error:', err?.message || err);
    return new Response(JSON.stringify({ success: false, error: err?.message || 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});