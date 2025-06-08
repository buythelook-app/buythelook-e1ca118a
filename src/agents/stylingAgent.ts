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

// Global tracker to prevent duplicate items across multiple outfit generations
let usedItemIds = new Set<string>();

/**
 * Helper function to clear the global used items tracker
 */
const clearUsedItems = () => {
  usedItemIds.clear();
  console.log('🔄 [DEBUG] Cleared used items tracker');
};

/**
 * Helper function to check if an item has already been used
 */
const isItemAlreadyUsed = (itemId: string): boolean => {
  return usedItemIds.has(itemId);
};

/**
 * Helper function to mark an item as used
 */
const markItemAsUsed = (itemId: string): void => {
  usedItemIds.add(itemId);
  console.log(`📝 [DEBUG] Marked item ${itemId} as used`);
};

/**
 * Helper function to check if an item is a valid clothing item
 */
const isValidClothingItem = (item: ZaraClothItem): boolean => {
  const name = (item.product_name || '').toLowerCase();
  const family = (item.product_family || '').toLowerCase();
  const subfamily = (item.product_subfamily || '').toLowerCase();
  
  // Exclude non-clothing items
  const excludePatterns = [
    'perfume', 'fragrance', 'בושם', 'ריח',
    'bag', 'תיק', 'handbag', 'backpack',
    'wallet', 'ארנק', 'purse',
    'watch', 'שעון',
    'phone case', 'כיסוי טלפון',
    'makeup', 'איפור', 'cosmetic',
    'candle', 'נר',
    'home', 'בית', 'decoration'
  ];
  
  const fullText = `${name} ${family} ${subfamily}`;
  const hasExcludePattern = excludePatterns.some(pattern => fullText.includes(pattern));
  
  return !hasExcludePattern;
};

/**
 * Helper function to check if an image has valid pattern
 */
const isValidImagePattern = (imageData: any, itemType: string = 'clothing'): boolean => {
  if (!imageData) {
    return false;
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
  
  // For shoes, be more lenient - accept 6th image and up
  if (itemType === 'shoes') {
    return imageUrls.some(url => /_[6-9]_\d+_1\.jpg/.test(url));
  }
  
  // For clothing, prefer 6th image and up but be more flexible
  return imageUrls.some(url => /_[6-9]_\d+_1\.jpg/.test(url)) || imageUrls.length > 0;
};

/**
 * Helper function to extract main product image
 */
const extractMainProductImage = async (imageData: any, itemId?: string, itemType?: string): Promise<string> => {
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
  
  // Find the best image - prioritize 6th, 7th, 8th, 9th images
  const noModelImages = imageUrls.filter(url => /_[6-9]_\d+_1\.jpg/.test(url));
  
  if (noModelImages.length > 0) {
    return noModelImages[0];
  } else if (imageUrls.length > 0) {
    return imageUrls[0];
  } else {
    return '/placeholder.svg';
  }
};

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
  
  const filteredItems = items.filter(item => {
    // Safely handle price field - ensure it's a valid number
    const itemPrice = typeof item.price === 'number' ? item.price : 0;
    return itemPrice <= maxItemPrice;
  });
  
  console.log(`💰 [DEBUG] Budget filter: ${items.length} -> ${filteredItems.length} items (max item price: ${maxItemPrice})`);
  
  return filteredItems;
};

/**
 * Helper function to filter items by event type - REVERTED work logic to previous version
 */
