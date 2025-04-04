
/**
 * Centralized service for outfit generation API calls and processing
 */
import { fetchOutfitSuggestions } from "../dashboard/outfitSuggestionService";
import { mapBodyShape, mapStyle } from "../mappers/styleMappers";
import { validateMood } from "../utils/validationUtils";

/**
 * Generate outfit based on user preferences
 */
export const generateOutfit = async (bodyShape: string, style: string, mood: string) => {
  return await fetchOutfitSuggestions(bodyShape, style, mood);
};

/**
 * Generate outfit from user preferences stored in localStorage
 */
export const generateOutfitFromUserPreferences = async () => {
  try {
    // Get user preferences from localStorage
    const quizData = localStorage.getItem('styleAnalysis');
    if (!quizData) {
      throw new Error("No style analysis data found");
    }
    
    const styleAnalysis = JSON.parse(quizData);
    if (!styleAnalysis?.analysis) {
      throw new Error("Invalid style analysis data");
    }
    
    // Map body shape from quiz data
    const bodyShape = mapBodyShape(styleAnalysis.analysis.bodyShape || 'H');
    
    // Get style preference from quiz data
    const preferredStyle = styleAnalysis.analysis.styleProfile || 'classic';
    const style = mapStyle(preferredStyle);
    
    // Get current mood from localStorage or use default
    const currentMoodData = localStorage.getItem('current-mood');
    const mood = validateMood(currentMoodData);
    
    // Generate outfit based on user preferences
    return await generateOutfit(bodyShape, style, mood);
  } catch (error) {
    console.error('Error generating outfit from user preferences:', error);
    throw error;
  }
};
