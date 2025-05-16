
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

// Define a type for the Supabase zara_cloth items
interface ZaraClothItem {
  id: string;
  product_name: string;
  price: number | string;
  image?: string;
  colour?: string;
  description?: string;
}

// Helper function to map Supabase zara_cloth items to DashboardItem type
const mapToOutfitItem = (item: ZaraClothItem): DashboardItem => {
  // Map product_family or category_id to one of the allowed types
  let type = item.product_name ? item.product_name.toLowerCase() : '';
  
  // Ensure type is one of the allowed values
  const allowedTypes = [
    "top", "bottom", "dress", "shoes", "accessory", "sunglasses", "outerwear", "cart"
  ];
  
  if (!allowedTypes.includes(type as any)) {
    // Map based on common clothing terms in the product name
    if (type.includes('shirt') || type.includes('blouse') || type.includes('tee') || 
        type.includes('top') || type.includes('sweater')) {
      type = "top";
    } else if (type.includes('pant') || type.includes('trouser') || type.includes('jean') || 
               type.includes('skirt') || type.includes('bottom') || type.includes('short')) {
      type = "bottom";
    } else if (type.includes('shoe') || type.includes('boot') || type.includes('sneaker') || 
               type.includes('sandal') || type.includes('footwear')) {
      type = "shoes";
    } else if (type.includes('dress')) {
      type = "dress";
    } else if (type.includes('jacket') || type.includes('coat') || type.includes('outerwear')) {
      type = "outerwear";
    } else if (type.includes('accessory') || type.includes('hat') || type.includes('bag')) {
      type = "accessory";
    } else if (type.includes('sunglasses') || type.includes('glasses')) {
      type = "sunglasses";
    } else {
      // Default to "top" if we can't determine type
      type = "top";
    }
  }
  
  // Make sure we have a valid image URL
  const imageUrl = item.image || '/placeholder.svg';
  
  return {
    id: item.id || `zara-${Math.random().toString(36).substring(2, 9)}`,
    name: item.product_name || 'Fashion item',
    image: imageUrl,
    type: type as "top" | "bottom" | "dress" | "shoes" | "accessory" | "sunglasses" | "outerwear" | "cart",
    price: item.price ? `$${parseFloat(String(item.price)).toFixed(2)}` : '$49.99'
  };
};

