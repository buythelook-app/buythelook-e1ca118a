
/**
 * Service for fetching outfit suggestions from the API
 */

import { validateMood } from "@/services/utils/validationUtils";
import { getCachedResponse, setCachedResponse } from './cacheService';

// Avoid logging during initial load
const DEBUG = false;

// Edge Function API endpoint and API key
const SUPABASE_FUNCTION_URL = 'https://mwsblnposuyhrgzrtoyo.supabase.co/functions/v1/generate-outfit';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13c2JsbnBvc3V5aHJnenJ0b3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4OTUyOTYsImV4cCI6MjA1MzQ3MTI5Nn0.gyU3tLyZ_1yY82BKkii8EyeaGzFn9muZR6G6ELJocQk';

// Fallback data in case the API fails
export const FALLBACK_DATA = {
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
 * Fetch outfit suggestions via the Supabase Edge Function API
 */
export const fetchOutfitSuggestions = async (bodyStructure: string, style: string, mood: string) => {
  const cacheKey = `${bodyStructure}:${style}:${mood}`;
  
  const cachedResponse = getCachedResponse(cacheKey);
  if (cachedResponse) {
    if (DEBUG) console.log('Using cached outfit data for:', cacheKey);
    return cachedResponse;
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
    setCachedResponse(cacheKey, data);
    
    return data;
  } catch (error) {
    if (DEBUG) console.error('Error in fetchOutfitSuggestions:', error);
    return FALLBACK_DATA;
  }
};
