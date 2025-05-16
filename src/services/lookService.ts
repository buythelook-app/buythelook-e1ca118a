import { supabase } from "@/lib/supabaseClient";
import { DashboardItem } from "@/types/lookTypes";

// Cache for storing outfit suggestions to avoid unnecessary API calls
const outfitCache: Record<string, any> = {};

interface OutfitColors {
  top: string;
  bottom: string;
  shoes: string;
}

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
    
    let query = supabase
      .from('zara_cloth')
      .select('*')
      .or(`product_family.eq.${type},category_id.eq.${type}`);
    
    if (excludeIds.length > 0) {
      query = query.not('product_id', 'in', `(${excludeIds.join(',')})`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching items from Supabase:", error);
      throw error;
    }
    
    // Filter items by occasion suitability (simplified logic for demo)
    // In real app, we would have more complex filtering based on occasion
    const occasionMap: Record<string, string[]> = {
      "Work": ["formal", "business", "elegant"],
      "Casual": ["casual", "relaxed", "comfortable"],
      "Evening": ["elegant", "formal", "sophisticated"],
      "Weekend": ["casual", "comfortable", "relaxed"]
    };
    
    // Shuffle the array to get random items
    const shuffledData = data.sort(() => Math.random() - 0.5);
    
    // Map to the required format
    const mappedItems = shuffledData.map(mapToOutfitItem);
    
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
    
    // Fetch different item types for the occasion
    const topItems = await fetchItemsByType("top", occasion, Array.from(usedItemIds[occasion]));
    const bottomItems = await fetchItemsByType("bottom", occasion, Array.from(usedItemIds[occasion]));
    const shoesItems = await fetchItemsByType("shoes", occasion, Array.from(usedItemIds[occasion]));
    
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
};
