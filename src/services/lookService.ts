import { DashboardItem, OutfitItem } from "@/types/lookTypes";

export const fallbackItems: OutfitItem[] = [
  {
    id: '1',
    title: 'Classic White Blouse',
    description: 'A timeless piece for your wardrobe',
    image: 'http://preview--ai-bundle-construct-20.lovable.app/images/classic-blouse.jpg',
    price: '$49.99',
    type: 'top'
  },
  {
    id: '2',
    title: 'Black Trousers',
    description: 'Elegant and versatile',
    image: 'http://preview--ai-bundle-construct-20.lovable.app/images/black-trousers.jpg',
    price: '$69.99',
    type: 'bottom'
  }
];

export const fetchDashboardItems = async (): Promise<DashboardItem[]> => {
  try {
    const response = await fetch('http://preview--ai-bundle-construct-20.lovable.app/dashboard');
    if (!response.ok) {
      console.error('API response not ok:', await response.text());
      throw new Error('Failed to fetch dashboard items');
    }
    const data = await response.json();
    console.log('Raw API response:', data);
    
    if (!data.items || !Array.isArray(data.items)) {
      console.error('Invalid data format received:', data);
      throw new Error('Invalid data format');
    }
    
    // Filter out items without required properties and ensure image URLs are from the correct domain
    const validItems = data.items.filter(item => 
      item && 
      item.id && 
      item.name && 
      item.image && 
      item.image.startsWith('http://preview--ai-bundle-construct-20.lovable.app') &&
      item.type
    );
    
    console.log('Filtered valid items:', validItems);
    return validItems;
  } catch (error) {
    console.error('Error fetching dashboard items:', error);
    return fallbackItems.map(item => ({
      id: item.id,
      name: item.title,
      description: item.description,
      image: item.image,
      price: item.price,
      type: item.type
    }));
  }
};

export const mapDashboardItemToOutfitItem = (item: DashboardItem): OutfitItem => {
  console.log('Mapping item:', item);
  
  if (!item || !item.image || !item.image.startsWith('http://preview--ai-bundle-construct-20.lovable.app')) {
    console.error('Invalid item or incorrect image domain:', item);
    return fallbackItems[0];
  }
  
  return {
    id: item.id || String(Math.random()),
    title: item.name || 'Fashion Item',
    description: item.description || 'Stylish piece for your wardrobe',
    image: item.image,
    price: item.price || "$49.99",
    type: item.type || 'top'
  };
};