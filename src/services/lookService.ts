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
    Elegance: "classic"
  };
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
    // Return the first valid image URL
    if (Array.isArray(product.image)) {
      return product.image[0] || '';
    }
    return product.image || '';
  } catch (error) {
    console.error('Error extracting image URL:', error);
    return '';
  }
};

export const fetchDashboardItems = async (): Promise<DashboardItem[]> => {
  try {
    const quizData = localStorage.getItem('styleAnalysis');
    const currentMood = localStorage.getItem('current-mood');
    const styleAnalysis = quizData ? JSON.parse(quizData) : null;
    
    console.log('Retrieved quiz data:', styleAnalysis);
    console.log('Current mood:', currentMood);
    
    if (!styleAnalysis?.analysis) {
      console.error('Invalid style analysis data');
      throw new Error('Style analysis data is missing');
    }

    const bodyShape = mapBodyShape(styleAnalysis.analysis.bodyShape || 'H');
    const style = mapStyle(styleAnalysis.analysis.styleProfile || 'classic');
    const mood = validateMood(currentMood);

    console.log('Generating outfit with:', { bodyShape, style, mood });

    const response = await generateOutfit(bodyShape, style, mood);
    console.log('API response:', response);

    const items: DashboardItem[] = [];
    
    // Handle API response data - the response structure is an array
    if (Array.isArray(response.data)) {
      response.data.forEach(item => {
        if (item.top) {
          items.push({
            id: String(item.top.product_id || Math.random()),
            name: item.top.product_name || 'Top Item',
            description: item.top.description || '',
            image: extractImageUrl(item.top),
            price: item.top.price ? `$${Number(item.top.price).toFixed(2)}` : '$49.99',
            type: 'top'
          });
        }
        if (item.bottom) {
          items.push({
            id: String(item.bottom.product_id || Math.random()),
            name: item.bottom.product_name || 'Bottom Item',
            description: item.bottom.description || '',
            image: extractImageUrl(item.bottom),
            price: item.bottom.price ? `$${Number(item.bottom.price).toFixed(2)}` : '$59.99',
            type: 'bottom'
          });
        }
        if (item.shoes) {
          items.push({
            id: String(item.shoes.product_id || Math.random()),
            name: item.shoes.product_name || 'Shoes',
            description: item.shoes.description || '',
            image: extractImageUrl(item.shoes),
            price: item.shoes.price ? `$${Number(item.shoes.price).toFixed(2)}` : '$79.99',
            type: 'shoes'
          });
        }
      });
    }

    console.log('Final processed items:', items);
    return items;
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
