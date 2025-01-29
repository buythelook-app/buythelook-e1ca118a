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
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format');
    }
    
    // Map the API response to our DashboardItem type
    return data.map(item => ({
      id: item.id || String(Math.random()),
      name: item.name || 'Fashion Item',
      description: item.description || 'Stylish piece for your wardrobe',
      image: item.image || fallbackItems[0].image,
      price: item.price || "$49.99",
      type: item.type || 'top'
    }));
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

export const mapDashboardItemToOutfitItem = (item: DashboardItem): OutfitItem => ({
  id: item.id || String(Math.random()),
  title: item.name || 'Fashion Item',
  description: item.description || 'Stylish piece for your wardrobe',
  image: item.image || fallbackItems[0].image,
  price: item.price || "$49.99",
  type: item.type || 'top'
});