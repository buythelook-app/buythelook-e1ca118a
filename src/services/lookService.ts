
import { DashboardItem, OutfitItem } from "@/types/lookTypes";

const AI_BUNDLE_API = 'https://preview--ai-bundle-construct-20.lovable.app/api';

export const generateLooks = async (preferences: {
  bodyShape: string;
  stylePreferences: string[];
  mood: string | null;
}) => {
  try {
    console.log('Sending preferences to AI Bundle API:', preferences);
    
    const response = await fetch(`${AI_BUNDLE_API}/generate-looks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error('Failed to generate looks');
    }

    const data = await response.json();
    console.log('Received generated looks:', data);
    return data;
  } catch (error) {
    console.error('Error generating looks:', error);
    throw error;
  }
};

export const fetchLookDetails = async (productIds: string[]) => {
  try {
    const response = await fetch(`${AI_BUNDLE_API}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productIds }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch look details');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching look details:', error);
    throw error;
  }
};

export const fetchDashboardItems = async (): Promise<DashboardItem[]> => {
  try {
    // Get quiz data and current mood
    const quizData = localStorage.getItem('style-quiz-data');
    const currentMood = localStorage.getItem('current-mood');
    
    if (!quizData) {
      console.error('No quiz data found');
      return [];
    }

    const parsedQuizData = JSON.parse(quizData);
    console.log('Retrieved quiz data:', quizData);
    
    // Generate looks using AI Bundle API
    const generatedLooks = await generateLooks({
      bodyShape: parsedQuizData.bodyShape,
      stylePreferences: parsedQuizData.stylePreferences,
      mood: currentMood,
    });

    if (!generatedLooks || !generatedLooks.productIds) {
      console.error('Invalid response from AI Bundle API');
      return [];
    }

    // Fetch full details for the generated looks
    const lookDetails = await fetchLookDetails(generatedLooks.productIds);
    
    return lookDetails.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      image: item.image || '/placeholder.svg',
      price: item.price || '$99.99',
      type: item.type || 'fashion',
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
