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
    // Create a cache key based on the request parameters
    const cacheKey = `${bodyStructure}:${style}:${mood}`;
    
    // Check if we have a cached response
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
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
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
    
    // Cache the successful response
    requestCache.set(cacheKey, data);
    
    // Clear old cache entries if cache gets too large
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
  
  // Check item name and description for underwear terms
  const itemName = (item.product_name || '').toLowerCase();
  const itemDesc = (item.description || '').toLowerCase();
  const itemType = (item.type || '').toLowerCase();
  
  return underwearTerms.some(term => 
    itemName.includes(term) || 
    itemDesc.includes(term) || 
    itemType.includes(term)
  );
};

// Helper function to check if an item matches minimalist style
const isMinimalistStyleItem = (item: any): boolean => {
  if (!item) return false;
  
  // Check item name and description for minimalist terms
  const itemName = (item.product_name || '').toLowerCase();
  const itemDesc = (item.description || '').toLowerCase();
  const itemType = (item.type || '').toLowerCase();
  
  // Colors that match minimalist aesthetic
  const minimalistColors = ['white', 'black', 'gray', 'beige', 'cream', 'navy', 'brown', 'tan', 'neutral'];
  const hasMinimalistColor = minimalistColors.some(color => 
    itemName.includes(color) || 
    itemDesc.includes(color)
  );
  
  // Patterns that don't match minimalist aesthetic
  const nonMinimalistPatterns = ['floral', 'stripe', 'print', 'pattern', 'graphic', 'logo', 'sequin', 'embellish', 'embroidery'];
  const hasNonMinimalistPattern = nonMinimalistPatterns.some(pattern => 
    itemName.includes(pattern) || 
    itemDesc.includes(pattern)
  );
  
  // Terms that match minimalist aesthetic
  const minimalistTerms = ['simple', 'clean', 'minimal', 'basic', 'timeless', 'essential', 'classic', 'sleek', 'streamlined'];
  const hasMinimalistTerm = minimalistTerms.some(term => 
    itemName.includes(term) || 
    itemDesc.includes(term)
  );
  
  // If the style preference is explicitly minimalist, prioritize items that match
  return (hasMinimalistColor || hasMinimalistTerm) && !hasNonMinimalistPattern;
};

