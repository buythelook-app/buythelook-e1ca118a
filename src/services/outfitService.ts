
/**
 * Service for fetching and generating outfit suggestions
 */

import { DashboardItem } from "@/types/lookTypes";
import { generateOutfit } from "./api/outfitApi";
import { mapBodyShape, mapStyle, getEventStyles } from "./mappers/styleMappers";
import { getFallbackItems } from "./fallbacks/outfitFallbacks";
import { validateMood } from "./utils/validationUtils";
import { findBestColorMatch } from "./fetchers/itemsFetcher";
import { OutfitColors, storeOutfitColors, storeStyleRecommendations } from "./utils/outfitStorageUtils";
import { mapStylePreference } from "@/components/quiz/constants/styleRecommendations";

// Cache for outfit suggestions
const outfitCache = new Map<string, DashboardItem[]>();

/**
 * Main function to fetch outfit suggestion
 */
export const fetchFirstOutfitSuggestion = async (): Promise<DashboardItem[]> => {
  try {
    // Generate a cache key based on user preferences
    const quizData = localStorage.getItem('styleAnalysis');
    const currentMoodData = localStorage.getItem('current-mood');
    const selectedEvent = localStorage.getItem('selected-event');
    
    if (!quizData) {
      console.log("[OutfitService] No style analysis data found, using fallback items");
      return getFallbackItems();
    }
    
    const cacheKey = `outfit-${quizData}-${currentMoodData}-${selectedEvent}`;
    
    // Check if we already have this outfit cached
    if (outfitCache.has(cacheKey)) {
      console.log("[OutfitService] Using cached outfit");
      return outfitCache.get(cacheKey) || getFallbackItems();
    }
    
    console.log("[OutfitService] Starting to fetch outfit suggestions");
    
    // Extract user preferences from quiz
    const styleAnalysis = JSON.parse(quizData);
    
    if (!styleAnalysis?.analysis) {
      console.log("[OutfitService] Invalid style analysis data, using fallback items");
      return getFallbackItems();
    }
    
    const bodyShape = mapBodyShape(styleAnalysis.analysis.bodyShape || 'H');
    const preferredStyle = styleAnalysis.analysis.styleProfile || 'classic';
    
    // Map the user's preferred style to our standardized categories for better matching
    const mappedStylePreference = mapStylePreference(preferredStyle);
    console.log("User's raw preferred style from quiz:", preferredStyle);
    console.log("Mapped to standardized style category:", mappedStylePreference);
    
    // Get selected event style (if any) or use preferred style from quiz
    const eventStyle = selectedEvent ? getEventStyles() : null;
    const style = mapStyle(eventStyle || mappedStylePreference);
    console.log("Selected event:", selectedEvent, "Mapped style for API request:", style);
    
    // Get the current mood selection from localStorage
    const mood = validateMood(currentMoodData);
    console.log("Using mood:", mood);
    
    // Make API request for outfit suggestions
    const response = await generateOutfit(bodyShape, style, mood);
    
    if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.log("No valid outfit data returned, using fallbacks");
      return getFallbackItems();
    }
    
    const outfitSuggestion = response.data[0];
    
    // Store recommendations for display in the UI
    if (outfitSuggestion.recommendations && Array.isArray(outfitSuggestion.recommendations)) {
      const enhancedRecommendations = [
        ...outfitSuggestion.recommendations,
        `This outfit complements your ${preferredStyle} style preference.`,
        `Selected colors are optimized for your ${bodyShape}-type body shape.`
      ];
      storeStyleRecommendations(enhancedRecommendations);
    }
    
    // Store color palette for display in the UI
    const outfitColors: OutfitColors = {
      top: outfitSuggestion.top,
      bottom: outfitSuggestion.bottom,
      shoes: outfitSuggestion.shoes
    };
    
    // Only add coat if it exists in the outfit suggestion
    if (outfitSuggestion.coat) {
      outfitColors.coat = outfitSuggestion.coat;
    }
    
    storeOutfitColors(outfitColors);
    
    // Find matching items for each color
    const topItem = await findBestColorMatch(outfitSuggestion.top, 'top');
    const bottomItem = await findBestColorMatch(outfitSuggestion.bottom, 'bottom');
    const shoesItem = await findBestColorMatch(outfitSuggestion.shoes, 'shoes');
    
    // Use fallback items if matches not found
    const items = [
      topItem || getFallbackItems()[0],
      bottomItem || getFallbackItems()[1],
      shoesItem || getFallbackItems()[2]
    ];
    
    // Add coat if present in the suggestion
    if (outfitSuggestion.coat) {
      const coatItem = await findBestColorMatch(outfitSuggestion.coat, 'outerwear');
      if (coatItem) {
        items.push(coatItem);
      }
    }
    
    // Cache the results
    outfitCache.set(cacheKey, items);
    
    return items;
  } catch (error) {
    console.error('[OutfitService] Error in fetchFirstOutfitSuggestion:', error);
    // Return fallback items if anything goes wrong
    return getFallbackItems();
  }
};
