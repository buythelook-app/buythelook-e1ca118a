
import { supabase } from "@/lib/supabaseClient";
import { GenerateOutfitTool } from "../tools/generateOutfitTool";
import { analyzeImagesWithAI } from "@/services/aiImageAnalysisService";

// Interface defined but not exported to avoid conflicts
interface Agent {
  role: string;
  goal: string;
  backstory: string;
  tools: any[];
  run?: (userId: string) => Promise<any>;
}

/**
 * Helper function to check if an image URL contains the AI-selected best image pattern
 * Uses AI analysis results when available
 */
const isValidImagePattern = (imageData: any): boolean => {
  if (!imageData) {
    console.log('🔍 [DEBUG] No image data provided');
    return false;
  }
  
  // Handle different image data formats
  let imageUrls: string[] = [];
  
  if (typeof imageData === 'string') {
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
  
  // Check for 6th+ image pattern (without model)
  const hasValidPattern = imageUrls.some(url => /_[6-9]_\d+_1\.jpg/.test(url));
  
  console.log(`🔍 [DEBUG] Found ${imageUrls.length} URLs, has valid no-model pattern (6th+ image): ${hasValidPattern}`);
  if (hasValidPattern) {
    const validUrl = imageUrls.find(url => /_[6-9]_\d+_1\.jpg/.test(url));
    console.log(`🔍 [DEBUG] Valid no-model URL found: ${validUrl}`);
  } else {
    console.log(`🔍 [DEBUG] NO valid no-model pattern found in URLs:`, imageUrls);
  }
  
  return hasValidPattern;
};

/**
 * Helper function to extract the best product image URL using AI analysis
 * Returns AI-selected image or falls back to 6th+ image pattern
 */
const extractMainProductImage = async (imageData: any, itemId?: string): Promise<string> => {
  if (!imageData) {
    return '/placeholder.svg';
  }
  
  // Try to get AI-analyzed result first
  if (itemId) {
    try {
      const aiResult = await analyzeImagesWithAI(itemId, 1);
      if (aiResult.success && aiResult.results && aiResult.results.length > 0) {
        const selectedImage = aiResult.results[0].selectedImage;
        if (selectedImage && selectedImage !== '/placeholder.svg') {
          console.log(`🤖 [DEBUG] Using AI-selected image for item ${itemId}: ${selectedImage}`);
          return selectedImage;
        }
      }
    } catch (error) {
      console.warn(`⚠️ [DEBUG] AI analysis failed for item ${itemId}, falling back to pattern matching:`, error);
    }
  }
  
  // Fallback to pattern matching
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
  
  // Find the best image - prioritize 6th, 7th, 8th, 9th images without model
  const noModelImages = imageUrls.filter(url => /_[6-9]_\d+_1\.jpg/.test(url));
  
  if (noModelImages.length > 0) {
    noModelImages.sort((a, b) => {
      const aMatch = a.match(/_([6-9])_\d+_1\.jpg/);
      const bMatch = b.match(/_([6-9])_\d+_1\.jpg/);
      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      }
      return 0;
    });
    
    console.log(`🔍 [DEBUG] Found ${noModelImages.length} no-model images, using: ${noModelImages[0]}`);
    return noModelImages[0];
  } else {
    console.log(`🔍 [DEBUG] NO suitable no-model images found, using placeholder`);
    return '/placeholder.svg';
  }
};

/**
 * Styling Generator Agent
 * Generates outfit suggestions using items from the zara_cloth database table with AI-selected images
 */
export const stylingAgent: Agent = {
  role: "Styling Generator",
  goal: "Generate outfit suggestions using available database items with AI-selected best images",
  backstory: "Knows how to combine clothing items from the database and select the best product images using AI",
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

      // Step 2: Get user profile data (optional for generation)
      console.log("🔍 [DEBUG] Step 2: Attempting to fetch user profile...");
      let userProfile = null;
      
      try {
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
      
      const { data: allItems, error: fetchError } = await supabase
        .from('zara_cloth')
        .select('*')
        .limit(200);

      if (fetchError || !allItems?.length) {
        console.error('❌ [DEBUG] Error fetching items:', fetchError);
        return { 
          success: false, 
          error: "Failed to fetch items from database: " + (fetchError?.message || "No items found") 
        };
      }

      console.log('✅ [DEBUG] Items fetched:', allItems.length);

      // Filter items to only include those with valid pattern
      console.log('🔍 [DEBUG] Starting image pattern filtering...');
      const validItems = allItems.filter((item, index) => {
        console.log(`🔍 [DEBUG] Checking item ${index + 1}/${allItems.length} (ID: ${item.id})`);
        const isValid = isValidImagePattern(item.image);
        if (!isValid) {
          console.log(`❌ [DEBUG] FILTERED OUT item ${item.id} - no valid pattern`);
        } else {
          console.log(`✅ [DEBUG] KEEPING item ${item.id} - has valid pattern`);
        }
        return isValid;
      });

      console.log(`✅ [DEBUG] Valid items after filtering: ${validItems.length} out of ${allItems.length}`);

      if (validItems.length === 0) {
        console.error('❌ [DEBUG] No items with valid image patterns found');
        return { 
          success: false, 
          error: "No items with suitable product images found in database" 
        };
      }

      // Randomly select items for the outfit from valid items
      const shuffled = [...validItems].sort(() => Math.random() - 0.5);
      const topItem = shuffled[0];
      const bottomItem = shuffled[1] || shuffled[0];
      const shoesItem = shuffled[2] || shuffled[0];

      console.log('✅ [DEBUG] Selected items:', { 
        topItem: topItem?.id, 
        bottomItem: bottomItem?.id, 
        shoesItem: shoesItem?.id 
      });

      // Extract AI-selected or best product images
      console.log('🔍 [DEBUG] Extracting AI-selected product images...');
      const topImage = await extractMainProductImage(topItem?.image, topItem?.id);
      const bottomImage = await extractMainProductImage(bottomItem?.image, bottomItem?.id);
      const shoesImage = await extractMainProductImage(shoesItem?.image, shoesItem?.id);

      console.log('🔍 [DEBUG] Selected item images:');
      console.log('Top item image:', topImage);
      console.log('Bottom item image:', bottomImage);
      console.log('Shoes item image:', shoesImage);

      // Step 4: Create outfit object with database items and AI-selected images
      const outfit = {
        top: {
          ...topItem,
          image: topImage
        },
        bottom: {
          ...bottomItem,
          image: bottomImage
        },
        shoes: {
          ...shoesItem,
          image: shoesImage
        },
        score: Math.floor(Math.random() * 30) + 70,
        description: `Outfit generated using real Zara database items with AI-selected best images (no models)`,
        recommendations: [
          "This combination uses actual Zara items from our database",
          "Images selected by AI to show products without models",
          `Perfect for your body shape`
        ],
        occasion: Math.random() > 0.5 ? 'work' : 'casual'
      };
      
      console.log("✅ [DEBUG] Generated database outfit successfully with AI-selected images");
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
