import { DashboardItem, OutfitItem } from "@/types/lookTypes";

const API_URL = 'https://mwsblnposuyhrgzrtoyo.supabase.co/functions/v1/generate-outfit';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13c2JsbnBvc3V5aHJnenJ0b3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4OTUyOTYsImV4cCI6MjA1MzQ3MTI5Nn0.gyU3tLyZ_1yY82BKkii8EyeaGzFn9muZR6G6ELJocQk';

// Fallback images from Unsplash for different item types
const fallbackImages = {
  top: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901',
  bottom: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04',
  shoes: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1',
  default: 'https://images.unsplash.com/photo-1485833077593-4278bba3f11f'
};

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

// Helper function to transform a product into a DashboardItem
const transformProductToDashboardItem = (product: any, type: string): DashboardItem => {
  let imageUrl = fallbackImages.default;
  
  // Try to get image from product
  if (product.image) {
    try {
      // If image is a string that contains JSON array
      if (typeof product.image === 'string' && product.image.startsWith('[')) {
        const imageArray = JSON.parse(product.image);
        if (Array.isArray(imageArray) && imageArray.length > 0) {
          imageUrl = imageArray[0];
        }
      } 
      // If image is already an array
      else if (Array.isArray(product.image) && product.image.length > 0) {
        imageUrl = product.image[0];
      }
      // If image is a direct URL string
      else if (typeof product.image === 'string') {
        imageUrl = product.image;
      }
    } catch (error) {
      console.error('Error parsing image:', error);
      imageUrl = fallbackImages[type as keyof typeof fallbackImages] || fallbackImages.default;
    }
  } else {
    // Use type-specific fallback image
    imageUrl = fallbackImages[type as keyof typeof fallbackImages] || fallbackImages.default;
  }

  console.log('Product:', product);
  console.log('Selected image URL:', imageUrl);

  return {
    id: String(product.product_id || Math.random().toString()),
    name: product.product_name || `${type.charAt(0).toUpperCase() + type.slice(1)} Item`,
    description: `${product.materials_description || ''} ${product.colour ? `- ${product.colour}` : ''}`.trim(),
    image: imageUrl,
    price: product.price ? `$${Number(product.price).toFixed(2)}` : '$49.99',
    type: product.product_family_en?.toLowerCase() || type
  };
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
      return [];
    }

    // Extract body shape from quiz data
    const bodyShape = styleAnalysis.analysis.bodyShape || 'H';
    
    // Use the style profile from analysis
    const style = styleAnalysis.analysis.styleProfile || 'classic';
    
    // Use the current mood or default to 'energized'
    const mood = currentMood || 'energized';

    console.log('Generating outfit with:', { bodyShape, style, mood });

    // Generate outfit using the API
    const response = await generateOutfit(bodyShape, style, mood);
    console.log('API response:', response);

    if (!response?.data) {
      console.error('Invalid API response:', response);
      return [];
    }
    
    // Transform the API response into DashboardItems
    const { top, bottom, shoes } = response.data;
    const items: DashboardItem[] = [];

    if (top) items.push(transformProductToDashboardItem(top, 'top'));
    if (bottom) items.push(transformProductToDashboardItem(bottom, 'bottom'));
    if (shoes) items.push(transformProductToDashboardItem(shoes, 'shoes'));

    // Store recommendations and color information
    if (response.data.recommendations) {
      localStorage.setItem('style-recommendations', JSON.stringify(response.data.recommendations));
    }
    if (response.data.colors) {
      localStorage.setItem('outfit-colors', JSON.stringify(response.data.colors));
    }

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
