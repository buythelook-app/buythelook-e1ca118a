
import { DashboardItem, OutfitItem } from "@/types/lookTypes";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = 'https://preview--ai-bundle-construct-20.lovable.app';

const transformImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://review--ai-bundle-construct-20.lovable.app')) {
    return url.replace(
      'http://review--ai-bundle-construct-20.lovable.app',
      'https://bc0cf4d7-9a35-4a65-b424-9d5ecd554d30.lovableproject.com'
    );
  }
  return url;
};

// Fetch all available items from Supabase
const fetchAllItems = async (): Promise<DashboardItem[]> => {
  const { data, error } = await supabase
    .from('items')
    .select('*');

  if (error) {
    console.error('Error fetching items from Supabase:', error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    image: transformImageUrl(item.image),
    price: item.price || '$99.99',
    type: item.type || 'fashion'
  }));
};

// Generate AI suggestions based on available items and user preferences
const generateAISuggestions = async (preferences: any, availableItems: DashboardItem[]): Promise<DashboardItem[]> => {
  try {
    console.log('Generating AI suggestions with preferences:', preferences);
    const response = await fetch(`${BASE_URL}/api/generate-outfits`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preferences,
        availableItems // Pass the available items to the AI
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate suggestions');
    }

    const suggestionsData = await response.json();
    return suggestionsData.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      description: item.description || '',
      image: transformImageUrl(item.image),
      price: item.price || '$99.99',
      type: item.type || 'fashion'
    }));
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return [];
  }
};

// Fallback items in case everything fails
const fallbackItems: DashboardItem[] = [
  {
    id: '1',
    name: 'Elegant Dress',
    description: 'A beautiful dress for special occasions',
    image: '/placeholder.svg',
    price: '$129.99',
    type: 'dress'
  },
  {
    id: '2',
    name: 'Classic Blazer',
    description: 'Professional and stylish blazer',
    image: '/placeholder.svg',
    price: '$89.99',
    type: 'outerwear'
  }
];

export const fetchDashboardItems = async (): Promise<DashboardItem[]> => {
  try {
    // First, fetch all available items from Supabase
    const availableItems = await fetchAllItems();
    
    if (availableItems.length === 0) {
      console.error('No items available in database');
      return fallbackItems;
    }

    // Get the quiz data to send to the AI
    const savedQuizData = localStorage.getItem('style-quiz-data');
    if (!savedQuizData) {
      console.error('No quiz data found');
      return availableItems; // Return all items if no quiz data
    }

    const quizData = JSON.parse(savedQuizData);
    
    // Generate AI suggestions based on preferences and available items
    const suggestions = await generateAISuggestions({
      gender: quizData.gender,
      style: quizData.stylePreferences[0] || 'Elegant',
      colors: quizData.colorPreferences || ['neutral'],
      bodyShape: quizData.bodyShape,
    }, availableItems);

    if (suggestions.length > 0) {
      return suggestions;
    }

    // If AI generation fails, return all available items
    return availableItems.length > 0 ? availableItems : fallbackItems;
  } catch (error) {
    console.error('Error in fetchDashboardItems:', error);
    return fallbackItems;
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
