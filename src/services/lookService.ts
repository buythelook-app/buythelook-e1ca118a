import { supabase } from "@/lib/supabaseClient";
import type { LookItem } from "@/hooks/usePersonalizedLooks";
import { DashboardItem } from "@/types/lookTypes";
import { mapProductToType, extractImageUrl } from "@/utils/utils";

// Define the correct ZaraShoesData type
type ZaraShoesData = {
  id: string;
  product_name: string;
  product_family: string;
  product_subfamily: string;
  colour: string;
  price: number;
  image: string;
  availability: boolean;
  url?: string;
  description?: string;
}

// Simple session-based tracking (clears on each fetchDashboardItems call)
let sessionUsedItems = new Set<string>();

export const clearOutfitCache = () => {
  sessionUsedItems.clear();
  console.log('🧹 [clearOutfitCache] Cleared session item tracking');
};

export const clearGlobalItemTrackers = () => {
  sessionUsedItems.clear();
  console.log('🧹 [clearGlobalItemTrackers] Cleared session item tracking');
};

const getRandomItems = (items: any[], count: number, occasion: string): any[] => {
  console.log(`🎲 [getRandomItems] Getting ${count} items for ${occasion} from ${items.length} available items`);
  
  if (items.length === 0) {
    console.warn(`⚠️ [getRandomItems] No items available for ${occasion}`);
    return [];
  }
  
  // First try to get items that haven't been used in this session
  let availableItems = items.filter(item => !sessionUsedItems.has(item.id));
  console.log(`🔍 [getRandomItems] ${availableItems.length} unused items available for ${occasion}`);
  
  // If no unused items available, use all items (allow reuse)
  if (availableItems.length === 0) {
    console.log(`⚠️ [getRandomItems] No unused items for ${occasion}, using all available items`);
    availableItems = items;
  }
  
  // Shuffle and select
  const shuffled = [...availableItems].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  
  // Track selected items for this session only
  selected.forEach(item => {
    sessionUsedItems.add(item.id);
    console.log(`📝 [getRandomItems] Marking item ${item.id} (${item.product_name}) as used for ${occasion}`);
  });
  
  console.log(`✅ [getRandomItems] Selected ${selected.length} items for ${occasion}`);
  return selected;
};

export const fetchDashboardItems = async (): Promise<{ [key: string]: DashboardItem[] }> => {
  console.log('🚀 [fetchDashboardItems] Starting fresh session with item tracking...');
  
  try {
    // Clear session tracking for new fetch
    sessionUsedItems.clear();
    
    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    
    // Fetch all available items from database
    const { data: allItems, error } = await supabase
      .from('zara_cloth')
      .select(`
        id,
        product_name,
        price,
        image,
        product_family,
        product_subfamily,
        colour,
        availability,
        url,
        description
      `)
      .eq('availability', true)
      .not('image', 'is', null);

    if (error) {
      console.error('❌ [fetchDashboardItems] Database error:', error);
      throw error;
    }

    if (!allItems || allItems.length === 0) {
      console.warn('⚠️ [fetchDashboardItems] No items found in database');
      throw new Error('No items available');
    }

    console.log(`📊 [fetchDashboardItems] Found ${allItems.length} total items in database`);

    // Process and categorize items
    const processedItems = allItems.map(item => ({
      ...item,
      image: extractImageUrl(item.image),
      type: mapProductToType(item.product_subfamily || item.product_family || 'top')
    }));

    // Separate by type for balanced distribution
    const tops = processedItems.filter(item => item.type === 'top');
    const bottoms = processedItems.filter(item => item.type === 'bottom');
    const shoes = processedItems.filter(item => item.type === 'shoes');

    console.log(`👕 Tops: ${tops.length}, 👖 Bottoms: ${bottoms.length}, 👠 Shoes: ${shoes.length}`);

    const result: { [key: string]: DashboardItem[] } = {};

    // Distribute items to each occasion sequentially
    occasions.forEach((occasion, index) => {
      console.log(`\n🎯 [fetchDashboardItems] Processing occasion: ${occasion} (${index + 1}/${occasions.length})`);
      
      const outfitItems: DashboardItem[] = [];
      
      // Get one item from each category (will automatically avoid duplicates within session)
      const selectedTop = getRandomItems(tops, 1, `${occasion}-top`);
      const selectedBottom = getRandomItems(bottoms, 1, `${occasion}-bottom`);
      const selectedShoes = getRandomItems(shoes, 1, `${occasion}-shoes`);
      
      // Add selected items to outfit
      [...selectedTop, ...selectedBottom, ...selectedShoes].forEach(item => {
        outfitItems.push({
          id: item.id,
          name: item.product_name,
          image: item.image,
          type: item.type,
          price: `$${item.price}`,
          description: item.description || `${item.product_family} from Zara`
        });
      });
      
      result[occasion] = outfitItems;
      
      console.log(`✅ [fetchDashboardItems] ${occasion} outfit completed with ${outfitItems.length} items:`);
      outfitItems.forEach(item => {
        console.log(`   - ${item.type}: ${item.name} (ID: ${item.id})`);
      });
    });

    // Log final distribution
    const totalSelectedItems = Object.values(result).reduce((sum, items) => sum + items.length, 0);
    const uniqueItems = new Set(Object.values(result).flat().map(item => item.id)).size;
    console.log(`🎉 [fetchDashboardItems] Distribution completed: ${totalSelectedItems} total items (${uniqueItems} unique) across ${occasions.length} occasions`);
    
    return result;

  } catch (error) {
    console.error('❌ [fetchDashboardItems] Error:', error);
    throw error;
  }
};

export const fetchFirstOutfitSuggestion = async (isRetry: boolean = false): Promise<DashboardItem[]> => {
  try {
    const { data, error } = await supabase
      .from('zara_cloth')
      .select(`
        id,
        product_name,
        price,
        image,
        product_family,
        product_subfamily,
        colour,
        availability,
        url,
        description
      `)
      .eq('availability', true)
      .limit(3);

    if (error) {
      console.error("Error fetching data:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn("No items found in database");
      return [];
    }

    const dashboardItems: DashboardItem[] = data.map(item => ({
      id: item.id,
      name: item.product_name,
      image: extractImageUrl(item.image),
      type: mapProductToType(item.product_subfamily || item.product_family || 'top'),
      price: `$${item.price}`,
      description: item.description || `${item.product_family} from Zara`
    }));

    return dashboardItems;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};

export const fetchZaraShoes = async (): Promise<ZaraShoesData[]> => {
  try {
    const { data, error } = await supabase
      .from('zara_cloth')
      .select(`
        id,
        product_name,
        price,
        image,
        product_family,
        product_subfamily,
        colour,
        availability
      `)
      .eq('product_family', 'shoes')
      .eq('availability', true)

    if (error) {
      console.error("Error fetching Zara shoes:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn("No Zara shoes found in database");
      return [];
    }

    return data as ZaraShoesData[];
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};
