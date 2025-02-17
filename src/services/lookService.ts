
import { DashboardItem, OutfitItem } from "@/types/lookTypes";
import { supabase } from "@/lib/supabase";

const generateAILooks = async (preferences: {
  bodyShape: string;
  stylePreferences: string[];
  mood: string | null;
}) => {
  try {
    console.log('Generating AI looks with preferences:', preferences);
    
    // Query items from Supabase based on preferences
    let query = supabase.from('items')
      .select('*');
    
    // Add filters based on preferences
    if (preferences.bodyShape) {
      // You might want to adjust this based on your data structure
      query = query.ilike('type', `%${preferences.bodyShape}%`);
    }

    if (preferences.stylePreferences?.length > 0) {
      query = query.in('type', preferences.stylePreferences);
    }

    const { data: items, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    // Transform items into the expected format
    return items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      image: item.image,
      price: item.price,
      type: item.type
    }));
  } catch (error) {
    console.error('Error generating looks:', error);
    throw error;
  }
};

export const fetchDashboardItems = async (): Promise<DashboardItem[]> => {
  try {
    const quizData = localStorage.getItem('style-quiz-data');
    const currentMood = localStorage.getItem('current-mood');
    
    if (!quizData) {
      console.error('No quiz data found');
      return [];
    }

    const parsedQuizData = JSON.parse(quizData);
    console.log('Retrieved quiz data:', parsedQuizData);
    
    // Generate looks using Supabase and AI preferences
    const generatedLooks = await generateAILooks({
      bodyShape: parsedQuizData.bodyShape,
      stylePreferences: parsedQuizData.stylePreferences,
      mood: currentMood,
    });

    return generatedLooks.map((item: any) => ({
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
