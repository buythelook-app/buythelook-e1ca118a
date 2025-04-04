
/**
 * Service for converting outfit API responses into dashboard items
 */

import { DashboardItem } from "@/types/lookTypes";
import { getCachedResponse, setCachedResponse } from './cacheService';

/**
 * Converts outfit suggestions from the API into dashboard items
 */
export const convertOutfitToDashboardItems = (outfit: any, type: string, occasion: string): DashboardItem[] => {
  if (!outfit || !outfit.data || !Array.isArray(outfit.data)) {
    return [];
  }
  
  // Filter for the specific occasion
  const occasionOutfits = outfit.data.filter(item => 
    item.occasion?.toLowerCase() === occasion.toLowerCase());
  
  if (occasionOutfits.length === 0) {
    return [];
  }
  
  // Generate dashboard items based on the outfit data
  const items: DashboardItem[] = [];
  
  occasionOutfits.forEach((outfitItem, index) => {
    // Only add the specific item type requested
    if (type === 'top' && outfitItem.top) {
      items.push({
        id: `generated-top-${occasion}-${index}`,
        name: `${occasion} Top`,
        description: outfitItem.description || `A stylish top for ${occasion} occasions`,
        image: '/placeholder.svg',
        price: '$49.99',
        type: 'top',
        color: outfitItem.top
      });
    } else if (type === 'bottom' && outfitItem.bottom) {
      items.push({
        id: `generated-bottom-${occasion}-${index}`,
        name: `${occasion} Bottom`,
        description: outfitItem.description || `Stylish bottoms for ${occasion} occasions`,
        image: '/placeholder.svg',
        price: '$59.99',
        type: 'bottom',
        color: outfitItem.bottom
      });
    } else if (type === 'shoes' && outfitItem.shoes) {
      items.push({
        id: `generated-shoes-${occasion}-${index}`,
        name: `${occasion} Shoes`,
        description: outfitItem.description || `Stylish shoes for ${occasion} occasions`,
        image: '/placeholder.svg',
        price: '$79.99',
        type: 'shoes',
        color: outfitItem.shoes
      });
    }
  });
  
  return items;
};

/**
 * Generates fallback items when API fails or no data is available
 */
export const generateFallbackItems = (type: string, occasion: string): DashboardItem[] => {
  return [
    {
      id: `fallback-${type}-${occasion}-1`,
      name: `${type} Item 1`,
      description: `A stylish ${type} perfect for ${occasion} occasions`,
      image: '/placeholder.svg',
      price: '$59.99',
      type: type,
      color: type === 'top' ? '#FFFFFF' : type === 'bottom' ? '#000000' : '#A52A2A'
    },
    {
      id: `fallback-${type}-${occasion}-2`,
      name: `${type} Item 2`,
      description: `Another great ${type} for ${occasion}`,
      image: '/placeholder.svg',
      price: '$49.99',
      type: type,
      color: type === 'top' ? '#E6E6FA' : type === 'bottom' ? '#1E1E1E' : '#8B4513'
    }
  ];
};
