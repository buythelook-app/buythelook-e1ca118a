
/**
 * Service for fetching and generating outfit suggestions
 */

import { DashboardItem } from "@/types/lookTypes";
import { generateOutfit } from "./api/outfitApi";
import { mapBodyShape, mapStyle, getEventStyles } from "./mappers/styleMappers";
import { convertToDashboardItem, getItemIdentifier } from "./outfitFactory";
import { isMinimalistTop, isMinimalistBottom, isMinimalistShoe } from "./filters/minimalistStyleCheckers";
import { scoreItem } from "./filters/styleFilters";
import { supabase } from "@/lib/supabase";

// Fallback items for when API doesn't return anything useful
const FALLBACK_ITEMS = {
  top: {
    id: "fallback-top-1",
    name: "Classic White Shirt",
    description: "A timeless white shirt that pairs with everything",
    image: "/placeholder-image.jpg", // Use local placeholder
    price: "$45.99",
    type: "top"
  },
  bottom: {
    id: "fallback-bottom-1",
    name: "Black Slim Pants",
    description: "Essential black pants for any style",
    image: "/placeholder-image.jpg", // Use local placeholder
    price: "$55.99",
    type: "bottom"
  },
  shoes: {
    id: "fallback-shoes-1",
    name: "Classic Loafers",
    description: "Versatile loafers to complete your look",
    image: "/placeholder-image.jpg", // Use local placeholder
    price: "$75.99",
    type: "shoes"
  }
};

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

