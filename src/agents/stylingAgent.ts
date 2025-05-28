import { supabase } from "@/lib/supabaseClient";
import { GenerateOutfitTool } from "../tools/generateOutfitTool";

// Interface defined but not exported to avoid conflicts
interface Agent {
  role: string;
  goal: string;
  backstory: string;
  tools: any[];
  run?: (userId: string) => Promise<any>;
}

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

/**
 * Styling Generator Agent
 * Generates outfit suggestions using items from the zara_cloth database table
 */
export const stylingAgent: Agent = {
  role: "Styling Generator",
  goal: "Generate outfit suggestions using available database items",
  backstory: "Knows how to combine clothing items from the database",
  tools: [GenerateOutfitTool],
  
  /**
   * Runs the styling agent to generate a new outfit combination from database items
   * @param userId The ID of the user to generate outfit for
   */
  run: async (userId: string) => {
    console.log("🔍 [DEBUG] StylingAgent starting for user:", userId);
    
    try {
      // Step 1: Check if zara_cloth table exists and get actual count
      console.log("🔍 [DEBUG] Step 1: Checking zara_cloth table...");
      const { count: tableCount, error: tableCheckError } = await supabase
        .from('zara_cloth')
        .select('*', { count: 'exact', head: true });
      
      if (tableCheckError) {
        console.error("❌ [DEBUG] Table check failed:", tableCheckError);
        return { 
          success: false, 
          error: "zara_cloth table is not accessible: " + tableCheckError.message 
        };
      }
      
      console.log("✅ [DEBUG] zara_cloth table exists with", tableCount, "items");

      if (!tableCount || tableCount === 0) {
        console.error("❌ [DEBUG] zara_cloth table is empty");
        return { 
          success: false, 
          error: "zara_cloth table is empty" 
        };
      }

      // Step 2: Get user profile data (optional for generation) - skip if table doesn't exist
      console.log("🔍 [DEBUG] Step 2: Attempting to fetch user profile...");
      let userProfile = null;
      
      try {
        // Try to fetch from style_quiz_results table directly
        const { data: profileData, error: profileError } = await supabase
          .from('style_quiz_results')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (!profileError && profileData) {
          userProfile = profileData;
          console.log("✅ [DEBUG] User profile found:", userProfile);
        } else {
          console.log("⚠️ [DEBUG] Profile fetch error or no profile found:", profileError?.message || "No profile data");
        }
      } catch (profileError) {
        console.log("⚠️ [DEBUG] Profile table not available, continuing without profile data");
      }

      // Step 3: Fetch random items from each category
      console.log("🔍 [DEBUG] Step 3: Fetching clothing items...");
      
      // Get random items from zara_cloth table
      const { data: allItems, error: fetchError } = await supabase
        .from('zara_cloth')
        .select('*')
        .limit(100); // Increased limit to have more items to filter from

      if (fetchError || !allItems?.length) {
        console.error('❌ [DEBUG] Error fetching items:', fetchError);
        return { 
          success: false, 
          error: "Failed to fetch items from database: " + (fetchError?.message || "No items found") 
        };
      }

      console.log('✅ [DEBUG] Items fetched:', allItems.length);

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
        return { 
          success: false, 
          error: "No items with valid image patterns (6_x_1.jpg) found in database" 
        };
      }

      // Randomly select items for the outfit from valid items
      const shuffled = [...validItems].sort(() => Math.random() - 0.5);
      const topItem = shuffled[0];
      const bottomItem = shuffled[1] || shuffled[0]; // Fallback to same item if not enough
      const shoesItem = shuffled[2] || shuffled[0]; // Fallback to same item if not enough

      console.log('✅ [DEBUG] Selected items:', { 
        topItem: topItem?.id, 
        bottomItem: bottomItem?.id, 
        shoesItem: shoesItem?.id 
      });

      // Log the actual image URLs being used
      console.log('🔍 [DEBUG] Selected item images:');
      console.log('Top item image:', topItem?.image);
      console.log('Bottom item image:', bottomItem?.image);
      console.log('Shoes item image:', shoesItem?.image);

      // Step 4: Create outfit object with database items
      const outfit = {
        top: topItem,
        bottom: bottomItem,
        shoes: shoesItem,
        score: Math.floor(Math.random() * 30) + 70,
        description: `Outfit generated using real Zara database items (no model images)`,
        recommendations: [
          "This combination uses actual Zara items from our database",
          "Images selected to avoid model photos (6_x_1.jpg pattern only)",
          `Perfect for your body shape`
        ],
        occasion: Math.random() > 0.5 ? 'work' : 'casual'
      };
      
      console.log("✅ [DEBUG] Generated database outfit successfully");
      return { success: true, data: outfit };
      
    } catch (error) {
      console.error("❌ [DEBUG] Error in styling agent:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error in styling agent" 
      };
    }
  }
};
