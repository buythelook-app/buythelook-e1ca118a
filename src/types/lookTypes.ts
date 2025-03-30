
export interface DashboardItem {
  id: string;
  name: string;
  description?: string;
  image?: string;
  price?: string;
  type: string;
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
  title: string;
  description: string;
  style: string;
  totalPrice: string;
  items: OutfitItem[];
}

// Added for better minimalist filtering
export interface MinimalistCriteria {
  naturalColors: string[];
  nonMinimalistPatterns: string[];
  acceptableTopTypes: string[];
  acceptableBottomTypes: string[];
  acceptableShoeTypes: string[];
}
