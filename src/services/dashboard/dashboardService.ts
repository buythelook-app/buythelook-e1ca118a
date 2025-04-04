
/**
 * Main service for fetching and processing dashboard items
 */

import { DashboardItem } from "@/types/lookTypes";
import { validateMood } from "@/services/utils/validationUtils";
import { mapBodyShape, mapStyle } from "@/services/mappers/styleMappers";
import { fetchOutfitSuggestions, FALLBACK_DATA } from "./outfitSuggestionService";
import { convertOutfitToDashboardItems, generateFallbackItems } from "./dashboardItemsService";
import { getCachedResponse, setCachedResponse } from './cacheService';

// Avoid logging during initial load
const DEBUG = false;

/**
 * Fetches dashboard items by type and occasion using the outfit API
 */
export const fetchItemsByTypeAndOccasion = async (
  type: string, 
  occasion: string, 
  forceRefresh = false
): Promise<DashboardItem[]> => {
  const cacheKey = `${type}-${occasion}`;
  
  // Use cached data if available and not forcing refresh
  if (!forceRefresh && getCachedResponse(cacheKey)) {
    if (DEBUG) console.log(`Using cached ${type} items for ${occasion}`);
    return getCachedResponse(cacheKey) || [];
  }
  
  if (DEBUG) console.log(`Fetching ${type} items for ${occasion}`);
  
  try {
    // Get user preferences from localStorage
    const quizData = localStorage.getItem('styleAnalysis');
    
    if (!quizData) {
      if (DEBUG) console.log('No quiz data found, using default values');
      // Generate fallback items
      const fallbackItems = generateFallbackItems(type, occasion);
      setCachedResponse(cacheKey, fallbackItems);
      return fallbackItems;
    }
    
    const styleAnalysis = JSON.parse(quizData);
    if (!styleAnalysis?.analysis) {
      if (DEBUG) console.log('Invalid quiz data, using default values');
      const fallbackItems = generateFallbackItems(type, occasion);
      setCachedResponse(cacheKey, fallbackItems);
      return fallbackItems;
    }
    
    // Map body shape from quiz data
    const bodyShape = mapBodyShape(styleAnalysis.analysis.bodyShape || 'H');
    
    // Get style preference from quiz data
    const preferredStyle = styleAnalysis.analysis.styleProfile || 'classic';
    const style = mapStyle(preferredStyle);
    
    // Get current mood from localStorage or use a default
    const currentMoodData = localStorage.getItem('current-mood');
    const mood = validateMood(currentMoodData);
    
    // Fetch outfit suggestions from the API
    const outfitData = await fetchOutfitSuggestions(bodyShape, style, mood);
    
    // Convert to dashboard items
    const items = convertOutfitToDashboardItems(outfitData, type, occasion);
    
    // If no items were returned, use fallbacks
    if (items.length === 0) {
      const fallbackItems = generateFallbackItems(type, occasion);
      setCachedResponse(cacheKey, fallbackItems);
      return fallbackItems;
    }
    
    // Cache and return the items
    setCachedResponse(cacheKey, items);
    return items;
  } catch (error) {
    if (DEBUG) console.error(`Error fetching ${type} items for ${occasion}:`, error);
    const fallbackItems = generateFallbackItems(type, occasion);
    return fallbackItems;
  }
};

/**
 * Fetches items for all occasions - modified to use the API
 */
export const fetchItemsForOccasion = async (triggerRefresh = false): Promise<Record<string, DashboardItem[]>> => {
  // Skip running this function automatically unless requested
  if (!triggerRefresh) {
    return {
      Work: [],
      Casual: [],
      Evening: [],
      Weekend: []
    };
  }
  
  try {
    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    const result: Record<string, DashboardItem[]> = {};
    
    // Get user preferences
    const quizData = localStorage.getItem('styleAnalysis');
    if (!quizData) {
      return occasions.reduce((acc, occasion) => {
        acc[occasion] = [];
        return acc;
      }, {} as Record<string, DashboardItem[]>);
    }
    
    const styleAnalysis = JSON.parse(quizData);
    if (!styleAnalysis?.analysis) {
      return occasions.reduce((acc, occasion) => {
        acc[occasion] = [];
        return acc;
      }, {} as Record<string, DashboardItem[]>);
    }
    
    // Map user preferences
    const bodyShape = mapBodyShape(styleAnalysis.analysis.bodyShape || 'H');
    const preferredStyle = styleAnalysis.analysis.styleProfile || 'classic';
    const style = mapStyle(preferredStyle);
    const currentMoodData = localStorage.getItem('current-mood');
    const mood = validateMood(currentMoodData);
    
    // Make a single API call to get all outfit suggestions
    const outfitData = await fetchOutfitSuggestions(bodyShape, style, mood);
    
    // Process the result for each occasion
    for (const occasion of occasions) {
      // Get items of each type for this occasion
      const topItems = convertOutfitToDashboardItems(outfitData, 'top', occasion);
      const bottomItems = convertOutfitToDashboardItems(outfitData, 'bottom', occasion);
      const shoesItems = convertOutfitToDashboardItems(outfitData, 'shoes', occasion);
      
      // Combine all items for this occasion
      result[occasion] = [...topItems, ...bottomItems, ...shoesItems];
      
      if (DEBUG) console.log(`Total items for ${occasion}: ${result[occasion].length}`);
    }
    
    return result;
  } catch (error) {
    if (DEBUG) console.error('Error fetching items for occasions:', error);
    return {
      Work: [],
      Casual: [],
      Evening: [],
      Weekend: []
    };
  }
};
