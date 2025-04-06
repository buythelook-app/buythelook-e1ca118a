import { DashboardItem, OutfitItem } from "@/types/lookTypes";
import { EventType, EVENT_TO_STYLES } from "@/components/filters/eventTypes";

const API_URL = 'https://mwsblnposuyhrgzrtoyo.supabase.co/functions/v1/generate-outfit';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13c2JsbnBvc3V5aHJnenJ0b3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4OTUyOTYsImV4cCI6MjA1MzQ3MTI5Nn0.gyU3tLyZ_1yY82BKkii8EyeaGzFn9muZR6G6ELJocQk';

// Global tracking of used items to prevent repetition across multiple requests
const globalUsedItemIds = new Set<string>();
const globalUsedTopIds = new Set<string>();
const globalUsedBottomIds = new Set<string>();
const globalUsedShoeIds = new Set<string>();
// Limit the max number of tracked items to prevent memory issues
const MAX_TRACKED_ITEMS = 100;

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
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
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
    console.error('Error in generateOutfit:', error);
    throw error;
  }
};

// Helper function to extract image URL from product
const extractImageUrl = (product: any): string => {
  if (!product) return '';
  
  try {
    if (Array.isArray(product.image)) {
      return product.image[0] || '';
    }
    return product.image || '';
  } catch (error) {
    console.error('Error extracting image URL:', error);
    return '';
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
  if (item?.product_id) return String(item.product_id);
  
  if (item?.image && typeof item.image === 'string') {
    return `img-${item.image.split('/').pop()?.substring(0, 16) || Math.random().toString(36).substring(2, 10)}`;
  }
  
  if (item?.product_name) {
    return `name-${item.product_name.substring(0, 10).replace(/\s/g, '')}-${Math.random().toString(36).substring(2, 6)}`;
  }
  
  return `item-${Math.random().toString(36).substring(2, 15)}`;
};

// Helper function to convert API item to DashboardItem
const convertToDashboardItem = (item: any, type: string, userStyle: string = ''): DashboardItem | null => {
  if (!item) return null;
  
  if (isUnderwear(item)) {
    console.log('Filtering out underwear item:', item.product_name);
    return null;
  }
  
  // Check if this item has been used too often
  const itemId = generateItemId(item);
  
  // Check for repetition by type
  if (type === 'top' && globalUsedTopIds.has(itemId)) {
    console.log('Item already used as top, filtering:', item.product_name);
    return null;
  }
  if (type === 'bottom' && globalUsedBottomIds.has(itemId)) {
    console.log('Item already used as bottom, filtering:', item.product_name);
    return null;
  }
  if (type === 'shoes' && globalUsedShoeIds.has(itemId)) {
    console.log('Item already used as shoes, filtering:', item.product_name);
    return null;
  }
  
  // Be less strict with filtering for minimalist style
  if (userStyle === 'Minimalist') {
    if (type === 'top' && !hasNaturalColor(item)) {
      console.log('Item does not have natural colors for minimalist style:', item.product_name);
      // Be more lenient - only filter out some items
      if (Math.random() > 0.7) {
        return null;
      }
    }
    
    if (!isMinimalistStyleItem(item)) {
      console.log('Item does not match minimalist style criteria:', item.product_name);
      // Be more lenient - only filter out some items
      if (Math.random() > 0.6) {
        return null;
      }
    }
  }
  
  // For Casual style, prioritize casual items but be more lenient
  if (userStyle === 'Casual') {
    if (!isCasualStyleItem(item)) {
      console.log('Item does not match casual style criteria:', item.product_name);
      // Be more lenient - only filter out some items
      if (Math.random() > 0.7) {
        return null;
      }
    }
  }
  
  const imageUrl = extractImageUrl(item);
  if (!imageUrl) return null;

  // Track this item globally to prevent repetition across requests
  globalUsedItemIds.add(itemId);
  if (type === 'top') globalUsedTopIds.add(itemId);
  if (type === 'bottom') globalUsedBottomIds.add(itemId);
  if (type === 'shoes') globalUsedShoeIds.add(itemId);
  
  // Clean up trackers if they get too big
  if (globalUsedItemIds.size > MAX_TRACKED_ITEMS) {
    const itemsArray = Array.from(globalUsedItemIds);
    for (let i = 0; i < 20; i++) {
      if (i < itemsArray.length) {
        globalUsedItemIds.delete(itemsArray[i]);
      }
    }
  }

  return {
    id: itemId,
    name: item.product_name || `${type.charAt(0).toUpperCase() + type.slice(1)} Item`,
    description: item.description || '',
    image: imageUrl,
    price: item.price ? `$${Number(item.price).toFixed(2)}` : '$49.99',
    type: type
  };
};

// Function to get only the first outfit suggestion
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

    // If forceRefresh is true, clear the cache for this request
    if (forceRefresh) {
      clearOutfitCache(bodyShape, style, mood);
      console.log("Forcing refresh of outfit suggestions");
    }

    const response = await generateOutfit(bodyShape, style, mood);
    const items: DashboardItem[] = [];

    if (Array.isArray(response.data) && response.data.length > 0) {
      // Try multiple outfits until we find one with all required items
      // and with items we haven't shown before
      let outfitFound = false;
      
      for (const outfit of response.data) {
        const topItem = convertToDashboardItem(outfit.top, 'top', preferredStyle);
        const bottomItem = convertToDashboardItem(outfit.bottom, 'bottom', preferredStyle);
        const shoesItem = convertToDashboardItem(outfit.shoes, 'shoes', preferredStyle);
        
        // If we have all three required items, use this outfit
        if (topItem && bottomItem && shoesItem) {
          items.push(topItem, bottomItem, shoesItem);
          
          // Store the outfit data for later use (recommendations, colors)
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
          
          outfitFound = true;
          break;
        }
      }
      
      // If we couldn't find a complete outfit, try to create one from different outfits
      if (!outfitFound) {
        console.log("Couldn't find a complete outfit, combining items from different outfits");
        
        let topFound = false, bottomFound = false, shoesFound = false;
        
        // Shuffle the outfits to get more variety
        const shuffledOutfits = [...response.data];
        for (let i = shuffledOutfits.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledOutfits[i], shuffledOutfits[j]] = [shuffledOutfits[j], shuffledOutfits[i]];
        }
        
        for (const outfit of shuffledOutfits) {
          if (!topFound) {
            const topItem = convertToDashboardItem(outfit.top, 'top', preferredStyle);
            if (topItem) {
              items.push(topItem);
              topFound = true;
            }
          }
          
          if (!bottomFound) {
            const bottomItem = convertToDashboardItem(outfit.bottom, 'bottom', preferredStyle);
            if (bottomItem) {
              items.push(bottomItem);
              bottomFound = true;
            }
          }
          
          if (!shoesFound) {
            const shoesItem = convertToDashboardItem(outfit.shoes, 'shoes', preferredStyle);
            if (shoesItem) {
              items.push(shoesItem);
              shoesFound = true;
            }
          }
          
          if (topFound && bottomFound && shoesFound) {
            break;
          }
        }
      }
    }

    console.log('First outfit items:', items);
    return items;
  } catch (error) {
    console.error('Error in fetchFirstOutfitSuggestion:', error);
    throw error;
  }
};

