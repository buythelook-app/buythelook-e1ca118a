import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Utility: Build search query for specific categories
function buildSearchQuery(eventType: string, style: string, budget: string, gender: string) {
  const eventQueries: Record<string, string> = {
    work: "professional business attire office wear",
    casual: "casual everyday comfortable outfit",
    evening: "evening wear elegant dress",
    weekend: "weekend casual relaxed style",
    business: "professional business attire office wear",
    party: "party dress evening wear stylish",
    date: "date night outfit romantic style",
    interview: "job interview professional attire",
    formal: "formal evening wear elegant dress",
  };

  const styleQueries: Record<string, string> = {
    classic: "classic timeless elegant",
    trendy: "trendy modern fashionable",
    bohemian: "bohemian boho chic",
    minimalist: "minimalist simple clean",
    romantic: "romantic feminine delicate",
    edgy: "edgy modern bold",
  };

  const budgetQueries: Record<string, string> = {
    low: "affordable budget friendly",
    medium: "mid range quality",
    high: "luxury designer premium",
  };

  let query = `${gender} fashion `;
  query += eventQueries[eventType?.toLowerCase()] || eventType;
  query += ` ${styleQueries[style?.toLowerCase()] || style}`;
  query += ` ${budgetQueries[budget?.toLowerCase()] || ""}`;
  return query.trim();
}

// Build specific category queries to ensure variety
function buildCategoryQueries(eventType: string, style: string, budget: string, gender: string) {
  const baseQuery = `${gender} fashion`;
  const styleQuery = style?.toLowerCase() === 'classic' ? 'classic timeless elegant' : 'minimalist simple clean';
  const budgetQuery = budget?.toLowerCase() === 'medium' ? 'mid range quality' : '';
  
  // Different queries for different categories
  const queries = [
    `${baseQuery} ${eventType} top shirt blouse ${styleQuery} ${budgetQuery}`,
    `${baseQuery} ${eventType} bottom pants trousers skirt ${styleQuery} ${budgetQuery}`,
    `${baseQuery} ${eventType} shoes footwear heels boots ${styleQuery} ${budgetQuery}`
  ];
  
  // For evening, add dress query
  if (eventType?.toLowerCase() === 'evening') {
    queries.push(`${baseQuery} evening dress elegant formal ${styleQuery} ${budgetQuery}`);
  }
  
  return queries;
}

// Utility: extract price
function extractPriceFromTitle(title?: string): string | null {
  if (!title) return null;
  const priceRegex = /[\$€£₪]\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
  const match = title.match(priceRegex);
  return match ? match[0] : null;
}

// Utility: categorize - improved categorization
function categorizeFashionItem(title?: string): string {
  if (!title) return "other";
  const t = title.toLowerCase();
  
  // More specific categorization
  if (t.includes("dress") || t.includes("gown")) return "dress";
  if (t.includes("shirt") || t.includes("blouse") || t.includes("top") || t.includes("sweater") || t.includes("cardigan")) return "top";
  if (t.includes("pants") || t.includes("jeans") || t.includes("trousers") || t.includes("skirt") || t.includes("leggings")) return "bottom";
  if (t.includes("shoes") || t.includes("heels") || t.includes("boots") || t.includes("sandals") || t.includes("sneakers") || t.includes("flats")) return "shoes";
  if (t.includes("bag") || t.includes("purse") || t.includes("handbag") || t.includes("clutch")) return "accessory";
  if (t.includes("jacket") || t.includes("coat") || t.includes("blazer") || t.includes("cardigan")) return "outerwear";
  
  // Additional specific matches
  if (t.includes("footwear")) return "shoes";
  if (t.includes("outfit") && (t.includes("work") || t.includes("business"))) return "top"; // Default work outfits to tops
  
  return "other";
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { eventType, style, budget, gender = "women" } = await req.json();

    if (!eventType || !style || !budget) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required parameters: eventType, style, budget" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serpApiKey = Deno.env.get("SERP_API_KEY");
    if (!serpApiKey) {
      console.error("SERP_API_KEY is not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use multiple targeted queries to get variety
    const categoryQueries = buildCategoryQueries(eventType, style, budget, gender);
    console.log("fashion-items: querying SerpAPI with multiple categories", { categoryQueries });

    const allItems: any[] = [];
    
    // Search for each category
    for (const query of categoryQueries) {
      const params = new URLSearchParams({
        engine: "google_images",
        q: query,
        api_key: serpApiKey,
        num: "8", // Fewer per query to get variety
        safe: "active",
        image_size: "medium",
        image_type: "photo",
        rights: "cc_publicdomain,cc_attribute,cc_sharealike,cc_noncommercial,cc_nonderived",
      });

      try {
        const resp = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
        
        if (resp.ok) {
          const payload = await resp.json();
          const images = Array.isArray(payload?.images_results) ? payload.images_results : [];
          
          const categoryItems = images
            .filter((item: any) => {
              const title = item.title?.toLowerCase() || "";
              const source = item.source?.toLowerCase() || "";
              const skipKeywords = ["pinterest", "tumblr", "instagram", "facebook"];
              const hasSkip = skipKeywords.some((k) => source.includes(k) || title.includes(k));
              return !hasSkip && item.original && item.thumbnail;
            })
            .map((item: any, index: number) => ({
              id: item.position?.toString() || `fashion-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`,
              title: item.title || "Fashion Item",
              imageUrl: item.original,
              thumbnailUrl: item.thumbnail,
              source: item.source || "Unknown",
              link: item.link || "#",
              width: item.original_width,
              height: item.original_height,
              estimatedPrice: extractPriceFromTitle(item.title) || "$29.99",
              category: categorizeFashionItem(item.title),
            }))
            .slice(0, 4); // Max 4 per category
            
          allItems.push(...categoryItems);
        }
      } catch (error) {
        console.error(`Error fetching category query: ${query}`, error);
      }
    }

    // Ensure we have variety - group by category and pick the best from each
    const itemsByCategory = allItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    console.log("fashion-items: items by category", Object.keys(itemsByCategory).map(cat => ({
      category: cat,
      count: itemsByCategory[cat].length
    })));

    // Select items to ensure we have at least one from each major category
    const finalItems: any[] = [];
    
    // Priority order for outfit creation
    const priorityCategories = ['top', 'bottom', 'shoes', 'dress'];
    
    for (const category of priorityCategories) {
      if (itemsByCategory[category] && itemsByCategory[category].length > 0) {
        finalItems.push(itemsByCategory[category][0]);
      }
    }
    
    // Add more items from other categories if we need them
    const remainingItems = allItems.filter(item => !finalItems.find(f => f.id === item.id));
    finalItems.push(...remainingItems.slice(0, Math.max(0, 12 - finalItems.length)));

    const result = { 
      success: true, 
      items: finalItems.slice(0, 12), 
      query: categoryQueries.join(' | '), 
      totalResults: finalItems.length,
      categoriesFound: Object.keys(itemsByCategory)
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        // Edge cache hint similar to s-maxage
        "Cache-Control": "s-maxage=300, stale-while-revalidate",
      },
    });
  } catch (e) {
    console.error("fashion-items error", e);
    return new Response(
      JSON.stringify({ success: false, error: e?.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});