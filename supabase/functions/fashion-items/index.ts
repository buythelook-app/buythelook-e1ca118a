import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Utility: Build search query
function buildSearchQuery(eventType: string, style: string, budget: string, gender: string) {
  const eventQueries: Record<string, string> = {
    wedding: "elegant formal dress wedding guest outfit",
    business: "professional business attire office wear",
    casual: "casual everyday comfortable outfit",
    party: "party dress evening wear stylish",
    date: "date night outfit romantic style",
    interview: "job interview professional attire",
    formal: "formal evening wear elegant dress",
    sport: "activewear sportswear athletic outfit",
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

// Utility: extract price
function extractPriceFromTitle(title?: string): string | null {
  if (!title) return null;
  const priceRegex = /[\$€£₪]\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
  const match = title.match(priceRegex);
  return match ? match[0] : null;
}

// Utility: categorize
function categorizeFashionItem(title?: string): string {
  if (!title) return "other";
  const t = title.toLowerCase();
  if (t.includes("dress")) return "dress";
  if (t.includes("shirt") || t.includes("blouse")) return "top";
  if (t.includes("pants") || t.includes("jeans") || t.includes("trousers")) return "bottom";
  if (t.includes("shoes") || t.includes("heels") || t.includes("boots")) return "shoes";
  if (t.includes("bag") || t.includes("purse") || t.includes("handbag")) return "accessory";
  if (t.includes("jacket") || t.includes("coat") || t.includes("blazer")) return "outerwear";
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

    const query = buildSearchQuery(eventType, style, budget, gender);
    console.log("fashion-items: querying SerpAPI", { query });

    const params = new URLSearchParams({
      engine: "google_images",
      q: query,
      api_key: serpApiKey,
      num: "20",
      safe: "active",
      image_size: "medium",
      image_type: "photo",
      rights: "cc_publicdomain,cc_attribute,cc_sharealike,cc_noncommercial,cc_nonderived",
    });

    const resp = await fetch(`https://serpapi.com/search.json?${params.toString()}`);

    if (!resp.ok) {
      const text = await resp.text();
      console.error("SerpAPI error", resp.status, text);
      return new Response(
        JSON.stringify({ success: false, error: `SerpAPI failed: ${resp.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = await resp.json();
    const images = Array.isArray(payload?.images_results) ? payload.images_results : [];

    const items = images
      .filter((item: any) => {
        const title = item.title?.toLowerCase() || "";
        const source = item.source?.toLowerCase() || "";
        const skipKeywords = ["pinterest", "tumblr", "instagram", "facebook"];
        const hasSkip = skipKeywords.some((k) => source.includes(k) || title.includes(k));
        return !hasSkip && item.original && item.thumbnail;
      })
      .map((item: any, index: number) => ({
        id: item.position?.toString() || `fashion-${index}-${Math.random().toString(36).slice(2, 9)}`,
        title: item.title || "Fashion Item",
        imageUrl: item.original,
        thumbnailUrl: item.thumbnail,
        source: item.source || "Unknown",
        link: item.link || "#",
        width: item.original_width,
        height: item.original_height,
        estimatedPrice: extractPriceFromTitle(item.title),
        category: categorizeFashionItem(item.title),
      }))
      .slice(0, 12);

    const result = { success: true, items, query, totalResults: items.length };

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