
/**
 * Functions for fetching items from the database
 */

import { DashboardItem } from "@/types/lookTypes";
import { supabase } from "@/lib/supabase";

// Cache to avoid redundant fetches
const itemsCache = new Map<string, DashboardItem[]>();

/**
 * Fetch items from Supabase database by type
 */
export const fetchItemsByType = async (type: string): Promise<DashboardItem[]> => {
  try {
    // Check cache first
    const cacheKey = `items-${type}`;
    if (itemsCache.has(cacheKey)) {
      return itemsCache.get(cacheKey) || [];
    }
    
    console.log(`[Supabase] Fetching ${type} items from database`);
    
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('type', type)
      .limit(10);
    
    if (error) {
      console.error(`[Supabase] Error fetching ${type} items:`, error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log(`[Supabase] No ${type} items found in database`);
      const fallbackItems = getFallbackItemsByType(type);
      itemsCache.set(cacheKey, fallbackItems);
      return fallbackItems;
    }
    
    const formattedItems = data.map(item => ({
      id: item.id || `generated-${Math.random().toString(36).substring(2, 9)}`,
      name: item.name || `Stylish ${type}`,
      description: item.description || `Stylish ${type}`,
      image: item.image || `items/default_${type}.png`,
      price: item.price || '$49.99',
      type: type
    }));
    
    // Cache the results
    itemsCache.set(cacheKey, formattedItems);
    
    return formattedItems;
  } catch (e) {
    console.error(`[Supabase] Exception in fetchItemsByType for ${type}:`, e);
    return [];
  }
};

/**
 * Generate fallback items by type when no database items are found
 */
const getFallbackItemsByType = (type: string): DashboardItem[] => {
  return [{
    id: `fallback-${type}-${Math.random().toString(36).substring(2, 9)}`,
    name: `Stylish ${type}`,
    description: `Beautiful ${type} for your wardrobe`,
    image: `/placeholder.svg`,
    price: '$49.99',
    type: type
  }];
};

/**
 * Find the best matching item color from database
 */
export const findBestColorMatch = async (hexColor: string, itemType: string): Promise<DashboardItem | null> => {
  try {
    // Create a cache key based on color and type
    const cacheKey = `color-${hexColor}-${itemType}`;
    if (itemsCache.has(cacheKey)) {
      return itemsCache.get(cacheKey)?.[0] || null;
    }
    
    // Try to find items by type
    const items = await fetchItemsByType(itemType);
    
    if (items.length === 0) {
      return null;
    }
    
    // For now, just return a random item of the correct type
    // In a real app, we would try to match the color
    const randomIndex = Math.floor(Math.random() * items.length);
    const selectedItem = items[randomIndex];
    
    // Cache the selected item
    itemsCache.set(cacheKey, [selectedItem]);
    
    return selectedItem;
  } catch (error) {
    console.error(`Error finding color match for ${itemType}:`, error);
    return null;
  }
};
