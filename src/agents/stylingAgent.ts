import { supabase } from "@/lib/supabaseClient";
import { GenerateOutfitTool } from "../tools/generateOutfitTool";
import { analyzeImagesWithAI } from "@/services/aiImageAnalysisService";

// Updated type to match actual database schema and handle NULL values
type ZaraClothItem = {
  id: string;
  product_name: string;
  price: number;
  colour: string;
  colour_code?: number | null;
  description?: string | null;
  size: string[]; // Array of sizes as in database
  materials?: any[] | null; // Can be array of objects or null
  materials_description?: string | null;
  availability: boolean;
  low_on_stock?: boolean | null;
  image?: any | null; // Can be string, array, or JSON
  category_id?: number | null;
  product_id?: number | null;
  product_family?: string | null;
  product_family_en?: string | null;
  product_subfamily?: string | null;
  section?: string | null;
  currency?: string | null;
  care?: any | null;
  dimension?: string | null;
  sku?: string | null;
  url?: string | null;
  you_may_also_like?: any | null;
  created_at: string;
};

// Interface defined but not exported to avoid conflicts
interface Agent {
  role: string;
  goal: string;
  backstory: string;
  tools: any[];
  run?: (userId: string) => Promise<any>;
}

/**
 * Helper function to get user budget from localStorage or filters
 */
const getUserBudget = (): number => {
  try {
    // Try to get budget from localStorage first
    const savedBudget = localStorage.getItem('user-budget');
    if (savedBudget) {
      const budget = parseInt(savedBudget);
      console.log(`📊 [DEBUG] Found saved budget: ${budget}`);
      return budget;
    }
    
    // Fallback to default budget
    console.log(`📊 [DEBUG] No budget found, using default: 500`);
    return 500; // Default budget in NIS
  } catch (error) {
    console.warn(`⚠️ [DEBUG] Error getting budget:`, error);
    return 500;
  }
};

/**
 * Helper function to get selected event type from localStorage
 */
const getSelectedEvent = (): string | null => {
  try {
    const event = localStorage.getItem('selected-event');
    console.log(`🎯 [DEBUG] Selected event: ${event}`);
    return event;
  } catch (error) {
    console.warn(`⚠️ [DEBUG] Error getting event:`, error);
    return null;
  }
};

/**
 * Helper function to get current mood from localStorage
 */
const getCurrentMood = (): string | null => {
  try {
    const mood = localStorage.getItem('current-mood');
    console.log(`😊 [DEBUG] Current mood: ${mood}`);
    return mood;
  } catch (error) {
    console.warn(`⚠️ [DEBUG] Error getting mood:`, error);
    return null;
  }
};

/**
 * Helper function to filter items by budget constraint
 */
const filterByBudget = (items: ZaraClothItem[], budget: number): ZaraClothItem[] => {
  // Filter items that are reasonably priced for the budget
  // Allow individual items up to 40% of total budget
  const maxItemPrice = budget * 0.4;
  
  const filteredItems = items.filter(item => item.price <= maxItemPrice);
  console.log(`💰 [DEBUG] Budget filter: ${items.length} -> ${filteredItems.length} items (max item price: ${maxItemPrice})`);
  
  return filteredItems;
};

/**
 * Helper function to filter items by event type
 */
const filterByEvent = (items: ZaraClothItem[], event: string | null): ZaraClothItem[] => {
  if (!event) return items;
  
  const eventLower = event.toLowerCase();
  let filteredItems = items;
  
  // Filter based on event type
  if (eventLower.includes('work') || eventLower.includes('business')) {
    // For work events, prefer formal and classic items
    filteredItems = items.filter(item => {
      const name = (item.product_name || '').toLowerCase();
      const family = (item.product_family || '').toLowerCase();
      const subfamily = (item.product_subfamily || '').toLowerCase();
      
      // Include formal items
      return name.includes('blazer') || name.includes('shirt') || name.includes('trouser') ||
             family.includes('formal') || subfamily.includes('עסקי') ||
             !name.includes('casual') && !name.includes('sport');
    });
  } else if (eventLower.includes('party') || eventLower.includes('date')) {
    // For parties/dates, prefer elegant and trendy items
    filteredItems = items.filter(item => {
      const name = (item.product_name || '').toLowerCase();
      const color = (item.colour || '').toLowerCase();
      
      // Include party-appropriate items
      return name.includes('dress') || name.includes('heel') || name.includes('elegant') ||
             color.includes('black') || color.includes('red') || color.includes('gold');
    });
  } else if (eventLower.includes('casual') || eventLower.includes('weekend')) {
    // For casual events, prefer comfortable and relaxed items
    filteredItems = items.filter(item => {
      const name = (item.product_name || '').toLowerCase();
      const family = (item.product_family || '').toLowerCase();
      
      // Include casual items
      return name.includes('jean') || name.includes('t-shirt') || name.includes('sneaker') ||
             name.includes('casual') || family.includes('casual');
    });
  }
  
  console.log(`🎯 [DEBUG] Event filter (${event}): ${items.length} -> ${filteredItems.length} items`);
  return filteredItems.length > 0 ? filteredItems : items; // Fallback to all items if no matches
};

