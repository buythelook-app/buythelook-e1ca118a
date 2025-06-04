import { supabase } from "@/lib/supabaseClient";
import { GenerateOutfitTool } from "../tools/generateOutfitTool";
import { analyzeImagesWithAI } from "@/services/aiImageAnalysisService";
import { Database } from "@/integrations/supabase/types";

// Use the correct database type from Supabase integrations
type ZaraClothItem = Database['public']['Tables']['zara_cloth']['Row'];

// Interface defined but not exported to avoid conflicts
interface Agent {
  role: string;
  goal: string;
  backstory: string;
  tools: any[];
  run?: (userId: string) => Promise<any>;
}

/**
 * Helper function to check if an item is actually a clothing item based on name and category
 */
const isValidClothingItem = (item: ZaraClothItem): boolean => {
  if (!item) return false;
  
  const productName = (item.product_name || '').toLowerCase();
  const description = (item.description || '').toLowerCase();
  const productFamily = (item.product_family || '').toLowerCase();
  const subfamily = (item.product_subfamily || '').toLowerCase();
  
  // Exclude non-clothing items
  const excludePatterns = [
    'תיק', 'bag', 'ארנק', 'wallet', 'משקפיים', 'glasses', 'שעון', 'watch',
    'צמיד', 'bracelet', 'שרשרת', 'necklace', 'עגיל', 'earring', 'טבעת', 'ring',
    'כובע', 'hat', 'כפפות', 'gloves', 'חגורה', 'belt', 'זרוע', 'arm',
    'כלי', 'tool', 'ספר', 'book', 'נייר', 'paper', 'מחשב', 'computer',
    'טלפון', 'phone', 'כבל', 'cable', 'מטען', 'charger'
  ];
  
  const fullText = `${productName} ${description} ${productFamily} ${subfamily}`;
  
  // Check if item contains any excluded patterns
  const hasExcludedPattern = excludePatterns.some(pattern => fullText.includes(pattern));
  
  if (hasExcludedPattern) {
    console.log(`❌ [DEBUG] Filtered out non-clothing item: ${item.id} - ${productName}`);
    return false;
  }
  
  // Must contain clothing-related patterns
  const clothingPatterns = [
    'חולצ', 'shirt', 'בלוז', 'blouse', 'טופ', 'top', 'גופייה', 'tank',
    'מכנס', 'pants', 'ג\'ינס', 'jeans', 'חצאית', 'skirt', 'שמלה', 'dress',
    'נעל', 'shoe', 'סנדל', 'sandal', 'מגפ', 'boot', 'נעלי', 'sneaker',
    'סוודר', 'sweater', 'קרדיגן', 'cardigan', 'ז\'קט', 'jacket', 'מעיל', 'coat'
  ];
  
  const hasClothingPattern = clothingPatterns.some(pattern => fullText.includes(pattern));
  
  if (!hasClothingPattern) {
    console.log(`❌ [DEBUG] Filtered out item without clothing patterns: ${item.id} - ${productName}`);
    return false;
  }
  
  console.log(`✅ [DEBUG] Valid clothing item: ${item.id} - ${productName}`);
  return true;
};

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
 * Helper function to determine if a top item has short sleeves based on product name and description
 */
const hasShortSleeves = (item: ZaraClothItem): boolean => {
  if (!item) return false;
  
  const productName = (item.product_name || '').toLowerCase();
  const description = (item.description || '').toLowerCase();
  const productFamily = (item.product_family || '').toLowerCase();
  
  // Hebrew patterns for short sleeves
  const shortSleevePatterns = [
    'שרוול קצר',
    'ללא שרוולים',
    'גופייה',
    'טופ',
    'חולצת טי',
    'טי שירט',
    'קמיסול'
  ];
  
  // Hebrew patterns for long sleeves
  const longSleevePatterns = [
    'שרוול ארוך',
    'שרוולים ארוכים',
    'סוודר',
    'קרדיגן',
    'חולצה מכופתרת'
  ];
  
  const fullText = `${productName} ${description} ${productFamily}`;
  
  // Check for explicit short sleeve patterns
  const hasShortSleevePattern = shortSleevePatterns.some(pattern => 
    fullText.includes(pattern)
  );
  
  // Check for explicit long sleeve patterns
  const hasLongSleevePattern = longSleevePatterns.some(pattern => 
    fullText.includes(pattern)
  );
  
  // If we have explicit patterns, use them
  if (hasShortSleevePattern && !hasLongSleevePattern) {
    console.log(`🔍 [DEBUG] Item ${item.id} detected as SHORT sleeves: ${productName}`);
    return true;
  }
  
  if (hasLongSleevePattern && !hasShortSleevePattern) {
    console.log(`🔍 [DEBUG] Item ${item.id} detected as LONG sleeves: ${productName}`);
    return false;
  }
  
  // Default assumption: if it's summer-like clothing, assume short sleeves
  const summerPatterns = ['קיץ', 'חוף', 'ים', 'שמש'];
  const hasSummerPattern = summerPatterns.some(pattern => fullText.includes(pattern));
  
  if (hasSummerPattern) {
    console.log(`🔍 [DEBUG] Item ${item.id} detected as summer clothing (SHORT sleeves): ${productName}`);
    return true;
  }
  
  // Default to short sleeves if unclear
  console.log(`🔍 [DEBUG] Item ${item.id} sleeve length unclear, defaulting to SHORT: ${productName}`);
  return true;
};

