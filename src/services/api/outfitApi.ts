
/**
 * API service for outfit generation
 */

import { supabase } from "@/lib/supabase";

// Cache for API requests to avoid duplications
const requestCache = new Map();

// Sample data for fallback when API fails
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
 * Validates the mood parameter against allowed values
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
 * Generates outfit suggestions using the Supabase Edge Function
 * @param bodyStructure Body structure type: 'X', 'V', 'H', 'O', or 'A'
 * @param style Clothing style: 'classic', 'romantic', 'minimalist', 'casual', 'boohoo', 'sporty'
 * @param mood The desired mood for the outfit
 * @returns Outfit suggestions with color codes and descriptions
 */
export const generateOutfit = async (bodyStructure: string, style: string, mood: string) => {
  try {
    const cacheKey = `${bodyStructure}:${style}:${mood}`;
    
    // Check cache first
    if (requestCache.has(cacheKey)) {
      console.log('Using cached outfit data for:', cacheKey);
      return requestCache.get(cacheKey);
    }
    
    console.log('Generating outfit with params:', { bodyStructure, style, mood: validateMood(mood) });
    
    // Use Supabase Functions to generate the outfit
    const { data, error } = await supabase.functions.invoke('generate-outfit', {
      body: { 
        bodyStructure,
        style,
        mood: validateMood(mood)
      }
    });
    
    if (error) {
      console.error('API Error:', error);
      console.log('Using fallback data due to API error');
      return FALLBACK_DATA;
    }
    
    // If the response doesn't have the expected structure
    if (!data || !data.data || !Array.isArray(data.data)) {
      console.error('Invalid API response format:', data);
      return FALLBACK_DATA;
    }
    
    console.log('API response successful:', data);
    
    // Cache the successful response
    requestCache.set(cacheKey, data);
    
    // Limit cache size
    if (requestCache.size > 10) {
      const oldestKey = requestCache.keys().next().value;
      requestCache.delete(oldestKey);
    }
    
    return data;
  } catch (error) {
    console.error('Error in generateOutfit:', error);
    return FALLBACK_DATA;
  }
};
