import { supabase } from "@/lib/supabaseClient";
import { DashboardItem } from "@/types/lookTypes";
import { isValidImagePattern } from "../../supabase/functions/trainer-agent/imageValidator";
import { extractZaraImageUrl, extractShoesImageUrl } from "@/utils/imageUtils";
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

// Type for Zara database items - Updated to match actual database schema
interface ZaraItem {
  id: string;
  product_name: string;
  product_subfamily?: string;
  price: number;
  colour: string;
  description: string;
  image: any;
  availability: boolean;
  size: string; // Changed from string[] to string to match database
  materials?: string[]; // Keep as array since that's what database returns
  created_at: string;
  [key: string]: any; // For other properties
}

// Function to check if an item is underwear/intimate apparel
const isUnderwearItem = (item: ZaraItem): boolean => {
  const subfamily = item.product_subfamily?.toLowerCase() || '';
  const name = item.product_name?.toLowerCase() || '';
  const family = item.product_family?.toLowerCase() || '';
  
  // List of underwear/intimate keywords to filter out
  const underwearKeywords = [
    'underwear', 'bra', 'panties', 'lingerie', 'brief', 'boxer',
    'intimate', 'undershirt', 'camisole', 'slip', 'thong',
    'bikini', 'swimsuit', 'swimwear', 'bathing suit',
    'תחתונים', 'חזייה', 'תחתון', 'לבוש תחתון'
  ];
  
  return underwearKeywords.some(keyword => 
    subfamily.includes(keyword) || 
    name.includes(keyword) || 
    family.includes(keyword)
  );
};

/**
 * Enhanced function to detect shoes with multiple criteria
 */
const isShoeItem = (item: ZaraItem): boolean => {
  const subfamily = item.product_subfamily?.toLowerCase() || '';
  const name = item.product_name?.toLowerCase() || '';
  const family = item.product_family?.toLowerCase() || '';
  const section = item.section?.toLowerCase() || '';
  
  // Comprehensive list of shoe-related keywords in multiple languages
  const shoeKeywords = [
    // English
    'shoes', 'shoe', 'sneakers', 'sneaker', 'boots', 'boot',
    'sandals', 'sandal', 'heels', 'heel', 'flats', 'flat',
    'trainers', 'trainer', 'loafers', 'loafer', 'pumps', 'pump',
    'slip-on', 'oxford', 'derby', 'ankle boots', 'knee boots',
    'running shoes', 'walking shoes', 'basketball shoes', 'tennis shoes',
    'footwear', 'calzado',
    // Hebrew
    'נעליים', 'נעל', 'סניקרס', 'מגפיים', 'מגף',
    'סנדלים', 'סנדל', 'עקבים', 'עקב', 'שטוחות',
    'נעלי ספורט', 'מוקסינים',
    // Spanish (for Zara items)
    'zapatos', 'zapatillas', 'botas', 'sandalias'
  ];
  
  const isShoe = shoeKeywords.some(keyword => 
    subfamily.includes(keyword) || 
    name.includes(keyword) || 
    family.includes(keyword) ||
    section.includes(keyword)
  );
  
  if (isShoe) {
    console.log(`👟 [LookService] DETECTED SHOE: ${item.id} - "${name}" (subfamily: "${subfamily}", family: "${family}")`);
  }
  
  return isShoe;
};

/**
 * Helper function to safely map subfamily to item type with enhanced shoe detection
 */
