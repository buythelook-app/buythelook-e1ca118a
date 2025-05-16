
import { supabase } from "@/lib/supabaseClient";
import { DashboardItem } from "@/types/lookTypes";

// Cache for storing outfit suggestions to avoid unnecessary API calls
const outfitCache: Record<string, any> = {};

// Global trackers for item repetition prevention
const globalItemTrackers = {
  usedItemIds: new Set<string>(),
  usedTopIds: new Set<string>(),
  usedBottomIds: new Set<string>(),
  usedShoeIds: new Set<string>()
};

// Function to clear the global item trackers
export const clearGlobalItemTrackers = () => {
  globalItemTrackers.usedItemIds.clear();
  globalItemTrackers.usedTopIds.clear();
  globalItemTrackers.usedBottomIds.clear();
  globalItemTrackers.usedShoeIds.clear();
  console.log("Global item trackers cleared");
};

// Function to clear the outfit cache when user wants new combinations
export const clearOutfitCache = (
  bodyShape: string,
  style: string,
  mood: string
) => {
  const key = `${bodyShape}-${style}-${mood}`;
  if (outfitCache[key]) {
    delete outfitCache[key];
    console.log("Cache cleared for", key);
  }
};

// Helper function to map Supabase zara_cloth items to DashboardItem type
const mapToOutfitItem = (item: any): DashboardItem => {
  // Map product_family or category_id to one of the allowed types
  let type = item.product_family.toLowerCase();
  
  // Ensure type is one of the allowed values
  const allowedTypes = [
    "top", "bottom", "dress", "shoes", "accessory", "sunglasses", "outerwear", "cart"
  ];
  
  if (!allowedTypes.includes(type)) {
    // Handle mapping for category_id if product_family doesn't match allowed types
    if (item.category_id) {
      const categoryMap: Record<string, string> = {
        "tops": "top",
        "bottoms": "bottom",
        "dresses": "dress",
        "footwear": "shoes",
        "accessories": "accessory",
        "eyewear": "sunglasses",
        "jackets": "outerwear",
        "coats": "outerwear",
      };
      
      type = categoryMap[item.category_id.toLowerCase()] || "top";
    } else {
      // Default to "top" if we can't determine type
      type = "top";
    }
  }
  
  return {
    id: item.product_id || `zara-${item.id}`,
    name: item.product_name,
    image: item.image,
    type: type as "top" | "bottom" | "dress" | "shoes" | "accessory" | "sunglasses" | "outerwear" | "cart",
    price: `$${parseFloat(item.price).toFixed(2)}`
  };
};

// Function to fetch items by type with improved randomization
export const fetchItemsByType = async (
  type: string,
  occasion: string,
  excludeIds: string[] = []
): Promise<DashboardItem[]> => {
  try {
    console.log(`Fetching ${type} items for ${occasion} (excluding ${excludeIds.length} items)`);
    
    // Use product_family or category_id for filtering
    let query = supabase
      .from('zara_cloth')
      .select('*')
      .or(`product_family.eq.${type},category_id.eq.${type}`);
    
    // Exclude already used items to prevent duplication
    if (excludeIds.length > 0) {
      query = query.not('product_id', 'in', `(${excludeIds.join(',')})`);
    }
    
    // Track items in global trackers based on type
    const typeTracker = type === 'top' 
      ? globalItemTrackers.usedTopIds
      : type === 'bottom' 
        ? globalItemTrackers.usedBottomIds 
        : type === 'shoes'
          ? globalItemTrackers.usedShoeIds
          : null;
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching items from Supabase:", error);
      throw error;
    }
    
    // Filter out items that have been used before (in global trackers)
    let availableItems = data || [];
    if (typeTracker) {
      availableItems = availableItems.filter(item => !typeTracker.has(item.product_id));
    }
    
    // If we've used up most items, clear the tracker to allow reuse
    if (availableItems.length < 3 && typeTracker && typeTracker.size > 10) {
      console.log(`Clearing ${type} tracker as we're running out of unique items`);
      typeTracker.clear();
      // Re-filter without the tracker constraint
      availableItems = data || [];
    }
    
    // Shuffle the array to get random items
    const shuffledData = availableItems.sort(() => Math.random() - 0.5);
    
    // Map to the required format
    const mappedItems = shuffledData.map(mapToOutfitItem);
    
    // Add used items to the appropriate tracker
    if (typeTracker && mappedItems.length > 0) {
      mappedItems.forEach(item => {
        typeTracker.add(item.id);
        globalItemTrackers.usedItemIds.add(item.id);
      });
    }
    
    // Return items, or empty array if no items found
    return mappedItems.length > 0 ? mappedItems : [];
  } catch (error) {
    console.error(`Error fetching ${type} items:`, error);
    return [];
  }
};

