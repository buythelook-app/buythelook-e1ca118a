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

const mockDashboardItems = [
  {
    id: '1',
    name: 'Elegant Dress',
    description: 'Perfect for special occasions',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446',
    price: '$129.99',
    type: 'dress'
  },
  {
    id: '2',
    name: 'Casual Blazer',
    description: 'Versatile and stylish',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea',
    price: '$89.99',
    type: 'outerwear'
  }
];

export const fetchDashboardItems = async (): Promise<DashboardItem[]> => {
  try {
    console.log('Fetching dashboard items...');
    
    // For development, return mock data since the API is not accessible
    console.log('Using mock data due to API unavailability');
    return mockDashboardItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      image: item.image,
      price: item.price,
      type: item.type
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