import { DashboardItem } from "@/types/lookTypes";
import { supabase } from "@/lib/supabase";
import { checkDatabaseHasItems } from "./fetchers/itemsFetcher";

console.log("Fetching dashboard items from Supabase");
console.log("[Supabase] Dashboard service using URL:", process.env.SUPABASE_URL || 'https://aqkeprwxxsryropnhfvm.supabase.co');

// Cache for item filters to prevent redundant processing 
const topItemsByOccasionCache = new Map();
const bottomItemsByOccasionCache = new Map();
const shoesItemsByOccasionCache = new Map();

const fetchTopItemsForOccasion = async (occasion: string): Promise<DashboardItem[]> => {
  if (topItemsByOccasionCache.has(occasion)) {
    console.log(`Using cached top items for occasion: ${occasion}`);
    return topItemsByOccasionCache.get(occasion) || [];
  }
  
  console.log(`Fetching top items for occasion: ${occasion}`);
  
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('type', 'top')
    .ilike('description', `%${occasion}%`)
    .limit(5);
  
  if (error) {
    console.error(`Error fetching top items for ${occasion}:`, error);
    return [];
  }
  
  const topItems = data ? data.map(item => ({
    id: item.id || `generated-${Math.random().toString(36).substring(2, 9)}`,
    name: item.name || 'Top',
    description: item.description || 'No description available',
    image: item.image || '/placeholder.svg',
    price: item.price || '$0.00',
    type: item.type || 'top'
  })) : [];
  
  topItemsByOccasionCache.set(occasion, topItems);
  return topItems;
};

const fetchBottomItemsForOccasion = async (occasion: string): Promise<DashboardItem[]> => {
  if (bottomItemsByOccasionCache.has(occasion)) {
    console.log(`Using cached bottom items for occasion: ${occasion}`);
    return bottomItemsByOccasionCache.get(occasion) || [];
  }
  
  console.log(`Fetching bottom items for occasion: ${occasion}`);
  
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('type', 'bottom')
    .ilike('description', `%${occasion}%`)
    .limit(5);
  
  if (error) {
    console.error(`Error fetching bottom items for ${occasion}:`, error);
    return [];
  }
  
  const bottomItems = data ? data.map(item => ({
    id: item.id || `generated-${Math.random().toString(36).substring(2, 9)}`,
    name: item.name || 'Bottom',
    description: item.description || 'No description available',
    image: item.image || '/placeholder.svg',
    price: item.price || '$0.00',
    type: item.type || 'bottom'
  })) : [];
  
  bottomItemsByOccasionCache.set(occasion, bottomItems);
  return bottomItems;
};

const fetchShoesItemsForOccasion = async (occasion: string): Promise<DashboardItem[]> => {
  if (shoesItemsByOccasionCache.has(occasion)) {
    console.log(`Using cached shoes items for occasion: ${occasion}`);
    return shoesItemsByOccasionCache.get(occasion) || [];
  }
  
  console.log(`Fetching shoes items for occasion: ${occasion}`);
  
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('type', 'shoes')
    .ilike('description', `%${occasion}%`)
    .limit(5);
  
  if (error) {
    console.error(`Error fetching shoes items for ${occasion}:`, error);
    return [];
  }
  
  const shoesItems = data ? data.map(item => ({
    id: item.id || `generated-${Math.random().toString(36).substring(2, 9)}`,
    name: item.name || 'Shoes',
    description: item.description || 'No description available',
    image: item.image || '/placeholder.svg',
    price: item.price || '$0.00',
    type: item.type || 'shoes'
  })) : [];
  
  shoesItemsByOccasionCache.set(occasion, shoesItems);
  return shoesItems;
};

export const getAllItemsFromSupabase = async (): Promise<DashboardItem[]> => {
  try {
    // First check if we should query the database at all
    const hasItems = await checkDatabaseHasItems();
    if (!hasItems) {
      console.log("Database has no items according to cache. Using empty array.");
      return [];
    }
    
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .limit(30); // Limit to 30 items total
    
    if (error) {
      console.error('Error fetching all items:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log("No items found in database");
      return [];
    }
    
    return data.map(item => ({
      id: item.id || `generated-${Math.random().toString(36).substring(2, 9)}`,
      name: item.name || 'Item',
      description: item.description || 'No description available',
      image: item.image || '/placeholder.svg',
      price: item.price || '$0.00',
      type: item.type || 'unknown'
    }));
  } catch (error) {
    console.error('Error fetching all items:', error);
    return [];
  }
};

export const fetchItemsForOccasion = async (): Promise<Record<string, DashboardItem[]>> => {
  try {
    // Define a list of occasions to fetch items for
    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    const result: Record<string, DashboardItem[]> = {};
    
    // Fetch items for each occasion
    await Promise.all(
      occasions.map(async (occasion) => {
        const [topItems, bottomItems, shoesItems] = await Promise.all([
          fetchTopItemsForOccasion(occasion),
          fetchBottomItemsForOccasion(occasion),
          fetchShoesItemsForOccasion(occasion),
        ]);
        
        // Combine items for this occasion
        const combinedItems = [...topItems, ...bottomItems, ...shoesItems];
        const uniqueItems = Array.from(new Map(combinedItems.map(item => [item.id, item])).values());
        
        result[occasion] = uniqueItems;
        console.log(`Total unique items for ${occasion}: ${uniqueItems.length}`);
      })
    );
    
    return result;
  } catch (error) {
    console.error('Error fetching items for occasions:', error);
    return {};
  }
};

// Cache for dashboard items
const dashboardCache = new Map<string, DashboardItem[]>();

const fetchItemsByTypeAndOccasion = async (type: string, occasion: string): Promise<DashboardItem[]> => {
  try {
    const cacheKey = `${type}-${occasion}`;
    if (dashboardCache.has(cacheKey)) {
      return dashboardCache.get(cacheKey) || [];
    }
    
    console.log(`Fetching ${type} items for ${occasion} from Supabase`);
    
    let result: DashboardItem[] = [];
    
    // Query items with description containing the occasion
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('type', type)
      .ilike('description', `%${occasion}%`)
      .limit(10);
    
    if (error) {
      console.error(`Error fetching ${type} items for ${occasion}:`, error);
      return [];
    }
    
    if (data && data.length > 0) {
      result = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        image: item.image || '/placeholder.svg',
        price: item.price,
        type: item.type
      }));
      
      console.log(`Found ${result.length} ${type} items for ${occasion}`);
      dashboardCache.set(cacheKey, result);
      return result;
    }
    
    // If no items found with occasion in description, fetch any items of that type
    console.log(`No ${type} items found with description containing ${occasion}, fetching any ${type} items`);
    const { data: anyTypeData, error: anyTypeError } = await supabase
      .from('items')
      .select('*')
      .eq('type', type)
      .limit(10);
    
    if (anyTypeError) {
      console.error(`Error fetching any ${type} items:`, anyTypeError);
      return [];
    }
    
    if (anyTypeData && anyTypeData.length > 0) {
      result = anyTypeData.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        image: item.image || '/placeholder.svg',
        price: item.price,
        type: item.type
      }));
      
      console.log(`Found ${result.length} general ${type} items`);
      dashboardCache.set(cacheKey, result);
      return result;
    }
    
    console.log(`No ${type} items found in database for ${occasion}`);
    dashboardCache.set(cacheKey, []);
    return [];
  } catch (error) {
    console.error(`Error in fetchItemsByTypeAndOccasion for ${type}/${occasion}:`, error);
    return [];
  }
};
