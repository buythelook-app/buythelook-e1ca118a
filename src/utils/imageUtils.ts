
/**
 * Utility functions for handling image URLs and transformations.
 */

import { getImageUrl as getSupabaseImageUrl } from "@/lib/supabase";

// Transform image URL for display
export const transformImageUrl = (url: string): string => {
  if (!url) return '';
  
  // If it's already a full URL, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.log('Using existing HTTPS URL:', url);
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
    console.log('Using relative path:', url);
    return url;
  }
  
  // Return as is if we can't determine the type
  console.log('Using URL as is:', url);
  return url;
};

// Add cache or timestamp to force image reload
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
         url.startsWith('data:image/');
};

// Get default images by item type
export const getDefaultImageByType = (type: string): string => {
  const fallbacks: Record<string, string> = {
    'top': 'https://i.imgur.com/1j9ZXed.png',
    'bottom': 'https://i.imgur.com/RWCV0G0.png',
    'shoes': 'https://i.imgur.com/PzAHrXN.png',
    'dress': 'https://i.imgur.com/1j9ZXed.png',
    'accessory': 'https://i.imgur.com/PzAHrXN.png',
    'sunglasses': 'https://i.imgur.com/PzAHrXN.png',
    'outerwear': 'https://i.imgur.com/1j9ZXed.png',
    'cart': 'https://i.imgur.com/1j9ZXed.png',
    'default': 'https://i.imgur.com/1j9ZXed.png'
  };
  
  return fallbacks[type.toLowerCase()] || fallbacks['default'];
};

// Debug function to log database items
export const logDatabaseItems = async () => {
  try {
    // Import supabase dynamically to avoid circular dependencies
    const { supabase } = await import('@/lib/supabase');
    
    console.log("Checking Supabase items table contents...");
    
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .limit(20);
      
    if (error) {
      console.error("Error fetching items:", error);
      return;
    }
    
    console.log(`Found ${data?.length || 0} items in the database:`, data);
    
    // Log image URLs specifically
    if (data && data.length > 0) {
      console.log("Image URLs in database:");
      data.forEach(item => {
        console.log(`${item.id} (${item.type}): ${item.image}`);
      });
    }
  } catch (err) {
    console.error("Exception in logDatabaseItems:", err);
  }
};
