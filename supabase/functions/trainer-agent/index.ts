
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

// Sample outfit data generation function
function generateAgentResults(userPreferences?: { likedOutfits: any[], dislikedOutfits: any[] }): AgentResult[] {
  const results: AgentResult[] = [];
  
  // Color palettes by style
  const colorPalettes = {
    classic: ['#2C3E50', '#34495E', '#7F8C8D', '#BDC3C7', '#ECF0F1'],
    modern: ['#212121', '#424242', '#616161', '#FAFAFA', '#FFFFFF'],
    trendy: ['#FF4081', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5'],
    colorful: ['#F44336', '#4CAF50', '#2196F3', '#FFEB3B', '#FF9800'],
    neutral: ['#795548', '#9E9E9E', '#607D8B', '#EEEEEE', '#EFEBE9']
  };
  
  // Generate unique results for each agent
  for (const agent of agents) {
    let palette;
    
    // Assign palette based on agent type
    if (agent === 'classic-style-agent') {
      palette = colorPalettes.classic;
    } else if (agent === 'modern-minimalist-agent') {
      palette = colorPalettes.modern;
    } else if (agent === 'trend-spotter-agent') {
      palette = colorPalettes.trendy;
    } else if (agent === 'color-harmony-agent') {
      palette = colorPalettes.colorful;
    } else {
      palette = colorPalettes.neutral;
    }
    
    // If we have user preference data, use that to adjust item selection
    if (userPreferences && (userPreferences.likedOutfits.length > 0 || userPreferences.dislikedOutfits.length > 0)) {
      // Apply user preferences logic here
      // This is where an AI system would use the feedback to improve suggestions
      console.log("Applying user preferences to agent recommendations");
    }
    
    // Select random colors for outfit
    const topIndex = Math.floor(Math.random() * palette.length);
    let bottomIndex;
    do {
      bottomIndex = Math.floor(Math.random() * palette.length);
    } while (bottomIndex === topIndex);
    
    let shoesIndex;
    do {
      shoesIndex = Math.floor(Math.random() * palette.length);
    } while (shoesIndex === topIndex || shoesIndex === bottomIndex);
    
    // Maybe add a coat (30% chance)
    let coatColor = undefined;
    if (Math.random() < 0.3) {
      let coatIndex;
      do {
        coatIndex = Math.floor(Math.random() * palette.length);
      } while (coatIndex === topIndex || coatIndex === bottomIndex || coatIndex === shoesIndex);
      coatColor = palette[coatIndex];
    }
    
    // Generate a random score - agents would each have their own scoring logic
    const score = Math.floor(Math.random() * 30) + 70;
    
    // Add the result
    results.push({
      agent,
      output: {
        top: `top-${palette[topIndex].replace('#', '')}`,
        bottom: `bottom-${palette[bottomIndex].replace('#', '')}`,
        shoes: `shoes-${palette[shoesIndex].replace('#', '')}`,
        coat: coatColor ? `coat-${coatColor.replace('#', '')}` : undefined,
        score,
        description: `Sample outfit by ${agent}`,
        recommendations: [
          "This outfit balances your body shape well",
          "The color palette complements your skin tone"
        ],
        occasion: Math.random() > 0.5 ? 'work' : 'casual'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  return results;
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
    
    // Generate results (in a real system, this would use the user preferences data)
    const agentResults = generateAgentResults(userPreferences);
    
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
