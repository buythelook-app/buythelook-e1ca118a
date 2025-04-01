
/**
 * Utility functions for handling image URLs and transformations.
 */

import { getImageUrl as getSupabaseImageUrl } from "@/lib/supabase";

// Transform image URL for display
export const transformImageUrl = (url: string): string => {
  if (!url) return '/placeholder.svg';
  
  // Always use local placeholder for imgur URLs
  if (url.includes('imgur.com')) {
    console.log('Using local placeholder instead of Imgur URL:', url);
    return '/placeholder.svg';
  }
  
  // If it's already a full URL, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Skip any invalid or known-problematic URLs
    if (url.includes('undefined') || url.includes('null')) {
      console.warn('Invalid URL detected, using placeholder:', url);
      return '/placeholder.svg';
    }
    return url;
  }
  
  // If it's a Supabase storage path, get the full URL
  if (url.startsWith('public/') || url.startsWith('items/')) {
    try {
      const transformedUrl = getSupabaseImageUrl(url);
      console.log('Transformed Supabase URL:', transformedUrl);
      return transformedUrl;
    } catch (error) {
      console.error('Error transforming Supabase URL:', error);
      return '/placeholder.svg';
    }
  }
  
  // If it's a relative path, assume it's from the public folder
  if (url.startsWith('/')) {
    return url;
  }
  
  // Use placeholder for any other case
  console.log('Using placeholder for unrecognized URL format:', url);
  return '/placeholder.svg';
};

// Add cache buster to force image reload
export const addTimestampToUrl = (url: string): string => {
  if (!url || url === '/placeholder.svg') return url;
  
  // Don't add timestamp to data URLs or placeholder
  if (url.startsWith('data:')) return url;
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
};

// Check if an image URL is valid
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  return url.startsWith('http://') || 
         url.startsWith('https://') ||
         url.startsWith('data:image/') ||
         url.startsWith('/');
};

// Get default images by item type - using local placeholders
export const getDefaultImageByType = (type: string): string => {
  return '/placeholder.svg';
};

// Log detailed image information
export const logImageDetails = (imageUrl: string, component: string, itemId?: string): void => {
  console.log(`[${component}] Processing image:`, {
    originalUrl: imageUrl,
    transformedUrl: transformImageUrl(imageUrl),
    forItem: itemId || 'unknown'
  });
};