const mapSubfamilyToType = (item: ZaraItem): DashboardItem['type'] => {
  // First check if it's shoes using our enhanced detection
  if (isShoeItem(item)) {
    return 'shoes';
  }
  
  const subfamily = item.product_subfamily?.toLowerCase() || '';
  const name = item.product_name?.toLowerCase() || '';
  const family = item.product_family?.toLowerCase() || '';
  
  // Check for dress
  if (['dress', 'gown', 'jumpsuit', 'שמלה'].some(type => 
    subfamily.includes(type) || name.includes(type) || family.includes(type)
  )) {
    return 'dress';
  }
  
  // Check for bottom (excluding dresses)
  if (['pants', 'skirt', 'shorts', 'jeans', 'trousers', 'leggings', 'מכנס', 'חצאית', 'ג\'ינס', 'שורט'].some(type => 
    subfamily.includes(type) || name.includes(type) || family.includes(type)
  )) {
    return 'bottom';
  }
  
  // Check for outerwear
  if (['coat', 'jacket', 'blazer', 'cardigan', 'מעיל', 'ג\'קט', 'בלייזר'].some(type => 
    subfamily.includes(type) || name.includes(type) || family.includes(type)
  )) {
    return 'outerwear';
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
  
  // Fallback to our enhanced image extraction
  const type = mapSubfamilyToType(item);
  return type === 'shoes' ? extractShoesImageUrl(item.image) : extractZaraImageUrl(item.image);
};

/**
 * Enhanced mapZaraItemToDashboardItem with AI image selection and proper type detection
 */
const mapZaraItemToDashboardItem = async (item: ZaraItem, targetType?: string): Promise<DashboardItem> => {
  const type = targetType || mapSubfamilyToType(item);
  
  // Use AI-selected image or enhanced extraction
  const selectedImage = await getAISelectedImage(item);
  
  console.log(`🔍 [LookService] Mapped item ${item.id} as ${type}: "${item.product_name}" with image: ${selectedImage.substring(0, 50)}...`);
  
  return {
    id: item.id,
    name: item.product_name || 'Unknown Item',
    image: selectedImage,
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

    // Use 'as any[]' to avoid type conversion issues and handle each item individually
    const typedItems = allItems as any[];

    // Filter items with valid image patterns (6th+ images without models) AND exclude underwear
    const validItems = typedItems.filter(item => {
      // First check if it's underwear
      if (isUnderwearItem(item)) {
        console.log(`❌ [DEBUG] FILTERED OUT underwear item: ${item.id} - ${item.product_name}`);
        return false;
      }
      
      // Then check for valid image patterns
      return isValidImagePattern(item.image);
    });
    
    console.log(`✅ [DEBUG] Valid non-underwear items with no-model patterns: ${validItems.length} out of ${allItems.length}`);
    
    // Group items by type using enhanced detection
    const result = {
      top: validItems.filter(item => mapSubfamilyToType(item) === 'top').map(item => ({
        id: item.id,
        name: item.product_name || 'Fashion Item',
        image: item.image,
        type: 'top' as const,
        price: item.price ? `$${item.price}` : '$49.99'
      })),
      bottom: validItems.filter(item => mapSubfamilyToType(item) === 'bottom').map(item => ({
        id: item.id,
        name: item.product_name || 'Fashion Item',
        image: item.image,
        type: 'bottom' as const,
        price: item.price ? `$${item.price}` : '$49.99'
      })),
      shoes: validItems.filter(item => mapSubfamilyToType(item) === 'shoes').map(item => ({
        id: item.id,
        name: item.product_name || 'Fashion Item',
        image: item.image,
        type: 'shoes' as const,
        price: item.price ? `$${item.price}` : '$49.99'
      }))
    };

    console.log("✅ [DEBUG] Color matching result with enhanced detection:", Object.keys(result).map(k => `${k}: ${result[k].length}`));
    
    // Special debug for shoes
    if (result.shoes.length > 0) {
      console.log("👟 [DEBUG] Found shoes:", result.shoes.slice(0, 3).map(s => ({
        id: s.id,
        name: s.name
      })));
    } else {
      console.log("❌ [DEBUG] NO SHOES FOUND in color matching!");
    }
    
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

    // Use 'as any[]' to avoid type conversion issues
    const typedItems = allItems as any[];

    // Filter items to only include those with valid image patterns (6th+ images without models) AND exclude underwear
    const validItems = typedItems.filter(item => {
      // First check if it's underwear
      if (isUnderwearItem(item)) {
        console.log(`❌ [DEBUG] FILTERED OUT underwear item: ${item.id} - ${item.product_name}`);
        return false;
      }
      
      const isValid = isValidImagePattern(item.image);
      if (!isValid) {
        console.log(`❌ [DEBUG] FILTERED OUT item ${item.id} - no suitable no-model image pattern`);
      }
      return isValid;
    });

    console.log(`✅ [DEBUG] Valid non-underwear items with no-model patterns: ${validItems.length}`);
    
    // Debug: Count shoes specifically
    const shoeItems = validItems.filter(item => isShoeItem(item));
    console.log(`👟 [DEBUG] Found ${shoeItems.length} shoe items in fetchDashboardItems`);
    if (shoeItems.length > 0) {
      console.log("👟 [DEBUG] Shoe examples:", shoeItems.slice(0, 3).map(s => ({
        id: s.id,
        name: s.product_name,
        subfamily: s.product_subfamily
      })));
    }

    if (validItems.length === 0) {
      console.log('❌ [DEBUG] No valid non-underwear items with suitable no-model patterns found');
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
        type: mapSubfamilyToType(item),
        price: item.price ? `$${item.price}` : '$49.99'
      }));
    });

    console.log(`✅ [DEBUG] Distributed non-underwear items across occasions:`, Object.keys(result).map(k => `${k}: ${result[k].length}`));
    
    // Debug: Check shoes distribution
    occasions.forEach(occasion => {
      const shoesInOccasion = result[occasion].filter(item => item.type === 'shoes');
      console.log(`👟 [DEBUG] ${occasion} has ${shoesInOccasion.length} shoes`);
    });
    
    return result;

  } catch (error) {
    console.error('❌ [DEBUG] Error in fetchDashboardItems:', error);
    // Return empty data instead of fallbacks
    return { Work: [], Casual: [], Evening: [], Weekend: [] };
  }
};

