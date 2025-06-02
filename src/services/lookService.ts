
import { supabase } from "@/lib/supabaseClient";
import { DashboardItem } from "@/types/lookTypes";
import { isValidImagePattern } from "../../supabase/functions/trainer-agent/imageValidator";

// Cache for outfit data
const outfitCache = new Map<string, any>();

export const clearOutfitCache = (bodyShape?: string, style?: string, mood?: string) => {
  if (bodyShape && style && mood) {
    const cacheKey = `${bodyShape}-${style}-${mood}`;
    outfitCache.delete(cacheKey);
  } else {
    outfitCache.clear();
  }
};

export const fetchDashboardItems = async (): Promise<{ [key: string]: DashboardItem[] }> => {
  try {
    console.log("🔍 [DEBUG] fetchDashboardItems: Starting to fetch items from zara_cloth table");
    
    // Fetch items from zara_cloth table only
    const { data: allItems, error } = await supabase
      .from('zara_cloth')
      .select('*')
      .limit(100);

    if (error) {
      console.error('❌ [DEBUG] Error fetching from zara_cloth:', error);
      throw error;
    }

    if (!allItems || allItems.length === 0) {
      console.log('❌ [DEBUG] No items found in zara_cloth table');
      return { Work: [], Casual: [], Evening: [], Weekend: [] };
    }

    console.log(`✅ [DEBUG] Fetched ${allItems.length} items from zara_cloth`);

    // Filter items to only include those with _6_1_1.jpg pattern
    const validItems = allItems.filter(item => {
      const isValid = isValidImagePattern(item.image);
      if (!isValid) {
        console.log(`❌ [DEBUG] FILTERED OUT item ${item.id} - no _6_1_1.jpg pattern`);
      }
      return isValid;
    });

    console.log(`✅ [DEBUG] Valid items with _6_1_1.jpg pattern: ${validItems.length}`);

    if (validItems.length === 0) {
      console.log('❌ [DEBUG] No items with _6_1_1.jpg pattern found');
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
        type: item.product_subfamily || 'top',
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
