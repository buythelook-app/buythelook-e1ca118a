
/**
 * Utility functions for handling image URLs and transformations.
 */

import { getImageUrl as getSupabaseImageUrl } from "@/lib/supabase";

// Transform image URL for display
export const transformImageUrl = (url: string): string => {
  if (!url || url.trim() === '') {
    console.log('Empty URL, using placeholder');
    return '/placeholder.svg';
  }
  
  // Always use local placeholder for imgur URLs
  if (url.includes('imgur.com')) {
    console.log('Using local placeholder instead of Imgur URL:', url);
    return '/placeholder.svg';
  }
  
  // If it's already a full URL (but not imgur), validate it
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
