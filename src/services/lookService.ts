
import { supabase } from "@/lib/supabaseClient";
import { DashboardItem } from "@/types/lookTypes";
import { isValidImagePattern } from "../../supabase/functions/trainer-agent/imageValidator";

// Cache for outfit data
const outfitCache = new Map<string, any>();

// Global cache to track shown items and prevent repetition
const globalItemTracker = {
  shownItems: new Map<string, number>(), // id -> times shown
  shownTops: new Set<string>(),
  shownBottoms: new Set<string>(),
  shownShoes: new Set<string>(),
  maxRepetitions: 2 // Allow an item to appear this many times max
};

export const clearOutfitCache = (bodyShape?: string, style?: string, mood?: string) => {
  if (bodyShape && style && mood) {
    const cacheKey = `${bodyShape}-${style}-${mood}`;
    outfitCache.delete(cacheKey);
  } else {
    outfitCache.clear();
  }
};

export const clearGlobalItemTrackers = () => {
  globalItemTracker.shownItems.clear();
  globalItemTracker.shownTops.clear();
  globalItemTracker.shownBottoms.clear();
  globalItemTracker.shownShoes.clear();
};

// Helper function to safely map subfamily to item type
const mapSubfamilyToType = (subfamily: string | null | undefined): DashboardItem['type'] => {
  if (!subfamily) return 'top';
  
  const lowerSubfamily = subfamily.toLowerCase();
  
  if (['shirt', 'blouse', 't-shirt', 'top', 'sweater', 'cardigan', 'jacket'].some(type => 
    lowerSubfamily.includes(type)
  )) {
    return 'top';
  }
  
  if (['pants', 'skirt', 'shorts', 'jeans', 'trousers', 'leggings'].some(type => 
    lowerSubfamily.includes(type)
  )) {
    return 'bottom';
  }
  
  if (['shoes', 'heel', 'sneakers', 'boots', 'sandals', 'flats'].some(type => 
    lowerSubfamily.includes(type)
  )) {
    return 'shoes';
  }
  
  if (['dress', 'gown', 'jumpsuit'].some(type => 
    lowerSubfamily.includes(type)
  )) {
    return 'dress';
  }
  
  // Default to top if we can't determine
  return 'top';
};

export const matchOutfitToColors = async () => {
  try {
    console.log("🔍 [DEBUG] matchOutfitToColors: Fetching items for color matching");
    
    // Fetch items from zara_cloth table
    const { data: allItems, error } = await supabase
      .from('zara_cloth')
      .select('*')
      .limit(100);

    if (error) {
      console.error('❌ [DEBUG] Error fetching from zara_cloth:', error);
      return { top: [], bottom: [], shoes: [] };
    }

    if (!allItems || allItems.length === 0) {
      console.log('❌ [DEBUG] No items found in zara_cloth table');
      return { top: [], bottom: [], shoes: [] };
    }

    // Filter items with valid image patterns (6th+ images without models)
    const validItems = allItems.filter(item => isValidImagePattern(item.image));
    
    console.log(`✅ [DEBUG] Valid items with no-model patterns: ${validItems.length} out of ${allItems.length}`);
    
    // Group items by type using safe property access
    const result = {
      top: validItems.filter(item => {
        const subfamily = (item as any).product_subfamily;
        return mapSubfamilyToType(subfamily) === 'top';
      }).map(item => ({
        id: item.id,
        name: item.product_name || 'Fashion Item',
        image: item.image,
        type: 'top' as const,
        price: item.price ? `$${item.price}` : '$49.99'
      })),
      bottom: validItems.filter(item => {
        const subfamily = (item as any).product_subfamily;
        return mapSubfamilyToType(subfamily) === 'bottom';
      }).map(item => ({
        id: item.id,
        name: item.product_name || 'Fashion Item',
        image: item.image,
        type: 'bottom' as const,
        price: item.price ? `$${item.price}` : '$49.99'
      })),
      shoes: validItems.filter(item => {
        const subfamily = (item as any).product_subfamily;
        return mapSubfamilyToType(subfamily) === 'shoes';
      }).map(item => ({
        id: item.id,
        name: item.product_name || 'Fashion Item',
        image: item.image,
        type: 'shoes' as const,
        price: item.price ? `$${item.price}` : '$49.99'
      }))
    };

    console.log("✅ [DEBUG] Color matching result:", Object.keys(result).map(k => `${k}: ${result[k].length}`));
    return result;

  } catch (error) {
    console.error('❌ [DEBUG] Error in matchOutfitToColors:', error);
    return { top: [], bottom: [], shoes: [] };
  }
};

