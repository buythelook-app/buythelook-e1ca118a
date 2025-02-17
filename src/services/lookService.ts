
import { DashboardItem, OutfitItem } from "@/types/lookTypes";

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

export const fetchDashboardItems = async (): Promise<DashboardItem[]> => {
  try {
    console.log('Fetching dashboard items from:', `${BASE_URL}/api/items`);
    const response = await fetch(`${BASE_URL}/api/items`);
    
    if (!response.ok) {
      console.error('API response not ok:', await response.text());
      throw new Error('Failed to fetch dashboard items');
    }
    
    const data = await response.json();
    console.log('Raw API response:', data);
    
    if (!data || !Array.isArray(data)) {
      console.error('Invalid data format received:', data);
      throw new Error('Invalid data format');
    }
    
    // Transform the data to match our DashboardItem type
    const validItems = data
      .filter(item => {
        const isValid = item && 
          item.id && 
          item.name &&
          item.image;
        
        if (!isValid) {
          console.log('Filtered out invalid item:', item);
        }
        
        return isValid;
      })
      .map(item => ({
        id: item.id.toString(),
        name: item.name,
        description: item.description || '',
        image: transformImageUrl(item.image),
        price: item.price || '$99.99',
        type: item.type || 'fashion'
      }));
    
    console.log('Transformed valid items:', validItems);
    return validItems;
  } catch (error) {
    console.error('Error fetching dashboard items:', error);
    throw error; // Let the error propagate to be handled by the UI
  }
};

export const mapDashboardItemToOutfitItem = (item: DashboardItem): OutfitItem => {
  console.log('Mapping dashboard item to outfit item:', item);
  return {
    id: item.id,
    title: item.name,
    description: item.description || 'Stylish piece for your wardrobe',
    image: item.image || '',
    price: item.price || '$49.99',
    type: item.type
  };
};
