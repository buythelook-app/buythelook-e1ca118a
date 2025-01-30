import { DashboardItem, OutfitItem } from "@/types/lookTypes";

export const fallbackItems: OutfitItem[] = [
  {
    id: '1',
    title: 'Classic White Blouse',
    description: 'A timeless piece for your wardrobe',
    image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7',
    price: '$49.99',
    type: 'top'
  },
  {
    id: '2',
    title: 'Black Trousers',
    description: 'Elegant and versatile',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
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
    console.log('Raw API response:', data); // Debug the entire response
    
    if (!data.items || !Array.isArray(data.items)) {
      console.error('Invalid data format received:', data);
      throw new Error('Invalid data format');
    }
    
    // Filter out items without required properties
    const validItems = data.items.filter(item => 
      item && 
      item.id && 
      item.name && 
      item.image && 
      item.type
    );
    
    console.log('Filtered valid items:', validItems);
    return validItems;
  } catch (error) {
    console.error('Error fetching dashboard items:', error);
    // Return fallback items mapped to DashboardItem format
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
  console.log('Mapping item:', item); // Debug log
  
  if (!item || !item.image) {
    console.error('Invalid item or missing image:', item);
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