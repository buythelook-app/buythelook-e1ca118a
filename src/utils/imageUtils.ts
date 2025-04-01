
/**
 * Utility functions for handling image URLs and transformations.
 */

import { getImageUrl as getSupabaseImageUrl } from "@/lib/supabase";

/**
 * Transform image URL for display, prioritizing Supabase storage
 */
export const transformImageUrl = (url: string): string => {
  // Return placeholder for empty URLs
  if (!url || url.trim() === '') {
    console.log('Empty URL, using placeholder');
    return '/placeholder.svg';
  }
  
  // If it's a Supabase storage path, get the full URL 
  if (url.startsWith('public/') || url.startsWith('items/')) {
    try {
      const fullUrl = getSupabaseImageUrl(url);
      console.log('Using Supabase URL:', fullUrl);
      return fullUrl;
    } catch (error) {
      console.error('Error with Supabase URL:', error);
      return '/placeholder.svg';
    }
  }
  
  // If it's already a full URL, use it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Convert to Supabase URL if possible based on user preferences
    try {
      // Extract the filename from the URL
      const filename = url.split('/').pop();
      if (filename) {
        // Try to find a matching file in Supabase storage
        const supabaseUrl = `items/${filename}`;
        const fullUrl = getSupabaseImageUrl(supabaseUrl);
        console.log('Converted external URL to Supabase URL:', fullUrl);
        return fullUrl;
      }
    } catch (error) {
      console.log('Using original URL as fallback:', url);
    }
    return url;
  }
  
  // If it's a relative path from public folder
  if (url.startsWith('/')) {
    return url;
  }
  
  // For any other case, try to interpret as Supabase path
  try {
    const fullUrl = getSupabaseImageUrl(`items/${url}`);
    console.log('Interpreted as Supabase path:', fullUrl);
    return fullUrl;
  } catch (error) {
    console.error('Error interpreting as Supabase path:', error);
    return '/placeholder.svg';
  }
};

// Get default images by item type from Supabase
export const getDefaultImageByType = (type: string): string => {
  const defaultPath = `items/default_${type.toLowerCase()}.png`;
  try {
    return getSupabaseImageUrl(defaultPath);
  } catch (error) {
    return '/placeholder.svg';
  }
};
