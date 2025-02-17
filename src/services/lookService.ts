
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
    athletic: "sporty"
  };
  return styleMap[style.toLowerCase()] || "casual";
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
    return "energized"; // default mood
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
        'apikey': API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API response:', data);
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate outfit');
    }

    return data;
  } catch (error) {
    console.error('Error in generateOutfit:', error);
    throw error;
  }
};

// Helper function to transform a product into a DashboardItem
const transformProductToDashboardItem = (product: any, type: string): DashboardItem => ({
  id: String(product.product_id),
  name: product.product_name,
  description: `${product.materials_description || ''} - ${product.colour}`,
  image: Array.isArray(product.image) ? product.image[0] : '/placeholder.svg',
  price: `$${product.price?.toFixed(2)}`,
  type: product.product_family_en?.toLowerCase() || type
});

export const fetchDashboardItems = async (): Promise<DashboardItem[]> => {
  try {
    const quizData = localStorage.getItem('styleAnalysis');
    const currentMood = localStorage.getItem('current-mood');
    
    if (!quizData) {
      console.error('No quiz data found');
      return [];
    }

    const parsedQuizData = JSON.parse(quizData);
    console.log('Retrieved quiz data:', parsedQuizData);
    console.log('Current mood:', currentMood);
    
    // Extract style preferences and body shape from quiz data
    const bodyShape = mapBodyShape(parsedQuizData.analysis?.bodyShape || '');
    const style = mapStyle(parsedQuizData.analysis?.styleProfile || '');
    const mood = currentMood; // Use the current mood directly

    // Generate outfit using the API
    const response = await generateOutfit(bodyShape, style, mood || 'energized');
    console.log('Full API response:', response);

    // Ensure we have valid data before transforming
    if (!response?.success || !response?.data) {
      console.error('Invalid API response structure:', response);
      return [];
    }
    
    // Transform the API response into DashboardItems
    const { top, bottom, shoes } = response.data;
    const items: DashboardItem[] = [];

    if (top) items.push(transformProductToDashboardItem(top, 'top'));
    if (bottom) items.push(transformProductToDashboardItem(bottom, 'bottom'));
    if (shoes) items.push(transformProductToDashboardItem(shoes, 'shoes'));

    // Store recommendations and color information in localStorage for use in other components
    if (response.data.recommendations) {
      localStorage.setItem('style-recommendations', JSON.stringify(response.data.recommendations));
    }
    if (response.data.colors) {
      localStorage.setItem('outfit-colors', JSON.stringify(response.data.colors));
    }

    return items;
  } catch (error) {
    console.error('Error in fetchDashboardItems:', error);
    return [];
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
