
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

// Fallback items in case the API fails
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
    console.log('Fetching dashboard items from:', `${BASE_URL}/api/items`);
    const response = await fetch(`${BASE_URL}/api/items`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response body:', text);
      return fallbackItems; // Return fallback items instead of throwing
    }
    
    let data;
    try {
      const text = await response.text();
      console.log('Raw response text:', text);
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return fallbackItems; // Return fallback items on parse error
    }
    
    console.log('Parsed API response:', data);
    
    if (!data || !Array.isArray(data)) {
      console.error('Invalid data format received:', data);
      return fallbackItems; // Return fallback items on invalid format
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
    return validItems.length > 0 ? validItems : fallbackItems;
  } catch (error) {
    console.error('Error fetching dashboard items:', error);
    return fallbackItems; // Return fallback items on any error
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
