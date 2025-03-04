import { DashboardItem, OutfitItem } from "@/types/lookTypes";

const API_URL = 'https://mwsblnposuyhrgzrtoyo.supabase.co/functions/v1/generate-outfit';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13c2JsbnBvc3V5aHJnenJ0b3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4OTUyOTYsImV4cCI6MjA1MzQ3MTI5Nn0.gyU3tLyZ_1yY82BKkii8EyeaGzFn9muZR6G6ELJocQk';

// Helper function to map body shapes to API expected format
const mapBodyShape = (shape: string): "X" | "V" | "H" | "O" | "A" => {
  const shapeMap: { [key: string]: "X" | "V" | "H" | "O" | "A" } = {
    hourglass: "X",
    athletic: "H",
    pear: "A",
    apple: "O",
    rectangle: "H",
    inverted_triangle: "V"
  };
  return shapeMap[shape.toLowerCase()] || "H";
};

// Helper function to map style preferences to API expected format
const mapStyle = (style: string): "classic" | "romantic" | "minimalist" | "casual" | "boohoo" | "sporty" => {
  const styleMap: { [key: string]: "classic" | "romantic" | "minimalist" | "casual" | "boohoo" | "sporty" } = {
    elegant: "classic",
    romantic: "romantic",
    minimal: "minimalist",
    casual: "casual",
    bohemian: "boohoo",
    athletic: "sporty",
    Elegance: "classic",
    Classy: "classic",
    Modern: "minimalist",
    "Boo Hoo": "boohoo",
    Nordic: "minimalist",
    Sporty: "sporty"
  };
  
  console.log("Mapping style:", style, "to:", styleMap[style] || "casual");
  return styleMap[style] || "casual";
};

// Helper function to validate mood
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

const generateOutfit = async (bodyStructure: string, style: string, mood: string) => {
  try {
    const requestBody = {
      bodyStructure,
      style,
      mood: validateMood(mood)
    };
    
    console.log('Generating outfit with params:', requestBody);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody),
      mode: 'cors',
      credentials: 'omit'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API response:', data);
    
    return data;
  } catch (error) {
    console.error('Error in generateOutfit:', error);
    throw error;
  }
};

// Helper function to extract image URL from product
const extractImageUrl = (product: any): string => {
  if (!product) return '';
  
  try {
    if (Array.isArray(product.image)) {
      return product.image[0] || '';
    }
    return product.image || '';
  } catch (error) {
    console.error('Error extracting image URL:', error);
    return '';
  }
};

// Helper function to check if an item is underwear
const isUnderwear = (item: any): boolean => {
  if (!item) return false;
  
  const underwearTerms = ['underwear', 'lingerie', 'bra', 'panties', 'briefs', 'boxer', 'thong', 'g-string'];
  
  // Check item name and description for underwear terms
  const itemName = (item.product_name || '').toLowerCase();
  const itemDesc = (item.description || '').toLowerCase();
  const itemType = (item.type || '').toLowerCase();
  
  return underwearTerms.some(term => 
    itemName.includes(term) || 
    itemDesc.includes(term) || 
    itemType.includes(term)
  );
};

// Helper function to convert API item to DashboardItem
const convertToDashboardItem = (item: any, type: string): DashboardItem | null => {
  if (!item) return null;
  
  // Skip underwear items
  if (isUnderwear(item)) {
    console.log('Filtering out underwear item:', item.product_name);
    return null;
  }
  
  const imageUrl = extractImageUrl(item);
  if (!imageUrl) return null;

  return {
    id: String(item.product_id || Math.random()),
    name: item.product_name || `${type.charAt(0).toUpperCase() + type.slice(1)} Item`,
    description: item.description || '',
    image: imageUrl,
    price: item.price ? `$${Number(item.price).toFixed(2)}` : '$49.99',
    type: type
  };
};

// Function to get only the first outfit suggestion
export const fetchFirstOutfitSuggestion = async (): Promise<DashboardItem[]> => {
  try {
    const quizData = localStorage.getItem('styleAnalysis');
    const currentMood = localStorage.getItem('current-mood');
    const styleAnalysis = quizData ? JSON.parse(quizData) : null;
    
    if (!styleAnalysis?.analysis) {
      throw new Error('Style analysis data is missing');
    }

    const bodyShape = mapBodyShape(styleAnalysis.analysis.bodyShape || 'H');
    const style = mapStyle(styleAnalysis.analysis.styleProfile || 'classic');
    const mood = validateMood(currentMood);

    const response = await generateOutfit(bodyShape, style, mood);
    const items: DashboardItem[] = [];

    // Only process the first outfit suggestion
    if (Array.isArray(response.data) && response.data.length > 0) {
      const firstOutfit = response.data[0];
      const top = convertToDashboardItem(firstOutfit.top, 'top');
      const bottom = convertToDashboardItem(firstOutfit.bottom, 'bottom');
      const shoes = convertToDashboardItem(firstOutfit.shoes, 'shoes');

      if (top) items.push(top);
      if (bottom) items.push(bottom);
      if (shoes) items.push(shoes);
    }

    console.log('First outfit items:', items);
    return items;
  } catch (error) {
    console.error('Error in fetchFirstOutfitSuggestion:', error);
    throw error;
  }
};

// Function to get all outfit suggestions for different occasions
export const fetchDashboardItems = async (): Promise<{[key: string]: DashboardItem[]}> => {
  try {
    const quizData = localStorage.getItem('styleAnalysis');
    const currentMood = localStorage.getItem('current-mood');
    const styleAnalysis = quizData ? JSON.parse(quizData) : null;
    
    if (!styleAnalysis?.analysis) {
      throw new Error('Style analysis data is missing');
    }

    const bodyShape = mapBodyShape(styleAnalysis.analysis.bodyShape || 'H');
    const style = mapStyle(styleAnalysis.analysis.styleProfile || 'classic');
    const mood = validateMood(currentMood);

    // Make multiple API calls to generate different outfits
    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    const outfitPromises = [];
    
    // Generate separate outfit for each occasion
    for (let i = 0; i < occasions.length; i++) {
      outfitPromises.push(generateOutfit(bodyShape, style, mood));
    }
    
    const responses = await Promise.all(outfitPromises);
    const occasionOutfits: {[key: string]: DashboardItem[]} = {};

    // Process outfits and group by occasion
    responses.forEach((response, index) => {
      const occasion = occasions[index];
      occasionOutfits[occasion] = [];
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Just use the first outfit for each occasion
        const outfit = response.data[0];
        
        const top = convertToDashboardItem(outfit.top, 'top');
        const bottom = convertToDashboardItem(outfit.bottom, 'bottom');
        const shoes = convertToDashboardItem(outfit.shoes, 'shoes');

        if (top) occasionOutfits[occasion].push(top);
        if (bottom) occasionOutfits[occasion].push(bottom);
        if (shoes) occasionOutfits[occasion].push(shoes);
      }
    });

    console.log('All outfit items by occasion:', occasionOutfits);
    return occasionOutfits;
  } catch (error) {
    console.error('Error in fetchDashboardItems:', error);
    throw error;
  }
};

export const mapDashboardItemToOutfitItem = (item: DashboardItem): OutfitItem => {
  return {
    id: item.id,
    title: item.name,
    description: item.description || 'Stylish piece for your wardrobe',
    image: item.image || '',
    price: item.price || '$49.99',
    type: item.type
  };
};