// Implement parallel request for outfit suggestions
export const fetchDashboardItems = async (): Promise<{[key: string]: DashboardItem[]}> => {
  try {
    const quizData = localStorage.getItem('styleAnalysis');
    const currentMood = localStorage.getItem('current-mood');
    const styleAnalysis = quizData ? JSON.parse(quizData) : null;
    
    if (!styleAnalysis?.analysis) {
      throw new Error('Style analysis data is missing');
    }

    const bodyShape = mapBodyShape(styleAnalysis.analysis.bodyShape || 'H');
    
    const userPreferredStyle = styleAnalysis.analysis.styleProfile || 'classic';
    console.log("User's quiz preference:", userPreferredStyle);
    
    const eventStyle = getEventStyles();
    const baseStyle = mapStyle(userPreferredStyle);
    
    const mood = validateMood(currentMood);

    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    const occasionStyles = {
      'Work': [baseStyle, 'classic', 'minimalist'],
      'Casual': ['casual', 'sporty', baseStyle],  // Prioritize casual style for casual occasion
      'Evening': [baseStyle, 'romantic', 'classic'],
      'Weekend': ['casual', 'boohoo', baseStyle]  // Prioritize casual style for weekend occasion
    };
    
    console.log("Using base style for outfit generation:", baseStyle);
    
    const outfitPromises = [];
    
    for (let i = 0; i < occasions.length; i++) {
      const occasion = occasions[i];
      
      const styleOptions = occasionStyles[occasion as keyof typeof occasionStyles] || [baseStyle];
      
      const uniqueStyles = Array.from(new Set(styleOptions));
      
      // Adjust style based on occasion
      let selectedStyle = uniqueStyles[0];
      
      // For Casual occasion, always prioritize casual style
      if (occasion === 'Casual') {
        selectedStyle = 'casual';
      }
      // For Weekend, prioritize more relaxed styles
      else if (occasion === 'Weekend') {
        selectedStyle = userPreferredStyle === 'Casual' ? 'casual' : 
                       (userPreferredStyle === 'Sporty' ? 'sporty' : 
                       (userPreferredStyle === 'Boo Hoo' ? 'boohoo' : baseStyle));
      }
      
      console.log(`Generating outfit for ${occasion} with style: ${selectedStyle}`);
      
      let occasionMood = mood;
      if (occasion === 'Casual' || occasion === 'Weekend') {
        occasionMood = ['relaxed', 'casual', 'optimist', 'energized'][Math.floor(Math.random() * 4)];
      }
      
      outfitPromises.push(generateOutfit(bodyShape, selectedStyle, occasionMood));
    }
    
    const responses = await Promise.all(outfitPromises);
    const occasionOutfits: {[key: string]: DashboardItem[]} = {};
    const usedItemIds = new Set<string>();

    for (let index = 0; index < responses.length; index++) {
      const response = responses[index];
      const occasion = occasions[index];
      occasionOutfits[occasion] = [];
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        let outfitFound = false;
        
        // For casual occasions, prioritize true casual outfits
        let sortedOutfits = [...response.data];
        if (occasion === 'Casual' || occasion === 'Weekend') {
          sortedOutfits.sort((a, b) => {
            const aCasualScore = (isCasualStyleItem(a.top) ? 1 : 0) + 
                               (isCasualStyleItem(a.bottom) ? 1 : 0) + 
                               (isCasualStyleItem(a.shoes) ? 1 : 0);
            const bCasualScore = (isCasualStyleItem(b.top) ? 1 : 0) + 
                               (isCasualStyleItem(b.bottom) ? 1 : 0) + 
                               (isCasualStyleItem(b.shoes) ? 1 : 0);
            return bCasualScore - aCasualScore; // Sort in descending order of casual score
          });
        }
        
        for (const outfit of sortedOutfits) {
          const outfitItems: DashboardItem[] = [];
          const outfitItemIds: string[] = [];
          
          // Process outfit items based on occasion
          let topItem = null, bottomItem = null, shoesItem = null;
          
          if (outfit.top) {
            const topId = generateItemId(outfit.top);
            if (!usedItemIds.has(topId) && !globalUsedTopIds.has(topId)) {
              topItem = convertToDashboardItem(outfit.top, 'top', occasion === 'Casual' ? 'Casual' : userPreferredStyle);
              if (topItem) {
                outfitItems.push(topItem);
                outfitItemIds.push(topId);
              }
            }
          }
          
          if (outfit.bottom) {
            const bottomId = generateItemId(outfit.bottom);
            if (!usedItemIds.has(bottomId) && !globalUsedBottomIds.has(bottomId)) {
              bottomItem = convertToDashboardItem(outfit.bottom, 'bottom', occasion === 'Casual' ? 'Casual' : userPreferredStyle);
              if (bottomItem) {
                outfitItems.push(bottomItem);
                outfitItemIds.push(bottomId);
              }
            }
          }
          
          if (outfit.shoes) {
            const shoesId = generateItemId(outfit.shoes);
            if (!usedItemIds.has(shoesId) && !globalUsedShoeIds.has(shoesId)) {
              shoesItem = convertToDashboardItem(outfit.shoes, 'shoes', occasion === 'Casual' ? 'Casual' : userPreferredStyle);
              if (shoesItem) {
                outfitItems.push(shoesItem);
                outfitItemIds.push(shoesId);
              }
            }
          }
          
          if (outfitItems.length >= 2) {
            occasionOutfits[occasion] = outfitItems;
            outfitItemIds.forEach(id => usedItemIds.add(id));
            outfitFound = true;
            break;
          }
        }
        
        if (!outfitFound && sortedOutfits[0]) {
          const outfit = sortedOutfits[0];
          const partialOutfit: DashboardItem[] = [];
          
          if (outfit.top) {
            const topId = generateItemId(outfit.top);
            if (!usedItemIds.has(topId)) {
              const topItem = convertToDashboardItem(outfit.top, 'top', occasion === 'Casual' ? 'Casual' : userPreferredStyle);
              if (topItem) {
                partialOutfit.push(topItem);
                usedItemIds.add(topId);
              }
            }
          }
          
          if (outfit.bottom) {
            const bottomId = generateItemId(outfit.bottom);
            if (!usedItemIds.has(bottomId)) {
              const bottomItem = convertToDashboardItem(outfit.bottom, 'bottom', occasion === 'Casual' ? 'Casual' : userPreferredStyle);
              if (bottomItem) {
                partialOutfit.push(bottomItem);
                usedItemIds.add(bottomId);
              }
            }
          }
          
          if (outfit.shoes) {
            const shoesId = generateItemId(outfit.shoes);
            if (!usedItemIds.has(shoesId)) {
              const shoesItem = convertToDashboardItem(outfit.shoes, 'shoes', occasion === 'Casual' ? 'Casual' : userPreferredStyle);
              if (shoesItem) {
                partialOutfit.push(shoesItem);
                usedItemIds.add(shoesId);
              }
            }
          }
          
          if (partialOutfit.length > 0) {
            occasionOutfits[occasion] = partialOutfit;
          }
        }
      }
    }

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
