
import { DashboardItem, OutfitItem } from "@/types/lookTypes";
import { supabase } from "@/lib/supabase";

export const fetchDashboardItems = async (): Promise<DashboardItem[]> => {
  try {
    const { data: dbItems, error } = await supabase
      .from('items')
      .select('*');

    if (error) {
      console.error('Supabase fetch error:', error);
      throw error;
    }

    console.log('Raw items from Supabase:', dbItems);

    if (!dbItems || dbItems.length === 0) {
      console.error('No items found in Supabase');
      throw new Error('No items found in database');
    }

    const transformedItems = dbItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      image: item.image,
      type: item.type,
      price: item.price || '$0.00'
    }));

    console.log('Transformed items:', transformedItems);
    return transformedItems;
  } catch (error) {
    console.error('Error in fetchDashboardItems:', error);
    throw error;
  }
};

export const mapDashboardItemToOutfitItem = (item: DashboardItem): OutfitItem => {
  return {
    id: item.id,
    title: item.name,
    description: item.description,
    image: item.image,
    price: item.price,
    type: item.type
  };
};
