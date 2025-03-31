
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
    image: "https://i.imgur.com/1j9ZXed.png",
    price: "$39.99",
    type: "top"
  },
  bottom: {
    id: "fallback-bottom-1",
    name: "Black Slim Pants",
    description: "Essential black pants for any style",
    image: "https://i.imgur.com/RWCV0G0.png",
    price: "$49.99",
    type: "bottom"
  },
  shoes: {
    id: "fallback-shoes-1",
    name: "Classic Loafers",
    description: "Versatile loafers to complete your look",
    image: "https://i.imgur.com/PzAHrXN.png",
    price: "$79.99",
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
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('type', type)
      .limit(10);
    
    if (error) {
      console.error(`Error fetching ${type} items:`, error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log(`No ${type} items found in database`);
      return [];
    }
    
    console.log(`Found ${data.length} ${type} items in Supabase:`, data);
    
    return data.map(item => ({
      id: item.id,
      name: item.name || `Stylish ${type}`,
      description: item.description || `Stylish ${type}`,
      image: item.image || '',
      price: item.price || '$49.99',
      type: type
    }));
  } catch (e) {
    console.error(`Error in fetchItemsByType for ${type}:`, e);
    return [];
  }
};

export const fetchFirstOutfitSuggestion = async (): Promise<DashboardItem[]> => {
  try {
    console.log("Starting to fetch outfit suggestions");
    const quizData = localStorage.getItem('styleAnalysis');
    const currentMood = localStorage.getItem('current-mood');
    console.log("Quiz data from localStorage:", quizData);
    
    const styleAnalysis = quizData ? JSON.parse(quizData) : null;
    
    if (!styleAnalysis?.analysis) {
      console.error('Missing style analysis data');
      return [FALLBACK_ITEMS.top, FALLBACK_ITEMS.bottom, FALLBACK_ITEMS.shoes];
    }

    // First, try to fetch items from Supabase
    console.log("Attempting to fetch items from Supabase database");
    const databaseTops = await fetchItemsByType('top');
    const databaseBottoms = await fetchItemsByType('bottom');
    const databaseShoes = await fetchItemsByType('shoes');
    
    console.log(`Found ${databaseTops.length} tops, ${databaseBottoms.length} bottoms, and ${databaseShoes.length} shoes in database`);
    
    // If we have enough items in the database, use them
    if (databaseTops.length > 0 || databaseBottoms.length > 0 || databaseShoes.length > 0) {
      console.log("Using items from database for outfit");
      
      const outfit: DashboardItem[] = [];
      
      // Add top item if available or use fallback
      if (databaseTops.length > 0) {
        const randomTop = databaseTops[Math.floor(Math.random() * databaseTops.length)];
        outfit.push(randomTop);
      } else {
        outfit.push(FALLBACK_ITEMS.top);
      }
      
      // Add bottom item if available or use fallback
      if (databaseBottoms.length > 0) {
        const randomBottom = databaseBottoms[Math.floor(Math.random() * databaseBottoms.length)];
        outfit.push(randomBottom);
      } else {
        outfit.push(FALLBACK_ITEMS.bottom);
      }
      
      // Add shoes item if available or use fallback
      if (databaseShoes.length > 0) {
        const randomShoes = databaseShoes[Math.floor(Math.random() * databaseShoes.length)];
        outfit.push(randomShoes);
      } else {
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
    console.error('Error in fetchFirstOutfitSuggestion:', error);
    // Return fallback items if anything goes wrong
    return [FALLBACK_ITEMS.top, FALLBACK_ITEMS.bottom, FALLBACK_ITEMS.shoes];
  }
};
