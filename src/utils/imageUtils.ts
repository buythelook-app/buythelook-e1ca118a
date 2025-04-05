
/**
 * Utility functions for handling image URLs and transformations.
 */

// Block all Supabase storage items paths
const BLOCKED_STORAGE_PREFIX = 'https://aqkeprwxxsryropnhfvm.supabase.co/storage/v1/object/public/items';

// Blacklisted image URLs
const BLACKLISTED_URLS = [
  'items/default_shoes.png',
  'PzAHrXN.png',
  'RWCV0G0.png',
  '1j9ZXed.png'
];

/**
 * Check if a URL is in the blacklist or from blocked storage
 */
const isBlockedUrl = (url: string): boolean => {
  if (!url) return true;
  
  // Block all URLs from Supabase storage items path
  if (url.includes(BLOCKED_STORAGE_PREFIX)) {
    console.log('Blocking URL from Supabase storage items path:', url);
    return true;
  }
  
  // Also check specific blacklisted paths/filenames
  return BLACKLISTED_URLS.some(blocked => url.includes(blocked));
};

/**
 * Transform image URL for display, fixing issues with placeholder images
 */
export const transformImageUrl = (url: string): string => {
  // Return placeholder for empty URLs
  if (!url || url.trim() === '') {
    return '/placeholder.svg';
  }
  
  // Check if URL is blocked
  if (isBlockedUrl(url)) {
    return '/placeholder.svg';
  }
  
  // If it's a Supabase storage path, use placeholder
  if (url.startsWith('public/') || url.startsWith('items/')) {
    return '/placeholder.svg';
  }
  
  // Handle relative paths from public folder
  if (url.startsWith('/')) {
    return url;
  }
  
  // If it's already a full URL but not from blocked storage
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Block all URLs from blocked storage
    if (isBlockedUrl(url)) {
      return '/placeholder.svg';
    }
    
    // For other URLs, use as is
    return url;
  }
  
  // For any other case, use placeholder to be safe
  return '/placeholder.svg';
};

// Get default images by item type
export const getDefaultImageByType = (type: string): string => {
  return '/placeholder.svg';
};
