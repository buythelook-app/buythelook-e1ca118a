import { DashboardItem, OutfitItem } from "@/types/lookTypes";
import { EventType, EVENT_TO_STYLES } from "@/components/filters/eventTypes";
import { supabase } from "@/lib/supabaseClient";

const API_URL = 'https://mwsblnposuyhrgzrtoyo.supabase.co/functions/v1/generate-outfit';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13c2JsbnBvc3V5aHJnenJ0b3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4OTUyOTYsImV4cCI6MjA1MzQ3MTI5Nn0.gyU3tLyZ_1yY82BKkii8EyeaGzFn9muZR6G6ELJocQk';

// Global tracking of used items to prevent repetition across multiple requests
const globalUsedItemIds = new Set<string>();
const globalUsedTopIds = new Set<string>();
const globalUsedBottomIds = new Set<string>();
const globalUsedShoeIds = new Set<string>();
const MAX_TRACKED_ITEMS = 100;

// Define allowed item types for type safety
const ALLOWED_TYPES = ['top', 'bottom', 'dress', 'shoes', 'accessory', 'sunglasses', 'outerwear', 'cart'] as const;
type AllowedType = typeof ALLOWED_TYPES[number];

// Helper function to check if a type is valid
const isValidItemType = (type: string): type is AllowedType => {
  return ALLOWED_TYPES.includes(type as AllowedType);
};

// Helper function to map product family or category to allowed types
const mapProductTypeToAllowedType = (productType: string | null): AllowedType => {
  if (!productType) return 'top'; // Default fallback
  
  const typeMap: Record<string, AllowedType> = {
    'tops': 'top',
    'shirts': 'top',
    'blouses': 'top',
    't-shirts': 'top',
    'tshirts': 'top',
    'sweaters': 'top',
    'hoodies': 'top',
    'jackets': 'outerwear',
    'coats': 'outerwear',
    'blazers': 'outerwear',
    'bottoms': 'bottom',
    'pants': 'bottom',
    'trousers': 'bottom',
    'jeans': 'bottom',
    'shorts': 'bottom',
    'skirts': 'bottom',
    'dresses': 'dress',
    'footwear': 'shoes',
    'shoes': 'shoes',
    'sneakers': 'shoes',
    'boots': 'shoes',
    'heels': 'shoes',
    'sandals': 'shoes',
    'accessories': 'accessory',
    'jewelry': 'accessory',
    'bags': 'accessory',
    'hats': 'accessory',
    'glasses': 'sunglasses',
    'sunglasses': 'sunglasses',
    'eyewear': 'sunglasses',
    'outerwear': 'outerwear',
  };
  
  const lowerCaseType = productType.toLowerCase();
  for (const [key, value] of Object.entries(typeMap)) {
    if (lowerCaseType.includes(key)) {
      return value;
    }
  }
  
  // If no match is found, make a best guess based on keywords
  if (lowerCaseType.includes('top') || lowerCaseType.includes('shirt') || lowerCaseType.includes('blouse')) {
    return 'top';
  } else if (lowerCaseType.includes('pant') || lowerCaseType.includes('jean') || lowerCaseType.includes('skirt')) {
    return 'bottom';
  } else if (lowerCaseType.includes('shoe') || lowerCaseType.includes('boot') || lowerCaseType.includes('sneaker')) {
    return 'shoes';
  } else if (lowerCaseType.includes('dress')) {
    return 'dress';
  } else if (lowerCaseType.includes('jacket') || lowerCaseType.includes('coat')) {
    return 'outerwear';
  } else if (lowerCaseType.includes('sunglass') || lowerCaseType.includes('eyewear')) {
    return 'sunglasses';
  } else if (lowerCaseType.includes('accessory')) {
    return 'accessory';
  }
  
  // Default to top if no mapping is found
  return 'top';
};

// Helper function to map body shapes to API expected format
const mapBodyShape = (shape: string): "X" | "V" | "H" | "O" | "A" => {
  const shapeMap: { [key: string]: "X" | "V" | "H" | "O" | "A" } = {
    hourglass: "X",
    athletic: "H",
    pear: "A",
    apple: "O",
    rectangle: "H",
    inverted_triangle: "V"
  };
  return shapeMap[shape.toLowerCase()] || "H";
};

