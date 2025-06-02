
import { supabase } from "@/lib/supabaseClient";
import { DashboardItem } from "@/types/lookTypes";
import { isValidImagePattern } from "../../supabase/functions/trainer-agent/imageValidator";
import { extractZaraImageUrl } from "@/utils/imageUtils";
import { analyzeImagesWithAI } from "@/services/aiImageAnalysisService";

// Cache for outfit data
const outfitCache = new Map<string, any>();

// Global cache to track shown items and prevent repetition
const globalItemTracker = {
  shownItems: new Map<string, number>(), // id -> times shown
  shownTops: new Set<string>(),
  shownBottoms: new Set<string>(),
  shownShoes: new Set<string>(),
  maxRepetitions: 2 // Allow an item to appear this many times max
};

// Type for Zara database items
interface ZaraItem {
  id: string;
  product_name: string;
  product_subfamily?: string;
  price: number;
  colour: string;
  description: string;
  image: any;
  availability: boolean;
  size: string;
  materials?: string[];
  created_at: string;
  [key: string]: any; // For other properties
}

/**
 * Helper function to safely map subfamily to item type
 */
const mapSubfamilyToType = (subfamily: string | null | undefined): DashboardItem['type'] => {
  if (!subfamily) return 'top';
  
  const lowerSubfamily = subfamily.toLowerCase();
  
  if (['shirt', 'blouse', 't-shirt', 'top', 'sweater', 'cardigan', 'jacket'].some(type => 
    lowerSubfamily.includes(type)
  )) {
    return 'top';
  }
  
  if (['pants', 'skirt', 'shorts', 'jeans', 'trousers', 'leggings'].some(type => 
    lowerSubfamily.includes(type)
  )) {
    return 'bottom';
  }
  
  if (['shoes', 'heel', 'sneakers', 'boots', 'sandals', 'flats'].some(type => 
    lowerSubfamily.includes(type)
  )) {
    return 'shoes';
  }
  
  if (['dress', 'gown', 'jumpsuit'].some(type => 
    lowerSubfamily.includes(type)
  )) {
    return 'dress';
  }
  
  // Default to top if we can't determine
  return 'top';
};

/**
 * Enhanced function to get the best image for an item using AI analysis
 */
const getAISelectedImage = async (item: ZaraItem): Promise<string> => {
  try {
    // Try AI analysis first
    const aiResult = await analyzeImagesWithAI(item.id, 1);
    if (aiResult.success && aiResult.results && aiResult.results.length > 0) {
      const selectedImage = aiResult.results[0].selectedImage;
      if (selectedImage && selectedImage !== '/placeholder.svg') {
        console.log(`🤖 Using AI-selected image for item ${item.id}: ${selectedImage}`);
        return selectedImage;
      }
    }
  } catch (error) {
    console.warn(`⚠️ AI analysis failed for item ${item.id}, using fallback:`, error);
  }
  
  // Fallback to existing image extraction
  return extractZaraImageUrl(item.image);
};

/**
 * Enhanced mapZaraItemToDashboardItem with AI image selection
 */
const mapZaraItemToDashboardItem = async (item: ZaraItem, targetType?: string): Promise<DashboardItem> => {
  const type = targetType || mapSubfamilyToType(item.product_subfamily);
  
  // Use AI-selected image
  const aiSelectedImage = await getAISelectedImage(item);
  
  return {
    id: item.id,
    name: item.product_name || 'Unknown Item',
    image: aiSelectedImage,
    type: type as DashboardItem['type'],
    price: typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : '$0.00',
    description: item.description || `${item.colour} ${item.product_name}`
  };
};

export const clearOutfitCache = (bodyShape?: string, style?: string, mood?: string) => {
  if (bodyShape && style && mood) {
    const cacheKey = `${bodyShape}-${style}-${mood}`;
    outfitCache.delete(cacheKey);
  } else {
    outfitCache.clear();
  }
};

export const clearGlobalItemTrackers = () => {
  globalItemTracker.shownItems.clear();
  globalItemTracker.shownTops.clear();
  globalItemTracker.shownBottoms.clear();
  globalItemTracker.shownShoes.clear();
};

