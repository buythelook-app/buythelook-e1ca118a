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
 * Helper function to check if an image URL contains the specific _6_x_1.jpg pattern
 * Only accepts Zara main product photos with this specific pattern
 */
const isValidImagePattern = (imageData: any): boolean => {
  if (!imageData) {
    console.log('🔍 [DEBUG] No image data provided');
    return false;
  }
  
  // Handle different image data formats
  let imageUrls: string[] = [];
  
  if (typeof imageData === 'string') {
    // Handle JSON string arrays like "[\"https://static.zara.net/photos/...jpg\"]"
    try {
      const parsed = JSON.parse(imageData);
      if (Array.isArray(parsed)) {
        imageUrls = parsed.filter(url => typeof url === 'string');
        console.log(`🔍 [DEBUG] Parsed JSON array with ${imageUrls.length} URLs`);
      } else {
        imageUrls = [imageData];
        console.log(`🔍 [DEBUG] Using string directly: ${imageData}`);
      }
    } catch {
      imageUrls = [imageData];
      console.log(`🔍 [DEBUG] Failed to parse JSON, using string directly: ${imageData}`);
    }
  } else if (Array.isArray(imageData)) {
    imageUrls = imageData.filter(url => typeof url === 'string');
    console.log(`🔍 [DEBUG] Using array with ${imageUrls.length} URLs`);
  } else if (typeof imageData === 'object' && imageData.url) {
    imageUrls = [imageData.url];
    console.log(`🔍 [DEBUG] Using URL from object: ${imageData.url}`);
  } else {
    console.log(`🔍 [DEBUG] Unknown image data format:`, typeof imageData, imageData);
    return false;
  }
  
  // STRICTLY check if any URL contains the _6_x_1.jpg pattern (main product photos)
  const hasValidPattern = imageUrls.some(url => /_6_\d+_1\.jpg/.test(url));
  
  console.log(`🔍 [DEBUG] Found ${imageUrls.length} URLs, has _6_x_1.jpg pattern: ${hasValidPattern}`);
  if (hasValidPattern) {
    const validUrl = imageUrls.find(url => /_6_\d+_1\.jpg/.test(url));
    console.log(`🔍 [DEBUG] Valid URL found: ${validUrl}`);
  } else {
    console.log(`🔍 [DEBUG] NO _6_x_1.jpg pattern found in URLs:`, imageUrls);
  }
  
  return hasValidPattern;
};

/**
 * Helper function to extract the main product image URL (_6_x_1.jpg pattern)
 * Returns placeholder if no _6_x_1.jpg pattern is found
 */
const extractMainProductImage = (imageData: any): string => {
  if (!imageData) {
    return '/placeholder.svg';
  }
  
  let imageUrls: string[] = [];
  
  if (typeof imageData === 'string') {
    try {
      const parsed = JSON.parse(imageData);
      if (Array.isArray(parsed)) {
        imageUrls = parsed.filter(url => typeof url === 'string');
      } else {
        imageUrls = [imageData];
      }
    } catch {
      imageUrls = [imageData];
    }
  } else if (Array.isArray(imageData)) {
    imageUrls = imageData.filter(url => typeof url === 'string');
  } else if (typeof imageData === 'object' && imageData.url) {
    imageUrls = [imageData.url];
  }
  
  // STRICTLY find the first URL with _6_x_1.jpg pattern - NO FALLBACK
  const mainImage = imageUrls.find(url => /_6_\d+_1\.jpg/.test(url));
  
  if (mainImage) {
    console.log(`🔍 [DEBUG] Found _6_x_1.jpg image: ${mainImage}`);
    return mainImage;
  } else {
    console.log(`🔍 [DEBUG] NO _6_x_1.jpg image found, using placeholder`);
    return '/placeholder.svg';
  }
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
        // Try to fetch from style_quiz_results table directly using type assertion
        const { data: profileData, error: profileError } = await (supabase as any)
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
        .limit(200); // Increased limit to have more items to filter from

      if (fetchError || !allItems?.length) {
        console.error('❌ [DEBUG] Error fetching items:', fetchError);
        return { 
          success: false, 
          error: "Failed to fetch items from database: " + (fetchError?.message || "No items found") 
        };
      }

      console.log('✅ [DEBUG] Items fetched:', allItems.length);

      // Filter items to only include those with valid _6_x_1.jpg pattern
      console.log('🔍 [DEBUG] Starting _6_x_1.jpg pattern filtering...');
      const validItems = allItems.filter((item, index) => {
        console.log(`🔍 [DEBUG] Checking item ${index + 1}/${allItems.length} (ID: ${item.id})`);
        const isValid = isValidImagePattern(item.image);
        if (!isValid) {
          console.log(`❌ [DEBUG] FILTERED OUT item ${item.id} - no _6_x_1.jpg pattern`);
        } else {
          console.log(`✅ [DEBUG] KEEPING item ${item.id} - has _6_x_1.jpg pattern`);
        }
        return isValid;
      });

      console.log(`✅ [DEBUG] Valid items after _6_x_1.jpg filtering: ${validItems.length} out of ${allItems.length}`);

      if (validItems.length === 0) {
        console.error('❌ [DEBUG] No items with _6_x_1.jpg pattern found');
        return { 
          success: false, 
          error: "No items with _6_x_1.jpg main product images found in database" 
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

      // Log the actual image URLs being used (extract main product images)
      console.log('🔍 [DEBUG] Selected item main product images:');
      console.log('Top item image:', extractMainProductImage(topItem?.image));
      console.log('Bottom item image:', extractMainProductImage(bottomItem?.image));
      console.log('Shoes item image:', extractMainProductImage(shoesItem?.image));

      // Step 4: Create outfit object with database items and main product images
      const outfit = {
        top: {
          ...topItem,
          image: extractMainProductImage(topItem?.image)
        },
        bottom: {
          ...bottomItem,
          image: extractMainProductImage(bottomItem?.image)
        },
        shoes: {
          ...shoesItem,
          image: extractMainProductImage(shoesItem?.image)
        },
        score: Math.floor(Math.random() * 30) + 70,
        description: `Outfit generated using real Zara database items with main product images (_6_x_1.jpg)`,
        recommendations: [
          "This combination uses actual Zara items from our database",
          "Images selected to show main product photos clearly",
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
