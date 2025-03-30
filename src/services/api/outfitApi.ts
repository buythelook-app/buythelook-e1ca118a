
/**
 * API service for outfit generation
 */

const API_URL = 'https://mwsblnposuyhrgzrtoyo.supabase.co/functions/v1/generate-outfit';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13c2JsbnBvc3V5aHJnenJ0b3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4OTUyOTYsImV4cCI6MjA1MzQ3MTI5Nn0.gyU3tLyZ_1yY82BKkii8EyeaGzFn9muZR6G6ELJocQk';

const requestCache = new Map();

// Sample data for fallback when API fails
const FALLBACK_DATA = {
  data: [
    {
      top: {
        product_id: "fallback1",
        product_name: "Basic White Tee",
        description: "Classic white t-shirt, essential for any wardrobe",
        image: "https://i.imgur.com/1j9ZXed.png",
        price: 29.99
      },
      bottom: {
        product_id: "fallback2",
        product_name: "Black Slim Pants",
        description: "Versatile black pants that go with everything",
        image: "https://i.imgur.com/RWCV0G0.png",
        price: 59.99
      },
      shoes: {
        product_id: "fallback3",
        product_name: "Classic Loafers",
        description: "Elegant loafers for a polished look",
        image: "https://i.imgur.com/PzAHrXN.png",
        price: 89.99
      }
    }
  ]
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

export const generateOutfit = async (bodyStructure: string, style: string, mood: string) => {
  try {
    const cacheKey = `${bodyStructure}:${style}:${mood}`;
    
    // Check cache first
    if (requestCache.has(cacheKey)) {
      console.log('Using cached outfit data for:', cacheKey);
      return requestCache.get(cacheKey);
    }
    
    console.log('Generating outfit with params:', { bodyStructure, style, mood });
    
    // Reduce timeout to 12 seconds to allow for more retries
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          bodyStructure,
          style,
          mood: validateMood(mood)
        }),
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        console.log('Using fallback data due to API error');
        return FALLBACK_DATA;
      }

      const data = await response.json();
      console.log('API response successful');
      
      // Cache the successful response
      requestCache.set(cacheKey, data);
      
      // Limit cache size
      if (requestCache.size > 10) {
        const oldestKey = requestCache.keys().next().value;
        requestCache.delete(oldestKey);
      }
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Request error:', error);
      console.log('Using fallback data due to fetch error');
      return FALLBACK_DATA;
    }
  } catch (error) {
    console.error('Error in generateOutfit:', error);
    return FALLBACK_DATA;
  }
};