export const fetchDashboardItems = async (): Promise<{ [key: string]: DashboardItem[] }> => {
  try {
    console.log("🔍 [DEBUG] fetchDashboardItems: Starting to fetch items from zara_cloth table");
    
    // Fetch items from zara_cloth table only
    const { data: allItems, error } = await supabase
      .from('zara_cloth')
      .select('*')
      .limit(200);

    if (error) {
      console.error('❌ [DEBUG] Error fetching from zara_cloth:', error);
      throw error;
    }

    if (!allItems || allItems.length === 0) {
      console.log('❌ [DEBUG] No items found in zara_cloth table');
      return { Work: [], Casual: [], Evening: [], Weekend: [] };
    }

    console.log(`✅ [DEBUG] Fetched ${allItems.length} items from zara_cloth`);

    // Filter items to only include those with valid image patterns (6th+ images without models)
    const validItems = allItems.filter(item => {
      const isValid = isValidImagePattern(item.image);
      if (!isValid) {
        console.log(`❌ [DEBUG] FILTERED OUT item ${item.id} - no suitable no-model image pattern`);
      }
      return isValid;
    });

    console.log(`✅ [DEBUG] Valid items with no-model patterns: ${validItems.length}`);

    if (validItems.length === 0) {
      console.log('❌ [DEBUG] No items with suitable no-model patterns found');
      return { Work: [], Casual: [], Evening: [], Weekend: [] };
    }

    // Convert to DashboardItem format and distribute across occasions
    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    const result: { [key: string]: DashboardItem[] } = {};

    occasions.forEach(occasion => {
      // Shuffle and take different items for each occasion
      const shuffled = [...validItems].sort(() => Math.random() - 0.5);
      const selectedItems = shuffled.slice(0, Math.min(12, shuffled.length));
      
      result[occasion] = selectedItems.map(item => ({
        id: item.id,
        name: item.product_name || 'Fashion Item',
        image: item.image,
        type: mapSubfamilyToType((item as any).product_subfamily),
        price: item.price ? `$${item.price}` : '$49.99'
      }));
    });

    console.log(`✅ [DEBUG] Distributed items across occasions:`, Object.keys(result).map(k => `${k}: ${result[k].length}`));
    return result;

  } catch (error) {
    console.error('❌ [DEBUG] Error in fetchDashboardItems:', error);
    // Return empty data instead of fallbacks
    return { Work: [], Casual: [], Evening: [], Weekend: [] };
  }
};

export const fetchFirstOutfitSuggestion = async (forceRefresh = false): Promise<DashboardItem[]> => {
  try {
    console.log("🔍 [DEBUG] fetchFirstOutfitSuggestion: Getting first outfit");
    
    const dashboardData = await fetchDashboardItems();
    
    // Get items from the first available occasion
    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    for (const occasion of occasions) {
      if (dashboardData[occasion] && dashboardData[occasion].length >= 3) {
        console.log(`✅ [DEBUG] Using items from ${occasion} occasion`);
        return dashboardData[occasion].slice(0, 3);
      }
    }
    
    console.log('❌ [DEBUG] No sufficient items found for any occasion');
    return [];
    
  } catch (error) {
    console.error('❌ [DEBUG] Error in fetchFirstOutfitSuggestion:', error);
    return [];
  }
};
