
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
async function fetchRandomItemsByType(supabaseClient: any, type: string, count: number = 10) {
  try {
    console.log(`שולף פריטים מסוג: ${type}`);
    
    let query = supabaseClient.from('zara_cloth').select('id, product_name, image, price, colour');
    
    // Filter by product type based on product_name with better filtering
    if (type === 'top') {
      query = query.or('product_name.ilike.%shirt%,product_name.ilike.%blouse%,product_name.ilike.%tee%,product_name.ilike.%sweater%,product_name.ilike.%top%');
    } else if (type === 'bottom') {
      query = query.or('product_name.ilike.%pant%,product_name.ilike.%trouser%,product_name.ilike.%jean%,product_name.ilike.%skirt%,product_name.ilike.%short%');
    } else if (type === 'shoes') {
      query = query.or('product_name.ilike.%shoe%,product_name.ilike.%boot%,product_name.ilike.%sneaker%,product_name.ilike.%sandal%');
    } else if (type === 'coat') {
      query = query.or('product_name.ilike.%jacket%,product_name.ilike.%coat%,product_name.ilike.%cardigan%');
    }
    
    // Limit and execute query
    const { data, error } = await query.limit(count);
    
    if (error) {
      console.error(`שגיאה בשליפת פריטי ${type}:`, error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log(`לא נמצאו פריטים מסוג: ${type}`);
      return [];
    }
    
    console.log(`נמצאו ${data.length} פריטים מסוג: ${type}`);
    return data;
  } catch (error) {
    console.error(`שגיאה ב-fetchRandomItemsByType עבור ${type}:`, error);
    return [];
  }
}

// Sample outfit data generation function using real items
async function generateAgentResults(supabaseClient: any): Promise<AgentResult[]> {
  const results: AgentResult[] = [];
  
  try {
    console.log("שולף פריטים אמיתיים מטבלת zara_cloth...");
    
    // Fetch real items from the database
    const topItems = await fetchRandomItemsByType(supabaseClient, 'top', 15);
    const bottomItems = await fetchRandomItemsByType(supabaseClient, 'bottom', 15);
    const shoeItems = await fetchRandomItemsByType(supabaseClient, 'shoes', 10);
    const coatItems = await fetchRandomItemsByType(supabaseClient, 'coat', 8);
    
    console.log(`נמצאו: ${topItems.length} חולצות, ${bottomItems.length} מכנסיים, ${shoeItems.length} נעליים, ${coatItems.length} מעילים`);
    
    if (topItems.length === 0 || bottomItems.length === 0 || shoeItems.length === 0) {
      console.log("לא נמצאו מספיק פריטים בדאטהבייס ליצירת תלבושות");
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
      
      // Generate a random score
      const score = Math.floor(Math.random() * 30) + 70;
      
      console.log(`יוצר תלבושת עבור ${agent}:`, {
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
        description: `תלבושת מותאמת על ידי ${agent.replace('-', ' ')}`,
        recommendations: [
          "התלבושת מאזנת היטב את מבנה הגוף שלך",
          "פלטת הצבעים משלימה את גוון העור שלך"
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
    
    console.log(`נוצרו ${results.length} תלבושות שלמות עם פריטים אמיתיים`);
    return results;
  } catch (error) {
    console.error("שגיאה ביצירת תוצאות אייג'נטים:", error);
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
    console.log("מתחיל להריץ את trainer-agent...");
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    // Generate results using real items from the database
    const agentResults = await generateAgentResults(supabaseClient);
    
    if (agentResults.length === 0) {
      console.log("לא נוצרו תוצאות אייג'נטים");
      return new Response(
        JSON.stringify({
          success: false,
          status: "no_results",
          results: [],
          message: "לא נמצאו פריטים מתאימים בדאטהבייס"
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
    
    console.log(`מחזיר ${agentResults.length} תוצאות אייג'נטים`);
    
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
    console.error("שגיאה ב-trainer-agent:", error);
    
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
