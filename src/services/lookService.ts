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
    const response = await fetch('https://preview--ai-bundle-construct-20.lovable.app/dashboard');
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard items');
    }
    const data = await response.json();
    console.log('Fetched dashboard items:', data.items); // Debug log
    return data.items || [];
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
  console.log('Mapping item:', item); // Debug log
  
  // Ensure we're using the image from the model data
  const imageUrl = item.image || fallbackItems[0].image;
  
  return {
    id: item.id || String(Math.random()),
    title: item.name || 'Fashion Item',
    description: item.description || 'Stylish piece for your wardrobe',
    image: imageUrl,
    price: item.price || "$49.99",
    type: item.type || 'top'
  };
};