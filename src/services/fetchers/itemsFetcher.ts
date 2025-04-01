
/**
 * Functions for fetching items from the database
 */

import { DashboardItem } from "@/types/lookTypes";
import { supabase } from "@/lib/supabase";

/**
 * Fetch items from Supabase database by type
 */
export const fetchItemsByType = async (type: string): Promise<DashboardItem[]> => {
  try {
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
      return [];
    }
    
    console.log(`[Supabase] Found ${data.length} ${type} items`);
    
    return data.map(item => ({
      id: item.id || `generated-${Math.random().toString(36).substring(2, 9)}`,
      name: item.name || `Stylish ${type}`,
      description: item.description || `Stylish ${type}`,
      image: item.image || `items/default_${type}.png`,
      price: item.price || '$49.99',
      type: type
    }));
  } catch (e) {
    console.error(`[Supabase] Exception in fetchItemsByType for ${type}:`, e);
    return [];
  }
};

/**
 * Find the best matching item color from database
 */
export const findBestColorMatch = async (hexColor: string, itemType: string): Promise<DashboardItem | null> => {
  try {
    console.log(`Finding ${itemType} item matching color ${hexColor}`);
    
    // Try to find items by type
    const items = await fetchItemsByType(itemType);
    
    if (items.length === 0) {
      console.log(`No ${itemType} items found, using fallback`);
      return null;
    }
    
    // For now, just return a random item of the correct type
    // In a real app, we would try to match the color
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
  } catch (error) {
    console.error(`Error finding color match for ${itemType}:`, error);
    return null;
  }
};
