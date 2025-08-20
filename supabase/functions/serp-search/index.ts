import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { itemType } = await req.json();
    console.log(`🔍 [serp-search] Fetching items for: ${itemType}`);

    if (!itemType) {
      throw new Error('itemType parameter is required');
    }

    // Get the SERP API key from environment variables
    const serpApiKey = Deno.env.get('SERP_API_KEY');
    if (!serpApiKey) {
      throw new Error('SERP_API_KEY not configured');
    }

    // Make the request to SERP API
    const serpUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(itemType)}+fashion+shop&api_key=${serpApiKey}&tbm=shop`;
    console.log(`🌐 [serp-search] Calling SERP API for: ${itemType}`);
    
    const response = await fetch(serpUrl);
    
    if (!response.ok) {
      throw new Error(`SERP API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ [serp-search] Successfully fetched ${data.shopping_results?.length || 0} items for ${itemType}`);

    // Check for API errors
    if (data.error) {
      throw new Error(`SERP API error: ${data.error}`);
    }

    // Return the shopping results
    return new Response(
      JSON.stringify({
        success: true,
        data: data.shopping_results || [],
        count: data.shopping_results?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ [serp-search] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        data: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});