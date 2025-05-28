
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
    console.log("יוצר תלבושות באמצעות פריטים מהדאטהבייס...");
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    
    // Fetch items from zara_cloth table
    const { data: topItems } = await supabase
      .from('zara_cloth')
      .select('*')
      .or('product_name.ilike.%shirt%,product_name.ilike.%blouse%,product_name.ilike.%top%')
      .limit(10);

    const { data: bottomItems } = await supabase
      .from('zara_cloth')
      .select('*')
      .or('product_name.ilike.%pant%,product_name.ilike.%trouser%,product_name.ilike.%skirt%')
      .limit(10);

    const { data: shoesItems } = await supabase
      .from('zara_cloth')
      .select('*')
      .or('product_name.ilike.%shoe%,product_name.ilike.%boot%,product_name.ilike.%sneaker%')
      .limit(10);
    
    if (!topItems?.length || !bottomItems?.length || !shoesItems?.length) {
      console.log("לא נמצאו מספיק פריטים בדאטהבייס");
      return [];
    }
    
    // Generate unique results for each agent using database items
    for (const agent of agents) {
      // Select random database items for outfit
      const randomTop = topItems[Math.floor(Math.random() * topItems.length)];
      const randomBottom = bottomItems[Math.floor(Math.random() * bottomItems.length)];
      const randomShoes = shoesItems[Math.floor(Math.random() * shoesItems.length)];
      
      // Generate a random score
      const score = Math.floor(Math.random() * 30) + 70;
      
      console.log(`יוצר תלבושת עבור ${agent}:`, {
        top: randomTop.id,
        bottom: randomBottom.id,
        shoes: randomShoes.id
      });
      
      // Create outfit with database items
      const outfit: AgentOutfit = {
        top: randomTop,
        bottom: randomBottom,
        shoes: randomShoes,
        score,
        description: `תלבושת מותאמת על ידי ${agent.replace('-', ' ')}`,
        recommendations: [
          "התלבושת מאזנת היטב את מבנה הגוף שלך",
          "פלטת הצבעים משלימה את גוון העור שלך"
        ],
        occasion: Math.random() > 0.5 ? 'work' : 'casual'
      };
      
      results.push({
        agent,
        output: outfit,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`נוצרו ${results.length} תלבושות עם פריטים מהדאטהבייס`);
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
    console.log("מתחיל להריץ את trainer-agent עם פריטים מהדאטהבייס...");
    
    // Generate results using database items
    const agentResults = await generateAgentResults();
    
    if (agentResults.length === 0) {
      console.log("לא נוצרו תוצאות אייג'נטים");
      return new Response(
        JSON.stringify({
          success: false,
          status: "no_results",
          results: [],
          message: "לא נמצאו פריטים זמינים בדאטהבייס"
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
    
    console.log(`מחזיר ${agentResults.length} תוצאות אייג'נטים עם פריטים מהדאטהבייס`);
    
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
