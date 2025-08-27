import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, engine = 'google', location, num = 10 } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const serpApiKey = Deno.env.get('SERP_API_KEY');
    if (!serpApiKey) {
      console.error('SERP_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'SerpAPI key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build SerpAPI URL
    const searchParams = new URLSearchParams({
      engine,
      q: query,
      api_key: serpApiKey,
      num: num.toString(),
    });

    if (location) {
      searchParams.append('location', location);
    }

    const serpUrl = `https://serpapi.com/search?${searchParams.toString()}`;
    
    console.log(`Making SerpAPI request for query: "${query}"`);
    
    const response = await fetch(serpUrl);
    
    if (!response.ok) {
      console.error(`SerpAPI request failed: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: `SerpAPI request failed: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    console.log(`SerpAPI request successful for query: "${query}"`);
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in serp-search function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});