// Helper function to map style preferences to API expected format
const mapStyle = (style: string): "classic" | "romantic" | "minimalist" | "casual" | "boohoo" | "sporty" => {
  const styleMap: { [key: string]: "classic" | "romantic" | "minimalist" | "casual" | "boohoo" | "sporty" } = {
    elegant: "classic",
    romantic: "romantic",
    minimal: "minimalist",
    minimalist: "minimalist",
    Minimalist: "minimalist",
    casual: "casual",
    bohemian: "boohoo",
    boohoo: "boohoo",
    athletic: "sporty",
    sportive: "sporty",
    Classy: "classic",
    Classic: "classic",
    Modern: "minimalist",
    "Boo Hoo": "boohoo",
    Nordic: "minimalist",
    Sporty: "sporty",
    Casual: "casual"
  };
  
  console.log("Mapping style:", style, "to:", styleMap[style] || "casual");
  return styleMap[style] || "casual";
};

// Get styles based on event type
const getEventStyles = (): string => {
  const selectedEvent = localStorage.getItem('selected-event') as EventType | null;
  
  if (selectedEvent && selectedEvent in EVENT_TO_STYLES) {
    const eventStyles = EVENT_TO_STYLES[selectedEvent as Exclude<EventType, null>];
    console.log("Using event styles:", eventStyles);
    return eventStyles[0] || "classic";
  }
  
  console.log("No event selected or invalid event, using default style");
  return "classic";
};

// Helper function to validate mood
const validateMood = (mood: string | null): string => {
  const validMoods = [
    "mystery", "quiet", "elegant", "energized", 
    "flowing", "optimist", "calm", "romantic", 
    "unique", "sweet", "childish", "passionate", 
    "powerful", "casual", "relaxed", "mysterious"
  ];
  
  if (!mood || !validMoods.includes(mood.toLowerCase())) {
    return "energized";
  }
  return mood.toLowerCase();
};

// Add a helper function to clear the outfit cache for a specific key
export const clearOutfitCache = (bodyStructure: string, style: string, mood: string) => {
  const cacheKey = `${bodyStructure}:${style}:${mood}`;
  if (requestCache.has(cacheKey)) {
    requestCache.delete(cacheKey);
    console.log('Cleared cache for:', cacheKey);
    return true;
  }
  return false;
};

// Clear global item trackers to allow for completely fresh outfits
export const clearGlobalItemTrackers = () => {
  globalUsedItemIds.clear();
  globalUsedTopIds.clear();
  globalUsedBottomIds.clear();
  globalUsedShoeIds.clear();
  console.log('Cleared global item trackers for fresh outfit generation');
  return true;
};

// Implement request caching for API calls
const requestCache = new Map();

const generateOutfit = async (bodyStructure: string, style: string, mood: string) => {
  try {
    const cacheKey = `${bodyStructure}:${style}:${mood}`;
    
    if (requestCache.has(cacheKey)) {
      console.log('Using cached outfit data for:', cacheKey);
      return requestCache.get(cacheKey);
    }
    
    const requestBody = {
      bodyStructure,
      style,
      mood: validateMood(mood)
    };
    
    console.log('Generating outfit with params:', requestBody);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API response:', data);
      
      requestCache.set(cacheKey, data);
      
      if (requestCache.size > 20) {
        const oldestKey = requestCache.keys().next().value;
        requestCache.delete(oldestKey);
      }
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.log('Request aborted due to timeout');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in generateOutfit:', error);
    throw error;
  }
};

// Helper function to check if an item is underwear
const isUnderwear = (item: any): boolean => {
  if (!item) return false;
  
  const underwearTerms = ['underwear', 'lingerie', 'bra', 'panties', 'briefs', 'boxer', 'thong', 'g-string'];
  
  const itemName = (item.product_name || '').toLowerCase();
  const itemDesc = (item.description || '').toLowerCase();
  const itemType = (item.type || '').toLowerCase();
  
  return underwearTerms.some(term => 
    itemName.includes(term) || 
    itemDesc.includes(term) || 
    itemType.includes(term)
  );
};