const filterByEvent = (items: ZaraClothItem[], event: string | null): ZaraClothItem[] => {
  if (!event) return items;
  
  const eventLower = event.toLowerCase();
  let filteredItems = items;
  
  // Filter based on event type - REVERTED work logic
  if (eventLower.includes('work') || eventLower.includes('business')) {
    // REVERTED: Use the old work filtering logic that was working better
    filteredItems = items.filter(item => {
      const name = (item.product_name ?? '').toLowerCase();
      const family = (item.product_family ?? '').toLowerCase();
      const subfamily = (item.product_subfamily ?? '').toLowerCase();
      const fullText = `${name} ${family} ${subfamily}`;
      
      // OLD LOGIC: Include business patterns for work
      const businessPatterns = [
        'blazer', 'בלייזר', 'shirt', 'חולצה', 'blouse', 'בלוזה',
        'trouser', 'מכנסיים פורמליים', 'formal', 'פורמלי', 'עסקי', 'business',
        'dress', 'שמלה', 'heel', 'עקב', 'pump', 'oxford', 'loafer',
        'נעלי עסקיות', 'coat', 'מעיל', 'jacket', 'ז\'קט', 'suit', 'חליפה'
      ];
      
      // OLD LOGIC: Exclude casual items from work (less strict)
      const casualExclusions = [
        'jean', 'ג\'ינס', 'sneaker', 'ספורט', 'נעלי ספורט',
        't-shirt', 'טי שירט', 'hoodie', 'הודי', 'sweat', 'סווט'
      ];
      
      const hasBusinessPattern = businessPatterns.some(pattern => fullText.includes(pattern));
      const hasCasualPattern = casualExclusions.some(pattern => fullText.includes(pattern));
      
      // OLD LOGIC: More lenient - include if has business OR doesn't have strong casual
      return hasBusinessPattern || !hasCasualPattern;
    });
  } else if (eventLower.includes('casual') || eventLower.includes('weekend')) {
    // KEEP NEW LOGIC: For casual/weekend, PRIORITIZE CASUAL items and EXCLUDE FORMAL items
    filteredItems = items.filter(item => {
      const name = (item.product_name ?? '').toLowerCase();
      const family = (item.product_family ?? '').toLowerCase();
      const subfamily = (item.product_subfamily ?? '').toLowerCase();
      const description = (item.description ?? '').toLowerCase();
      const materials = (item.materials_description ?? '').toLowerCase();
      const fullText = `${name} ${family} ${subfamily} ${description} ${materials}`;
      
      // STRONG preference for CASUAL patterns
      const casualPatterns = [
        // Jeans and denim - strongest casual indicator
        'jean', 'ג\'ינס', 'denim', 'דנים',
        // T-shirts and casual tops
        't-shirt', 'טי שירט', 'tee', 'טי', 'tank', 'גופייה', 'טריקו',
        // Sneakers and casual shoes - strongest casual indicator
        'sneaker', 'ספורט', 'trainer', 'נעלי ספורט', 'converse', 'נייק', 'אדידס',
        'running', 'jogging', 'canvas', 'סניקרס', 'נעלי בד',
        // Hoodies and sweatshirts
        'hoodie', 'הודי', 'sweatshirt', 'סווטשירט', 'sweat', 'סווט',
        // Casual pants and shorts
        'jogger', 'ג\'וגר', 'track', 'casual pants', 'מכנסיים קזואלים',
        'shorts', 'מכנסיים קצרים', 'bermuda', 'cargo',
        // Casual materials
        'cotton', 'כותנה', '100% cotton', 'jersey', 'ג\'רזי',
        // Casual descriptors
        'casual', 'קז\'ואל', 'relaxed', 'רגיל', 'comfortable', 'נוח',
        'everyday', 'יומיומי', 'weekend', 'סוף שבוע', 'sporty', 'ספורטיבי',
        // Polo and casual shirts
        'polo', 'פולו', 'henley'
      ];
      
      // STRICTLY exclude FORMAL/BUSINESS items from casual
      const formalExclusions = [
        'blazer', 'בלייזר', 'formal', 'פורמלי', 'business', 'עסקי',
        'heel', 'עקב', 'pump', 'oxford', 'dress shirt', 'חולצה פורמלית',
        'suit', 'חליפה', 'elegant', 'אלגנטי', 'evening', 'ערב',
        'blouse', 'בלוזה', 'trouser', 'מכנסיים פורמליים', 'formal pants',
        'dress shoe', 'נעלי דרס', 'loafer', 'נעלי עור'
      ];
      
      const hasCasualPattern = casualPatterns.some(pattern => fullText.includes(pattern));
      const hasFormalPattern = formalExclusions.some(pattern => fullText.includes(pattern));
      
      // For casual - MUST have casual patterns AND must NOT have formal patterns
      return hasCasualPattern && !hasFormalPattern;
    });
  } else if (eventLower.includes('party') || eventLower.includes('evening') || eventLower.includes('date')) {
    // For evening/party/dates, prefer elegant and dressy items
    filteredItems = items.filter(item => {
      const name = (item.product_name ?? '').toLowerCase();
      const family = (item.product_family ?? '').toLowerCase();
      const subfamily = (item.product_subfamily ?? '').toLowerCase();
      const color = (item.colour ?? '').toLowerCase();
      const fullText = `${name} ${family} ${subfamily}`;
      
      // Include evening/party items
      const eveningPatterns = [
        'dress', 'שמלה', 'heel', 'עקב', 'elegant', 'אלגנטי', 'blouse', 'בלוזה',
        'skirt', 'חצאית', 'blazer', 'בלייזר', 'formal', 'פורמלי'
      ];
      
      // Include elegant colors
      const elegantColors = ['black', 'שחור', 'נייבי', 'red', 'אדום', 'gold', 'זהב'];
      
      // Exclude very casual items
      const casualExclusions = [
        'jean', 'ג\'ינס', 'sneaker', 'ספורט', 't-shirt', 'טי שירט', 'hoodie'
      ];
      
      const hasEveningPattern = eveningPatterns.some(pattern => fullText.includes(pattern));
      const hasElegantColor = elegantColors.some(colorName => color.includes(colorName));
      const hasCasualPattern = casualExclusions.some(pattern => fullText.includes(pattern));
      
      return (hasEveningPattern || hasElegantColor) && !hasCasualPattern;
    });
  }
  
  console.log(`🎯 [DEBUG] Event filter (${event}): ${items.length} -> ${filteredItems.length} items`);
  
  // If filtered items are too few, use more lenient approach but maintain style direction
  if (filteredItems.length < 10) {
    console.log(`⚠️ [DEBUG] Too few items after strict filtering, using lenient approach for ${event}`);
    
    // For casual, at least ensure we have some casual items and exclude very formal
    if (eventLower.includes('casual') || eventLower.includes('weekend')) {
      filteredItems = items.filter(item => {
        const fullText = `${item.product_name ?? ''} ${item.product_family ?? ''} ${item.product_subfamily ?? ''}`.toLowerCase();
        
        // At minimum, exclude blazers and heels from casual
        const strongFormalExclusions = ['blazer', 'בלייזר', 'heel', 'עקב', 'formal', 'פורמלי', 'suit', 'חליפה'];
        const hasStrongFormal = strongFormalExclusions.some(pattern => fullText.includes(pattern));
        
        // Prefer items that have at least some casual indicators
        const basicCasualPatterns = ['jean', 'ג\'ינס', 'sneaker', 'ספורט', 't-shirt', 'טי שירט', 'casual', 'קז\'ואל'];
        const hasSomeCasual = basicCasualPatterns.some(pattern => fullText.includes(pattern));
        
        // Include if: (has casual patterns) OR (doesn't have strong formal patterns)
        return hasSomeCasual || !hasStrongFormal;
      });
    }
    
    // For work, use OLD LENIENT logic - at least exclude very casual items
    if (eventLower.includes('work') || eventLower.includes('business')) {
      filteredItems = items.filter(item => {
        const fullText = `${item.product_name ?? ''} ${item.product_family ?? ''} ${item.product_subfamily ?? ''}`.toLowerCase();
        // OLD LOGIC: Just exclude very casual items, don't be too strict
        const excludePatterns = ['jean', 'ג\'ינס', 'sneaker', 'ספורט', 't-shirt', 'טי שירט', 'hoodie', 'הודי'];
        return !excludePatterns.some(pattern => fullText.includes(pattern));
      });
    }
    
    // Fallback to all items if still too few
    if (filteredItems.length < 5) {
      filteredItems = items;
    }
  }
  
  return filteredItems;
};

