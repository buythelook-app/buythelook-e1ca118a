import { supabase } from "@/lib/supabaseClient"; // Use centralized Supabase client
import { DashboardItem } from "@/types/lookTypes";
import logger from "@/lib/logger";
import { generateOutfit as generateOutfitFromAPI, getOutfitColors } from "./outfitGenerationService";

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
  logger.debug("Global item trackers cleared");
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
    logger.debug("Cache cleared for", { context: "lookService", data: key });
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
    // Try to get the count to verify table exists and log connection details
    logger.info('Attempting to connect to Supabase and verify zara_cloth table', { context: "lookService" });
    logger.debug('Supabase connection info:', { 
      context: "lookService", 
      data: {
        url: "https://mwsblnposuyhrgzrtoyo.supabase.co", // Hardcode URL instead of accessing protected property
        auth: !!supabase.auth,
        from: !!supabase.from
      }
    });
    
    const { error, count } = await supabase
      .from('zara_cloth')
      .select('id', { count: 'exact', head: true });
    
    if (error) {
      logger.error('Error checking zara_cloth table:', { context: "lookService", data: error });
      return false;
    }
    
    logger.info('zara_cloth table exists with count:', { context: "lookService", data: count });
    return true;
  } catch (error) {
    logger.error('Exception checking zara_cloth table:', { context: "lookService", data: error });
    return false;
  }
};

// Function to fetch items by type with improved error handling and debugging
export const fetchItemsByType = async (
  type: string,
  occasion: string,
  excludeIds: string[] = []
): Promise<DashboardItem[]> => {
  try {
    logger.info(`Fetching ${type} items for ${occasion} (excluding ${excludeIds.length} items)`, 
                { context: "lookService" });
    
    // Explicitly log supabase client information for debugging
    logger.debug('Using Supabase client with URL:', { 
      context: "lookService", 
      data: {
        url: "https://mwsblnposuyhrgzrtoyo.supabase.co", // Hardcode URL instead of accessing protected property
        clientType: typeof supabase
      }
    });
    
    // Check if the zara_cloth table exists
    const tableExists = await verifyZaraClothTableExists();
    if (!tableExists) {
      logger.warn('zara_cloth table does not exist or cannot be accessed, using fallback data', 
                 { context: "lookService" });
      // Return fallback data for testing (since we know table should exist)
      return generateFallbackItems(type, 3);
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
    
    // Log the full query for debugging
    logger.debug('Executing query to zara_cloth table:', { 
      context: "lookService", 
      data: { type, occasion, excludeIds: excludeIdsArray } 
    });
    
    // Execute the query with additional logging
    logger.debug('About to execute Supabase query', {
      context: "lookService",
      data: { timestamp: new Date().toISOString() }
    });
    
    // Explicitly cast the data to ZaraClothItem[] type
    const { data, error } = await query;
    
    if (error) {
      logger.error("Error fetching items from Supabase:", { context: "lookService", data: error });
      // Return fallback data on error
      return generateFallbackItems(type, 3);
    }
    
    const clothesData = data as ZaraClothItem[];
    
    logger.info(`Retrieved ${clothesData?.length || 0} items for ${type} from database`, 
               { context: "lookService", data: clothesData });
    
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
      logger.debug(`Not enough ${type} items, clearing tracker to get more options`, 
                  { context: "lookService" });
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
      logger.debug(`No ${type} items found with specific filters, using broader search`, 
                  { context: "lookService" });
      
      const fallbackQuery = supabase
        .from('zara_cloth')
        .select('*')
        .limit(10);
      
      // Explicitly cast the fallback data to ZaraClothItem[] type
      const { data: fallbackData } = await fallbackQuery;
      availableItems = (fallbackData as ZaraClothItem[]) || [];
      
      logger.debug(`Fallback query returned ${availableItems.length} items`, 
                  { context: "lookService" });
    }
    
    // Shuffle the array to get random items
    const shuffledData = [...availableItems].sort(() => Math.random() - 0.5);
    
    // Map to the required format with better logging
    const mappedItems = (shuffledData || []).slice(0, 5).map(mapToOutfitItem);
    
    logger.info(`Returning ${mappedItems.length} ${type} items for ${occasion}`, 
               { context: "lookService", data: mappedItems });
    
    // Return items, or fallback if no items found
    return mappedItems.length > 0 ? mappedItems : generateFallbackItems(type, 3);
  } catch (error) {
    logger.error(`Error fetching ${type} items:`, { context: "lookService", data: error });
    // Return fallback data on error
    return generateFallbackItems(type, 3);
  }
};