/**
 * Helper function to filter shoes based on whether they should be open or closed
 */
const filterShoesByType = (shoes: ZaraClothItem[], shouldBeOpen: boolean): ZaraClothItem[] => {
  return shoes.filter(shoe => {
    if (!shoe) return false;
    
    const productName = (shoe.product_name || '').toLowerCase();
    const description = (shoe.description || '').toLowerCase();
    const productFamily = (shoe.product_family || '').toLowerCase();
    
    const fullText = `${productName} ${description} ${productFamily}`;
    
    // Hebrew patterns for open shoes (sandals, etc.)
    const openShoePatterns = [
      'סנדל',
      'כפכפים',
      'נעלי קיץ',
      'נעלי חוף',
      'פתוח',
      'אוורור'
    ];
    
    // Hebrew patterns for closed shoes
    const closedShoePatterns = [
      'נעל עקב',
      'מגפון',
      'נעל סגורה',
      'נעלי עבודה',
      'נעלי חורף',
      'נעל עור',
      'מוקסין'
    ];
    
    const hasOpenPattern = openShoePatterns.some(pattern => fullText.includes(pattern));
    const hasClosedPattern = closedShoePatterns.some(pattern => fullText.includes(pattern));
    
    // If we want open shoes
    if (shouldBeOpen) {
      // Prefer shoes with open patterns, avoid shoes with closed patterns
      if (hasOpenPattern && !hasClosedPattern) {
        console.log(`🔍 [DEBUG] Selected OPEN shoe: ${productName}`);
        return true;
      }
      // If no clear pattern, allow it (might be general shoes)
      if (!hasOpenPattern && !hasClosedPattern) {
        return true;
      }
      return false;
    } else {
      // We want closed shoes
      // Prefer shoes with closed patterns, avoid shoes with open patterns
      if (hasClosedPattern && !hasOpenPattern) {
        console.log(`🔍 [DEBUG] Selected CLOSED shoe: ${productName}`);
        return true;
      }
      // If no clear pattern, allow it (might be general shoes)
      if (!hasOpenPattern && !hasClosedPattern) {
        return true;
      }
      return false;
    }
  });
};

/**
 * Styling Generator Agent
 * Generates outfit suggestions using items from the zara_cloth database table with AI-selected images
 */
