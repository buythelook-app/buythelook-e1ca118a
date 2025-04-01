import { DashboardItem } from "@/types/lookTypes";
import { validateMood } from "@/services/utils/validationUtils";
import { mapBodyShape, mapStyle } from "@/services/mappers/styleMappers";

// Avoid logging during initial load
const DEBUG = false;

// Edge Function API endpoint and API key
const SUPABASE_FUNCTION_URL = 'https://mwsblnposuyhrgzrtoyo.supabase.co/functions/v1/generate-outfit';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13c2JsbnBvc3V5aHJnenJ0b3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4OTUyOTYsImV4cCI6MjA1MzQ3MTI5Nn0.gyU3tLyZ_1yY82BKkii8EyeaGzFn9muZR6G6ELJocQk';

// Cache for API responses to avoid redundant calls
const responseCache = new Map();

// Fallback data in case the API fails
const FALLBACK_DATA = {
  success: true,
  data: [
    {
      top: "#FFFFFF",
      bottom: "#000000",
      shoes: "#A52A2A",
      description: "A classic combination featuring a white top paired with black bottoms and brown shoes.",
      recommendations: [
        "Add a statement necklace to elevate this timeless look",
        "Roll up sleeves for a more casual feel"
      ],
      occasion: "work"
    }
  ]
};

/**
 * Converts outfit suggestions from the API into dashboard items
 */
const convertOutfitToDashboardItems = (outfit: any, type: string, occasion: string): DashboardItem[] => {
  if (!outfit || !outfit.data || !Array.isArray(outfit.data)) {
    return [];
  }
  
  // Filter for the specific occasion
  const occasionOutfits = outfit.data.filter(item => 
    item.occasion?.toLowerCase() === occasion.toLowerCase());
  
  if (occasionOutfits.length === 0) {
    return [];
  }
  
  // Generate dashboard items based on the outfit data
  const items: DashboardItem[] = [];
  
  occasionOutfits.forEach((outfitItem, index) => {
    // Only add the specific item type requested
    if (type === 'top' && outfitItem.top) {
      items.push({
        id: `generated-top-${occasion}-${index}`,
        name: `${occasion} Top`,
        description: outfitItem.description || `A stylish top for ${occasion} occasions`,
        image: '/placeholder.svg',
        price: '$49.99',
        type: 'top',
        color: outfitItem.top
      });
    } else if (type === 'bottom' && outfitItem.bottom) {
      items.push({
        id: `generated-bottom-${occasion}-${index}`,
        name: `${occasion} Bottom`,
        description: outfitItem.description || `Stylish bottoms for ${occasion} occasions`,
        image: '/placeholder.svg',
        price: '$59.99',
        type: 'bottom',
        color: outfitItem.bottom
      });
    } else if (type === 'shoes' && outfitItem.shoes) {
      items.push({
        id: `generated-shoes-${occasion}-${index}`,
        name: `${occasion} Shoes`,
        description: outfitItem.description || `Stylish shoes for ${occasion} occasions`,
        image: '/placeholder.svg',
        price: '$79.99',
        type: 'shoes',
        color: outfitItem.shoes
      });
    }
  });
  
  return items;
};

/**
 * Fetch outfit suggestions via the Supabase Edge Function API
 */
const fetchOutfitSuggestions = async (bodyStructure: string, style: string, mood: string) => {
  const cacheKey = `${bodyStructure}:${style}:${mood}`;
  
  if (responseCache.has(cacheKey)) {
    if (DEBUG) console.log('Using cached outfit data for:', cacheKey);
    return responseCache.get(cacheKey);
  }
  
  if (DEBUG) console.log('Generating outfit with params:', { bodyStructure, style, mood });
  
  try {
    // Make the HTTP POST request to the Supabase edge function
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_API_KEY}`,
        'apikey': SUPABASE_API_KEY
      },
      body: JSON.stringify({
        bodyStructure,
        style,
        mood
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      if (DEBUG) console.error('API Error:', response.status, errorText);
      return FALLBACK_DATA;
    }
    
    const data = await response.json();
    
    // Cache the response
    responseCache.set(cacheKey, data);
    
    // Limit cache size
    if (responseCache.size > 10) {
      const oldestKey = responseCache.keys().next().value;
      responseCache.delete(oldestKey);
    }
    
    return data;
  } catch (error) {
    if (DEBUG) console.error('Error in fetchOutfitSuggestions:', error);
    return FALLBACK_DATA;
  }
};

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
  if (!forceRefresh && responseCache.has(cacheKey)) {
    if (DEBUG) console.log(`Using cached ${type} items for ${occasion}`);
    return responseCache.get(cacheKey);
  }
  
  if (DEBUG) console.log(`Fetching ${type} items for ${occasion}`);
  
  try {
    // Get user preferences from localStorage
    const quizData = localStorage.getItem('styleAnalysis');
    
    if (!quizData) {
      if (DEBUG) console.log('No quiz data found, using default values');
      // Generate fallback items
      const fallbackItems = generateFallbackItems(type, occasion);
      responseCache.set(cacheKey, fallbackItems);
      return fallbackItems;
    }
    
    const styleAnalysis = JSON.parse(quizData);
    if (!styleAnalysis?.analysis) {
      if (DEBUG) console.log('Invalid quiz data, using default values');
      const fallbackItems = generateFallbackItems(type, occasion);
      responseCache.set(cacheKey, fallbackItems);
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
      responseCache.set(cacheKey, fallbackItems);
      return fallbackItems;
    }
    
    // Cache and return the items
    responseCache.set(cacheKey, items);
    return items;
  } catch (error) {
    if (DEBUG) console.error(`Error fetching ${type} items for ${occasion}:`, error);
    const fallbackItems = generateFallbackItems(type, occasion);
    return fallbackItems;
  }
};

/**
 * Generates fallback items when API fails or no data is available
 */
const generateFallbackItems = (type: string, occasion: string): DashboardItem[] => {
  return [
    {
      id: `fallback-${type}-${occasion}-1`,
      name: `${type} Item 1`,
      description: `A stylish ${type} perfect for ${occasion} occasions`,
      image: '/placeholder.svg',
      price: '$59.99',
      type: type,
      color: type === 'top' ? '#FFFFFF' : type === 'bottom' ? '#000000' : '#A52A2A'
    },
    {
      id: `fallback-${type}-${occasion}-2`,
      name: `${type} Item 2`,
      description: `Another great ${type} for ${occasion}`,
      image: '/placeholder.svg',
      price: '$49.99',
      type: type,
      color: type === 'top' ? '#E6E6FA' : type === 'bottom' ? '#1E1E1E' : '#8B4513'
    }
  ];
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
