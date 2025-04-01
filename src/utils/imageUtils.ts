
/**
 * Utility functions for handling image URLs and transformations.
 */

import { getImageUrl as getSupabaseImageUrl } from "@/lib/supabase";

/**
 * Checks if a URL is from Imgur
 */
export const isImgurUrl = (url: string): boolean => {
  return url && url.includes('imgur.com');
};

/**
 * Checks if URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '' || url.includes('undefined') || url.includes('null')) {
    return false;
  }
  return true;
};

/**
 * Transform image URL for display
 */
export const transformImageUrl = (url: string): string => {
  // Return placeholder for empty or invalid URLs
  if (!isValidUrl(url)) {
    console.log('Invalid URL, using placeholder:', url);
    return '/placeholder.svg';
  }
  
  // Always return placeholder for Imgur URLs
  if (isImgurUrl(url)) {
    console.log('Imgur URL detected, using placeholder instead:', url);
    return '/placeholder.svg';
  }
  
  // If it's already a full URL (but not imgur), use it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a Supabase storage path, get the full URL 
  if (url.startsWith('public/') || url.startsWith('items/')) {
    try {
      const fullUrl = getSupabaseImageUrl(url);
      console.log('Transformed Supabase URL:', fullUrl);
      return fullUrl;
    } catch (error) {
      console.error('Error transforming Supabase URL:', error);
      return '/placeholder.svg';
    }
  }
  
  // If it's a relative path from public folder
  if (url.startsWith('/')) {
    return url;
  }
  
  // For any other case, use placeholder
  console.log('Unknown URL format, using placeholder:', url);
  return '/placeholder.svg';
};

// Get default images by item type
export const getDefaultImageByType = (type: string): string => {
  return '/placeholder.svg';
};