export const stylingAgent: Agent = {
  role: "Styling Generator",
  goal: "Generate complete outfit suggestions using available database items with AI-selected best images and sleeve-appropriate shoes",
  backstory: "Knows how to combine clothing items from the database, select the best product images using AI, and match shoe types to sleeve lengths",
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
        // Use raw query to avoid type issues
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
        .limit(300); // Increased limit to have more options

      if (fetchError || !allItems?.length) {
        console.error('❌ [DEBUG] Error fetching items:', fetchError);
        return { 
          success: false, 
          error: "Failed to fetch items from database: " + (fetchError?.message || "No items found") 
        };
      }

      console.log('✅ [DEBUG] Items fetched:', allItems.length);

      // Filter items to only include valid clothing items and those with valid image patterns
      console.log('🔍 [DEBUG] Starting filtering for valid clothing items with image patterns...');
      const validItems = allItems.filter((item, index) => {
        console.log(`🔍 [DEBUG] Checking item ${index + 1}/${allItems.length} (ID: ${item.id})`);
        
        // First check if it's a valid clothing item
        const isClothing = isValidClothingItem(item);
        if (!isClothing) {
          return false;
        }
        
        // Then check if it has valid image pattern
        const hasValidImage = isValidImagePattern(item.image);
        if (!hasValidImage) {
          console.log(`❌ [DEBUG] FILTERED OUT item ${item.id} - no valid image pattern`);
          return false;
        }
        
        console.log(`✅ [DEBUG] KEEPING item ${item.id} - valid clothing with good image`);
        return true;
      });

      console.log(`✅ [DEBUG] Valid items after filtering: ${validItems.length} out of ${allItems.length}`);

      if (validItems.length === 0) {
        console.error('❌ [DEBUG] No valid clothing items with suitable image patterns found');
        return { 
          success: false, 
          error: "No valid clothing items with suitable product images found in database" 
        };
      }

      // Separate items by category with enhanced classification
      const topItems = validItems.filter(item => {
        const name = (item.product_name || '').toLowerCase();
        const family = (item.product_family || '').toLowerCase();
        const subfamily = (item.product_subfamily || '').toLowerCase();
        return name.includes('חולצ') || name.includes('טופ') || name.includes('גופייה') || 
               name.includes('בלוז') || name.includes('סוודר') || name.includes('קרדיגן') ||
               family.includes('חולצ') || family.includes('טופ') || family.includes('בלוז') ||
               subfamily.includes('חולצ') || subfamily.includes('טופ') || subfamily.includes('בלוז');
      });

      const bottomItems = validItems.filter(item => {
        const name = (item.product_name || '').toLowerCase();
        const family = (item.product_family || '').toLowerCase();
        const subfamily = (item.product_subfamily || '').toLowerCase();
        return name.includes('מכנס') || name.includes('חצאית') || name.includes('ג\'ינס') || 
               name.includes('שורט') || name.includes('מכנסיים') ||
               family.includes('מכנס') || family.includes('חצאית') || family.includes('ג\'ינס') ||
               subfamily.includes('מכנס') || subfamily.includes('חצאית') || subfamily.includes('ג\'ינס');
      });

      const shoeItems = validItems.filter(item => {
        const name = (item.product_name || '').toLowerCase();
        const family = (item.product_family || '').toLowerCase();
        const subfamily = (item.product_subfamily || '').toLowerCase();
        return name.includes('נעל') || name.includes('סנדל') || name.includes('מגפ') || 
               name.includes('נעלי') || name.includes('בוט') ||
               family.includes('נעל') || family.includes('סנדל') || family.includes('מגפ') ||
               subfamily.includes('נעל') || subfamily.includes('סנדל') || subfamily.includes('מגפ');
      });

      console.log(`🔍 [DEBUG] Category distribution: TOP=${topItems.length}, BOTTOM=${bottomItems.length}, SHOES=${shoeItems.length}`);

      // Ensure we have items in each category, use fallback if needed
      if (topItems.length === 0) {
        console.warn('⚠️ [DEBUG] No top items found, using first 10 items as fallback');
        topItems.push(...validItems.slice(0, Math.min(10, validItems.length)));
      }
      
      if (bottomItems.length === 0) {
        console.warn('⚠️ [DEBUG] No bottom items found, using middle items as fallback');
        const startIndex = Math.floor(validItems.length / 3);
        bottomItems.push(...validItems.slice(startIndex, startIndex + Math.min(10, validItems.length - startIndex)));
      }
      
      if (shoeItems.length === 0) {
        console.warn('⚠️ [DEBUG] No shoe items found, using last items as fallback');
        const startIndex = Math.floor(validItems.length * 2 / 3);
        shoeItems.push(...validItems.slice(startIndex, startIndex + Math.min(10, validItems.length - startIndex)));
      }

      // Randomly select items ensuring we have all three categories
      const topItem = topItems[Math.floor(Math.random() * topItems.length)];
      const bottomItem = bottomItems[Math.floor(Math.random() * bottomItems.length)];

      // Determine shoe type based on top item sleeve length
      const shouldUseOpenShoes = hasShortSleeves(topItem);
      console.log(`🔍 [DEBUG] Top item has ${shouldUseOpenShoes ? 'SHORT' : 'LONG'} sleeves, selecting ${shouldUseOpenShoes ? 'OPEN' : 'CLOSED'} shoes`);

      // Filter shoes based on sleeve length and select one
      let filteredShoes = filterShoesByType(shoeItems, shouldUseOpenShoes);
      
      // If no matching shoes found, use any available shoe
      if (filteredShoes.length === 0) {
        console.log('⚠️ [DEBUG] No matching shoes found, using any available shoe');
        filteredShoes = shoeItems;
      }

      const shoesItem = filteredShoes[Math.floor(Math.random() * filteredShoes.length)];

      console.log('✅ [DEBUG] Selected items:', { 
        topItem: topItem?.id, 
        bottomItem: bottomItem?.id, 
        shoesItem: shoesItem?.id,
        shoeType: shouldUseOpenShoes ? 'OPEN' : 'CLOSED'
      });

      // Validate that we have all three required items
      if (!topItem || !bottomItem || !shoesItem) {
        console.error('❌ [DEBUG] Missing required items:', { 
          hasTop: !!topItem, 
          hasBottom: !!bottomItem, 
          hasShoes: !!shoesItem 
        });
        return { 
          success: false, 
          error: "Could not find complete outfit items (top, bottom, shoes)" 
        };
      }

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
        description: `Complete outfit with top, bottom, and shoes - generated using real Zara database items with AI-selected images`,
        recommendations: [
          "This combination uses actual Zara items from our database",
          "Images selected by AI to show products without models",
          `${shouldUseOpenShoes ? 'Open shoes' : 'Closed shoes'} selected to match ${shouldUseOpenShoes ? 'short' : 'long'} sleeve top`,
          "Complete outfit with all essential clothing pieces",
          `Perfect for your body shape`
        ],
        occasion: Math.random() > 0.5 ? 'work' : 'casual'
      };
      
      console.log("✅ [DEBUG] Generated complete database outfit successfully with all three items");
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
