
/**
 * Factory functions for creating outfit items and converting data formats
 */

import { DashboardItem } from "@/types/lookTypes";
import { isUnderwear } from "./filters/styleFilters";
import { isMinimalistStyleItem } from "./filters/minimalistStyleCheckers";

export const extractImageUrl = (product: any): string => {
  if (!product) return '';
  
  try {
    if (Array.isArray(product.image)) {
      return product.image[0] || '';
    }
    return product.image || '';
  } catch (error) {
    console.error('Error extracting image URL:', error);
    return '';
  }
};

export const hasPatternInName = (item: any): boolean => {
  if (!item) return false;
  
  const patternTerms = [
    'square', 'pattern', 'gingham', 'check', 'checked', 'plaid', 
    'stripe', 'striped', 'dot', 'dots', 'polka', 'floral', 'print',
    'textured', 'texture', 'grid', 'geometric', 'animal print'
  ];
  
  const name = (item.product_name || item.name || '').toLowerCase();
  const description = (item.description || '').toLowerCase();
  
  return patternTerms.some(term => name.includes(term) || description.includes(term));
};

export const convertToDashboardItem = (item: any, type: string, userStyle: string = ''): DashboardItem | null => {
  if (!item) return null;
  
  // Filter out underwear items
  if (isUnderwear(item)) {
    console.log('Filtering out underwear item:', item.product_name);
    return null;
  }
  
  // Handle different style preferences with appropriate filtering
  const normalizedStyle = userStyle.toLowerCase().trim();
  
  // Special filtering for minimalist style
  if (normalizedStyle.includes('minimalist') || 
      normalizedStyle.includes('minimal') || 
      normalizedStyle.includes('nordic') || 
      normalizedStyle.includes('modern')) {
    
    if (hasPatternInName(item)) {
      const name = item.product_name || '';
      console.log(`Rejected ${type} item for having pattern in name: ${name}`);
      return null;
    }
    
    if (!isMinimalistStyleItem(item, type)) {
      const name = item.product_name || '';
      console.log(`Rejected ${type} item for minimalist style: ${name}`);
      return null;
    }
  }
  
  const imageUrl = extractImageUrl(item);
  if (!imageUrl) return null;

  return {
    id: String(item.product_id || Math.random()),
    name: item.product_name || `${type.charAt(0).toUpperCase() + type.slice(1)} Item`,
    description: item.description || '',
    image: imageUrl,
    price: item.price ? `$${Number(item.price).toFixed(2)}` : '$49.99',
    type: type
  };
};

export const getItemIdentifier = (item: any): string => {
  if (item.product_id?.toString()) return item.product_id.toString();
  if (item.image?.toString()) return item.image.toString();
  return Math.random().toString();
};
