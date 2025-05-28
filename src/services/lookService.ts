import { supabase } from "@/lib/supabaseClient";
import { DashboardItem } from "@/types/lookTypes";
import logger from "@/lib/logger";

// Cache variables and helper functions
const outfitCache = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

const extractImageUrl = (imageField: any): string => {
  if (!imageField) return '/placeholder.svg';
  
  if (typeof imageField === 'string') {
    return imageField;
  }
  
  if (Array.isArray(imageField) && imageField.length > 0) {
    const firstImage = imageField[0];
    if (typeof firstImage === 'string') {
      return firstImage;
    }
    if (typeof firstImage === 'object' && firstImage.url) {
      return firstImage.url;
    }
  }
  
  return '/placeholder.svg';
};

const isValidImageUrl = (url: string): boolean => {
  if (!url || url === '/placeholder.svg') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

async function verifySupabaseConnection(): Promise<boolean> {
  try {
    logger.info("Attempting to connect to Supabase and verify zara_cloth table", { context: "lookService" });
    
    const { count, error } = await supabase
      .from('zara_cloth')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      logger.error("Error connecting to zara_cloth table:", { context: "lookService", data: error });
      return false;
    }
    
    logger.info("zara_cloth table exists with count:", { context: "lookService", data: count });
    return count !== null && count > 0;
  } catch (error) {
    logger.error("Exception during Supabase connection verification:", { context: "lookService", data: error });
    return false;
  }
}

async function fetchItemsFromDatabase(
  itemType: string,
  occasion?: string,
  excludeItems: string[] = []
): Promise<DashboardItem[]> {
  const cacheKey = `${itemType}-${occasion || 'all'}-${excludeItems.join(',')}`;
  const now = Date.now();
  
  if (outfitCache.has(cacheKey)) {
    const timestamp = cacheTimestamps.get(cacheKey);
    if (timestamp && (now - timestamp) < CACHE_DURATION) {
      logger.debug("Using cached items", { context: "lookService", data: { cacheKey } });
      return outfitCache.get(cacheKey);
    }
  }
  
  const hasConnection = await verifySupabaseConnection();
  if (!hasConnection) {
    logger.warn("No Supabase connection, returning empty array", { context: "lookService" });
    return [];
  }
  
  try {
    logger.info(`Fetching ${itemType} items for ${occasion || 'all'} (excluding ${excludeItems.length} items)`, { context: "lookService" });
    
    let query = supabase
      .from('zara_cloth')
      .select('*')
      .eq('availability', true)
      .limit(1000);
    
    if (excludeItems.length > 0) {
      query = query.not('id', 'in', `(${excludeItems.map(id => `"${id}"`).join(',')})`);
    }
    
    const { data: items, error } = await query;
    
    if (error) {
      logger.error(`Error fetching ${itemType} items:`, { context: "lookService", data: error });
      return [];
    }
    
    if (!items?.length) {
      logger.warn(`No ${itemType} items found in database`, { context: "lookService" });
      return [];
    }
    
    logger.info(`Retrieved ${items.length} items for ${itemType} from database`, { context: "lookService", data: items.slice(0, 3) });
    
    const processedItems = items
      .filter(item => item && item.product_name && item.price)
      .map(item => ({
        id: item.id,
        name: item.product_name,
        image: extractImageUrl(item.image),
        type: itemType as 'top' | 'bottom' | 'shoes',
        price: `$${item.price}`
      }))
      .filter(item => isValidImageUrl(item.image))
      .slice(0, 5);
    
    logger.info(`Returning ${processedItems.length} ${itemType} items for ${occasion || 'all'}`, { context: "lookService", data: processedItems });
    
    outfitCache.set(cacheKey, processedItems);
    cacheTimestamps.set(cacheKey, now);
    
    return processedItems;
  } catch (error) {
    logger.error(`Exception while fetching ${itemType} items:`, { context: "lookService", data: error });
    return [];
  }
}

export async function fetchDashboardItems(): Promise<{ [key: string]: DashboardItem[] }> {
  const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
  const result: { [key: string]: DashboardItem[] } = {};
  
  for (const occasion of occasions) {
    const topItems = await fetchItemsFromDatabase('top', occasion);
    const bottomItems = await fetchItemsFromDatabase('bottom', occasion);
    const shoeItems = await fetchItemsFromDatabase('shoes', occasion);
    
    const allItems = [...topItems, ...bottomItems, ...shoeItems];
    
    result[occasion] = allItems;
  }
  
  return result;
}

export async function fetchFirstOutfitSuggestion(forceRefresh: boolean = false): Promise<DashboardItem[]> {
  try {
    const hasConnection = await verifySupabaseConnection();
    if (!hasConnection) {
      logger.warn("No Supabase connection for outfit suggestion", { context: "lookService" });
      return [];
    }

    const topItems = await fetchItemsFromDatabase('top');
    const bottomItems = await fetchItemsFromDatabase('bottom');
    const shoeItems = await fetchItemsFromDatabase('shoes');
    
    const outfit: DashboardItem[] = [];
    
    if (topItems.length > 0) {
      const randomTop = topItems[Math.floor(Math.random() * topItems.length)];
      outfit.push(randomTop);
    }
    
    if (bottomItems.length > 0) {
      const randomBottom = bottomItems[Math.floor(Math.random() * bottomItems.length)];
      outfit.push(randomBottom);
    }
    
    if (shoeItems.length > 0) {
      const randomShoes = shoeItems[Math.floor(Math.random() * shoeItems.length)];
      outfit.push(randomShoes);
    }
    
    return outfit;
  } catch (error) {
    logger.error("Error fetching outfit suggestion:", { context: "lookService", data: error });
    return [];
  }
}

export function clearOutfitCache(bodyShape?: string, style?: string, mood?: string): void {
  outfitCache.clear();
  cacheTimestamps.clear();
  logger.info("Outfit cache cleared", { context: "lookService" });
}

export function clearGlobalItemTrackers(): void {
  // Clear any global state or trackers used for item selection
  clearOutfitCache();
  logger.info("Global item trackers cleared", { context: "lookService" });
}

export async function matchOutfitToColors(): Promise<Record<string, DashboardItem[]>> {
  try {
    const hasConnection = await verifySupabaseConnection();
    if (!hasConnection) {
      return { top: [], bottom: [], shoes: [] };
    }

    const topItems = await fetchItemsFromDatabase('top');
    const bottomItems = await fetchItemsFromDatabase('bottom');
    const shoeItems = await fetchItemsFromDatabase('shoes');
    
    return {
      top: topItems,
      bottom: bottomItems,
      shoes: shoeItems
    };
  } catch (error) {
    logger.error("Error matching outfit to colors:", { context: "lookService", data: error });
    return { top: [], bottom: [], shoes: [] };
  }
}
