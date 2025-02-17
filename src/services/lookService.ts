
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

const generateOutfit = async (bodyStructure: string, style: string, mood: string) => {
  try {
    console.log('Generating outfit with params:', { bodyStructure, style, mood });
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY
      },
      body: JSON.stringify({
        bodyStructure,
        style,
        mood
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API response:', data);
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate outfit');
    }

    return data.data;
  } catch (error) {
    console.error('Error in generateOutfit:', error);
    throw error;
  }
};

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
    
    // Extract style preferences and body shape from quiz data
    const bodyShape = mapBodyShape(parsedQuizData.analysis?.bodyShape || '');
    const style = mapStyle(parsedQuizData.analysis?.styleProfile || '');
    const mood = currentMood || 'energized';

    // Generate outfit using the API
    const outfitData = await generateOutfit(bodyShape, style, mood);
    
    // Transform the API response into DashboardItems
    return outfitData.items.map((item: any) => ({
      id: item.id || String(Math.random()),
      name: item.name || 'Stylish Item',
      description: item.description || 'Perfect for your style',
      image: item.image || '/placeholder.svg',
      price: item.price || '$99.99',
      type: item.type || 'fashion'
    }));
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
