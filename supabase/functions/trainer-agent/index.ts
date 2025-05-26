
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0'
import { corsHeaders } from '../_shared/cors.ts'

// Types for our response
interface AgentOutfit {
  top?: string;
  bottom?: string;
  shoes?: string;
  coat?: string;
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

// Function to fetch random items by type from zara_cloth table
async function fetchRandomItemsByType(supabaseClient: any, type: string, count: number = 3) {
  try {
    let query = supabaseClient.from('zara_cloth').select('id, product_name');
    
    // Filter by product type based on product_name
    if (type === 'top') {
      query = query.or('product_name.ilike.%shirt%,product_name.ilike.%blouse%,product_name.ilike.%tee%,product_name.ilike.%sweater%,product_name.ilike.%top%');
    } else if (type === 'bottom') {
      query = query.or('product_name.ilike.%pant%,product_name.ilike.%trouser%,product_name.ilike.%jean%,product_name.ilike.%skirt%,product_name.ilike.%short%,product_name.ilike.%bottom%');
    } else if (type === 'shoes') {
      query = query.or('product_name.ilike.%shoe%,product_name.ilike.%boot%,product_name.ilike.%sneaker%,product_name.ilike.%sandal%,product_name.ilike.%footwear%');
    } else if (type === 'coat') {
      query = query.or('product_name.ilike.%jacket%,product_name.ilike.%coat%,product_name.ilike.%outerwear%');
    }
    
    const { data, error } = await query.limit(count * 3); // Get more items to have variety
    
    if (error) {
      console.error(`Error fetching ${type} items:`, error);
      return [];
    }
    
    // Shuffle and return random items
    const shuffled = (data || []).sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  } catch (error) {
    console.error(`Error in fetchRandomItemsByType for ${type}:`, error);
    return [];
  }
}

// Sample outfit data generation function using real items
async function generateAgentResults(supabaseClient: any, userPreferences?: { likedOutfits: any[], dislikedOutfits: any[] }): Promise<AgentResult[]> {
  const results: AgentResult[] = [];
  
  try {
    // Fetch real items from the database
    console.log("Fetching real items from zara_cloth table...");
    const topItems = await fetchRandomItemsByType(supabaseClient, 'top', 10);
    const bottomItems = await fetchRandomItemsByType(supabaseClient, 'bottom', 10);
    const shoeItems = await fetchRandomItemsByType(supabaseClient, 'shoes', 10);
    const coatItems = await fetchRandomItemsByType(supabaseClient, 'coat', 5);
    
    console.log(`Found ${topItems.length} tops, ${bottomItems.length} bottoms, ${shoeItems.length} shoes, ${coatItems.length} coats`);
    
    // Generate unique results for each agent
    for (const agent of agents) {
      // If we have user preference data, use that to adjust item selection
      if (userPreferences && (userPreferences.likedOutfits.length > 0 || userPreferences.dislikedOutfits.length > 0)) {
        console.log("Applying user preferences to agent recommendations for", agent);
      }
      
      // Select random real items for outfit
      const randomTop = topItems.length > 0 ? topItems[Math.floor(Math.random() * topItems.length)] : null;
      const randomBottom = bottomItems.length > 0 ? bottomItems[Math.floor(Math.random() * bottomItems.length)] : null;
      const randomShoes = shoeItems.length > 0 ? shoeItems[Math.floor(Math.random() * shoeItems.length)] : null;
      
      // Maybe add a coat (30% chance)
      const randomCoat = (Math.random() < 0.3 && coatItems.length > 0) 
        ? coatItems[Math.floor(Math.random() * coatItems.length)] 
        : null;
      
      // Generate a random score - agents would each have their own scoring logic
      const score = Math.floor(Math.random() * 30) + 70;
      
      // Create outfit with real item IDs
      const outfit: AgentOutfit = {
        score,
        description: `Curated outfit by ${agent.replace('-', ' ')}`,
        recommendations: [
          "This outfit balances your body shape well",
          "The color palette complements your skin tone"
        ],
        occasion: Math.random() > 0.5 ? 'work' : 'casual'
      };
      
      // Add real item IDs if available
      if (randomTop) outfit.top = randomTop.id;
      if (randomBottom) outfit.bottom = randomBottom.id;
      if (randomShoes) outfit.shoes = randomShoes.id;
      if (randomCoat) outfit.coat = randomCoat.id;
      
      // Only add results that have at least top, bottom, and shoes
      if (outfit.top && outfit.bottom && outfit.shoes) {
        results.push({
          agent,
          output: outfit,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    console.log(`Generated ${results.length} complete outfits with real items`);
    return results;
  } catch (error) {
    console.error("Error generating agent results:", error);
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
    // Get the user's preferences from the database
    let userPreferences = { likedOutfits: [], dislikedOutfits: [] };
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    // Try to get the user ID from the JWT
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (user) {
      console.log("User authenticated:", user.id);
      
      // Fetch user feedback data
      const { data: feedbackData, error } = await supabaseClient
        .from('agent_feedback')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Error fetching feedback:", error);
      } else if (feedbackData && feedbackData.length > 0) {
        console.log("Found user feedback data:", feedbackData.length, "records");
        
        // Process feedback into preferences
        userPreferences = {
          likedOutfits: feedbackData.filter((item: any) => item.user_liked === true),
          dislikedOutfits: feedbackData.filter((item: any) => item.user_liked === false)
        };
      }
    }
    
    // Generate results using real items from the database
    const agentResults = await generateAgentResults(supabaseClient, userPreferences);
    
    // Create response
    const response: TrainerAgentResponse = {
      success: true,
      status: "completed",
      results: agentResults
    };
    
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
    console.error("Error in trainer-agent:", error);
    
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