// Enhanced check for natural colors in item descriptions
const hasNaturalColor = (item: any): boolean => {
  if (!item) return false;
  
  const naturalColors = [
    'beige', 'cream', 'ivory', 'off-white', 'white', 'ecru', 'oatmeal', 
    'tan', 'khaki', 'sand', 'stone', 'taupe', 'camel', 'nude', 
    'gray', 'grey', 'light grey', 'dark grey', 'charcoal',
    'black', 'navy', 'brown', 'olive', 'sage'
  ];
  
  const itemName = (item.product_name || '').toLowerCase();
  const itemDesc = (item.description || '').toLowerCase();
  
  return naturalColors.some(color => 
    itemName.includes(color) || 
    itemDesc.includes(color)
  );
}

// Helper function to check if an item matches minimalist style
const isMinimalistStyleItem = (item: any): boolean => {
  if (!item) return false;
  
  const itemName = (item.product_name || '').toLowerCase();
  const itemDesc = (item.description || '').toLowerCase();
  
  const hasNatural = hasNaturalColor(item);
  
  const nonMinimalistPatterns = ['floral', 'stripe', 'print', 'pattern', 'graphic', 'logo', 'sequin', 'embellish', 'embroidery'];
  const hasNonMinimalistPattern = nonMinimalistPatterns.some(pattern => 
    itemName.includes(pattern) || 
    itemDesc.includes(pattern)
  );
  
  const minimalistTerms = ['simple', 'clean', 'minimal', 'basic', 'timeless', 'essential', 'classic', 'sleek', 'streamlined'];
  const hasMinimalistTerm = minimalistTerms.some(term => 
    itemName.includes(term) || 
    itemDesc.includes(term)
  );
  
  return (hasNatural || hasMinimalistTerm) && !hasNonMinimalistPattern;
};

// Helper function to check if an item matches casual style
const isCasualStyleItem = (item: any): boolean => {
  if (!item) return false;
  
  const itemName = (item.product_name || '').toLowerCase();
  const itemDesc = (item.description || '').toLowerCase();
  const itemType = (item.type || '').toLowerCase();
  
  const casualTerms = ['casual', 'comfortable', 'relaxed', 'everyday', 'leisure', 
                      'weekend', 'jeans', 'denim', 't-shirt', 'tee', 'hoodie', 
                      'sneaker', 'cotton', 'sweatshirt', 'lounge', 'sweater'];
  
  return casualTerms.some(term => 
    itemName.includes(term) || 
    itemDesc.includes(term) || 
    itemType.includes(term)
  );
};

// Generate a reliable unique ID for items when product_id isn't available
const generateItemId = (item: any): string => {
  if (item?.id) return String(item.id);
  if (item?.product_id) return String(item.product_id);
  
  if (item?.image && typeof item.image === 'string') {
    return `img-${item.image.split('/').pop()?.substring(0, 16) || Math.random().toString(36).substring(2, 10)}`;
  }
  
  if (item?.product_name) {
    return `name-${item.product_name.substring(0, 10).replace(/\s/g, '')}-${Math.random().toString(36).substring(2, 6)}`;
  }
  
  return `item-${Math.random().toString(36).substring(2, 15)}`;
};

