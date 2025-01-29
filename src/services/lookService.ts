import { DashboardItem, OutfitItem } from "@/types/lookTypes";

export const fallbackItems: OutfitItem[] = [
  {
    id: '1',
    title: 'Classic White Blouse',
    description: 'A timeless piece for your wardrobe',
    image: '/placeholder.svg',
    price: '$49.99',
    type: 'top'
  },
  {
    id: '2',
    title: 'Black Trousers',
    description: 'Elegant and versatile',
    image: '/placeholder.svg',
    price: '$69.99',
    type: 'bottom'
  }
];

export const fetchDashboardItems = async (): Promise<DashboardItem[]> => {
  try {
    const response = await fetch('https://preview--ai-bundle-construct-20.lovable.app/api/dashboard/items');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format');
    }
    return data;
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
  image: item.image || '/placeholder.svg',
  price: item.price || "$49.99",
  type: item.type || 'top'
});