// Helper function to convert API item to DashboardItem
const convertToDashboardItem = (item: any, type: string, userStyle: string = ''): DashboardItem | null => {
  if (!item) return null;
  
  // Skip underwear items
  if (isUnderwear(item)) {
    console.log('Filtering out underwear item:', item.product_name);
    return null;
  }
  
  // For minimalist style, apply additional filtering
  if (userStyle === 'Minimalist' && !isMinimalistStyleItem(item)) {
    console.log('Item does not match minimalist style criteria:', item.product_name);
    // Don't immediately reject, but we'll prioritize minimalist items
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
  // Create a unique identifier for each product based on product_id or image URL
  return item.product_id?.toString() || item.image?.toString() || Math.random().toString();
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
    // Get style from event (if available) or from quiz data
    const eventStyle = getEventStyles();
    // Prioritize the user's chosen style from the quiz
    const preferredStyle = styleAnalysis.analysis.styleProfile || 'classic';
    const style = mapStyle(eventStyle || preferredStyle);
    const mood = validateMood(currentMood);

    console.log("Using user's preferred style from quiz:", preferredStyle);

    const response = await generateOutfit(bodyShape, style, mood);
    const items: DashboardItem[] = [];

    // Only process the first outfit suggestion
    if (Array.isArray(response.data) && response.data.length > 0) {
      // Try to find the best matching outfit for user's style
      let bestMatch = response.data[0];
      
      // If user prefers minimalist style, prioritize outfits with minimalist items
      if (preferredStyle === 'Minimalist') {
        for (const outfit of response.data) {
          const topIsMinimalist = outfit.top ? isMinimalistStyleItem(outfit.top) : false;
          const bottomIsMinimalist = outfit.bottom ? isMinimalistStyleItem(outfit.bottom) : false;
          const shoesIsMinimalist = outfit.shoes ? isMinimalistStyleItem(outfit.shoes) : false;
          
          // If more items match minimalist style, use this outfit
          const currentMatchCount = (topIsMinimalist ? 1 : 0) + (bottomIsMinimalist ? 1 : 0) + (shoesIsMinimalist ? 1 : 0);
          const bestMatchCount = 
            (bestMatch.top ? isMinimalistStyleItem(bestMatch.top) : 0) + 
            (bestMatch.bottom ? isMinimalistStyleItem(bestMatch.bottom) : 0) + 
            (bestMatch.shoes ? isMinimalistStyleItem(bestMatch.shoes) : 0);
          
          if (currentMatchCount > bestMatchCount) {
            bestMatch = outfit;
          }
        }
      }
      
      const top = convertToDashboardItem(bestMatch.top, 'top', preferredStyle);
      const bottom = convertToDashboardItem(bestMatch.bottom, 'bottom', preferredStyle);
      const shoes = convertToDashboardItem(bestMatch.shoes, 'shoes', preferredStyle);

      if (top) items.push(top);
      if (bottom) items.push(bottom);
      if (shoes) items.push(shoes);
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
    
    // Get user's preferred style from the quiz
    const userPreferredStyle = styleAnalysis.analysis.styleProfile || 'classic';
    console.log("User's quiz preference:", userPreferredStyle);
    
    // Get base style from event (if available) or from quiz data
    const eventStyle = getEventStyles();
    const baseStyle = mapStyle(userPreferredStyle);
    
    // Get mood
    const mood = validateMood(currentMood);

    // Define style variations for different occasions
    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    const occasionStyles = {
      'Work': [baseStyle, 'classic', 'minimalist'],
      'Casual': [baseStyle, 'casual', 'sporty'],
      'Evening': [baseStyle, 'romantic', 'classic'],
      'Weekend': [baseStyle, 'boohoo', 'casual']
    };
    
    console.log("Using base style for outfit generation:", baseStyle);
    
    const outfitPromises = [];
    
    // Generate separate outfit for each occasion with varied styles
    for (let i = 0; i < occasions.length; i++) {
      const occasion = occasions[i];
      
      // Get style options for this occasion, always prioritizing the user's preferred style
      const styleOptions = [baseStyle, ...(occasionStyles[occasion as keyof typeof occasionStyles] || [])];
      
      // Ensure user's style preference is first in the list
      const uniqueStyles = Array.from(new Set(styleOptions));
      
      // Select a style (prioritize user's preference if it fits the occasion)
      const selectedStyle = uniqueStyles[0];
      
      console.log(`Generating outfit for ${occasion} with style: ${selectedStyle}`);
      
      outfitPromises.push(generateOutfit(bodyShape, selectedStyle, mood));
    }
    
    const responses = await Promise.all(outfitPromises);
    const occasionOutfits: {[key: string]: DashboardItem[]} = {};
    const usedItemIds = new Set<string>(); // Track used items across all occasions

    // Process outfits and group by occasion
    for (let index = 0; index < responses.length; index++) {
      const response = responses[index];
      const occasion = occasions[index];
      occasionOutfits[occasion] = [];
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Try all outfit options for each occasion
        let outfitFound = false;
        
        for (const outfit of response.data) {
          // Check each item in the outfit for duplicates
          const outfitItems: DashboardItem[] = [];
          const outfitItemIds: string[] = [];
          
          // Process top
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
          
          // Process bottom
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
          
          // Process shoes
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
          
          // If we found at least 2 items that aren't duplicates, use this outfit
          if (outfitItems.length >= 2) {
            occasionOutfits[occasion] = outfitItems;
            // Mark these items as used
            outfitItemIds.forEach(id => usedItemIds.add(id));
            outfitFound = true;
            break;
          }
        }
        
        // If no outfit was found with unique items, create a partial outfit with whatever unique items we can find
        if (!outfitFound && response.data[0]) {
          const outfit = response.data[0];
          const partialOutfit: DashboardItem[] = [];
          
          // Try to add top
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
          
          // Try to add bottom
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
          
          // Try to add shoes
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