// Helper function to convert database item to DashboardItem
const convertToDashboardItem = (item: any, typeHint: string, userStyle: string = ''): DashboardItem | null => {
  if (!item) return null;
  
  if (isUnderwear(item)) {
    console.log('Filtering out underwear item:', item.product_name);
    return null;
  }
  
  // Generate item ID
  const itemId = generateItemId(item);
  
  // Determine item type - first try to use the type from the item itself if it's valid
  let itemType: AllowedType;
  
  // Try to determine the type from the item's product_family or category_id
  const productFamily = item.product_family || item.category_id || '';
  
  if (item.type && isValidItemType(item.type.toLowerCase())) {
    // If the item already has a valid type, use it
    itemType = item.type.toLowerCase() as AllowedType;
  } else {
    // Otherwise use the mapping function with the type hint as a fallback
    itemType = mapProductTypeToAllowedType(productFamily || typeHint);
  }
  
  // Check for repetition by type
  if (itemType === 'top' && globalUsedTopIds.has(itemId)) {
    console.log('Item already used as top, filtering:', item.product_name);
    return null;
  }
  if (itemType === 'bottom' && globalUsedBottomIds.has(itemId)) {
    console.log('Item already used as bottom, filtering:', item.product_name);
    return null;
  }
  if (itemType === 'shoes' && globalUsedShoeIds.has(itemId)) {
    console.log('Item already used as shoes, filtering:', item.product_name);
    return null;
  }
  
  // Style-specific filtering
  if (userStyle === 'Minimalist') {
    if (itemType === 'top' && !hasNaturalColor(item)) {
      console.log('Item does not have natural colors for minimalist style:', item.product_name);
      if (Math.random() > 0.7) {
        return null;
      }
    }
    
    if (!isMinimalistStyleItem(item)) {
      console.log('Item does not match minimalist style criteria:', item.product_name);
      if (Math.random() > 0.6) {
        return null;
      }
    }
  }
  
  // For Casual style, prioritize casual items but be more lenient
  if (userStyle === 'Casual') {
    if (!isCasualStyleItem(item)) {
      console.log('Item does not match casual style criteria:', item.product_name);
      if (Math.random() > 0.7) {
        return null;
      }
    }
  }
  
  // Track this item globally to prevent repetition across requests
  globalUsedItemIds.add(itemId);
  if (itemType === 'top') globalUsedTopIds.add(itemId);
  if (itemType === 'bottom') globalUsedBottomIds.add(itemId);
  if (itemType === 'shoes') globalUsedShoeIds.add(itemId);
  
  // Clean up trackers if they get too big
  if (globalUsedItemIds.size > MAX_TRACKED_ITEMS) {
    const itemsArray = Array.from(globalUsedItemIds);
    for (let i = 0; i < 20; i++) {
      if (i < itemsArray.length) {
        globalUsedItemIds.delete(itemsArray[i]);
      }
    }
  }

  // Get image URL
  const imageUrl = item.image || '';
  
  // Format price
  let priceStr = '$49.99'; // Default price
  if (item.price) {
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price.toString().replace(/[^0-9.]/g, '') || '0');
    priceStr = `$${price.toFixed(2)}`;
  }

  return {
    id: itemId,
    name: item.product_name || `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Item`,
    description: item.description || '',
    image: imageUrl,
    price: priceStr,
    type: itemType
  };
};

