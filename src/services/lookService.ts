
import { supabase } from "@/lib/supabase";
import { DashboardItem, OutfitItem } from "@/types/lookTypes";

export const fetchDashboardItems = async (): Promise<DashboardItem[]> => {
  try {
    console.log('Fetching items from Supabase');
    
    const { data: items, error } = await supabase
      .from('items')
      .select('*');

    if (error) {
      console.error('Error fetching items from Supabase:', error);
      throw error;
    }

    console.log('Fetched items from Supabase:', items);

    if (!items || items.length === 0) {
      console.log('No items found in database');
      return [];
    }

    const dashboardItems: DashboardItem[] = items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      image: item.image || '',
      price: item.price || '$0',
      type: item.type || 'top'
    }));

    console.log('Transformed items:', dashboardItems);
    return dashboardItems;
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
