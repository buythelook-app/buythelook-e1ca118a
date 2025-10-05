
export interface DashboardItem {
  id: string;
  name: string;
  description?: string;
  image?: string;
  price?: string;
  type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' | 'cart';
  color?: string;
  category?: string;
  season?: string;
  formality?: string;
  style?: string;
  affiliate_link?: string;
}

export interface OutfitItem {
  id: string;
  title: string;
  description: string;
  image: string;
  price: string;
  type: string;
}

export interface Look {
  id: string;
  title?: string;
  description: string;
  style: string;
  mood?: string;
  totalPrice?: string;
  items: OutfitItem[];
  occasion?: 'work' | 'casual' | 'weekend' | 'date night' | 'general';
}