export const matchOutfitToColors = async () => {
  try {
    console.log("🔍 [DEBUG] matchOutfitToColors: Fetching items for color matching");
    
    // Fetch items from zara_cloth table
    const { data: allItems, error } = await supabase
      .from('zara_cloth')
      .select('*')
      .limit(100);

    if (error) {
      console.error('❌ [DEBUG] Error fetching from zara_cloth:', error);
      return { top: [], bottom: [], shoes: [] };
    }

    if (!allItems || allItems.length === 0) {
      console.log('❌ [DEBUG] No items found in zara_cloth table');
      return { top: [], bottom: [], shoes: [] };
    }

    // Type assertion for the items array
    const typedItems = allItems as ZaraItem[];

    // Filter items with valid image patterns (6th+ images without models)
    const validItems = typedItems.filter(item => isValidImagePattern(item.image));
    
    console.log(`✅ [DEBUG] Valid items with no-model patterns: ${validItems.length} out of ${allItems.length}`);
    
    // Group items by type using safe property access
    const result = {
      top: validItems.filter(item => {
        const subfamily = item.product_subfamily;
        return mapSubfamilyToType(subfamily) === 'top';
      }).map(item => ({
        id: item.id,
        name: item.product_name || 'Fashion Item',
        image: item.image,
        type: 'top' as const,
        price: item.price ? `$${item.price}` : '$49.99'
      })),
      bottom: validItems.filter(item => {
        const subfamily = item.product_subfamily;
        return mapSubfamilyToType(subfamily) === 'bottom';
      }).map(item => ({
        id: item.id,
        name: item.product_name || 'Fashion Item',
        image: item.image,
        type: 'bottom' as const,
        price: item.price ? `$${item.price}` : '$49.99'
      })),
      shoes: validItems.filter(item => {
        const subfamily = item.product_subfamily;
        return mapSubfamilyToType(subfamily) === 'shoes';
      }).map(item => ({
        id: item.id,
        name: item.product_name || 'Fashion Item',
        image: item.image,
        type: 'shoes' as const,
        price: item.price ? `$${item.price}` : '$49.99'
      }))
    };

    console.log("✅ [DEBUG] Color matching result:", Object.keys(result).map(k => `${k}: ${result[k].length}`));
    return result;

  } catch (error) {
    console.error('❌ [DEBUG] Error in matchOutfitToColors:', error);
    return { top: [], bottom: [], shoes: [] };
  }
};

export const fetchDashboardItems = async (): Promise<{ [key: string]: DashboardItem[] }> => {
  try {
    console.log("🔍 [DEBUG] fetchDashboardItems: Starting to fetch items from zara_cloth table");
    
    // Fetch items from zara_cloth table only
    const { data: allItems, error } = await supabase
      .from('zara_cloth')
      .select('*')
      .limit(200);

    if (error) {
      console.error('❌ [DEBUG] Error fetching from zara_cloth:', error);
      throw error;
    }

    if (!allItems || allItems.length === 0) {
      console.log('❌ [DEBUG] No items found in zara_cloth table');
      return { Work: [], Casual: [], Evening: [], Weekend: [] };
    }

    console.log(`✅ [DEBUG] Fetched ${allItems.length} items from zara_cloth`);

    // Type assertion for the items array
    const typedItems = allItems as ZaraItem[];

    // Filter items to only include those with valid image patterns (6th+ images without models)
    const validItems = typedItems.filter(item => {
      const isValid = isValidImagePattern(item.image);
      if (!isValid) {
        console.log(`❌ [DEBUG] FILTERED OUT item ${item.id} - no suitable no-model image pattern`);
      }
      return isValid;
    });

    console.log(`✅ [DEBUG] Valid items with no-model patterns: ${validItems.length}`);

    if (validItems.length === 0) {
      console.log('❌ [DEBUG] No items with suitable no-model patterns found');
      return { Work: [], Casual: [], Evening: [], Weekend: [] };
    }

    // Convert to DashboardItem format and distribute across occasions
    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    const result: { [key: string]: DashboardItem[] } = {};

    occasions.forEach(occasion => {
      // Shuffle and take different items for each occasion
      const shuffled = [...validItems].sort(() => Math.random() - 0.5);
      const selectedItems = shuffled.slice(0, Math.min(12, shuffled.length));
      
      result[occasion] = selectedItems.map(item => ({
        id: item.id,
        name: item.product_name || 'Fashion Item',
        image: item.image,
        type: mapSubfamilyToType(item.product_subfamily),
        price: item.price ? `$${item.price}` : '$49.99'
      }));
    });

    console.log(`✅ [DEBUG] Distributed items across occasions:`, Object.keys(result).map(k => `${k}: ${result[k].length}`));
    return result;

  } catch (error) {
    console.error('❌ [DEBUG] Error in fetchDashboardItems:', error);
    // Return empty data instead of fallbacks
    return { Work: [], Casual: [], Evening: [], Weekend: [] };
  }
};

/**
 * Enhanced fetchFirstOutfitSuggestion with AI image integration
 */
