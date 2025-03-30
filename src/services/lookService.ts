import { DashboardItem, OutfitItem } from "@/types/lookTypes";
import { EventType, EVENT_TO_STYLES } from "@/components/filters/eventTypes";

const API_URL = 'https://mwsblnposuyhrgzrtoyo.supabase.co/functions/v1/generate-outfit';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13c2JsbnBvc3V5aHJnenJ0b3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4OTUyOTYsImV4cCI6MjA1MzQ3MTI5Nn0.gyU3tLyZ_1yY82BKkii8EyeaGzFn9muZR6G6ELJocQk';

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
    Sporty: "sporty"
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
    "powerful"
  ];
  
  if (!mood || !validMoods.includes(mood.toLowerCase())) {
    return "energized";
  }
  return mood.toLowerCase();
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

// ENHANCED: More strict checking for minimalist colors
const hasMinimalistColor = (item: any): boolean => {
  if (!item) return false;
  
  const minimalistColors = [
    'beige', 'cream', 'ivory', 'off-white', 'white', 'ecru', 'oatmeal', 
    'tan', 'khaki', 'sand', 'stone', 'taupe', 'camel', 'nude', 
    'gray', 'grey', 'light grey', 'dark grey', 'charcoal',
    'black', 'navy', 'brown', 'olive', 'sage',
    // Added more specific minimalist color terms
    'neutral', 'earth tone', 'soft white', 'natural', 'greige'
  ];
  
  const itemName = (item.product_name || '').toLowerCase();
  const itemDesc = (item.description || '').toLowerCase();
  const itemColor = (item.colour || '').toLowerCase();
  
  return minimalistColors.some(color => 
    itemName.includes(color) || 
    itemDesc.includes(color) ||
    itemColor.includes(color)
  ) || isNeutralItem(item);
};

// Additional check for neutral items without explicit color mentions
const isNeutralItem = (item: any): boolean => {
  if (!item) return false;
  
  // Check if item has color property with neutral values
  const neutralColorValues = ['black', 'white', 'gray', 'grey', 'beige', 'navy', 'brown', 'khaki', 'taupe'];
  const itemColor = (item.colour || '').toLowerCase();
  
  if (neutralColorValues.some(color => itemColor.includes(color))) {
    return true;
  }
  
  // Check for minimalist keywords that suggest neutral tones
  const neutralKeywords = ['basic', 'classic', 'simple', 'minimalist', 'essential', 'clean', 'solid color'];
  const itemName = (item.product_name || '').toLowerCase();
  const itemDesc = (item.description || '').toLowerCase();
  
  return neutralKeywords.some(keyword => 
    itemName.includes(keyword) || 
    itemDesc.includes(keyword)
  );
};

// ENHANCED: Stricter check for minimalist shoes
const isMinimalistShoe = (item: any): boolean => {
  if (!item) return false;
  
  const itemName = (item.product_name || '').toLowerCase();
  const itemDesc = (item.description || '').toLowerCase();
  
  // Non-minimalist shoe elements
  const nonMinimalistElements = [
    'platform', 'chunky', 'heel', 'high heel', 'stiletto', 
    'glitter', 'sequin', 'embellish', 'rhinestone', 'crystal',
    'studs', 'spike', 'neon', 'bright', 'graphic', 'print', 
    'pattern', 'floral', 'multi-color', 'multicolor'
  ];
  
  // Check if the shoe has any non-minimalist elements
  const hasNonMinimalistFeature = nonMinimalistElements.some(element => 
    itemName.includes(element) || 
    itemDesc.includes(element)
  );
  
  if (hasNonMinimalistFeature) {
    return false;
  }
  
  // Minimalist shoe types
  const minimalistShoeTypes = [
    'loafer', 'oxford', 'flat', 'mule', 'slide', 'slip-on', 
    'minimal', 'simple', 'clean', 'basic', 'leather', 'ballet',
    'sneaker', 'sandal'
  ];
  
  // Check if the shoe type matches minimalist styles
  const hasMinimalistType = minimalistShoeTypes.some(type => 
    itemName.includes(type) || 
    itemDesc.includes(type)
  );
  
  // Check if the shoe has natural colors
  const hasNatural = hasMinimalistColor(item);
  
  return hasMinimalistType || hasNatural;
};

