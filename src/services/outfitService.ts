
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
      return getFallbackItems();
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
      return getFallbackItems();
    }
    
    const outfitSuggestion = response.data[0];
    console.log("Using outfit suggestion:", outfitSuggestion);
    
    // Store recommendations for display in the UI
    if (outfitSuggestion.recommendations && Array.isArray(outfitSuggestion.recommendations)) {
      storeStyleRecommendations(outfitSuggestion.recommendations);
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
    
    return items;
  } catch (error) {
    console.error('[OutfitService] Error in fetchFirstOutfitSuggestion:', error);
    // Return fallback items if anything goes wrong
    return getFallbackItems();
  }
};