export const fetchFirstOutfitSuggestion = async (forceRefresh: boolean = false): Promise<DashboardItem[]> => {
  try {
    console.log('🎯 fetchFirstOutfitSuggestion called with forceRefresh:', forceRefresh);
    
    const styleData = localStorage.getItem('styleAnalysis');
    if (!styleData) {
      throw new Error('Style analysis not found');
    }

    const parsedData = JSON.parse(styleData);
    const bodyShape = parsedData?.analysis?.bodyShape || 'H';
    const style = parsedData?.analysis?.styleProfile || 'classic';
    const mood = localStorage.getItem('current-mood') || 'energized';

    const cacheKey = `${bodyShape}-${style}-${mood}`;
    
    // Check cache first
    if (!forceRefresh && outfitCache[cacheKey]) {
      console.log('📦 Returning cached outfit for:', cacheKey);
      return outfitCache[cacheKey];
    }

    // Clear cache if forcing refresh
    if (forceRefresh) {
      clearOutfitCache(bodyShape, style, mood);
      clearGlobalItemTrackers();
    }

    console.log('🔍 Generating new outfit combination with AI-selected images (no models)...');

    // Fetch items from zara_cloth table with valid image patterns
    const { data: allItems, error } = await supabase
      .from('zara_cloth')
      .select('*')
      .limit(500);

    if (error || !allItems?.length) {
      throw new Error('Failed to fetch items from database');
    }

    console.log(`📊 Fetched ${allItems.length} total items from database`);

    // Type assertion for the items array
    const typedItems = allItems as ZaraItem[];

    // Enhanced filtering with AI-compatible items (items that have 6th+ image patterns)
    const validItems = typedItems.filter(item => {
      // Check if item has valid image data
      if (!item.image) return false;
      
      // Check for valid image pattern (6th+ images without models)
      let imageUrls: string[] = [];
      
      if (typeof item.image === 'string') {
        try {
          const parsed = JSON.parse(item.image);
          if (Array.isArray(parsed)) {
            imageUrls = parsed.filter(url => typeof url === 'string');
          } else {
            imageUrls = [item.image];
          }
        } catch {
          imageUrls = [item.image];
        }
      } else if (Array.isArray(item.image)) {
        imageUrls = item.image.filter(url => typeof url === 'string');
      }
      
      // Look for 6th+ image pattern (without models)
      const hasNoModelImage = imageUrls.some(url => /_[6-9]_\d+_1\.jpg/.test(url));
      
      if (!hasNoModelImage) {
        console.log(`❌ FILTERED OUT item ${item.id} - no suitable no-model image pattern`);
        return false;
      }
      
      const hasValidData = item.product_name && item.price;
      console.log(`✅ KEEPING item ${item.id} - has no-model image pattern and valid data`);
      return hasValidData;
    });

    console.log(`✅ ${validItems.length} items passed AI-compatible validation`);

    if (validItems.length < 3) {
      throw new Error('Not enough valid items with no-model images available');
    }

    // Group items by type for proper outfit composition
    const topItems = validItems.filter(item => {
      const type = mapSubfamilyToType(item.product_subfamily);
      return type === 'top';
    });
    
    const bottomItems = validItems.filter(item => {
      const type = mapSubfamilyToType(item.product_subfamily);
      return type === 'bottom';
    });
    
    const shoesItems = validItems.filter(item => {
      const type = mapSubfamilyToType(item.product_subfamily);
      return type === 'shoes';
    });

    console.log(`📊 Item distribution: tops=${topItems.length}, bottoms=${bottomItems.length}, shoes=${shoesItems.length}`);

    // Select random items from each category or fallback to any valid items
    const getRandomItem = (items: ZaraItem[], fallbackItems: ZaraItem[]) => {
      const sourceItems = items.length > 0 ? items : fallbackItems;
      return sourceItems[Math.floor(Math.random() * sourceItems.length)];
    };

    const selectedTop = getRandomItem(topItems, validItems);
    const selectedBottom = getRandomItem(bottomItems, validItems);
    const selectedShoes = getRandomItem(shoesItems, validItems);

    // Map items with AI-selected images (the Canvas will handle AI image selection)
    const outfitItems: DashboardItem[] = [
      await mapZaraItemToDashboardItem(selectedTop, 'top'),
      await mapZaraItemToDashboardItem(selectedBottom, 'bottom'),
      await mapZaraItemToDashboardItem(selectedShoes, 'shoes')
    ];

    // Cache the result
    outfitCache[cacheKey] = outfitItems;
    
    console.log('✅ Generated new outfit with AI-compatible items:', outfitItems.map(item => ({
      id: item.id,
      type: item.type,
      name: item.name
    })));

    return outfitItems;

  } catch (error) {
    console.error('❌ Error in fetchFirstOutfitSuggestion:', error);
    throw error;
  }
};