// ENHANCED: Stricter check for minimalist tops and bottoms
const isMinimalistTop = (item: any): boolean => {
  if (!item) return false;
  
  const itemName = (item.product_name || '').toLowerCase();
  const itemDesc = (item.description || '').toLowerCase();
  
  // Non-minimalist top elements
  const nonMinimalistElements = [
    'sequin', 'embellish', 'glitter', 'rhinestone', 'ruffle',
    'fringe', 'tassle', 'neon', 'bright', 'graphic', 'logo',
    'animal print', 'tropical', 'floral'
  ];
  
  // Check if the top has any non-minimalist elements
  const hasNonMinimalistFeature = nonMinimalistElements.some(element => 
    itemName.includes(element) || 
    itemDesc.includes(element)
  );
  
  if (hasNonMinimalistFeature) {
    return false;
  }
  
  // Minimalist top keywords
  const minimalistTopTypes = [
    't-shirt', 'tee', 'shirt', 'blouse', 'cardigan', 'sweater', 
    'pullover', 'tank', 'camisole', 'turtleneck', 'mock neck',
    'button-up', 'button-down', 'simple', 'basic', 'classic', 'clean'
  ];
  
  // Check if the top type matches minimalist styles
  const hasMinimalistType = minimalistTopTypes.some(type => 
    itemName.includes(type) || 
    itemDesc.includes(type)
  );
  
  // Check if the top has natural colors
  const hasNatural = hasMinimalistColor(item);
  
  return (hasMinimalistType || hasNatural);
};

// Check if bottoms match minimalist style
const isMinimalistBottom = (item: any): boolean => {
  if (!item) return false;
  
  const itemName = (item.product_name || '').toLowerCase();
  const itemDesc = (item.description || '').toLowerCase();
  
  // Non-minimalist bottom elements
  const nonMinimalistElements = [
    'sequin', 'embellish', 'glitter', 'rhinestone', 'distressed',
    'ripped', 'neon', 'bright', 'graphic', 'logo', 'embroidered',
    'animal print', 'tropical', 'floral'
  ];
  
  // Check if the bottom has any non-minimalist elements
  const hasNonMinimalistFeature = nonMinimalistElements.some(element => 
    itemName.includes(element) || 
    itemDesc.includes(element)
  );
  
  if (hasNonMinimalistFeature) {
    return false;
  }
  
  // Minimalist bottom keywords
  const minimalistBottomTypes = [
    'pant', 'trouser', 'jean', 'denim', 'skirt', 'short', 
    'straight leg', 'wide leg', 'culotte', 'palazzo', 'cigarette',
    'high waist', 'tailored', 'simple', 'basic', 'classic', 'clean'
  ];
  
  // Check if the bottom type matches minimalist styles
  const hasMinimalistType = minimalistBottomTypes.some(type => 
    itemName.includes(type) || 
    itemDesc.includes(type)
  );
  
  // Check if the bottom has natural colors
  const hasNatural = hasMinimalistColor(item);
  
  return (hasMinimalistType || hasNatural);
};

// Helper function to check if an item matches minimalist style
const isMinimalistStyleItem = (item: any, type: string): boolean => {
  if (!item) return false;
  
  if (type === 'top') {
    return isMinimalistTop(item);
  } else if (type === 'bottom') {
    return isMinimalistBottom(item);
  } else if (type === 'shoes') {
    return isMinimalistShoe(item);
  }
  
  return hasMinimalistColor(item) && !hasPatterns(item);
};

// Check if an item has patterns or loud designs (non-minimalist)
const hasPatterns = (item: any): boolean => {
  if (!item) return false;
  
  const itemName = (item.product_name || '').toLowerCase();
  const itemDesc = (item.description || '').toLowerCase();
  
  const patternKeywords = [
    'pattern', 'print', 'floral', 'stripe', 'check', 'plaid', 
    'graphic', 'logo', 'animal', 'leopard', 'zebra', 'snake', 
    'camo', 'camouflage', 'multi-color', 'multicolor'
  ];
  
  return patternKeywords.some(pattern => 
    itemName.includes(pattern) || 
    itemDesc.includes(pattern)
  );
};