const fetchItemsByType = async (type: string): Promise<DashboardItem[]> => {
  try {
    console.log(`[Supabase] Fetching ${type} items from database`);
    
    // Include detailed logging for debugging
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('type', type)
      .limit(10);
    
    if (error) {
      console.error(`[Supabase] Error fetching ${type} items:`, error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log(`[Supabase] No ${type} items found in database`);
      return [];
    }
    
    console.log(`[Supabase] Found ${data.length} ${type} items:`, data);
    
    return data.map(item => ({
      id: item.id || `generated-${Math.random().toString(36).substring(2, 9)}`,
      name: item.name || `Stylish ${type}`,
      description: item.description || `Stylish ${type}`,
      image: item.image || '',
      price: item.price || '$49.99',
      type: type
    }));
  } catch (e) {
    console.error(`[Supabase] Exception in fetchItemsByType for ${type}:`, e);
    return [];
  }
};

export const fetchFirstOutfitSuggestion = async (): Promise<DashboardItem[]> => {
  try {
    console.log("[OutfitService] Starting to fetch outfit suggestions");
    
    // Debug: Log the Supabase client configuration
    console.log("[Supabase] Client URL:", supabase.supabaseUrl);
    
    // Try to fetch items directly from Supabase first
    console.log("[Supabase] Attempting to fetch items from database");
    
    const databaseTops = await fetchItemsByType('top');
    const databaseBottoms = await fetchItemsByType('bottom');
    const databaseShoes = await fetchItemsByType('shoes');
    
    console.log(`[Supabase] Found ${databaseTops.length} tops, ${databaseBottoms.length} bottoms, and ${databaseShoes.length} shoes in database`);
    
    // If we have items in the database, use them
    if (databaseTops.length > 0 || databaseBottoms.length > 0 || databaseShoes.length > 0) {
      console.log("[OutfitService] Using items from Supabase database for outfit");
      
      const outfit: DashboardItem[] = [];
      
      // Add top item if available or use fallback
      if (databaseTops.length > 0) {
        const randomTop = databaseTops[Math.floor(Math.random() * databaseTops.length)];
        console.log("[OutfitService] Selected top item:", randomTop);
        outfit.push(randomTop);
      } else {
        console.log("[OutfitService] Using fallback top");
        outfit.push(FALLBACK_ITEMS.top);
      }
      
      // Add bottom item if available or use fallback
      if (databaseBottoms.length > 0) {
        const randomBottom = databaseBottoms[Math.floor(Math.random() * databaseBottoms.length)];
        console.log("[OutfitService] Selected bottom item:", randomBottom);
        outfit.push(randomBottom);
      } else {
        console.log("[OutfitService] Using fallback bottom");
        outfit.push(FALLBACK_ITEMS.bottom);
      }
      
      // Add shoes item if available or use fallback
      if (databaseShoes.length > 0) {
        const randomShoes = databaseShoes[Math.floor(Math.random() * databaseShoes.length)];
        console.log("[OutfitService] Selected shoes item:", randomShoes);
        outfit.push(randomShoes);
      } else {
        console.log("[OutfitService] Using fallback shoes");
        outfit.push(FALLBACK_ITEMS.shoes);
      }
      
      return outfit;
    }
    
    // If we don't have any items in the database, extract user preferences from quiz
    const bodyShape = mapBodyShape(styleAnalysis.analysis.bodyShape || 'H');
    const preferredStyle = styleAnalysis.analysis.styleProfile || 'classic';
    console.log("User's preferred style from quiz:", preferredStyle);
    
    // Get event style or use preferred style
    const eventStyle = getEventStyles();
    const style = mapStyle(eventStyle || preferredStyle);
    console.log("Mapped style for API request:", style);
    
    const mood = validateMood(currentMood);
    console.log("Using mood:", mood);
    
    // Make API requests for outfit suggestions
    const requests = 8; // Increased for better chances of complete outfits
    const promises = [];
    
    for (let i = 0; i < requests; i++) {
      promises.push(generateOutfit(bodyShape, style, mood));
    }
    
    // Handle API responses
    const responses = await Promise.allSettled(promises);
    const successfulResponses = responses.filter(r => r.status === 'fulfilled');
    console.log(`Received ${responses.length} API responses`);
    console.log(`API success rate: ${successfulResponses.length}/${requests}`);
    
    // Process all successful responses
    const allTops: any[] = [];
    const allBottoms: any[] = [];
    const allShoes: any[] = [];
    
    responses.forEach(result => {
      if (result.status === 'fulfilled' && result.value && Array.isArray(result.value.data)) {
        result.value.data.forEach((outfit: any) => {
          if (outfit.top) allTops.push(outfit.top);
          if (outfit.bottom) allBottoms.push(outfit.bottom);
          if (outfit.shoes) allShoes.push(outfit.shoes);
        });
      }
    });
    
    console.log(`Found ${allTops.length} tops, ${allBottoms.length} bottoms, and ${allShoes.length} shoes from API`);
    
    // Create the final outfit items array
    const items: DashboardItem[] = [];
    
    // Add top item
    if (allTops.length > 0) {
      const topItem = convertToDashboardItem(allTops[0], 'top', preferredStyle);
      if (topItem) {
        items.push(topItem);
      } else {
        items.push(FALLBACK_ITEMS.top);
      }
    } else {
      items.push(FALLBACK_ITEMS.top);
    }
    
    // Add bottom item
    if (allBottoms.length > 0) {
      const bottomItem = convertToDashboardItem(allBottoms[0], 'bottom', preferredStyle);
      if (bottomItem) {
        items.push(bottomItem);
      } else {
        items.push(FALLBACK_ITEMS.bottom);
      }
    } else {
      items.push(FALLBACK_ITEMS.bottom);
    }
    
    // Add shoes item
    if (allShoes.length > 0) {
      const shoesItem = convertToDashboardItem(allShoes[0], 'shoes', preferredStyle);
      if (shoesItem) {
        items.push(shoesItem);
      } else {
        items.push(FALLBACK_ITEMS.shoes);
      }
    } else {
      items.push(FALLBACK_ITEMS.shoes);
    }
    
    return items;
  } catch (error) {
    console.error('[OutfitService] Error in fetchFirstOutfitSuggestion:', error);
    // Return fallback items if anything goes wrong
    return [FALLBACK_ITEMS.top, FALLBACK_ITEMS.bottom, FALLBACK_ITEMS.shoes];
  }
};