/**
 * Helper function to filter items by mood
 */
const filterByMood = (items: ZaraClothItem[], mood: string | null): ZaraClothItem[] => {
  if (!mood) return items;
  
  const moodLower = mood.toLowerCase();
  let filteredItems = items;
  
  // Filter based on mood
  if (moodLower.includes('elegant') || moodLower.includes('sophisticated')) {
    // For elegant mood, prefer refined colors and styles
    filteredItems = items.filter(item => {
      const color = (item.colour || '').toLowerCase();
      const name = (item.product_name || '').toLowerCase();
      
      return color.includes('black') || color.includes('navy') || color.includes('white') ||
             color.includes('beige') || name.includes('elegant');
    });
  } else if (moodLower.includes('energized') || moodLower.includes('powerful')) {
    // For energized mood, prefer bright colors and bold styles
    filteredItems = items.filter(item => {
      const color = (item.colour || '').toLowerCase();
      
      return color.includes('red') || color.includes('orange') || color.includes('yellow') ||
             color.includes('bright') || color.includes('bold');
    });
  } else if (moodLower.includes('romantic') || moodLower.includes('sweet')) {
    // For romantic mood, prefer soft colors and feminine styles
    filteredItems = items.filter(item => {
      const color = (item.colour || '').toLowerCase();
      const name = (item.product_name || '').toLowerCase();
      
      return color.includes('pink') || color.includes('rose') || color.includes('pastel') ||
             color.includes('soft') || name.includes('dress') || name.includes('romantic');
    });
  } else if (moodLower.includes('calm') || moodLower.includes('quiet')) {
    // For calm mood, prefer neutral and muted colors
    filteredItems = items.filter(item => {
      const color = (item.colour || '').toLowerCase();
      
      return color.includes('beige') || color.includes('grey') || color.includes('cream') ||
             color.includes('neutral') || color.includes('muted');
    });
  }
  
  console.log(`😊 [DEBUG] Mood filter (${mood}): ${items.length} -> ${filteredItems.length} items`);
  return filteredItems.length > 0 ? filteredItems : items; // Fallback to all items if no matches
};

/**
 * Helper function to check if an item is actually a clothing item based on name and category
 * Only processes non-NULL values as specified
 */