// Keep track of used item IDs across different occasions to prevent duplication
const usedItemIds: Record<string, Set<string>> = {
  "Work": new Set(),
  "Casual": new Set(),
  "Evening": new Set(),
  "Weekend": new Set()
};

// Function to fetch items for a complete outfit
export const fetchOutfitItems = async (occasion: string): Promise<DashboardItem[]> => {
  try {
    // Reset used items for this occasion if it's getting too restrictive
    if (usedItemIds[occasion] && usedItemIds[occasion].size > 15) {
      usedItemIds[occasion] = new Set();
    }
    
    // Get current used IDs for this occasion and convert to string array
    const excludeIds = Array.from(usedItemIds[occasion] || new Set()).map(id => String(id));
    
    // Fetch different item types for the occasion
    const topItems = await fetchItemsByType("top", occasion, excludeIds);
    const bottomItems = await fetchItemsByType("bottom", occasion, excludeIds);
    const shoesItems = await fetchItemsByType("shoes", occasion, excludeIds);
    
    // Select one random item from each type
    const randomTop = topItems.length > 0 ? topItems[Math.floor(Math.random() * topItems.length)] : null;
    const randomBottom = bottomItems.length > 0 ? bottomItems[Math.floor(Math.random() * bottomItems.length)] : null;
    const randomShoes = shoesItems.length > 0 ? shoesItems[Math.floor(Math.random() * shoesItems.length)] : null;
    
    // Add selected items to usedItemIds to avoid repeated use
    if (randomTop) usedItemIds[occasion].add(randomTop.id);
    if (randomBottom) usedItemIds[occasion].add(randomBottom.id);
    if (randomShoes) usedItemIds[occasion].add(randomShoes.id);
    
    // Filter out null values and return
    const items = [randomTop, randomBottom, randomShoes].filter(Boolean) as DashboardItem[];
    
    console.log(`Generated outfit for ${occasion}:`, items);
    return items;
  } catch (error) {
    console.error(`Error generating outfit for ${occasion}:`, error);
    return [];
  }
};

// Function to fetch dashboard items (outfits for different occasions)
export const fetchDashboardItems = async (): Promise<Record<string, DashboardItem[]>> => {
  try {
    const occasions = ["Work", "Casual", "Evening", "Weekend"];
    const result: Record<string, DashboardItem[]> = {};
    
    await Promise.all(
      occasions.map(async (occasion) => {
        result[occasion] = await fetchOutfitItems(occasion);
      })
    );
    
    return result;
  } catch (error) {
    console.error("Error fetching dashboard items:", error);
    throw error;
  }
};

// Function to fetch the first outfit suggestion (for main display)
export const fetchFirstOutfitSuggestion = async (forceRefresh = false): Promise<DashboardItem[]> => {
  try {
    const data = await fetchOutfitItems("Casual");
    return data;
  } catch (error) {
    console.error("Error fetching first outfit suggestion:", error);
    return [];
  }
};

// Export other functions as needed
export {
  outfitCache,
  globalItemTrackers
};
