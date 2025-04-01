
/**
 * Utility functions for handling image URLs and transformations.
 */

import { getImageUrl as getSupabaseImageUrl } from "@/lib/supabase";

// Transform image URL for display
export const transformImageUrl = (url: string): string => {
  if (!url) return '';
  
  // Use local image from public folder for test URLs
  if (url.includes('imgur.com')) {
    console.log('Replacing Imgur URL with local fallback:', url);
    // Return default placeholder based on image type pattern in URL
    if (url.includes('PzAHrXN')) return '/placeholder.svg'; // Shoes fallback
    if (url.includes('RWCV0G0')) return '/placeholder.svg'; // Bottom fallback
    if (url.includes('1j9ZXed')) return '/placeholder.svg'; // Top fallback
    return '/placeholder.svg';
  }
  
  // If it's already a full URL, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a Supabase storage path, get the full URL
  if (url.startsWith('public/') || url.startsWith('items/')) {
    const transformedUrl = getSupabaseImageUrl(url);
    console.log('Transformed Supabase URL:', transformedUrl, 'Original:', url);
    return transformedUrl;
  }
  
  // If it's a relative path, assume it's from the public folder
  if (url.startsWith('/')) {
    return url;
  }
  
  // Return as is if we can't determine the type
  return url;
};

// Add cache buster to force image reload
export const addTimestampToUrl = (url: string): string => {
  if (!url) return '';
  
  // Don't add timestamp to data URLs
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

// Get default images by item type - using local placeholders instead of Imgur URLs
export const getDefaultImageByType = (type: string): string => {
  // Use local placeholders from public folder instead of Imgur URLs
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
