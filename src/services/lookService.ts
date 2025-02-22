
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
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate outfit');
    }

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
    if (product.image_urls && Array.isArray(product.image_urls)) {
      return product.image_urls[0];
    }
    
    if (typeof product.image === 'string') {
      if (product.image.startsWith('[')) {
        const images = JSON.parse(product.image);
        return Array.isArray(images) && images.length > 0 ? images[0] : '';
      }
      if (product.image.startsWith('http')) {
        return product.image;
      }
    }

    if (Array.isArray(product.image) && product.image.length > 0) {
      return product.image[0];
    }

    // Try individual image fields if they exist
    if (product.main_image) return product.main_image;
    if (product.primary_image) return product.primary_image;
    if (product.product_image) return product.product_image;
    
    return '';
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

    if (!response?.data) {
      console.error('Invalid API response:', response);
      throw new Error('Invalid API response');
    }

    const items: DashboardItem[] = [];
    
    if (response.data.top) {
      const imageUrl = extractImageUrl(response.data.top);
      if (imageUrl) {
        items.push({
          id: String(response.data.top.product_id || Math.random()),
          name: response.data.top.product_name || 'Top Item',
          description: response.data.top.description || '',
          image: imageUrl,
          price: response.data.top.price ? `$${Number(response.data.top.price).toFixed(2)}` : '$49.99',
          type: 'top'
        });
      }
    }
    
    if (response.data.bottom) {
      const imageUrl = extractImageUrl(response.data.bottom);
      if (imageUrl) {
        items.push({
          id: String(response.data.bottom.product_id || Math.random()),
          name: response.data.bottom.product_name || 'Bottom Item',
          description: response.data.bottom.description || '',
          image: imageUrl,
          price: response.data.bottom.price ? `$${Number(response.data.bottom.price).toFixed(2)}` : '$59.99',
          type: 'bottom'
        });
      }
    }
    
    if (response.data.shoes) {
      const imageUrl = extractImageUrl(response.data.shoes);
      if (imageUrl) {
        items.push({
          id: String(response.data.shoes.product_id || Math.random()),
          name: response.data.shoes.product_name || 'Shoes',
          description: response.data.shoes.description || '',
          image: imageUrl,
          price: response.data.shoes.price ? `$${Number(response.data.shoes.price).toFixed(2)}` : '$79.99',
          type: 'shoes'
        });
      }
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
