
/**
 * Type definitions for look-related components
 */

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
  occasion?: string; // Added occasion property for event context
  event?: string; // Alternative event/occasion property
  metadata?: {
    occasion?: string;
    event?: string;
    [key: string]: any; // Allow other metadata properties
  };
}

export interface OutfitItem {
  id: string;
  name: string;
  image: string;
  price: string;
  description: string;
  type: string;
}
