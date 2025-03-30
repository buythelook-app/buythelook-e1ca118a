
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

export const hasSolidColorIndicator = (item: any): boolean => {
  if (!item) return false;
  
  // Enhanced list of terms that indicate solid colors
  const solidTerms = [
    'solid', 'plain', 'basic', 'simple', 'minimal', 'clean', 'monochrome',
    'single color', 'one color', 'solid color', 'block color', 'undecorated',
    'uniform', 'solid-colored', 'minimalist'
  ];
  
  // Color names often indicate solid colors
  const colorNames = [
    'white', 'black', 'blue', 'red', 'green', 'yellow', 'purple', 
    'orange', 'pink', 'brown', 'gray', 'grey', 'beige', 'cream', 
    'ivory', 'navy', 'olive', 'tan'
  ];
  
  const name = (item.product_name || item.name || '').toLowerCase();
  const description = (item.description || '').toLowerCase();
  
  // Check if name contains solid terms
  const hasSolidTerm = solidTerms.some(term => name.includes(term) || description.includes(term));
  
  // Check if name has a color but no pattern terms
  const hasColorName = colorNames.some(color => (name.includes(color) || description.includes(color)));
  const hasNoPatternTerm = !hasPatternInName(item);
  
  return hasSolidTerm || (hasColorName && hasNoPatternTerm);
};

export const convertToDashboardItem = (item: any, type: string, userStyle: string = ''): DashboardItem | null => {
  if (!item) return null;
  
  if (isUnderwear(item)) {
    console.log('Filtering out underwear item:', item.product_name);
    return null;
  }
  
  // For minimalist style, reject any items with pattern terms in name or description
  if (userStyle === 'Minimalist') {
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
    
    // Store item with solid color indicator for better prioritization
    if (hasSolidColorIndicator(item)) {
      try {
        const recentSolidItems = localStorage.getItem('minimalist-solid-items') || '[]';
        const solidItems = JSON.parse(recentSolidItems);
        
        const itemId = item.product_id?.toString() || Math.random().toString();
        if (!solidItems.includes(itemId)) {
          solidItems.push(itemId);
          if (solidItems.length > 20) solidItems.shift();
          localStorage.setItem('minimalist-solid-items', JSON.stringify(solidItems));
          console.log(`Identified solid color item: ${item.product_name}`);
        }
      } catch (error) {
        console.error('Error storing solid color item:', error);
      }
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
