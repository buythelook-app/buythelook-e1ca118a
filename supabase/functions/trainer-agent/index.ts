
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

/**
 * Helper function to check if an image URL ends with the pattern 6_x_1.jpg
 * This filters out images with models
 */
const isValidImagePattern = (imageData: any): boolean => {
  if (!imageData) {
    console.log('🔍 [DEBUG] No image data provided');
    return false;
  }
  
  // Handle different image data formats
  let imageUrl = '';
  
  if (typeof imageData === 'string') {
    // Handle JSON string arrays like "[\"https://static.zara.net/photos/...jpg\"]"
    try {
      const parsed = JSON.parse(imageData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        imageUrl = parsed[0];
        console.log(`🔍 [DEBUG] Parsed JSON array, using first image: ${imageUrl}`);
      } else {
        imageUrl = imageData;
        console.log(`🔍 [DEBUG] Using string directly: ${imageUrl}`);
      }
    } catch {
      imageUrl = imageData;
      console.log(`🔍 [DEBUG] Failed to parse JSON, using string directly: ${imageUrl}`);
    }
  } else if (Array.isArray(imageData) && imageData.length > 0) {
    imageUrl = imageData[0];
    console.log(`🔍 [DEBUG] Using first item from array: ${imageUrl}`);
  } else if (typeof imageData === 'object' && imageData.url) {
    imageUrl = imageData.url;
    console.log(`🔍 [DEBUG] Using URL from object: ${imageUrl}`);
  } else {
    console.log(`🔍 [DEBUG] Unknown image data format:`, typeof imageData, imageData);
    return false;
  }
  
  // Check if the URL ends with the pattern 6_x_1.jpg (where x is any number)
  const pattern = /6_\d+_1\.jpg$/i;
  const isValid = pattern.test(imageUrl);
  
  console.log(`🔍 [DEBUG] Image URL: ${imageUrl} | Pattern match: ${isValid}`);
  
  return isValid;
};

// Generate outfit results using database items
async function generateAgentResults(): Promise<AgentResult[]> {
  const results: AgentResult[] = [];
  
  try {
    console.log("🔍 [DEBUG] Trainer Agent: Starting to generate agent results...");
    
    // Initialize Supabase client with correct credentials
    const supabase = createClient(
      'https://aqkeprwxxsryropnhfvm.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2Vwcnd4eHNyeXJvcG5oZnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MzE4MjksImV4cCI6MjA1MzQwNzgyOX0.1nstrLtlahU3kGAu-UrzgOVw6XwyKU6n5H5q4Taqtus'
    );
    
    // Step 1: Check if zara_cloth table exists and get count
    console.log("🔍 [DEBUG] Step 1: Checking if zara_cloth table exists...");
    const { count: tableCount, error: tableCheckError } = await supabase
      .from('zara_cloth')
      .select('*', { count: 'exact', head: true });
    
    if (tableCheckError) {
      console.error("❌ [DEBUG] zara_cloth table check failed:", tableCheckError);
      return [];
    }
    
    console.log("✅ [DEBUG] zara_cloth table exists with", tableCount, "items");
    
    if (!tableCount || tableCount === 0) {
      console.error("❌ [DEBUG] zara_cloth table is empty");
      return [];
    }
    
    // Step 2: Fetch items from zara_cloth table with larger limit for filtering
    console.log("🔍 [DEBUG] Step 2: Fetching items from zara_cloth...");
    
    const { data: allItems, error: allItemsError } = await supabase
      .from('zara_cloth')
      .select('*')
      .limit(100); // Increased limit to have more items to filter from
    
    if (allItemsError) {
      console.error("❌ [DEBUG] Failed to fetch items:", allItemsError);
      return [];
    }
    
    if (!allItems?.length) {
      console.error("❌ [DEBUG] No items found in database");
      return [];
    }
    
    console.log(`✅ [DEBUG] Found ${allItems.length} total items`);
    
    // Filter items to only include those with valid image patterns (6_x_1.jpg)
    console.log('🔍 [DEBUG] Starting image pattern filtering...');
    const validItems = allItems.filter((item, index) => {
      console.log(`🔍 [DEBUG] Checking item ${index + 1}/${allItems.length} (ID: ${item.id})`);
      const isValid = isValidImagePattern(item.image);
      if (!isValid) {
        console.log(`❌ [DEBUG] FILTERED OUT item ${item.id} - invalid image pattern`);
      } else {
        console.log(`✅ [DEBUG] KEEPING item ${item.id} - valid image pattern`);
      }
      return isValid;
    });

    console.log(`✅ [DEBUG] Valid items after filtering: ${validItems.length} out of ${allItems.length}`);

    if (validItems.length === 0) {
      console.error('❌ [DEBUG] No items with valid image patterns found');
      return [];
    }
    
    // Generate unique results for each agent using filtered database items
    for (const agent of agents) {
      // Shuffle items for each agent to get different combinations
      const shuffledItems = [...validItems].sort(() => Math.random() - 0.5);
      
      const randomTop = shuffledItems[0];
      const randomBottom = shuffledItems[1] || shuffledItems[0]; // Fallback if not enough items
      const randomShoe = shuffledItems[2] || shuffledItems[0]; // Fallback if not enough items
      
      const score = Math.floor(Math.random() * 30) + 70;
      
      console.log(`✅ [DEBUG] Creating outfit for ${agent}:`, {
        top: randomTop?.id,
        bottom: randomBottom?.id,
        shoes: randomShoe?.id
      });

      // Log the actual image URLs being used
      console.log('🔍 [DEBUG] Selected item images for', agent);
      console.log('Top item image:', randomTop?.image);
      console.log('Bottom item image:', randomBottom?.image);
      console.log('Shoes item image:', randomShoe?.image);
      
      const outfit: AgentOutfit = {
        top: randomTop,
        bottom: randomBottom,
        shoes: randomShoe,
        score,
        description: `Outfit by ${agent.replace('-', ' ')} using real Zara items (no model images)`,
        recommendations: [
          "Using actual items from Zara database",
          "Images selected to avoid model photos (6_x_1.jpg pattern only)"
        ],
        occasion: Math.random() > 0.5 ? 'work' : 'casual'
      };
      
      results.push({
        agent,
        output: outfit,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`✅ [DEBUG] Generated ${results.length} outfits with filtered database items`);
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
          message: "No items available in database or connection failed"
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
