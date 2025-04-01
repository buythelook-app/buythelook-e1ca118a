
/**
 * Service for fetching and generating outfit suggestions
 */

import { DashboardItem } from "@/types/lookTypes";
import { generateOutfit } from "./api/outfitApi";
import { mapBodyShape, mapStyle, getEventStyles } from "./mappers/styleMappers";
import { convertToDashboardItem, getItemIdentifier } from "./outfitFactory";
import { supabase, getImageUrl } from "@/lib/supabase";

// Fallback items for when API doesn't return anything useful
const FALLBACK_ITEMS = {
  top: {
    id: "fallback-top-1",
    name: "Classic White Shirt",
    description: "A timeless white shirt that pairs with everything",
    image: "items/default_top.png",
    price: "$45.99",
    type: "top"
  },
  bottom: {
    id: "fallback-bottom-1",
    name: "Black Slim Pants",
    description: "Essential black pants for any style",
    image: "items/default_bottom.png",
    price: "$55.99",
    type: "bottom"
  },
  shoes: {
    id: "fallback-shoes-1",
    name: "Classic Loafers",
    description: "Versatile loafers to complete your look",
    image: "items/default_shoes.png",
    price: "$75.99",
    type: "shoes"
  }
};

/**
 * Validates mood against the allowed values
 */
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

/**
 * Fetch items from Supabase database by type
 */
const fetchItemsByType = async (type: string): Promise<DashboardItem[]> => {
  try {
    console.log(`[Supabase] Fetching ${type} items from database`);
    
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
    
    console.log(`[Supabase] Found ${data.length} ${type} items`);
    
    return data.map(item => ({
      id: item.id || `generated-${Math.random().toString(36).substring(2, 9)}`,
      name: item.name || `Stylish ${type}`,
      description: item.description || `Stylish ${type}`,
      image: item.image || `items/default_${type}.png`,
      price: item.price || '$49.99',
      type: type
    }));
  } catch (e) {
    console.error(`[Supabase] Exception in fetchItemsByType for ${type}:`, e);
    return [];
  }
};

/**
 * Find the best matching item color from database
 */
const findBestColorMatch = async (hexColor: string, itemType: string): Promise<DashboardItem | null> => {
  try {
    console.log(`Finding ${itemType} item matching color ${hexColor}`);
    
    // Try to find items by type
    const items = await fetchItemsByType(itemType);
    
    if (items.length === 0) {
      console.log(`No ${itemType} items found, using fallback`);
      return null;
    }
    
    // For now, just return a random item of the correct type
    // In a real app, we would try to match the color
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
  } catch (error) {
    console.error(`Error finding color match for ${itemType}:`, error);
    return null;
  }
};

/**
 * Main function to fetch outfit suggestion
 */
export const fetchFirstOutfitSuggestion = async (): Promise<DashboardItem[]> => {
  try {
    console.log("[OutfitService] Starting to fetch outfit suggestions");
    
    // Extract user preferences from quiz
    const quizData = localStorage.getItem('styleAnalysis');
    const styleAnalysis = quizData ? JSON.parse(quizData) : null;
    
    if (!styleAnalysis?.analysis) {
      console.log("[OutfitService] No style analysis data found, using fallback items");
      return [FALLBACK_ITEMS.top, FALLBACK_ITEMS.bottom, FALLBACK_ITEMS.shoes];
    }
    
    const bodyShape = mapBodyShape(styleAnalysis.analysis.bodyShape || 'H');
    const preferredStyle = styleAnalysis.analysis.styleProfile || 'classic';
    console.log("User's preferred style from quiz:", preferredStyle);
    
    // Get selected event style (if any) or use preferred style from quiz
    const selectedEvent = localStorage.getItem('selected-event');
    const eventStyle = selectedEvent ? getEventStyles() : null;
    const style = mapStyle(eventStyle || preferredStyle);
    console.log("Selected event:", selectedEvent, "Mapped style for API request:", style);
    
    // Get the current mood selection from localStorage
    const currentMoodData = localStorage.getItem('current-mood');
    const mood = validateMood(currentMoodData);
    console.log("Using mood:", mood, "Original mood data:", currentMoodData);
    
    // Make API request for outfit suggestions
    const response = await generateOutfit(bodyShape, style, mood);
    console.log("Outfit API response:", response);
    
    if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.log("No valid outfit data returned, using fallbacks");
      return [FALLBACK_ITEMS.top, FALLBACK_ITEMS.bottom, FALLBACK_ITEMS.shoes];
    }
    
    const outfitSuggestion = response.data[0];
    console.log("Using outfit suggestion:", outfitSuggestion);
    
    // Store recommendations for display in the UI
    if (outfitSuggestion.recommendations && Array.isArray(outfitSuggestion.recommendations)) {
      localStorage.setItem('style-recommendations', JSON.stringify(outfitSuggestion.recommendations));
    }
    
    // Store color palette for display in the UI
    // Define the interface for outfit colors to ensure type safety
    interface OutfitColors {
      top: string;
      bottom: string;
      shoes: string;
      coat?: string;
      [key: string]: string | undefined;
    }
    
    const outfitColors: OutfitColors = {
      top: outfitSuggestion.top,
      bottom: outfitSuggestion.bottom,
      shoes: outfitSuggestion.shoes
    };
    
    // Only add coat if it exists in the outfit suggestion
    if (outfitSuggestion.coat) {
      outfitColors.coat = outfitSuggestion.coat;
    }
    
    localStorage.setItem('outfit-colors', JSON.stringify(outfitColors));
    
    // Find matching items for each color
    const topItem = await findBestColorMatch(outfitSuggestion.top, 'top') || FALLBACK_ITEMS.top;
    const bottomItem = await findBestColorMatch(outfitSuggestion.bottom, 'bottom') || FALLBACK_ITEMS.bottom;
    const shoesItem = await findBestColorMatch(outfitSuggestion.shoes, 'shoes') || FALLBACK_ITEMS.shoes;
    
    const items = [topItem, bottomItem, shoesItem];
    
    // Add coat if present in the suggestion
    if (outfitSuggestion.coat) {
      const coatItem = await findBestColorMatch(outfitSuggestion.coat, 'outerwear');
      if (coatItem) {
        items.push(coatItem);
      }
    }
    
    return items;
  } catch (error) {
    console.error('[OutfitService] Error in fetchFirstOutfitSuggestion:', error);
    // Return fallback items if anything goes wrong
    return [FALLBACK_ITEMS.top, FALLBACK_ITEMS.bottom, FALLBACK_ITEMS.shoes];
  }
};