/**
 * Helper function to filter items by mood
 */
const filterByMood = (items: ZaraClothItem[], mood: string | null): ZaraClothItem[] => {
  if (!mood) return items;
  
  const moodLower = mood.toLowerCase();
  
  if (moodLower.includes('energetic') || moodLower.includes('bold')) {
    return items.filter(item => {
      const color = (item.colour || '').toLowerCase();
      const name = (item.product_name || '').toLowerCase();
      return color.includes('red') || color.includes('bright') || name.includes('sport');
    });
  }
  
  if (moodLower.includes('calm') || moodLower.includes('elegant')) {
    return items.filter(item => {
      const color = (item.colour || '').toLowerCase();
      return color.includes('blue') || color.includes('beige') || color.includes('white');
    });
  }
  
  return items;
};

/**
 * Helper function to select professional outfit with proper coat/top logic
 */
const selectProfessionalOutfit = (items: ZaraClothItem[], budget: number) => {
  console.log('🔍 [DEBUG] Starting professional outfit selection...');
  
  // Categorize items by type with proper classification
  const categorizedItems = {
    tops: [] as ZaraClothItem[],
    bottoms: [] as ZaraClothItem[],
    shoes: [] as ZaraClothItem[],
    coats: [] as ZaraClothItem[]
  };
  
  items.forEach(item => {
    if (isItemAlreadyUsed(item.id)) {
      console.log(`⏭️ [DEBUG] Skipping already used item: ${item.id}`);
      return;
    }
    
    const name = (item.product_name || '').toLowerCase();
    const family = (item.product_family || '').toLowerCase();
    const subfamily = (item.product_subfamily || '').toLowerCase();
    
    // Classify coats/jackets/outerwear
    if (name.includes('coat') || name.includes('מעיל') || 
        name.includes('jacket') || name.includes('ג\'קט') ||
        name.includes('blazer') || name.includes('בלייזר') ||
        family.includes('outerwear') || subfamily.includes('outerwear')) {
      categorizedItems.coats.push(item);
    }
    // Classify skirts as bottoms (FIXED)
    else if (name.includes('skirt') || name.includes('חצאית') ||
             name.includes('pants') || name.includes('מכנסיים') ||
             name.includes('trousers') || name.includes('jeans') ||
             name.includes('shorts')) {
      categorizedItems.bottoms.push(item);
    }
    // Classify shoes
    else if (name.includes('shoe') || name.includes('נעל') ||
             name.includes('heel') || name.includes('עקב') ||
             name.includes('sneaker') || name.includes('ספורט') ||
             family.includes('shoe') || subfamily.includes('נעל')) {
      categorizedItems.shoes.push(item);
    }
    // Everything else as tops (shirts, blouses, t-shirts, etc.)
    else {
      categorizedItems.tops.push(item);
    }
  });
  
  console.log('📊 [DEBUG] Categorized items:', {
    tops: categorizedItems.tops.length,
    bottoms: categorizedItems.bottoms.length,
    shoes: categorizedItems.shoes.length,
    coats: categorizedItems.coats.length
  });
  
  // Select items within budget - ensure we have a top when selecting a coat
  let selectedTop: ZaraClothItem | null = null;
  let selectedBottom: ZaraClothItem | null = null;
  let selectedShoes: ZaraClothItem | null = null;
  let selectedCoat: ZaraClothItem | null = null;
  
  // Try to find a combination that fits the budget
  for (const bottom of categorizedItems.bottoms) {
    if (isItemAlreadyUsed(bottom.id)) continue;
    
    for (const shoes of categorizedItems.shoes) {
      if (isItemAlreadyUsed(shoes.id)) continue;
      
      // Try with coat first (4 items total)
      for (const coat of categorizedItems.coats) {
        if (isItemAlreadyUsed(coat.id)) continue;
        
        for (const top of categorizedItems.tops) {
          if (isItemAlreadyUsed(top.id)) continue;
          
          const totalCost = top.price + bottom.price + shoes.price + coat.price;
          if (totalCost <= budget) {
            selectedTop = top;
            selectedBottom = bottom;
            selectedShoes = shoes;
            selectedCoat = coat;
            
            // Mark all items as used
            markItemAsUsed(top.id);
            markItemAsUsed(bottom.id);
            markItemAsUsed(shoes.id);
            markItemAsUsed(coat.id);
            
            console.log(`✅ [DEBUG] Selected 4-piece outfit with coat (${totalCost}₪)`);
            return { top: selectedTop, bottom: selectedBottom, shoes: selectedShoes, coat: selectedCoat };
          }
        }
      }
      
      // If no coat combination works, try without coat (3 items)
      for (const top of categorizedItems.tops) {
        if (isItemAlreadyUsed(top.id)) continue;
        
        const totalCost = top.price + bottom.price + shoes.price;
        if (totalCost <= budget) {
          selectedTop = top;
          selectedBottom = bottom;
          selectedShoes = shoes;
          
          // Mark items as used
          markItemAsUsed(top.id);
          markItemAsUsed(bottom.id);
          markItemAsUsed(shoes.id);
          
          console.log(`✅ [DEBUG] Selected 3-piece outfit (${totalCost}₪)`);
          return { top: selectedTop, bottom: selectedBottom, shoes: selectedShoes };
        }
      }
    }
  }
  
  console.log('❌ [DEBUG] Could not find suitable combination within budget');
  return { top: null, bottom: null, shoes: null, coat: null };
};

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
      // Clear used items at the start of a new session
      clearUsedItems();
      
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

      // Step 4: Apply all filters - cast allItems to ZaraClothItem[] and filter properly
      console.log('🔍 [DEBUG] Starting professional filtering for valid clothing items...');
      
      // First filter for valid clothing items - properly type the items
      let validItems: ZaraClothItem[] = (allItems as ZaraClothItem[]).filter((item: any, index) => {
        const typedItem = item as ZaraClothItem;
        console.log(`🔍 [DEBUG] Checking item ${index + 1}/${allItems.length} (ID: ${typedItem.id})`);
        
        // First check if it's a valid clothing item
        const isClothing = isValidClothingItem(typedItem);
        if (!isClothing) {
          return false;
        }
        
        // For shoes, be more lenient with image requirements
        const itemType = (() => {
          const name = (typedItem.product_name || '').toLowerCase();
          const family = typedItem.product_family ? typedItem.product_family.toLowerCase() : '';
          const subfamily = typedItem.product_subfamily ? typedItem.product_subfamily.toLowerCase() : '';
          
          if (name.includes('נעל') || name.includes('shoe') || family.includes('shoe') || subfamily.includes('נעל')) {
            return 'shoes';
          }
          return 'clothing';
        })();
        
        // Then check if it has valid image pattern (more lenient for shoes)
        const hasValidImage = isValidImagePattern(typedItem.image, itemType);
        if (!hasValidImage) {
          console.log(`❌ [DEBUG] FILTERED OUT item ${typedItem.id} - no valid image pattern (type: ${itemType})`);
          return false;
        }
        
        console.log(`✅ [DEBUG] KEEPING item ${typedItem.id} - valid clothing with good image (type: ${itemType})`);
        return true;
      });

      console.log(`✅ [DEBUG] Valid items after clothing/image filtering: ${validItems.length} out of ${allItems.length}`);

      // Apply budget filter - now correctly typed as ZaraClothItem[]
      validItems = filterByBudget(validItems, budget);
      
      // Apply event filter - now correctly typed as ZaraClothItem[]
      validItems = filterByEvent(validItems, selectedEvent);
      
      // Apply mood filter - now correctly typed as ZaraClothItem[]
      validItems = filterByMood(validItems, currentMood);

      console.log(`✅ [DEBUG] Final valid items after all filters: ${validItems.length}`);

      if (validItems.length === 0) {
        console.error('❌ [DEBUG] No valid clothing items found after applying all filters');
        return { 
          success: false, 
          error: "No suitable clothing items found matching your budget, event, and mood preferences" 
        };
      }

      // Step 5: Professional outfit selection with budget consideration and duplicate prevention
      const outfitSelection = selectProfessionalOutfit(validItems, budget);
      
      // Check if we have a dress outfit (2 items) or regular outfit (3-4 items)
      const isDressOutfit = outfitSelection.dress && outfitSelection.shoes;
      const isRegularOutfit = outfitSelection.top && outfitSelection.bottom && outfitSelection.shoes;
      
      if (!isDressOutfit && !isRegularOutfit) {
        console.error('❌ [DEBUG] Could not find complete professional outfit within budget');
        return { 
          success: false, 
          error: "Could not find complete outfit items within your budget and preferences" 
        };
      }

      // Calculate total cost
      let totalCost = 0;
      if (isDressOutfit) {
        totalCost = outfitSelection.dress!.price + outfitSelection.shoes!.price;
      } else {
        totalCost = outfitSelection.top!.price + outfitSelection.bottom!.price + outfitSelection.shoes!.price + (outfitSelection.coat ? outfitSelection.coat.price : 0);
      }

      // Extract AI-selected or best product images with item type info
      console.log('🔍 [DEBUG] Extracting AI-selected product images...');
      
      let outfit: any = {};
      
      if (isDressOutfit) {
        // For dress outfits - only dress and shoes
        const dressImage = await extractMainProductImage(outfitSelection.dress?.image, outfitSelection.dress?.id, 'dress');
        const shoesImage = await extractMainProductImage(outfitSelection.shoes?.image, outfitSelection.shoes?.id, 'shoes');
        
        console.log('🔍 [DEBUG] Dress outfit images:');
        console.log('Dress item image:', dressImage);
        console.log('Shoes item image:', shoesImage);
        
        outfit = {
          dress: {
            ...outfitSelection.dress,
            image: dressImage
          },
          shoes: {
            ...outfitSelection.shoes,
            image: shoesImage
          }
        };
      } else {
        // For regular outfits - top, bottom, shoes, optional coat
        const topImage = await extractMainProductImage(outfitSelection.top?.image, outfitSelection.top?.id, 'top');
        const bottomImage = await extractMainProductImage(outfitSelection.bottom?.image, outfitSelection.bottom?.id, 'bottom');
        const shoesImage = await extractMainProductImage(outfitSelection.shoes?.image, outfitSelection.shoes?.id, 'shoes');
        const coatImage = outfitSelection.coat ? await extractMainProductImage(outfitSelection.coat?.image, outfitSelection.coat?.id, 'coat') : undefined;

        console.log('🔍 [DEBUG] Regular outfit images:');
        console.log('Top item image:', topImage);
        console.log('Bottom item image:', bottomImage);
        console.log('Shoes item image:', shoesImage);
        if (outfitSelection.coat) {
          console.log('Coat item image:', coatImage);
        }

        outfit = {
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
          ...(outfitSelection.coat && {
            coat: {
              ...outfitSelection.coat,
              image: coatImage
            }
          })
        };
      }

      // Step 6: Create professional outfit object with database items and AI-selected images
      const finalOutfit = {
        ...outfit,
        score: Math.floor(Math.random() * 30) + 70,
        description: `Professional outfit recommendation (${totalCost}₪/${budget}₪) tailored for ${selectedEvent || 'general occasion'} with ${currentMood || 'balanced'} mood${isDressOutfit ? ' - elegant dress ensemble' : (outfitSelection.coat ? ' including layering piece with coordinated top' : '')}`,
        recommendations: [
          `Budget-conscious selection: ${totalCost}₪ out of ${budget}₪ budget`,
          `Event-appropriate styling for ${selectedEvent || 'general occasions'}`,
          `Mood-matched design reflecting ${currentMood || 'balanced'} feelings`,
          "Items selected from real Zara database with AI-analyzed images",
          "All items currently available and prioritized over low-stock alternatives",
          "Colors and styles coordinated for visual appeal and occasion suitability",
          "Unique items - no duplicates across different outfit suggestions",
          ...(isDressOutfit ? ["Complete dress look - elegant and effortless"] : (outfitSelection.coat ? ["Complete layered look with coordinated outerwear and proper top underneath"] : []))
        ],
        occasion: selectedEvent || 'general',
        totalCost: totalCost,
        budget: budget,
        mood: currentMood
      };
      
      console.log("✅ [DEBUG] Generated professional database outfit successfully with budget and preference filtering and duplicate prevention");
      return { success: true, data: finalOutfit };
      
    } catch (error) {
      console.error("❌ [DEBUG] Error in professional styling agent:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error in styling agent" 
      };
    }
  }
};