// Function to verify if the zara_cloth table exists
const verifyZaraClothTableExists = async (): Promise<boolean> => {
  try {
    // Try to get the count to verify table exists
    const { error } = await supabase
      .from('zara_cloth')
      .select('id', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error checking zara_cloth table:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception checking zara_cloth table:', error);
    return false;
  }
};

// Function to fetch items by type with improved randomization and error handling
export const fetchItemsByType = async (
  type: string,
  occasion: string,
  excludeIds: string[] = []
): Promise<DashboardItem[]> => {
  try {
    console.log(`Fetching ${type} items for ${occasion} (excluding ${excludeIds.length} items)`);
    
    // Check if the zara_cloth table exists
    const tableExists = await verifyZaraClothTableExists();
    if (!tableExists) {
      console.warn('zara_cloth table does not exist, using fallback data');
      // Return empty array, which will trigger fallback data in the usePersonalizedLooks hook
      return [];
    }
    
    // Convert excludeIds to string array for proper filtering
    const excludeIdsArray = excludeIds.map(id => String(id));
    
    // Simple query to the zara_cloth table
    let query = supabase
      .from('zara_cloth')
      .select('*');
    
    // Apply filtering based on the type we're looking for
    // First, try to check if the product_name contains relevant type keywords
    if (type === 'top') {
      query = query.or('product_name.ilike.%shirt%,product_name.ilike.%blouse%,product_name.ilike.%tee%,product_name.ilike.%sweater%,product_name.ilike.%top%');
    } else if (type === 'bottom') {
      query = query.or('product_name.ilike.%pant%,product_name.ilike.%trouser%,product_name.ilike.%jean%,product_name.ilike.%skirt%,product_name.ilike.%short%,product_name.ilike.%bottom%');
    } else if (type === 'shoes') {
      query = query.or('product_name.ilike.%shoe%,product_name.ilike.%boot%,product_name.ilike.%sneaker%,product_name.ilike.%sandal%,product_name.ilike.%footwear%');
    } else if (type === 'outerwear') {
      query = query.or('product_name.ilike.%jacket%,product_name.ilike.%coat%,product_name.ilike.%outerwear%');
    } else {
      // For other types, just try a simple match
      query = query.ilike('product_name', `%${type}%`);
    }
    
    // Exclude IDs that have already been used
    if (excludeIdsArray.length > 0) {
      query = query.not('id', 'in', excludeIdsArray);
    }
    
    // Use explicit type casting as suggested
    const { data, error } = await query;
    const clothesData = data as ZaraClothItem[];
    
    if (error) {
      console.error("Error fetching items from Supabase:", error);
      throw error;
    }
    
    console.log(`Retrieved ${clothesData?.length || 0} items for ${type} from database`);
    
    // Track items in global trackers based on type
    const typeTracker = type === 'top' 
      ? globalItemTrackers.usedTopIds
      : type === 'bottom' 
        ? globalItemTrackers.usedBottomIds 
        : type === 'shoes'
          ? globalItemTrackers.usedShoeIds
          : null;
    
    // Filter out items that have been used before (in global trackers)
    let availableItems = clothesData || [];
    if (typeTracker) {
      availableItems = availableItems.filter(item => !typeTracker.has(String(item.id)));
    }
    
    // If we found no items or very few, we should get more by clearing the trackers
    if (availableItems.length < 3 && typeTracker && typeTracker.size > 0) {
      console.log(`Not enough ${type} items, clearing tracker to get more options`);
      typeTracker.clear();
      
      // Requery without tracker constraints, but still respect excludeIds
      if (excludeIdsArray.length > 0) {
        availableItems = (clothesData || []).filter(item => !excludeIdsArray.includes(String(item.id)));
      } else {
        availableItems = clothesData || [];
      }
    }
    
    // If still no data, use a more lenient query
    if (availableItems.length === 0) {
      console.log(`No ${type} items found with specific filters, using broader search`);
      
      const fallbackQuery = supabase
        .from('zara_cloth')
        .select('*')
        .limit(10);
      
      // Use explicit type casting for fallback query
      const { data: fallbackData } = await fallbackQuery;
      availableItems = (fallbackData as ZaraClothItem[]) || [];
    }
    
    // Shuffle the array to get random items
    const shuffledData = [...availableItems].sort(() => Math.random() - 0.5);
    
    // Map to the required format
    const mappedItems = shuffledData.slice(0, 5).map(mapToOutfitItem);
    
    // Add used items to the appropriate tracker
    if (typeTracker && mappedItems.length > 0) {
      mappedItems.forEach(item => {
        typeTracker.add(String(item.id));
        globalItemTrackers.usedItemIds.add(String(item.id));
      });
    }
    
    console.log(`Returning ${mappedItems.length} ${type} items for ${occasion}`);
    
    // Return items, or empty array if no items found
    return mappedItems;
  } catch (error) {
    console.error(`Error fetching ${type} items:`, error);
    return [];
  }
};

// Keep track of used item IDs across different occasions to prevent duplication
const usedItemIds: Record<string, Set<string>> = {
  "Work": new Set<string>(),
  "Casual": new Set<string>(),
  "Evening": new Set<string>(),
  "Weekend": new Set<string>()
};

// Function to fetch items for a complete outfit
export const fetchOutfitItems = async (occasion: string): Promise<DashboardItem[]> => {
  try {
    // Reset used items for this occasion if it's getting too restrictive
    if (usedItemIds[occasion] && usedItemIds[occasion].size > 15) {
      usedItemIds[occasion] = new Set<string>();
    }
    
    // Get current used IDs for this occasion and convert to string array
    const excludeIds = Array.from(usedItemIds[occasion] || new Set<string>()).map(id => String(id));
    
    console.log(`Fetching outfit items for ${occasion}, excluding ${excludeIds.length} items`);
    
    // Fetch different item types for the occasion
    const topItems = await fetchItemsByType("top", occasion, excludeIds);
    const bottomItems = await fetchItemsByType("bottom", occasion, excludeIds);
    const shoesItems = await fetchItemsByType("shoes", occasion, excludeIds);
    
    console.log(`Fetched: ${topItems.length} tops, ${bottomItems.length} bottoms, ${shoesItems.length} shoes`);
    
    // Select one random item from each type
    const randomTop = topItems.length > 0 ? topItems[Math.floor(Math.random() * topItems.length)] : null;
    const randomBottom = bottomItems.length > 0 ? bottomItems[Math.floor(Math.random() * bottomItems.length)] : null;
    const randomShoes = shoesItems.length > 0 ? shoesItems[Math.floor(Math.random() * shoesItems.length)] : null;
    
    // Add selected items to usedItemIds to avoid repeated use
    if (randomTop) usedItemIds[occasion].add(String(randomTop.id));
    if (randomBottom) usedItemIds[occasion].add(String(randomBottom.id));
    if (randomShoes) usedItemIds[occasion].add(String(randomShoes.id));
    
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
    
    // Check if the zara_cloth table exists before making any requests
    const tableExists = await verifyZaraClothTableExists();
    if (!tableExists) {
      console.warn('zara_cloth table does not exist, using fallback data');
      return {};
    }
    
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
