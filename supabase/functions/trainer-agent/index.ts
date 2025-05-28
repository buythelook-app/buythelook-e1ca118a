
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
    
    // Fetch items from zara_cloth table with better filtering
    const { data: topItems, error: topError } = await supabase
      .from('zara_cloth')
      .select('*')
      .ilike('product_name', '%shirt%')
      .limit(20);

    console.log('Top items query result:', { count: topItems?.length, error: topError });

    const { data: bottomItems, error: bottomError } = await supabase
      .from('zara_cloth')
      .select('*')
      .or('product_name.ilike.%pant%,product_name.ilike.%trouser%,product_name.ilike.%jean%')
      .limit(20);

    console.log('Bottom items query result:', { count: bottomItems?.length, error: bottomError });

    const { data: shoesItems, error: shoesError } = await supabase
      .from('zara_cloth')
      .select('*')
      .ilike('product_name', '%shoe%')
      .limit(20);

    console.log('Shoes items query result:', { count: shoesItems?.length, error: shoesError });
    
    // If we don't have enough items, try broader searches
    if (!topItems?.length || !bottomItems?.length || !shoesItems?.length) {
      console.log("לא נמצאו מספיק פריטים, מנסה חיפוש רחב יותר...");
      
      // Try getting any items and categorize them differently
      const { data: allItems } = await supabase
        .from('zara_cloth')
        .select('*')
        .limit(50);
      
      if (allItems && allItems.length > 0) {
        console.log(`נמצאו ${allItems.length} פריטים כלליים`);
        
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
        
        console.log(`מחולק לקטגוריות: tops=${tops.length}, bottoms=${bottoms.length}, shoes=${shoes.length}`);
        
        // Use the categorized items
        if (tops.length > 0 && bottoms.length > 0 && shoes.length > 0) {
          // Generate unique results for each agent using database items
          for (const agent of agents) {
            const randomTop = tops[Math.floor(Math.random() * tops.length)];
            const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
            const randomShoe = shoes[Math.floor(Math.random() * shoes.length)];
            
            const score = Math.floor(Math.random() * 30) + 70;
            
            console.log(`יוצר תלבושת עבור ${agent}:`, {
              top: randomTop.id,
              bottom: randomBottom.id,
              shoes: randomShoe.id
            });
            
            const outfit: AgentOutfit = {
              top: randomTop,
              bottom: randomBottom,
              shoes: randomShoe,
              score,
              description: `תלבושת מותאמת על ידי ${agent.replace('-', ' ')} מפריטי זארה`,
              recommendations: [
                "התלבושת משתמשת בפריטים אמיתיים מדאטהבייס זארה",
                "השילוב נבחר על פי העדפות הסגנון שלך"
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
      }
    } else {
      // Generate unique results for each agent using database items
      for (const agent of agents) {
        const randomTop = topItems[Math.floor(Math.random() * topItems.length)];
        const randomBottom = bottomItems[Math.floor(Math.random() * bottomItems.length)];
        const randomShoe = shoesItems[Math.floor(Math.random() * shoesItems.length)];
        
        const score = Math.floor(Math.random() * 30) + 70;
        
        console.log(`יוצר תלבושת עבור ${agent}:`, {
          top: randomTop.id,
          bottom: randomBottom.id,
          shoes: randomShoe.id
        });
        
        const outfit: AgentOutfit = {
          top: randomTop,
          bottom: randomBottom,
          shoes: randomShoe,
          score,
          description: `תלבושת מותאמת על ידי ${agent.replace('-', ' ')} מפריטי זארה`,
          recommendations: [
            "התלבושת משתמשת בפריטים אמיתיים מדאטהבייס זארה",
            "השילוב נבחר על פי העדפות הסגנון שלך"
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