/**
 * Enhanced fetchFirstOutfitSuggestion with improved shoe detection and AI image integration
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

    console.log('🔍 Generating new outfit combination with enhanced shoe detection...');

    // Fetch items from zara_cloth table with valid image patterns
    const { data: allItems, error } = await supabase
      .from('zara_cloth')
      .select('*')
      .limit(500);

    if (error || !allItems?.length) {
      throw new Error('Failed to fetch items from database');
    }

    console.log(`📊 Fetched ${allItems.length} total items from database`);

    // Use 'as any[]' to avoid type conversion issues
    const typedItems = allItems as any[];

    // Enhanced filtering with better shoe detection AND exclude underwear
    const validItems = typedItems.filter(item => {
      // Check if item has valid image data
      if (!item.image) return false;
      
      // First check if it's underwear
      if (isUnderwearItem(item)) {
        console.log(`❌ FILTERED OUT underwear item: ${item.id} - ${item.product_name}`);
        return false;
      }
      
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
      if (hasValidData) {
        console.log(`✅ KEEPING item ${item.id} - has no-model image pattern and valid data`);
      }
      return hasValidData;
    });

    console.log(`✅ ${validItems.length} non-underwear items passed validation`);

    if (validItems.length < 3) {
      throw new Error('Not enough valid non-underwear items with no-model images available');
    }

    // Group items by type using enhanced detection
    const topItems = validItems.filter(item => mapSubfamilyToType(item) === 'top');
    const bottomItems = validItems.filter(item => mapSubfamilyToType(item) === 'bottom');
    const shoesItems = validItems.filter(item => mapSubfamilyToType(item) === 'shoes');

    console.log(`📊 Enhanced item distribution: tops=${topItems.length}, bottoms=${bottomItems.length}, shoes=${shoesItems.length}`);

    // Special logging for shoes
    if (shoesItems.length > 0) {
      console.log("👟 Found shoes:", shoesItems.slice(0, 3).map(s => ({
        id: s.id,
        name: s.product_name,
        subfamily: s.product_subfamily
      })));
    } else {
      console.log("❌ NO SHOES FOUND! This will cause outfit creation to fail.");
    }

    // Select random items from each category or fallback to any valid items
    const getRandomItem = (items: any[], fallbackItems: any[]) => {
      const sourceItems = items.length > 0 ? items : fallbackItems;
      return sourceItems[Math.floor(Math.random() * sourceItems.length)];
    };

    const selectedTop = getRandomItem(topItems, validItems);
    const selectedBottom = getRandomItem(bottomItems, validItems);
    const selectedShoes = getRandomItem(shoesItems, validItems);

    // Map items with enhanced image selection
    const outfitItems: DashboardItem[] = [
      await mapZaraItemToDashboardItem(selectedTop, 'top'),
      await mapZaraItemToDashboardItem(selectedBottom, 'bottom'),
      await mapZaraItemToDashboardItem(selectedShoes, 'shoes')
    ];

    // Cache the result
    outfitCache[cacheKey] = outfitItems;
    
    console.log('✅ Generated new outfit with enhanced shoe detection:', outfitItems.map(item => ({
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