// Fetch items from Supabase based on item type
const fetchItemsByType = async (itemType: string, preferredStyle: string): Promise<any[]> => {
  try {
    console.log(`Fetching ${itemType} items from Supabase`);
    
    // Map the requested type to possible product family values
    const possibleTypes: string[] = [];
    
    switch (itemType.toLowerCase()) {
      case 'top':
        possibleTypes.push('tops', 'shirts', 'blouses', 't-shirts', 'sweaters');
        break;
      case 'bottom':
        possibleTypes.push('bottoms', 'pants', 'trousers', 'jeans', 'shorts', 'skirts');
        break;
      case 'dress':
        possibleTypes.push('dresses');
        break;
      case 'shoes':
        possibleTypes.push('shoes', 'footwear', 'sneakers', 'boots', 'heels', 'sandals');
        break;
      case 'accessory':
        possibleTypes.push('accessories', 'jewelry', 'bags', 'hats');
        break;
      case 'sunglasses':
        possibleTypes.push('sunglasses', 'glasses', 'eyewear');
        break;
      case 'outerwear':
        possibleTypes.push('outerwear', 'jackets', 'coats', 'blazers');
        break;
      default:
        possibleTypes.push(itemType);
    }
    
    // Query Supabase for items matching the type
    const { data, error } = await supabase
      .from('zara_cloth')
      .select('*')
      .limit(20);
    
    if (error) {
      console.error('Error fetching items from Supabase:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log(`No ${itemType} items found in Supabase`);
      return [];
    }
    
    // Filter items by type using our product family logic
    const filteredItems = data.filter(item => {
      const productFamily = (item.product_family || item.category_id || '').toLowerCase();
      return possibleTypes.some(type => productFamily.includes(type.toLowerCase()));
    });
    
    console.log(`Found ${filteredItems.length} ${itemType} items in Supabase`);
    
    return filteredItems;
  } catch (error) {
    console.error(`Error fetching ${itemType} items from Supabase:`, error);
    return [];
  }
};

// Function to get only the first outfit suggestion with guaranteed all three items
export const fetchFirstOutfitSuggestion = async (forceRefresh: boolean = false): Promise<DashboardItem[]> => {
  try {
    const quizData = localStorage.getItem('styleAnalysis');
    const currentMood = localStorage.getItem('current-mood');
    const styleAnalysis = quizData ? JSON.parse(quizData) : null;
    
    if (!styleAnalysis?.analysis) {
      throw new Error('Style analysis data is missing');
    }

    const bodyShape = mapBodyShape(styleAnalysis.analysis.bodyShape || 'H');
    const eventStyle = getEventStyles();
    const preferredStyle = styleAnalysis.analysis.styleProfile || 'classic';
    const style = mapStyle(eventStyle || preferredStyle);
    const mood = validateMood(currentMood);

    console.log("Using user's preferred style from quiz:", preferredStyle);

    if (forceRefresh) {
      clearOutfitCache(bodyShape, style, mood);
      console.log("Forcing refresh of outfit suggestions");
    }

    // Fetch items from Supabase for each category
    const topItems = await fetchItemsByType('top', preferredStyle);
    const bottomItems = await fetchItemsByType('bottom', preferredStyle);
    const shoeItems = await fetchItemsByType('shoes', preferredStyle);
    
    // Check if we have enough items for a complete outfit
    if (topItems.length > 0 && bottomItems.length > 0 && shoeItems.length > 0) {
      // Convert to DashboardItem format
      const topItem = convertToDashboardItem(topItems[0], 'top', preferredStyle);
      const bottomItem = convertToDashboardItem(bottomItems[0], 'bottom', preferredStyle);
      const shoeItem = convertToDashboardItem(shoeItems[0], 'shoes', preferredStyle);
      
      // Only use if we have all three required items
      if (topItem && bottomItem && shoeItem) {
        return [topItem, bottomItem, shoeItem];
      }
    }

    // If we couldn't get a complete outfit from Supabase, fall back to the API
    // Try up to 3 times to get a complete outfit
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await generateOutfit(bodyShape, style, mood);
        if (Array.isArray(response.data) && response.data.length > 0) {
          // Try multiple outfits until we find one with all required items
          for (const outfit of response.data) {
            const topItem = convertToDashboardItem(outfit.top, 'top', preferredStyle);
            const bottomItem = convertToDashboardItem(outfit.bottom, 'bottom', preferredStyle);
            const shoesItem = convertToDashboardItem(outfit.shoes, 'shoes', preferredStyle);
            
            // Only use this outfit if we have all three required items
            if (topItem && bottomItem && shoesItem) {
              const items = [topItem, bottomItem, shoesItem];
              
              // Store the outfit data for later use
              try {
                const outfitData = {
                  colors: {
                    top: outfit.top?.color || '#FFFFFF',
                    bottom: outfit.bottom?.color || '#000000',
                    shoes: outfit.shoes?.color || '#CCCCCC'
                  },
                  recommendations: outfit.recommendations || [],
                  description: outfit.description || ''
                };
                
                localStorage.setItem('last-outfit-data', JSON.stringify(outfitData));
              } catch (e) {
                console.error('Error storing outfit data:', e);
              }
              
              console.log('Complete outfit items:', items);
              return items;
            }
          }
        }
        
        // If we couldn't find a complete outfit, clear cache and try again
        console.log(`Couldn't find a complete outfit in attempt ${attempt+1}, trying again with different parameters`);
        clearOutfitCache(bodyShape, style, mood);
        
        // Slightly modify the mood to get different results
        const moods = ['energized', 'calm', 'elegant', 'casual', 'relaxed', 'optimist'];
        const nextMood = moods[attempt % moods.length];
        console.log(`Trying with different mood: ${nextMood}`);
        
      } catch (e) {
        console.error(`Error in attempt ${attempt+1}:`, e);
        if (attempt === 2) throw e; // Rethrow the error on the last attempt
      }
    }

    throw new Error('Could not generate a complete outfit with all required items after multiple attempts');
  } catch (error) {
    console.error('Error in fetchFirstOutfitSuggestion:', error);
    throw error;
  }
};

