import { DashboardItem, OutfitItem } from "@/types/lookTypes";

const BASE_URL = 'http://review--ai-bundle-construct-20.lovable.app';

const transformImageUrl = (url: string) => {
  if (!url) return '';
  // Keep both transformations to support existing URLs
  return url
    .replace(
      'http://preview--ai-bundle-construct-20.lovable.app',
      'https://bc0cf4d7-9a35-4a65-b424-9d5ecd554d30.lovableproject.com'
    )
    .replace(
      'http://review--ai-bundle-construct-20.lovable.app',
      'https://bc0cf4d7-9a35-4a65-b424-9d5ecd554d30.lovableproject.com'
    );
};

export const fallbackItems: DashboardItem[] = [
  {
    id: '1',
    name: 'Classic White Blouse',
    description: 'A timeless piece for your wardrobe',
    image: `${BASE_URL}/dashboard/1.jpg`,
    price: '$49.99',
    type: 'top'
  },
  {
    id: '2',
    name: 'Black Trousers',
    description: 'Elegant and versatile',
    image: `${BASE_URL}/dashboard/2.jpg`,
    price: '$69.99',
    type: 'bottom'
  }
];

export const fetchDashboardItems = async (): Promise<DashboardItem[]> => {
  try {
    console.log('Fetching dashboard items from:', `${BASE_URL}/dashboard`);
    const response = await fetch(`${BASE_URL}/dashboard`);
    
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
    
    // Filter out items without required properties and transform image URLs
    const validItems = data.filter(item => {
      const isValid = item && 
        item.id && 
        item.name &&
        item.image &&
        (item.image.startsWith('http://review--ai-bundle-construct-20.lovable.app') ||
         item.image.startsWith('http://preview--ai-bundle-construct-20.lovable.app') ||
         item.image.startsWith('https://bc0cf4d7-9a35-4a65-b424-9d5ecd554d30.lovableproject.com'));
      
      if (!isValid) {
        console.log('Filtered out invalid item:', item);
      }
      
      return isValid;
    }).map(item => ({
      ...item,
      image: transformImageUrl(item.image)
    }));
    
    console.log('Filtered valid items:', validItems);
    return validItems.length > 0 ? validItems : fallbackItems;
  } catch (error) {
    console.error('Error fetching dashboard items:', error);
    return fallbackItems;
  }
};

export const mapDashboardItemToOutfitItem = (item: DashboardItem): OutfitItem => {
  console.log('Mapping dashboard item to outfit item:', item);
  return {
    id: item.id,
    title: item.name,
    description: item.description || 'Stylish piece for your wardrobe',
    image: transformImageUrl(item.image) || '',
    price: item.price || '$49.99',
    type: item.type
  };
};
