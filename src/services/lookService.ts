import { DashboardItem, OutfitItem } from "@/types/lookTypes";

export const fallbackItems: DashboardItem[] = [
  {
    id: '1',
    name: 'Classic White Blouse',
    description: 'A timeless piece for your wardrobe',
    image: 'http://preview--ai-bundle-construct-20.lovable.app/images/classic-blouse.jpg',
    price: '$49.99',
    type: 'top'
  },
  {
    id: '2',
    name: 'Black Trousers',
    description: 'Elegant and versatile',
    image: 'http://preview--ai-bundle-construct-20.lovable.app/images/black-trousers.jpg',
    price: '$69.99',
    type: 'bottom'
  }
];

export const fetchDashboardItems = async (): Promise<DashboardItem[]> => {
  try {
    console.log('Fetching dashboard items...');
    const response = await fetch('http://preview--ai-bundle-construct-20.lovable.app/dashboard');
    
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
    
    // Filter out items without required properties and ensure image URLs are from the correct domain
    const validItems = data.filter(item => {
      const isValid = item && 
        item.id && 
        item.name &&
        item.image &&
        item.image.startsWith('http://preview--ai-bundle-construct-20.lovable.app');
      
      if (!isValid) {
        console.log('Filtered out invalid item:', item);
      }
      
      return isValid;
    });
    
    console.log('Filtered valid items:', validItems);
    return validItems;
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
    image: item.image || '',
    price: item.price || '$49.99',
    type: item.type
  };
};