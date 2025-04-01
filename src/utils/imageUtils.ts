
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
  
  // If it's already a full URL (but not imgur), return it
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
      return getSupabaseImageUrl(url);
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
  return '/placeholder.svg';
};

// Get default images by item type
export const getDefaultImageByType = (type: string): string => {
  return '/placeholder.svg';
};
