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
    accessories: string[];
  };
  colorPalette: {
    neutrals: string[];
    accent: string[];
    monochrome: string[];
  };
  avoidanceTerms: string[];
  preferredMaterials: string[];
  silhouettes: {
    top: string[];
    bottom: string[];
    dress: string[];
  };
}

export interface DashboardItem {
  id: string;
  image: string;
  name: string;
  price: string;
  type: string;
  description: string;
  color?: string; // Optional color hexcode for items generated from the API
}

export interface OutfitItem {
  id: string;
  name: string;
  image: string;
  price: string;
  description: string;
  type: string;
}
