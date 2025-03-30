
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

// Enhanced minimalist filtering criteria with more specific color options
export interface MinimalistCriteria {
  naturalColors: string[];
  nonMinimalistPatterns: string[];
  acceptableTopTypes: string[];
  acceptableBottomTypes: string[];
  acceptableShoeTypes: string[];
  preferredColors: {
    top: string[];
    bottom: string[];
    shoes: string[];
  };
}