// Implement parallel request for outfit suggestions from Supabase
export const fetchDashboardItems = async (): Promise<{[key: string]: DashboardItem[]}> => {
  try {
    const quizData = localStorage.getItem('styleAnalysis');
    const currentMood = localStorage.getItem('current-mood');
    const styleAnalysis = quizData ? JSON.parse(quizData) : null;
    
    if (!styleAnalysis?.analysis) {
      throw new Error('Style analysis data is missing');
    }

    const userPreferredStyle = styleAnalysis.analysis.styleProfile || 'classic';
    console.log("User's quiz preference:", userPreferredStyle);
    
    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    const occasionOutfits: {[key: string]: DashboardItem[]} = {};
    
    // Use Promise.all to fetch items for all occasions in parallel
    await Promise.all(occasions.map(async (occasion) => {
      try {
        // Fetch items from Supabase for each category
        const topItems = await fetchItemsByType('top', userPreferredStyle);
        const bottomItems = await fetchItemsByType('bottom', userPreferredStyle);
        const shoeItems = await fetchItemsByType('shoes', userPreferredStyle);
        
        // Randomly select items for this occasion (using different items for each occasion)
        const selectedTopIndex = Math.floor(Math.random() * topItems.length);
        const selectedBottomIndex = Math.floor(Math.random() * bottomItems.length);
        const selectedShoeIndex = Math.floor(Math.random() * shoeItems.length);
        
        const topItem = convertToDashboardItem(topItems[selectedTopIndex], 'top', userPreferredStyle);
        const bottomItem = convertToDashboardItem(bottomItems[selectedBottomIndex], 'bottom', userPreferredStyle);
        const shoeItem = convertToDashboardItem(shoeItems[selectedShoeIndex], 'shoes', userPreferredStyle);
        
        // Build the outfit for this occasion
        const outfitItems: DashboardItem[] = [];
        
        if (topItem) outfitItems.push(topItem);
        if (bottomItem) outfitItems.push(bottomItem);
        if (shoeItem) outfitItems.push(shoeItem);
        
        // If we don't have enough items, create fallback items
        if (outfitItems.length < 3) {
          const requiredTypes: AllowedType[] = ['top', 'bottom', 'shoes'];
          const existingTypes = outfitItems.map(item => item.type);
          
          for (const type of requiredTypes) {
            if (!existingTypes.includes(type)) {
              const dummyItem: DashboardItem = {
                id: `dummy-${occasion}-${type}-${Math.random().toString(36).substring(2, 9)}`,
                name: `${type.charAt(0).toUpperCase() + type.slice(1)} Item`,
                description: `Default ${type} item for ${occasion}`,
                image: 'https://static.zara.net/photos///2022/I/0/1/p/7644/040/400/2/w/1920/7644040400_6_1_1.jpg',
                price: '$49.99',
                type: type
              };
              outfitItems.push(dummyItem);
            }
          }
        }
        
        // Store the outfit for this occasion
        occasionOutfits[occasion] = outfitItems;
        
      } catch (error) {
        console.error(`Error fetching outfit for ${occasion}:`, error);
        
        // Create fallback items for this occasion
        const fallbackOutfit: DashboardItem[] = [];
        const requiredTypes: AllowedType[] = ['top', 'bottom', 'shoes'];
        
        for (const type of requiredTypes) {
          const dummyItem: DashboardItem = {
            id: `fallback-${occasion}-${type}-${Math.random().toString(36).substring(2, 9)}`,
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} Item`,
            description: `Default ${type} item for ${occasion}`,
            image: 'https://static.zara.net/photos///2022/I/0/1/p/7644/040/400/2/w/1920/7644040400_6_1_1.jpg',
            price: '$49.99',
            type: type
          };
          fallbackOutfit.push(dummyItem);
        }
        
        occasionOutfits[occasion] = fallbackOutfit;
      }
    }));

    console.log('All outfit items by occasion:', occasionOutfits);
    return occasionOutfits;
  } catch (error) {
    console.error('Error in fetchDashboardItems:', error);
    throw error;
  }
};

export const mapDashboardItemToOutfitItem = (item: DashboardItem): OutfitItem => {
  return {
    id: item.id,
    title: item.name,
    description: item.description || 'Stylish piece for your wardrobe',
    image: item.image || '',
    price: item.price || '$49.99',
    type: item.type
  };
};
