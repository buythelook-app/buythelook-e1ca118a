
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
async function fetchRandomItemsByType(supabaseClient: any, type: string, count: number = 5) {
  try {
    console.log(`Fetching items for type: ${type}`);
    
    let query = supabaseClient.from('zara_cloth').select('id, product_name, image, price, colour');
    
    // Filter by product type based on product_name
    if (type === 'top') {
      query = query.or('product_name.ilike.%shirt%,product_name.ilike.%blouse%,product_name.ilike.%tee%,product_name.ilike.%sweater%,product_name.ilike.%top%,product_name.ilike.%jacket%');
    } else if (type === 'bottom') {
      query = query.or('product_name.ilike.%pant%,product_name.ilike.%trouser%,product_name.ilike.%jean%,product_name.ilike.%skirt%,product_name.ilike.%short%,product_name.ilike.%bottom%');
    } else if (type === 'shoes') {
      query = query.or('product_name.ilike.%shoe%,product_name.ilike.%boot%,product_name.ilike.%sneaker%,product_name.ilike.%sandal%,product_name.ilike.%footwear%');
    } else if (type === 'coat') {
      query = query.or('product_name.ilike.%jacket%,product_name.ilike.%coat%,product_name.ilike.%outerwear%,product_name.ilike.%cardigan%');
    }
    
    const { data, error } = await query.limit(count * 2);
    
    if (error) {
      console.error(`Error fetching ${type} items:`, error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log(`No items found for type: ${type}`);
      return [];
    }
    
    console.log(`Found ${data.length} items for type: ${type}`);
    
    // Shuffle and return random items
    const shuffled = data.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  } catch (error) {
    console.error(`Error in fetchRandomItemsByType for ${type}:`, error);
    return [];
  }
}

// Sample outfit data generation function using real items
async function generateAgentResults(supabaseClient: any): Promise<AgentResult[]> {
  const results: AgentResult[] = [];
  
  try {
    // Fetch real items from the database
    console.log("Fetching real items from zara_cloth table...");
    const topItems = await fetchRandomItemsByType(supabaseClient, 'top', 10);
    const bottomItems = await fetchRandomItemsByType(supabaseClient, 'bottom', 10);
    const shoeItems = await fetchRandomItemsByType(supabaseClient, 'shoes', 10);
    const coatItems = await fetchRandomItemsByType(supabaseClient, 'coat', 5);
    
    console.log(`Found ${topItems.length} tops, ${bottomItems.length} bottoms, ${shoeItems.length} shoes, ${coatItems.length} coats`);
    
    if (topItems.length === 0 || bottomItems.length === 0 || shoeItems.length === 0) {
      console.log("Not enough items found in database to create outfits");
      return [];
    }
    
    // Generate unique results for each agent
    for (const agent of agents) {
      // Select random real items for outfit
      const randomTop = topItems[Math.floor(Math.random() * topItems.length)];
      const randomBottom = bottomItems[Math.floor(Math.random() * bottomItems.length)];
      const randomShoes = shoeItems[Math.floor(Math.random() * shoeItems.length)];
      
      // Maybe add a coat (30% chance)
      const randomCoat = (Math.random() < 0.3 && coatItems.length > 0) 
        ? coatItems[Math.floor(Math.random() * coatItems.length)] 
        : null;
      
      // Generate a random score - agents would each have their own scoring logic
      const score = Math.floor(Math.random() * 30) + 70;
      
      console.log(`Creating outfit for ${agent}:`, {
        top: randomTop.id,
        bottom: randomBottom.id,
        shoes: randomShoes.id,
        coat: randomCoat?.id || null
      });
      
      // Create outfit with real item IDs
      const outfit: AgentOutfit = {
        top: randomTop.id,
        bottom: randomBottom.id,
        shoes: randomShoes.id,
        score,
        description: `Curated outfit by ${agent.replace('-', ' ')}`,
        recommendations: [
          "This outfit balances your body shape well",
          "The color palette complements your skin tone"
        ],
        occasion: Math.random() > 0.5 ? 'work' : 'casual'
      };
      
      // Add coat if selected
      if (randomCoat) {
        outfit.coat = randomCoat.id;
      }
      
      results.push({
        agent,
        output: outfit,
        timestamp: new Date().toISOString()
      });
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
    console.log("Starting trainer-agent execution...");
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    // Generate results using real items from the database
    const agentResults = await generateAgentResults(supabaseClient);
    
    // Create response
    const response: TrainerAgentResponse = {
      success: true,
      status: "completed",
      results: agentResults
    };
    
    console.log(`Returning ${agentResults.length} agent results`);
    
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
