/**
 * Factory functions for creating outfit items and converting data formats
 */

import { DashboardItem } from "@/types/lookTypes";
import { isUnderwear } from "./filters/styleFilters";
import { isMinimalistStyleItem } from "./filters/minimalistStyleCheckers";

export const extractImageUrl = (product: any): string => {
  if (!product) return '';
  
  try {
    // Always return placeholder to avoid Supabase storage items
    return '/placeholder.svg';
  } catch (error) {
    console.error('Error extracting image URL:', error);
    return '/placeholder.svg';
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
    
    // For minimalist style, we still want items even if they don't pass strict filters
    // We'll just log the rejection reasons but not return null
    if (hasPatternInName(item)) {
      const name = item.product_name || '';
      console.log(`Note: ${type} item has pattern in name: ${name}`);
    }
    
    if (!isMinimalistStyleItem(item, type)) {
      const name = item.product_name || '';
      console.log(`Note: ${type} item may not be ideal for minimalist style: ${name}`);
    }
  }
  
  // Always use placeholder image to avoid Supabase storage URLs
  const imageUrl = '/placeholder.svg';
  
  // Generate a unique ID if none exists
  const itemId = item.product_id || 
                 item.id || 
                 `${type}-${Math.floor(Math.random() * 10000)}`;
  
  // Use product name or provide a sensible default
  const itemName = item.product_name || 
                   item.name || 
                   `${type.charAt(0).toUpperCase() + type.slice(1)} Item`;
  
  // Ensure we have a price (string format with $)
  let itemPrice = "$49.99"; // Default
  if (item.price) {
    const price = typeof item.price === 'string' 
      ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
      : Number(item.price);
    
    if (!isNaN(price)) {
      itemPrice = `$${price.toFixed(2)}`;
    }
  }

  return {
    id: String(itemId),
    name: itemName,
    description: item.description || `Stylish ${type} to complete your look`,
    image: imageUrl,
    price: itemPrice,
    type: type
  };
};

export const getItemIdentifier = (item: any): string => {
  if (!item) return Math.random().toString();
  
  if (item.product_id?.toString()) return item.product_id.toString();
  if (item.id?.toString()) return item.id.toString();
  if (item.image?.toString()) return item.image.toString();
  return Math.random().toString();
};
