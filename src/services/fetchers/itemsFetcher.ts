
/**
 * Functions for fetching items from the database
 */

import { DashboardItem } from "@/types/lookTypes";
import { supabase } from "@/lib/supabase";

// Cache to avoid redundant fetches - global application level cache
const itemsCache = new Map<string, DashboardItem[]>();
// Flag to track if we've already checked for items in this session
let hasCheckedDatabase = false;
// Flag to track if we've already displayed the "no items" message
let hasLoggedNoItems = false;
// Flag to track if we're currently checking the database
let isCheckingDatabase = false;

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
    
    // If we've already checked the database and found no items, don't check again
    if (hasCheckedDatabase) {
      return [];
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
      // Only log this message once per type
      if (!hasLoggedNoItems) {
        console.log(`[Supabase] No ${type} items found in database`);
        hasLoggedNoItems = true;
      }
      
      // Save empty result in cache
      itemsCache.set(cacheKey, []);
      return [];
    }
    
    const formattedItems = data.map(item => ({
      id: item.id || `generated-${Math.random().toString(36).substring(2, 9)}`,
      name: item.name || `Stylish ${type}`,
      description: item.description || `Stylish ${type}`,
      image: item.image || `/placeholder.svg`,
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
    
    // If we've already checked the database and found no items, don't check again
    if (hasCheckedDatabase) {
      return null;
    }
    
    // Try to find items by type
    const items = await fetchItemsByType(itemType);
    
    if (items.length === 0) {
      // After checking for items, update our flag
      hasCheckedDatabase = true;
      return null;
    }
    
    // For now, just return a random item of the correct type
    // In a real app, we would try to match the color
    const randomIndex = Math.floor(Math.random() * items.length);
    const selectedItem = items[randomIndex];
    
    // Cache the selected item
    const cacheItems: DashboardItem[] = [selectedItem];
    itemsCache.set(cacheKey, cacheItems);
    
    return selectedItem;
  } catch (error) {
    console.error(`Error finding color match for ${itemType}:`, error);
    return null;
  }
};

// Method to check if the database has any items at all
export const checkDatabaseHasItems = async (): Promise<boolean> => {
  try {
    // If we've already checked or are currently checking, use our cached result
    if (hasCheckedDatabase) {
      return false; // We know there are no items if hasCheckedDatabase is true
    }
    
    // Prevent multiple concurrent checks
    if (isCheckingDatabase) {
      // Wait a bit and then return cached result or false
      await new Promise(resolve => setTimeout(resolve, 500));
      return !hasCheckedDatabase;
    }
    
    isCheckingDatabase = true;
    console.log('[Supabase] Checking if database has any items');
    
    const { count, error } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true });
    
    isCheckingDatabase = false;
    
    if (error) {
      console.error('[Supabase] Error checking items count:', error);
      hasCheckedDatabase = true;
      return false;
    }
    
    const hasItems = count !== null && count > 0;
    
    // If no items, set our flag to avoid future checks
    if (!hasItems) {
      hasCheckedDatabase = true;
      console.log('[Supabase] No items found in database. Using fallbacks.');
    } else {
      console.log('[Supabase] Connection test successful. Items count:', count);
    }
    
    return hasItems;
  } catch (e) {
    console.error('[Supabase] Exception in checkDatabaseHasItems:', e);
    isCheckingDatabase = false;
    hasCheckedDatabase = true;
    return false;
  }
};

// Reset the cache and flags - useful for testing
export const resetItemsCache = () => {
  itemsCache.clear();
  hasCheckedDatabase = false;
  hasLoggedNoItems = false;
  isCheckingDatabase = false;
};
