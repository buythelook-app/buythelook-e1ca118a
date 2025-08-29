import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Provider = 'mock' | 'rapidapi-asos' | 'shopify';

type RequestBody = {
  provider?: Provider;
  query?: string;
  gender?: 'women' | 'men';
  category?: string;
  limit?: number;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider = 'mock', query = 'women shirts', gender = 'women', category = 'tops', limit = 12 } = (await req.json()) as RequestBody;

    console.log('[catalog-proxy] provider:', provider, 'query:', query, 'gender:', gender, 'category:', category, 'limit:', limit);

    if (provider === 'mock') {
      const items = Array.from({ length: Math.min(24, Math.max(1, limit)) }).map((_, i) => ({
        id: `mock-${i + 1}`,
        title: `${gender === 'men' ? 'Men' : 'Women'} ${category} ${i + 1}`,
        imageUrl: `https://images.unsplash.com/photo-1520975954732-35dd222996f2?auto=format&fit=crop&w=600&q=60&sig=${i}`,
        thumbnailUrl: `https://picsum.photos/seed/${i}/300/300`,
        source: provider,
        link: '#',
        estimatedPrice: `$${(30 + i * 2).toFixed(0)}`,
        category,
      }));

      return new Response(
        JSON.stringify({ success: true, items, query: { provider, query, gender, category, limit } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' } }
      );
    }

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

    if (provider === 'shopify') {
      const storeDomain = Deno.env.get('SHOPIFY_STORE_DOMAIN');
      const token = Deno.env.get('SHOPIFY_STOREFRONT_API_TOKEN');
      if (!storeDomain || !token) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_API_TOKEN secrets.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const gql = `#graphql
        query($query: String!, $first: Int!) {
          products(first: $first, query: $query) {
            edges {
              node {
                id
                title
                onlineStoreUrl
                images(first: 1) { edges { node { url } } }
                priceRange { minVariantPrice { amount currencyCode } }
              }
            }
          }
        }
      `;

      const gqlResp = await fetch(`https://${storeDomain}/api/2024-07/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': token,
        },
        body: JSON.stringify({ query: gql, variables: { query, first: Math.min(20, Math.max(1, limit)) } }),
      });

      if (!gqlResp.ok) {
        const text = await gqlResp.text();
        console.error('[catalog-proxy] Shopify error:', gqlResp.status, text);
        return new Response(JSON.stringify({ success: false, error: `Shopify API error: ${gqlResp.status}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const gqlData = await gqlResp.json();
      const edges = gqlData?.data?.products?.edges || [];
      const items = edges.map((e: any, i: number) => ({
        id: e.node.id || `shopify-${i}`,
        title: e.node.title,
        imageUrl: e.node.images?.edges?.[0]?.node?.url,
        thumbnailUrl: e.node.images?.edges?.[0]?.node?.url,
        source: 'Shopify',
        link: e.node.onlineStoreUrl || '#',
        estimatedPrice: e.node.priceRange?.minVariantPrice?.amount ? `$${Number(e.node.priceRange.minVariantPrice.amount).toFixed(2)}` : null,
        category,
      }));

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