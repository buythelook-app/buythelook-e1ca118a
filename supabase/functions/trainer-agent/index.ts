
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

// Local image mapping - using available image UUIDs
const LOCAL_IMAGES = {
  top: [
    '028933c6-ec95-471c-804c-0aa31a0e1f15',
    '97187c5b-b4bd-4ead-a4bf-644148da8924',
    'b2b5da4b-c967-4791-8832-747541e275be',
    '160222f3-86e6-41d7-b5c8-ecfc0b63851b'
  ],
  bottom: [
    '386cf438-be54-406f-9dbb-6495a8f8bde9',
    '6fe5dff3-dfba-447b-986f-7281b45a0703',
    'a1785297-040b-496d-a2fa-af4ecb55207a',
    '37542411-4b25-4f10-9cc8-782a286409a1'
  ],
  shoes: [
    '553ba2e6-53fd-46dd-82eb-64121072a826',
    '68407ade-0be5-4bc3-ab8a-300ad5130380',
    'c7a32d15-ffe2-4f07-ae82-a943d5128293'
  ]
};

// Our agent names
const agents = [
  'classic-style-agent',
  'modern-minimalist-agent', 
  'trend-spotter-agent',
  'color-harmony-agent',
  'body-shape-expert-agent'
];

// Generate outfit results using local images
async function generateAgentResults(): Promise<AgentResult[]> {
  const results: AgentResult[] = [];
  
  try {
    console.log("יוצר תלבושות באמצעות תמונות מקומיות...");
    
    if (LOCAL_IMAGES.top.length === 0 || LOCAL_IMAGES.bottom.length === 0 || LOCAL_IMAGES.shoes.length === 0) {
      console.log("לא נמצאו מספיק תמונות מקומיות");
      return [];
    }
    
    // Generate unique results for each agent using local images
    for (const agent of agents) {
      // Select random local images for outfit
      const randomTop = LOCAL_IMAGES.top[Math.floor(Math.random() * LOCAL_IMAGES.top.length)];
      const randomBottom = LOCAL_IMAGES.bottom[Math.floor(Math.random() * LOCAL_IMAGES.bottom.length)];
      const randomShoes = LOCAL_IMAGES.shoes[Math.floor(Math.random() * LOCAL_IMAGES.shoes.length)];
      
      // Generate a random score
      const score = Math.floor(Math.random() * 30) + 70;
      
      console.log(`יוצר תלבושת עבור ${agent}:`, {
        top: randomTop,
        bottom: randomBottom,
        shoes: randomShoes
      });
      
      // Create outfit with local image IDs
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
    
    console.log(`נוצרו ${results.length} תלבושות עם תמונות מקומיות`);
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
    console.log("מתחיל להריץ את trainer-agent עם תמונות מקומיות...");
    
    // Generate results using local images
    const agentResults = await generateAgentResults();
    
    if (agentResults.length === 0) {
      console.log("לא נוצרו תוצאות אייג'נטים");
      return new Response(
        JSON.stringify({
          success: false,
          status: "no_results",
          results: [],
          message: "לא נמצאו תמונות מקומיות זמינות"
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
    
    console.log(`מחזיר ${agentResults.length} תוצאות אייג'נטים עם תמונות מקומיות`);
    
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