// Helper function to convert API item to DashboardItem
const convertToDashboardItem = (item: any, type: string, userStyle: string = ''): DashboardItem | null => {
  if (!item) return null;
  
  if (isUnderwear(item)) {
    console.log('Filtering out underwear item:', item.product_name);
    return null;
  }
  
  // Strict filtering for minimalist style
  if (userStyle === 'Minimalist') {
    if (!isMinimalistStyleItem(item, type)) {
      console.log(`${type.toUpperCase()} does not match minimalist style criteria:`, item.product_name);
      return null;
    }
  }
  
  const imageUrl = extractImageUrl(item);
  if (!imageUrl) return null;

  return {
    id: String(item.product_id || Math.random()),
    name: item.product_name || `${type.charAt(0).toUpperCase() + type.slice(1)} Item`,
    description: item.description || '',
    image: imageUrl,
    price: item.price ? `$${Number(item.price).toFixed(2)}` : '$49.99',
    type: type
  };
};

// Track used items across all occasions to prevent duplicates
const getItemIdentifier = (item: any): string => {
  if (item.product_id?.toString()) return item.product_id.toString();
  if (item.image?.toString()) return item.image.toString();
  return Math.random().toString();
};

// Function to get only the first outfit suggestion
export const fetchFirstOutfitSuggestion = async (): Promise<DashboardItem[]> => {
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

    // Try multiple API calls to maximize chances of finding good minimalist items
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(generateOutfit(bodyShape, style, mood));
    }
    
    const responses = await Promise.all(promises);
    const allOutfits = responses.flatMap(response => response.data || []);
    
    // Collect all available items for mixing and matching
    const allTops: any[] = [];
    const allBottoms: any[] = [];
    const allShoes: any[] = [];
    
    allOutfits.forEach(outfit => {
      if (outfit.top) allTops.push(outfit.top);
      if (outfit.bottom) allBottoms.push(outfit.bottom);
      if (outfit.shoes) allShoes.push(outfit.shoes);
    });
    
    // Score and sort items by minimalist criteria
    const scoreItem = (item: any, type: string): number => {
      let score = 0;
      
      // Base score for having the item
      if (item) score += 1;
      
      // Score for natural colors
      if (hasMinimalistColor(item)) score += 3;
      
      // Penalize for patterns
      if (hasPatterns(item)) score -= 3;
      
      // Type-specific scoring
      if (type === 'top' && isMinimalistTop(item)) score += 3;
      if (type === 'bottom' && isMinimalistBottom(item)) score += 3;
      if (type === 'shoes' && isMinimalistShoe(item)) score += 3;
      
      return score;
    };
    
    // Sort items by their minimalist score
    const sortedTops = allTops.sort((a, b) => scoreItem(b, 'top') - scoreItem(a, 'top'));
    const sortedBottoms = allBottoms.sort((a, b) => scoreItem(b, 'bottom') - scoreItem(a, 'bottom'));
    const sortedShoes = allShoes.sort((a, b) => scoreItem(b, 'shoes') - scoreItem(a, 'shoes'));
    
    // Convert the best items to dashboard items
    const topItem = convertToDashboardItem(sortedTops[0], 'top', preferredStyle);
    const bottomItem = convertToDashboardItem(sortedBottoms[0], 'bottom', preferredStyle);
    const shoesItem = convertToDashboardItem(sortedShoes[0], 'shoes', preferredStyle);
    
    const items: DashboardItem[] = [];
    
    // Add items if they passed the minimalist filter
    if (topItem) items.push(topItem);
    if (bottomItem) items.push(bottomItem);
    if (shoesItem) items.push(shoesItem);
    
    // If we need fallbacks for missing items, try the next best options
    if (!topItem && sortedTops.length > 1) {
      for (let i = 1; i < sortedTops.length && !items.some(item => item.type === 'top'); i++) {
        const fallbackTop = convertToDashboardItem(sortedTops[i], 'top', preferredStyle);
        if (fallbackTop) {
          items.push(fallbackTop);
          console.log("Added fallback top item:", fallbackTop.name);
          break;
        }
      }
    }
    
    if (!bottomItem && sortedBottoms.length > 1) {
      for (let i = 1; i < sortedBottoms.length && !items.some(item => item.type === 'bottom'); i++) {
        const fallbackBottom = convertToDashboardItem(sortedBottoms[i], 'bottom', preferredStyle);
        if (fallbackBottom) {
          items.push(fallbackBottom);
          console.log("Added fallback bottom item:", fallbackBottom.name);
          break;
        }
      }
    }
    
    if (!shoesItem && sortedShoes.length > 1) {
      for (let i = 1; i < sortedShoes.length && !items.some(item => item.type === 'shoes'); i++) {
        const fallbackShoes = convertToDashboardItem(sortedShoes[i], 'shoes', preferredStyle);
        if (fallbackShoes) {
          items.push(fallbackShoes);
          console.log("Added fallback shoes item:", fallbackShoes.name);
          break;
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
      'Casual': [baseStyle, 'casual', 'sporty'],
      'Evening': [baseStyle, 'romantic', 'classic'],
      'Weekend': [baseStyle, 'boohoo', 'casual']
    };
    
    console.log("Using base style for outfit generation:", baseStyle);
    
    const outfitPromises = [];
    
    for (let i = 0; i < occasions.length; i++) {
      const occasion = occasions[i];
      
      const styleOptions = [baseStyle, ...(occasionStyles[occasion as keyof typeof occasionStyles] || [])];
      
      const uniqueStyles = Array.from(new Set(styleOptions));
      
      const selectedStyle = uniqueStyles[0];
      
      console.log(`Generating outfit for ${occasion} with style: ${selectedStyle}`);
      
      outfitPromises.push(generateOutfit(bodyShape, selectedStyle, mood));
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
        
        for (const outfit of response.data) {
          const outfitItems: DashboardItem[] = [];
          const outfitItemIds: string[] = [];
          
          if (outfit.top) {
            const topId = getItemIdentifier(outfit.top);
            if (!usedItemIds.has(topId)) {
              const topItem = convertToDashboardItem(outfit.top, 'top');
              if (topItem) {
                outfitItems.push(topItem);
                outfitItemIds.push(topId);
              }
            }
          }
          
          if (outfit.bottom) {
            const bottomId = getItemIdentifier(outfit.bottom);
            if (!usedItemIds.has(bottomId)) {
              const bottomItem = convertToDashboardItem(outfit.bottom, 'bottom');
              if (bottomItem) {
                outfitItems.push(bottomItem);
                outfitItemIds.push(bottomId);
              }
            }
          }
          
          if (outfit.shoes) {
            const shoesId = getItemIdentifier(outfit.shoes);
            if (!usedItemIds.has(shoesId)) {
              const shoesItem = convertToDashboardItem(outfit.shoes, 'shoes');
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
        
        if (!outfitFound && response.data[0]) {
          const outfit = response.data[0];
          const partialOutfit: DashboardItem[] = [];
          
          if (outfit.top) {
            const topId = getItemIdentifier(outfit.top);
            if (!usedItemIds.has(topId)) {
              const topItem = convertToDashboardItem(outfit.top, 'top');
              if (topItem) {
                partialOutfit.push(topItem);
                usedItemIds.add(topId);
              }
            }
          }
          
          if (outfit.bottom) {
            const bottomId = getItemIdentifier(outfit.bottom);
            if (!usedItemIds.has(bottomId)) {
              const bottomItem = convertToDashboardItem(outfit.bottom, 'bottom');
              if (bottomItem) {
                partialOutfit.push(bottomItem);
                usedItemIds.add(bottomId);
              }
            }
          }
          
          if (outfit.shoes) {
            const shoesId = getItemIdentifier(outfit.shoes);
            if (!usedItemIds.has(shoesId)) {
              const shoesItem = convertToDashboardItem(outfit.shoes, 'shoes');
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
