
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

export const convertToDashboardItem = (item: any, type: string, userStyle: string = ''): DashboardItem | null => {
  if (!item) return null;
  
  if (isUnderwear(item)) {
    console.log('Filtering out underwear item:', item.product_name);
    return null;
  }
  
  if (userStyle === 'Minimalist') {
    if (!isMinimalistStyleItem(item, type)) {
      const text = { name: item.product_name || '' };
      console.log(`Rejected ${type} item for minimalist style: ${text.name}`);
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
