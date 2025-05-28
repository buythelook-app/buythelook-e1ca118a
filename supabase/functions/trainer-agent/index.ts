
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0'
import { corsHeaders } from '../_shared/cors.ts'

// Types for our response
interface AgentOutfit {
  top?: any;
  bottom?: any;
  shoes?: any;
  coat?: any;
  score?: number;
  description?: string;
  recommendations?: string[];
  occasion?: 'work' | 'casual' | 'weekend' | 'date night' | 'general';
}

interface AgentResult {
  agent: string;
  output: AgentOutfit;
  timestamp?: string;
}

interface TrainerAgentResponse {
  success: boolean;
  status: string;
  results: AgentResult[];
  message?: string;
}

// Our agent names
const agents = [
  'classic-style-agent',
  'modern-minimalist-agent', 
  'trend-spotter-agent',
  'color-harmony-agent',
  'body-shape-expert-agent'
];

// Generate outfit results using database items
async function generateAgentResults(): Promise<AgentResult[]> {
  const results: AgentResult[] = [];
  
  try {
    console.log("🔍 [DEBUG] Trainer Agent: Starting to generate agent results...");
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    
    // Step 1: Check if zara_cloth table exists
    console.log("🔍 [DEBUG] Step 1: Checking if zara_cloth table exists...");
    const { count: tableCount, error: tableCheckError } = await supabase
      .from('zara_cloth')
      .select('id', { count: 'exact', head: true });
    
    if (tableCheckError) {
      console.error("❌ [DEBUG] zara_cloth table check failed:", tableCheckError);
      console.log("🔄 [DEBUG] Falling back to items table...");
      
      // Fallback to items table
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .limit(20);
      
      if (itemsError) {
        console.error("❌ [DEBUG] Items table also failed:", itemsError);
        return [];
      }
      
      console.log("✅ [DEBUG] Found items in fallback table:", itemsData?.length || 0);
      
      // Generate results using items table
      for (const agent of agents) {
        const randomItems = itemsData?.sort(() => Math.random() - 0.5).slice(0, 3) || [];
        const score = Math.floor(Math.random() * 30) + 70;
        
        const outfit: AgentOutfit = {
          top: randomItems[0] || null,
          bottom: randomItems[1] || null,
          shoes: randomItems[2] || null,
          score,
          description: `Outfit by ${agent.replace('-', ' ')} using fallback items`,
          recommendations: [
            "Using fallback items table",
            "Zara database connection needs to be fixed"
          ],
          occasion: Math.random() > 0.5 ? 'work' : 'casual'
        };
        
        results.push({
          agent,
          output: outfit,
          timestamp: new Date().toISOString()
        });
      }
      
      return results;
    }
    
    console.log("✅ [DEBUG] zara_cloth table exists with", tableCount, "items");
    
    // Step 2: Fetch items from zara_cloth table with better filtering
    console.log("🔍 [DEBUG] Step 2: Fetching items from zara_cloth...");
    
    const { data: topItems, error: topError } = await supabase
      .from('zara_cloth')
      .select('*')
      .ilike('product_name', '%shirt%')
      .limit(20);

    console.log('🔍 [DEBUG] Tops query result:', { count: topItems?.length, error: topError });

    const { data: bottomItems, error: bottomError } = await supabase
      .from('zara_cloth')
      .select('*')
      .or('product_name.ilike.%pant%,product_name.ilike.%trouser%,product_name.ilike.%jean%')
      .limit(20);

    console.log('🔍 [DEBUG] Bottoms query result:', { count: bottomItems?.length, error: bottomError });

    const { data: shoesItems, error: shoesError } = await supabase
      .from('zara_cloth')
      .select('*')
      .ilike('product_name', '%shoe%')
      .limit(20);

    console.log('🔍 [DEBUG] Shoes query result:', { count: shoesItems?.length, error: shoesError });
    
    // If we don't have enough items, try broader searches
    if (!topItems?.length || !bottomItems?.length || !shoesItems?.length) {
      console.log("⚠️ [DEBUG] Not enough specific items found, trying broader search...");
      
      // Try getting any items and categorize them differently
      const { data: allItems, error: allItemsError } = await supabase
        .from('zara_cloth')
        .select('*')
        .limit(50);
      
      if (allItemsError) {
        console.error("❌ [DEBUG] Failed to fetch any items:", allItemsError);
        return [];
      }
      
      if (allItems && allItems.length > 0) {
        console.log(`✅ [DEBUG] Found ${allItems.length} total items for manual categorization`);
        
        // Manually categorize items based on product names
        const tops = allItems.filter(item => 
          item.product_name?.toLowerCase().includes('shirt') ||
          item.product_name?.toLowerCase().includes('blouse') ||
          item.product_name?.toLowerCase().includes('top') ||
          item.product_name?.toLowerCase().includes('t-shirt') ||
          item.product_name?.toLowerCase().includes('sweater')
        );
        
        const bottoms = allItems.filter(item => 
          item.product_name?.toLowerCase().includes('pant') ||
          item.product_name?.toLowerCase().includes('trouser') ||
          item.product_name?.toLowerCase().includes('jean') ||
          item.product_name?.toLowerCase().includes('skirt') ||
          item.product_name?.toLowerCase().includes('short')
        );
        
        const shoes = allItems.filter(item => 
          item.product_name?.toLowerCase().includes('shoe') ||
          item.product_name?.toLowerCase().includes('boot') ||
          item.product_name?.toLowerCase().includes('sneaker') ||
          item.product_name?.toLowerCase().includes('sandal')
        );
        
        console.log(`🔍 [DEBUG] Manual categorization: tops=${tops.length}, bottoms=${bottoms.length}, shoes=${shoes.length}`);
        
        // Use the categorized items or fall back to any items
        const finalTops = tops.length > 0 ? tops : allItems.slice(0, 10);
        const finalBottoms = bottoms.length > 0 ? bottoms : allItems.slice(10, 20);
        const finalShoes = shoes.length > 0 ? shoes : allItems.slice(20, 30);
        
        // Generate unique results for each agent using database items
        for (const agent of agents) {
          const randomTop = finalTops[Math.floor(Math.random() * finalTops.length)];
          const randomBottom = finalBottoms[Math.floor(Math.random() * finalBottoms.length)];
          const randomShoe = finalShoes[Math.floor(Math.random() * finalShoes.length)];
          
          const score = Math.floor(Math.random() * 30) + 70;
          
          console.log(`✅ [DEBUG] Creating outfit for ${agent}:`, {
            top: randomTop?.id,
            bottom: randomBottom?.id,
            shoes: randomShoe?.id
          });
          
          const outfit: AgentOutfit = {
            top: randomTop,
            bottom: randomBottom,
            shoes: randomShoe,
            score,
            description: `Outfit by ${agent.replace('-', ' ')} using Zara database items`,
            recommendations: [
              "Using real items from Zara database",
              "Items categorized automatically from available data"
            ],
            occasion: Math.random() > 0.5 ? 'work' : 'casual'
          };
          
          results.push({
            agent,
            output: outfit,
            timestamp: new Date().toISOString()
          });
        }
      }
    } else {
      console.log("✅ [DEBUG] Using specific category items");
      // Generate unique results for each agent using database items
      for (const agent of agents) {
        const randomTop = topItems[Math.floor(Math.random() * topItems.length)];
        const randomBottom = bottomItems[Math.floor(Math.random() * bottomItems.length)];
        const randomShoe = shoesItems[Math.floor(Math.random() * shoesItems.length)];
        
        const score = Math.floor(Math.random() * 30) + 70;
        
        console.log(`✅ [DEBUG] Creating outfit for ${agent}:`, {
          top: randomTop?.id,
          bottom: randomBottom?.id,
          shoes: randomShoe?.id
        });
        
        const outfit: AgentOutfit = {
          top: randomTop,
          bottom: randomBottom,
          shoes: randomShoe,
          score,
          description: `Outfit by ${agent.replace('-', ' ')} using Zara items`,
          recommendations: [
            "Using real items from Zara database",
            "Items selected based on style preferences"
          ],
          occasion: Math.random() > 0.5 ? 'work' : 'casual'
        };
        
        results.push({
          agent,
          output: outfit,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    console.log(`✅ [DEBUG] Generated ${results.length} outfits with database items`);
    return results;
  } catch (error) {
    console.error("❌ [DEBUG] Error in generateAgentResults:", error);
    return [];
  }
}

// Main handler for the edge function
Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    console.log("🔍 [DEBUG] Trainer Agent Edge Function starting...");
    
    // Generate results using database items
    const agentResults = await generateAgentResults();
    
    if (agentResults.length === 0) {
      console.log("❌ [DEBUG] No agent results generated");
      return new Response(
        JSON.stringify({
          success: false,
          status: "no_results",
          results: [],
          message: "No items available in database"
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200
        }
      );
    }
    
    // Create response
    const response: TrainerAgentResponse = {
      success: true,
      status: "completed",
      results: agentResults
    };
    
    console.log(`✅ [DEBUG] Returning ${agentResults.length} agent results`);
    
    // Return the response
    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
    
  } catch (error) {
    // Handle errors
    console.error("❌ [DEBUG] Error in trainer-agent:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        status: "error",
        results: [],
        message: error.message
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});