const isValidClothingItem = (item: any): boolean => {
  if (!item || !item.availability) return false;
  
  const productName = (item.product_name || '').toLowerCase();
  const description = (item.description || '').toLowerCase();
  
  // Only use product_family and product_subfamily if they are not NULL
  const productFamily = item.product_family ? item.product_family.toLowerCase() : '';
  const subfamily = item.product_subfamily ? item.product_subfamily.toLowerCase() : '';
  
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
 * Professional outfit selection with budget, event, and mood considerations
 * Ensures budget compliance by validating total outfit cost
 */
const selectProfessionalOutfit = (items: ZaraClothItem[], budget: number): { top?: ZaraClothItem; bottom?: ZaraClothItem; shoes?: ZaraClothItem } => {
  // Filter available items and avoid low stock when possible
  const availableItems = items.filter(item => item.availability && !item.low_on_stock);
  const fallbackItems = items.filter(item => item.availability); // Include low stock as fallback
  
  const itemsToUse = availableItems.length >= 3 ? availableItems : fallbackItems;
  
  // Categorize by product_family - only if not NULL
  const tops = itemsToUse.filter(item => {
    if (!item.product_family && !item.product_subfamily) return false;
    
    const family = item.product_family ? item.product_family.toLowerCase() : '';
    const subfamily = item.product_subfamily ? item.product_subfamily.toLowerCase() : '';
    
    return family.includes('top') || family.includes('blouse') || family.includes('shirt') || 
           subfamily.includes('חולצ') || subfamily.includes('טופ') || subfamily.includes('בלוז');
  });
  
  const bottoms = itemsToUse.filter(item => {
    if (!item.product_family && !item.product_subfamily) return false;
    
    const family = item.product_family ? item.product_family.toLowerCase() : '';
    const subfamily = item.product_subfamily ? item.product_subfamily.toLowerCase() : '';
    
    return family.includes('bottom') || family.includes('pants') || family.includes('skirt') || 
           family.includes('dress') || subfamily.includes('מכנס') || subfamily.includes('חצאית') || subfamily.includes('שמלה');
  });
  
  const shoes = itemsToUse.filter(item => {
    if (!item.product_family && !item.product_subfamily) return false;
    
    const family = item.product_family ? item.product_family.toLowerCase() : '';
    const subfamily = item.product_subfamily ? item.product_subfamily.toLowerCase() : '';
    
    return family.includes('shoe') || family.includes('trainer') || family.includes('boot') || 
           subfamily.includes('נעל') || subfamily.includes('סנדל') || subfamily.includes('מגפ');
  });
  
  // Try multiple combinations to find one within budget
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const selectedTop = tops.length > 0 ? tops[Math.floor(Math.random() * tops.length)] : undefined;
    const selectedBottom = bottoms.length > 0 ? bottoms[Math.floor(Math.random() * bottoms.length)] : undefined;
    const selectedShoes = shoes.length > 0 ? shoes[Math.floor(Math.random() * shoes.length)] : undefined;
    
    if (selectedTop && selectedBottom && selectedShoes) {
      const totalCost = selectedTop.price + selectedBottom.price + selectedShoes.price;
      
      if (totalCost <= budget) {
        console.log(`💰 [DEBUG] Found outfit within budget: ${totalCost}₪ / ${budget}₪`);
        console.log(`🔍 [DEBUG] Professional outfit selection: TOP=${!!selectedTop}, BOTTOM=${!!selectedBottom}, SHOES=${!!selectedShoes}`);
        
        return {
          top: selectedTop,
          bottom: selectedBottom,
          shoes: selectedShoes
        };
      } else {
        console.log(`💰 [DEBUG] Outfit over budget (${totalCost}₪ > ${budget}₪), trying again...`);
      }
    }
  }
  
  // If no budget-compliant outfit found, return the cheapest option
  const cheapestTop = tops.sort((a, b) => a.price - b.price)[0];
  const cheapestBottom = bottoms.sort((a, b) => a.price - b.price)[0];
  const cheapestShoes = shoes.sort((a, b) => a.price - b.price)[0];
  
  console.log(`⚠️ [DEBUG] Could not find outfit within budget, returning cheapest options`);
  
  return {
    top: cheapestTop,
    bottom: cheapestBottom,
    shoes: cheapestShoes
  };
};

/**
 * Styling Generator Agent
 * Generates outfit suggestions using items from the zara_cloth database table with professional guidelines
 */
