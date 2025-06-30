import { supabase } from "@/lib/supabaseClient";
import type { ZaraItem } from "@/types/supabase";
import type { LookItem } from "@/hooks/usePersonalizedLooks";
import { mapProductToType } from "@/utils/utils";
import { DashboardItem } from "@/types/lookTypes";

// Global tracking to prevent duplicates across all occasions
const globalUsedItems = new Set<string>();
let outfitCache: { [key: string]: DashboardItem[] } = {};

export const clearOutfitCache = () => {
  outfitCache = {};
  globalUsedItems.clear();
  console.log('🧹 [clearOutfitCache] Cleared all caches and global tracking');
};

export type ZaraShoesData = Pick<ZaraItem,
  "id" |
  "product_name" |
  "price" |
  "image" |
  "product_family" |
  "product_subfamily" |
  "colour" |
  "availability">

const extractImageUrl = (image: string): string => {
  const parts = image.split(';');
  const urlPart = parts.find(part => part.startsWith('url:'));
  return urlPart ? urlPart.substring(4) : image;
};

const getRandomItems = (items: any[], count: number, occasion: string, usedItemIds?: Set<string>): any[] => {
  console.log(`🎲 [getRandomItems] Getting ${count} items for ${occasion} from ${items.length} available items`);
  
  const effectiveUsedItems = usedItemIds || globalUsedItems;
  
  // Filter out already used items
  const availableItems = items.filter(item => !effectiveUsedItems.has(item.id));
  console.log(`🔍 [getRandomItems] ${availableItems.length} items available after filtering used items`);
  
  if (availableItems.length === 0) {
    console.warn(`⚠️ [getRandomItems] No available items for ${occasion} after filtering`);
    return [];
  }
  
  // Shuffle and select
  const shuffled = [...availableItems].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  
  // Track selected items globally
  selected.forEach(item => {
    globalUsedItems.add(item.id);
    console.log(`📝 [getRandomItems] Tracking item ${item.id} (${item.product_name}) as used for ${occasion}`);
  });
  
  console.log(`✅ [getRandomItems] Selected ${selected.length} unique items for ${occasion}`);
  return selected;
};

export const fetchDashboardItems = async (): Promise<{ [key: string]: DashboardItem[] }> => {
  console.log('🚀 [fetchDashboardItems] Starting fetch with unique item distribution...');
  
  try {
    // Clear previous tracking for fresh start
    globalUsedItems.clear();
    
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

    // Ensure we have enough items for all occasions
    const minItemsNeeded = occasions.length; // At least 1 of each type per occasion
    if (tops.length < minItemsNeeded || bottoms.length < minItemsNeeded || shoes.length < minItemsNeeded) {
      console.warn('⚠️ [fetchDashboardItems] Not enough items for unique distribution');
    }

    const result: { [key: string]: DashboardItem[] } = {};

    // Distribute unique items to each occasion
    occasions.forEach((occasion, index) => {
      console.log(`\n🎯 [fetchDashboardItems] Processing occasion: ${occasion} (${index + 1}/${occasions.length})`);
      
      const outfitItems: DashboardItem[] = [];
      
      // Get one unique item from each category
      const selectedTop = getRandomItems(tops, 1, `${occasion}-top`);
      const selectedBottom = getRandomItems(bottoms, 1, `${occasion}-bottom`);
      const selectedShoes = getRandomItems(shoes, 1, `${occasion}-shoes`);
      
      // Add selected items to outfit
      outfitItems.push(...selectedTop.map(item => ({
        id: item.id,
        name: item.product_name,
        image: item.image,
        type: item.type,
        price: `$${item.price}`,
        description: item.description || `${item.product_family} from Zara`
      })));
      
      outfitItems.push(...selectedBottom.map(item => ({
        id: item.id,
        name: item.product_name,
        image: item.image,
        type: item.type,
        price: `$${item.price}`,
        description: item.description || `${item.product_family} from Zara`
      })));
      
      outfitItems.push(...selectedShoes.map(item => ({
        id: item.id,
        name: item.product_name,
        image: item.image,
        type: item.type,
        price: `$${item.price}`,
        description: item.description || `${item.product_family} from Zara`
      })));
      
      result[occasion] = outfitItems;
      
      console.log(`✅ [fetchDashboardItems] ${occasion} outfit completed with ${outfitItems.length} unique items:`);
      outfitItems.forEach(item => {
        console.log(`   - ${item.type}: ${item.name} (ID: ${item.id})`);
      });
    });

    // Verify no duplicates across occasions
    const allSelectedIds = new Set<string>();
    let duplicatesFound = false;
    
    Object.entries(result).forEach(([occasion, items]) => {
      items.forEach(item => {
        if (allSelectedIds.has(item.id)) {
          console.error(`❌ [fetchDashboardItems] DUPLICATE FOUND: Item ${item.id} appears in multiple occasions`);
          duplicatesFound = true;
        }
        allSelectedIds.add(item.id);
      });
    });
    
    if (!duplicatesFound) {
      console.log(`✅ [fetchDashboardItems] SUCCESS: All ${allSelectedIds.size} items are unique across occasions`);
    }

    // Cache the result
    outfitCache = result;
    
    console.log('🎉 [fetchDashboardItems] Unique distribution completed successfully');
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
