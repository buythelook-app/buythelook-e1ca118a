
/**
 * Utility functions for handling image URLs and transformations.
 */

import { getImageUrl as getSupabaseImageUrl } from "@/lib/supabase";

// Transform image URL for display
export const transformImageUrl = (url: string): string => {
  if (!url) return '';
  
  // If it's already a full URL, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // For imgur images, ensure we're using HTTPS
    if (url.includes('imgur.com') && url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }
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
  
  // Special handling for image URLs that might need a protocol
  if (url.includes('imgur.com') && !url.startsWith('http')) {
    return `https://${url}`;
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
         url.startsWith('data:image/');
};

// Get default images by item type - using direct HTTPS URLs
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

// Log detailed image information
export const logImageDetails = (imageUrl: string, component: string, itemId?: string): void => {
  console.log(`[${component}] Processing image:`, {
    originalUrl: imageUrl,
    transformedUrl: transformImageUrl(imageUrl),
    forItem: itemId || 'unknown'
  });
};