// New helper function to generate fallback items when database access fails
const generateFallbackItems = (type: string, count: number): DashboardItem[] => {
  logger.warn(`Generating ${count} fallback items for ${type}`, { context: "lookService" });
  
  const items: DashboardItem[] = [];
  for (let i = 1; i <= count; i++) {
    const id = `fallback-${type}-${i}`;
    let image = '/placeholder.svg';
    
    // Use different placeholder images based on type
    switch(type) {
      case 'top':
        image = '/lovable-uploads/b2b5da4b-c967-4791-8832-747541e275be.png';
        break;
      case 'bottom':
        image = '/lovable-uploads/a1785297-040b-496d-a2fa-af4ecb55207a.png';
        break;
      case 'shoes':
        image = '/lovable-uploads/c7a32d15-ffe2-4f07-ae82-a943d5128293.png';
        break;
      default:
        image = '/placeholder.svg';
    }
    
    items.push({
      id,
      name: `Fallback ${type} item ${i}`,
      image,
      type: type as any,
      price: `$${(Math.random() * 50 + 20).toFixed(2)}`
    });
  }
  
  return items;
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
    
    logger.debug(`Fetching outfit items for ${occasion}, excluding ${excludeIds.length} items`, 
                { context: "lookService" });
    
    // Fetch different item types for the occasion
    const topItems = await fetchItemsByType("top", occasion, excludeIds);
    const bottomItems = await fetchItemsByType("bottom", occasion, excludeIds);
    const shoesItems = await fetchItemsByType("shoes", occasion, excludeIds);
    
    logger.debug(`Fetched: ${topItems.length} tops, ${bottomItems.length} bottoms, ${shoesItems.length} shoes`, 
                { context: "lookService" });
    
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
    
    // Fixed: Modify logger.debug call to pass items inside the data object instead of as a separate parameter
    logger.debug(`Generated outfit for ${occasion}:`, { 
      context: "lookService", 
      data: items 
    });
    
    return items;
  } catch (error) {
    logger.error(`Error generating outfit for ${occasion}:`, { context: "lookService", data: error });
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
      logger.warn('zara_cloth table does not exist, using fallback data', 
                 { context: "lookService" });
      return {};
    }
    
    await Promise.all(
      occasions.map(async (occasion) => {
        result[occasion] = await fetchOutfitItems(occasion);
      })
    );
    
    return result;
  } catch (error) {
    logger.error("Error fetching dashboard items:", { context: "lookService", data: error });
    throw error;
  }
};

// Function to fetch the first outfit suggestion (for main display)
export const fetchFirstOutfitSuggestion = async (forceRefresh = false): Promise<DashboardItem[]> => {
  try {
    // Try to get user style data
    const styleData = localStorage.getItem('styleAnalysis');
    if (styleData) {
      const parsedData = JSON.parse(styleData);
      const bodyShape = parsedData?.analysis?.bodyShape || 'H';
      const style = parsedData?.analysis?.styleProfile || 'classic';
      const mood = localStorage.getItem('current-mood') || 'energized';
      
      // If we're forcing a refresh or we don't have cached data, try to generate a new outfit
      if (forceRefresh || !localStorage.getItem('last-outfit-data')) {
        // Call the outfit generation API with a single request object
        const response = await generateOutfitFromAPI({
          bodyStructure: bodyShape as any,
          mood,
          style: style as any
        });
        
        // If successful, store the result
        if (response.success && response.data) {
          logger.info("Successfully generated new outfit from API", 
                    { context: "lookService" });
        } else {
          logger.warn("Failed to generate outfit from API, using fallback method", 
                     { context: "lookService" });
        }
      }
    }
    
    // Regardless of API success, continue with the standard fetch method
    // as a fallback or to match items with the AI suggestions
    const data = await fetchOutfitItems("Casual");
    return data;
  } catch (error) {
    logger.error("Error fetching first outfit suggestion:", 
               { context: "lookService", data: error });
    return [];
  }
};

// Function to match clothing items to the generated outfit colors
export const matchOutfitToColors = async (): Promise<Record<string, DashboardItem[]>> => {
  try {
    // Get color recommendations from the cached outfit
    const outfitColors = getOutfitColors();
    if (!outfitColors || Object.keys(outfitColors).length === 0) {
      logger.warn("No outfit colors found for matching", { context: "lookService" });
      return {};
    }
    
    const result: Record<string, DashboardItem[]> = {};
    
    // For each item type in the outfit, find matching clothing items
    for (const [type, color] of Object.entries(outfitColors)) {
      if (!color) continue;
      
      // Only process main outfit components
      if (!['top', 'bottom', 'shoes', 'coat'].includes(type)) continue;
      
      // Find items of this type
      const items = await fetchItemsByType(type, "AI Generated", []);
      
      // Add to the result
      result[type] = items;
    }
    
    return result;
  } catch (error) {
    logger.error("Error matching outfit to colors", 
               { context: "lookService", data: error });
    return {};
  }
};

// Export other functions as needed
export {
  outfitCache,
  globalItemTrackers
};
