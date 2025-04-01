
/**
 * API service for outfit generation
 */

import { validateMood } from "@/services/utils/validationUtils";
import { mapBodyShape, mapStyle } from "@/services/mappers/styleMappers";

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

// Supabase Edge Function URL and API key for outfit generation
const SUPABASE_FUNCTION_URL = 'https://mwsblnposuyhrgzrtoyo.supabase.co/functions/v1/generate-outfit';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13c2JsbnBvc3V5aHJnenJ0b3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4OTUyOTYsImV4cCI6MjA1MzQ3MTI5Nn0.gyU3tLyZ_1yY82BKkii8EyeaGzFn9muZR6G6ELJocQk';

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
    
    // Check cache first but skip cache when testing to ensure we see the POST request
    const skipCache = process.env.NODE_ENV === 'development';
    if (!skipCache && requestCache.has(cacheKey)) {
      console.log('Using cached outfit data for:', cacheKey);
      return requestCache.get(cacheKey);
    }
    
    // Validate mood
    const validatedMood = validateMood(mood);
    
    console.log('Generating outfit with params:', { bodyStructure, style, mood: validatedMood });
    console.log('Sending POST request to:', SUPABASE_FUNCTION_URL);
    
    const requestBody = {
      bodyStructure,
      style,
      mood: validatedMood
    };
    
    console.log('Request payload:', JSON.stringify(requestBody));
    
    // Make direct API request to the specified endpoint with the provided API key
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_API_KEY}`,
        'apikey': SUPABASE_API_KEY
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      return FALLBACK_DATA;
    }
    
    const data = await response.json();
    console.log('API Response data:', data);
    
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

/**
 * Get user preferences from quiz data and send outfit generation request
 * No parameters needed as it uses data from localStorage
 */
export const generateOutfitFromUserPreferences = async () => {
  try {
    // Extract user preferences from quiz
    const quizData = localStorage.getItem('styleAnalysis');
    if (!quizData) {
      console.log('No style analysis data found, using fallback');
      return FALLBACK_DATA;
    }
    
    const styleAnalysis = JSON.parse(quizData);
    if (!styleAnalysis?.analysis) {
      console.log('Invalid style analysis data, using fallback');
      return FALLBACK_DATA;
    }
    
    // Map body shape from quiz data
    const bodyShape = mapBodyShape(styleAnalysis.analysis.bodyShape || 'H');
    
    // Get style preference from quiz data
    const preferredStyle = styleAnalysis.analysis.styleProfile || 'classic';
    const style = mapStyle(preferredStyle);
    
    // Get current mood from localStorage or use a default
    const currentMoodData = localStorage.getItem('current-mood');
    const mood = validateMood(currentMoodData);
    
    console.log('Using user preferences for outfit generation:', {
      bodyShape,
      style,
      mood
    });
    
    // Force a new request by adding a timestamp to bypass cache in development
    const timestamp = new Date().getTime();
    const forcedMood = process.env.NODE_ENV === 'development' ? `${mood}-${timestamp}` : mood;
    
    // Call the outfit generation API with the user's preferences
    return generateOutfit(bodyShape, style, forcedMood);
    
  } catch (error) {
    console.error('Error in generateOutfitFromUserPreferences:', error);
    return FALLBACK_DATA;
  }
};