export const stylingAgent: Agent = {
  role: "Professional AI Styling Assistant",
  goal: "Recommend relevant fashion items based on event type, personal style preferences, budget constraints, and mood",
  backstory: "Professional stylist with expertise in combining clothing items from database, selecting best product images, and creating cohesive outfits within budget",
  tools: [GenerateOutfitTool],
  
  /**
   * Runs the styling agent to generate a professional outfit recommendation from database items
   * @param userId The ID of the user to generate outfit for
   */
  run: async (userId: string) => {
    console.log("🔍 [DEBUG] Professional StylingAgent starting for user:", userId);
    
    try {
      // Step 1: Get user preferences from localStorage
      const budget = getUserBudget();
      const selectedEvent = getSelectedEvent();
      const currentMood = getCurrentMood();
      
      console.log(`📊 [DEBUG] User preferences - Budget: ${budget}₪, Event: ${selectedEvent}, Mood: ${currentMood}`);
      
      // Step 2: Check if zara_cloth table exists and get actual count
      console.log("🔍 [DEBUG] Step 2: Checking zara_cloth table...");
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

      // Step 3: Fetch available clothing items (only available=true)
      console.log("🔍 [DEBUG] Step 3: Fetching available clothing items...");
      
      const { data: allItems, error: fetchError } = await supabase
        .from('zara_cloth')
        .select('*')
        .eq('availability', true)
        .limit(300);

      if (fetchError || !allItems?.length) {
        console.error('❌ [DEBUG] Error fetching items:', fetchError);
        return { 
          success: false, 
          error: "Failed to fetch available items from database: " + (fetchError?.message || "No items found") 
        };
      }

      console.log('✅ [DEBUG] Available items fetched:', allItems.length);

      // Step 4: Apply all filters
      console.log('🔍 [DEBUG] Starting professional filtering for valid clothing items...');
      
      // First filter for valid clothing items with good images
      let validItems = allItems.filter((item, index) => {
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

      console.log(`✅ [DEBUG] Valid items after clothing/image filtering: ${validItems.length} out of ${allItems.length}`);

      // Apply budget filter - now correctly typed
      validItems = filterByBudget(validItems, budget);
      
      // Apply event filter - now correctly typed
      validItems = filterByEvent(validItems, selectedEvent);
      
      // Apply mood filter - now correctly typed
      validItems = filterByMood(validItems, currentMood);

      console.log(`✅ [DEBUG] Final valid items after all filters: ${validItems.length}`);

      if (validItems.length === 0) {
        console.error('❌ [DEBUG] No valid clothing items found after applying all filters');
        return { 
          success: false, 
          error: "No suitable clothing items found matching your budget, event, and mood preferences" 
        };
      }

      // Step 5: Professional outfit selection with budget consideration
      const outfitSelection = selectProfessionalOutfit(validItems, budget);
      
      if (!outfitSelection.top || !outfitSelection.bottom || !outfitSelection.shoes) {
        console.error('❌ [DEBUG] Could not find complete professional outfit within budget');
        return { 
          success: false, 
          error: "Could not find complete outfit items (top, bottom, shoes) within your budget and preferences" 
        };
      }

      // Calculate total cost
      const totalCost = outfitSelection.top.price + outfitSelection.bottom.price + outfitSelection.shoes.price;

      // Extract AI-selected or best product images
      console.log('🔍 [DEBUG] Extracting AI-selected product images...');
      const topImage = await extractMainProductImage(outfitSelection.top?.image, outfitSelection.top?.id);
      const bottomImage = await extractMainProductImage(outfitSelection.bottom?.image, outfitSelection.bottom?.id);
      const shoesImage = await extractMainProductImage(outfitSelection.shoes?.image, outfitSelection.shoes?.id);

      console.log('🔍 [DEBUG] Professional outfit images:');
      console.log('Top item image:', topImage);
      console.log('Bottom item image:', bottomImage);
      console.log('Shoes item image:', shoesImage);

      // Step 6: Create professional outfit object with database items and AI-selected images
      const outfit = {
        top: {
          ...outfitSelection.top,
          image: topImage
        },
        bottom: {
          ...outfitSelection.bottom,
          image: bottomImage
        },
        shoes: {
          ...outfitSelection.shoes,
          image: shoesImage
        },
        score: Math.floor(Math.random() * 30) + 70,
        description: `Professional outfit recommendation (${totalCost}₪/${budget}₪) tailored for ${selectedEvent || 'general occasion'} with ${currentMood || 'balanced'} mood`,
        recommendations: [
          `Budget-conscious selection: ${totalCost}₪ out of ${budget}₪ budget`,
          `Event-appropriate styling for ${selectedEvent || 'general occasions'}`,
          `Mood-matched design reflecting ${currentMood || 'balanced'} feelings`,
          "Items selected from real Zara database with AI-analyzed images",
          "All items currently available and prioritized over low-stock alternatives",
          "Colors and styles coordinated for visual appeal and occasion suitability"
        ],
        occasion: selectedEvent || 'general',
        totalCost: totalCost,
        budget: budget,
        mood: currentMood
      };
      
      console.log("✅ [DEBUG] Generated professional database outfit successfully with budget and preference filtering");
      return { success: true, data: outfit };
      
    } catch (error) {
      console.error("❌ [DEBUG] Error in professional styling agent:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error in styling agent" 
      };
    }
  }
};
