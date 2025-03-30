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
  const itemColor = (item.colour || '').toLowerCase();
  
  return naturalColors.some(color => 
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
  
  if (neutralColorValues.some(color => itemColor === color)) {
    return true;
  }
  
  // Check for minimalist keywords that suggest neutral tones
  const neutralKeywords = ['basic', 'classic', 'simple', 'minimalist', 'essential', 'clean'];
  const itemName = (item.product_name || '').toLowerCase();
  const itemDesc = (item.description || '').toLowerCase();
  
  return neutralKeywords.some(keyword => 
    itemName.includes(keyword) || 
    itemDesc.includes(keyword)
  );
};

// Helper function to check if shoes match minimalist style
const isMinimalistShoe = (item: any): boolean => {
  if (!item) return false;
  
  const itemName = (item.product_name || '').toLowerCase();
  const itemDesc = (item.description || '').toLowerCase();
  
  // Shoe types that typically align with minimalist aesthetic
  const minimalistShoeTypes = [
    'loafer', 'oxford', 'flat', 'mule', 'slide', 'slip-on', 
    'minimal', 'simple', 'clean', 'basic', 'leather'
  ];
  
  // Shoe types that don't align with minimalist aesthetic
  const nonMinimalistShoeTypes = [
    'platform', 'chunky', 'glitter', 'sequin', 'embellish', 
    'studs', 'spike', 'neon', 'bright', 'graphic', 'print', 
    'pattern', 'floral', 'multi-color', 'multicolor'
  ];
  
  // Check if the shoe has natural colors
  const hasNatural = hasNaturalColor(item);
  
  // Check if the shoe type matches minimalist styles
  const hasMinimalistType = minimalistShoeTypes.some(type => 
    itemName.includes(type) || 
    itemDesc.includes(type)
  );
  
  // Check if the shoe has non-minimalist features
  const hasNonMinimalistFeature = nonMinimalistShoeTypes.some(type => 
    itemName.includes(type) || 
    itemDesc.includes(type)
  );
  
  return (hasNatural || hasMinimalistType) && !hasNonMinimalistFeature;
};

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

// Helper function to convert API item to DashboardItem
const convertToDashboardItem = (item: any, type: string, userStyle: string = ''): DashboardItem | null => {
  if (!item) return null;
  
  if (isUnderwear(item)) {
    console.log('Filtering out underwear item:', item.product_name);
    return null;
  }
  
  // Relaxed filtering for minimalist style to ensure we get items
  if (userStyle === 'Minimalist') {
    // For tops and bottoms, we'll be less strict to ensure items are shown
    if (type === 'shoes' && !isMinimalistShoe(item)) {
      console.log('Shoes do not match minimalist style criteria:', item.product_name);
      if (Math.random() > 0.5) { // Only filter out some non-matching shoes
        return null;
      }
    }
    
    // Allow more items through for tops and bottoms by reducing random filtering
    if (!isMinimalistStyleItem(item) && !hasNaturalColor(item)) {
      console.log('Item does not match minimalist style criteria:', item.product_name);
      if (Math.random() > 0.7) { // Increased probability to keep items (70% chance)
        return null;
      }
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

    const response = await generateOutfit(bodyShape, style, mood);
    const items: DashboardItem[] = [];

    if (Array.isArray(response.data) && response.data.length > 0) {
      let bestMatch = response.data[0];
      
      if (preferredStyle === 'Minimalist') {
        // Find the best minimalist outfit from options
        let bestMatchScore = 0;
        
        for (const outfit of response.data) {
          let currentScore = 0;
          
          if (outfit.top && hasNaturalColor(outfit.top)) currentScore += 2;
          if (outfit.top) currentScore += 1; // Give points just for having a top
          
          if (outfit.bottom && hasNaturalColor(outfit.bottom)) currentScore += 2;
          if (outfit.bottom) currentScore += 1; // Give points just for having a bottom
          
          if (outfit.shoes && hasNaturalColor(outfit.shoes)) currentScore += 2;
          if (outfit.shoes && isMinimalistShoe(outfit.shoes)) currentScore += 2;
          
          if (currentScore > bestMatchScore) {
            bestMatchScore = currentScore;
            bestMatch = outfit;
          }
        }
        
        console.log(`Selected best minimalist outfit with score: ${bestMatchScore}`);
      }
      
      // Always try to include all parts of the outfit
      const top = convertToDashboardItem(bestMatch.top, 'top', preferredStyle);
      const bottom = convertToDashboardItem(bestMatch.bottom, 'bottom', preferredStyle);
      const shoes = convertToDashboardItem(bestMatch.shoes, 'shoes', preferredStyle);

      if (top) items.push(top);
      if (bottom) items.push(bottom);
      if (shoes) items.push(shoes);
      
      // If we still don't have a top or bottom, try getting them from other outfits
      if (!top || !bottom) {
        console.log("Missing top or bottom, trying to find alternatives from other outfits");
        
        for (let i = 1; i < Math.min(response.data.length, 5) && (items.length < 3); i++) {
          const alternateOutfit = response.data[i];
          
          if (!top && alternateOutfit.top) {
            const alternateTop = convertToDashboardItem(alternateOutfit.top, 'top', preferredStyle);
            if (alternateTop) {
              items.push(alternateTop);
              console.log("Added alternative top:", alternateTop.name);
            }
          }
          
          if (!bottom && alternateOutfit.bottom) {
            const alternateBottom = convertToDashboardItem(alternateOutfit.bottom, 'bottom', preferredStyle);
            if (alternateBottom) {
              items.push(alternateBottom);
              console.log("Added alternative bottom:", alternateBottom.name);
            }
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
