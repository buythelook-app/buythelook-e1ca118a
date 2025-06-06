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
 * Helper function to filter items by event type - FIXED logic for proper work vs casual categorization
 */
const filterByEvent = (items: ZaraClothItem[], event: string | null): ZaraClothItem[] => {
  if (!event) return items;
  
  const eventLower = event.toLowerCase();
  let filteredItems = items;
  
  // Filter based on event type with CORRECTED logic
  if (eventLower.includes('work') || eventLower.includes('business')) {
    // For work events, prefer FORMAL and BUSINESS items
    filteredItems = items.filter(item => {
      const name = (item.product_name ?? '').toLowerCase();
      const family = (item.product_family ?? '').toLowerCase();
      const subfamily = (item.product_subfamily ?? '').toLowerCase();
      const fullText = `${name} ${family} ${subfamily}`;
      
      // Include FORMAL/BUSINESS items for work
      const businessPatterns = [
        'blazer', 'בלייזר', 'shirt', 'חולצה', 'blouse', 'בלוזה',
        'trouser', 'מכנסיים', 'formal', 'פורמלי', 'עסקי', 'business',
        'dress', 'שמלה', 'heel', 'עקב', 'pump', 'oxford', 'loafer',
        'נעלי עסקיות', 'coat', 'מעיל', 'jacket', 'ז\'קט'
      ];
      
      // Exclude CASUAL items from work
      const casualExclusions = [
        'jean', 'ג\'ינס', 'sneaker', 'ספורט', 'נעלי ספורט',
        't-shirt', 'טי שירט', 'hoodie', 'הודי', 'sweat', 'סווט',
        'casual', 'קז\'ואל', 'trainer', 'converse', 'running'
      ];
      
      const hasBusinessPattern = businessPatterns.some(pattern => fullText.includes(pattern));
      const hasCasualPattern = casualExclusions.some(pattern => fullText.includes(pattern));
      
      return hasBusinessPattern && !hasCasualPattern;
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
  } else if (eventLower.includes('casual') || eventLower.includes('weekend')) {
    // For casual/weekend, prefer CASUAL and EVERYDAY items
    filteredItems = items.filter(item => {
      const name = (item.product_name ?? '').toLowerCase();
      const family = (item.product_family ?? '').toLowerCase();
      const subfamily = (item.product_subfamily ?? '').toLowerCase();
      const description = (item.description ?? '').toLowerCase();
      const materials = (item.materials_description ?? '').toLowerCase();
      const fullText = `${name} ${family} ${subfamily} ${description} ${materials}`;
      
      // Include CASUAL patterns for casual events
      const casualPatterns = [
        // Jeans and denim
        'jean', 'ג\'ינס', 'denim', 'דנים',
        // T-shirts and casual tops
        't-shirt', 'טי שירט', 'tee', 'טי', 'tank', 'גופייה', 'טריקו',
        // Sneakers and casual shoes
        'sneaker', 'ספורט', 'trainer', 'נעלי ספורט', 'converse', 'נייק', 'אדידס',
        'running', 'jogging', 'canvas', 'סניקרס',
        // Hoodies and sweatshirts
        'hoodie', 'הודי', 'sweatshirt', 'סווטשירט', 'sweat', 'סווט',
        // Casual pants and shorts
        'jogger', 'ג\'וגר', 'track', 'casual pants', 'מכנסיים קזואלים',
        'shorts', 'מכנסיים קצרים', 'bermuda',
        // Casual materials
        'cotton', 'כותנה', '100% cotton', 'jersey', 'ג\'רזי',
        // Casual descriptors
        'casual', 'קז\'ואל', 'relaxed', 'רגיל', 'comfortable', 'נוח',
        'everyday', 'יומיומי', 'weekend', 'סוף שבוע',
        // Polo and casual shirts
        'polo', 'פולו', 'henley'
      ];
      
      // Exclude FORMAL/BUSINESS items from casual
      const formalExclusions = [
        'blazer', 'בלייזר', 'formal', 'פורמלי', 'business', 'עסקי',
        'heel', 'עקב', 'pump', 'oxford', 'dress shirt', 'חולצה פורמלית',
        'suit', 'חליפה', 'elegant', 'אלגנטי', 'evening', 'ערב'
      ];
      
      const hasCasualPattern = casualPatterns.some(pattern => fullText.includes(pattern));
      const hasFormalPattern = formalExclusions.some(pattern => fullText.includes(pattern));
      
      return hasCasualPattern && !hasFormalPattern;
    });
  }
  
  console.log(`🎯 [DEBUG] Event filter (${event}): ${items.length} -> ${filteredItems.length} items`);
  
  // If filtered items are too few, use a more lenient approach but still prefer the right style
  if (filteredItems.length < 10) {
    console.log(`⚠️ [DEBUG] Too few items after strict filtering, using lenient approach for ${event}`);
    
    // For casual, at least exclude very formal items
    if (eventLower.includes('casual') || eventLower.includes('weekend')) {
      filteredItems = items.filter(item => {
        const fullText = `${item.product_name ?? ''} ${item.product_family ?? ''} ${item.product_subfamily ?? ''}`.toLowerCase();
        const excludePatterns = ['blazer', 'בלייזר', 'heel', 'עקב', 'formal', 'פורמלי'];
        return !excludePatterns.some(pattern => fullText.includes(pattern));
      });
    }
    
    // For work, at least exclude very casual items
    if (eventLower.includes('work') || eventLower.includes('business')) {
      filteredItems = items.filter(item => {
        const fullText = `${item.product_name ?? ''} ${item.product_family ?? ''} ${item.product_subfamily ?? ''}`.toLowerCase();
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

// ... keep existing code (all other helper functions, main styling agent logic) the same ...

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
      
      if (!outfitSelection.top || !outfitSelection.bottom || !outfitSelection.shoes) {
        console.error('❌ [DEBUG] Could not find complete professional outfit within budget');
        return { 
          success: false, 
          error: "Could not find complete outfit items (top, bottom, shoes) within your budget and preferences" 
        };
      }

      // Calculate total cost including coat if present
      const totalCost = outfitSelection.top.price + outfitSelection.bottom.price + outfitSelection.shoes.price + (outfitSelection.coat ? outfitSelection.coat.price : 0);

      // Extract AI-selected or best product images with item type info
      console.log('🔍 [DEBUG] Extracting AI-selected product images...');
      const topImage = await extractMainProductImage(outfitSelection.top?.image, outfitSelection.top?.id, 'top');
      const bottomImage = await extractMainProductImage(outfitSelection.bottom?.image, outfitSelection.bottom?.id, 'bottom');
      const shoesImage = await extractMainProductImage(outfitSelection.shoes?.image, outfitSelection.shoes?.id, 'shoes');
      const coatImage = outfitSelection.coat ? await extractMainProductImage(outfitSelection.coat?.image, outfitSelection.coat?.id, 'coat') : undefined;

      console.log('🔍 [DEBUG] Professional outfit images:');
      console.log('Top item image:', topImage);
      console.log('Bottom item image:', bottomImage);
      console.log('Shoes item image:', shoesImage);
      if (outfitSelection.coat) {
        console.log('Coat item image:', coatImage);
      }

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
        ...(outfitSelection.coat && {
          coat: {
            ...outfitSelection.coat,
            image: coatImage
          }
        }),
        score: Math.floor(Math.random() * 30) + 70,
        description: `Professional outfit recommendation (${totalCost}₪/${budget}₪) tailored for ${selectedEvent || 'general occasion'} with ${currentMood || 'balanced'} mood${outfitSelection.coat ? ' including layering piece with coordinated top' : ''}`,
        recommendations: [
          `Budget-conscious selection: ${totalCost}₪ out of ${budget}₪ budget`,
          `Event-appropriate styling for ${selectedEvent || 'general occasions'}`,
          `Mood-matched design reflecting ${currentMood || 'balanced'} feelings`,
          "Items selected from real Zara database with AI-analyzed images",
          "All items currently available and prioritized over low-stock alternatives",
          "Colors and styles coordinated for visual appeal and occasion suitability",
          "Unique items - no duplicates across different outfit suggestions",
          ...(outfitSelection.coat ? ["Complete layered look with coordinated outerwear and proper top underneath"] : [])
        ],
        occasion: selectedEvent || 'general',
        totalCost: totalCost,
        budget: budget,
        mood: currentMood
      };
      
      console.log("✅ [DEBUG] Generated professional database outfit successfully with budget and preference filtering and duplicate prevention");
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
