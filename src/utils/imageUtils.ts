
/**
 * Utility functions for handling image URLs and transformations.
 */

import { getImageUrl as getSupabaseImageUrl } from "@/lib/supabase";

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
  // Block all URLs from Supabase storage items path
  if (url.startsWith(BLOCKED_STORAGE_PREFIX)) {
    console.log('Blocking URL from Supabase storage items path:', url);
    return true;
  }
  
  // Also check specific blacklisted paths/filenames
  return BLACKLISTED_URLS.some(blocked => url.includes(blocked));
};

/**
 * Transform image URL for display, prioritizing Supabase storage
 */
export const transformImageUrl = (url: string): string => {
  // Return placeholder for empty URLs
  if (!url || url.trim() === '') {
    console.log('Empty URL, using placeholder');
    return '/placeholder.svg';
  }
  
  // Check if URL is blocked
  if (isBlockedUrl(url)) {
    console.log('Blocked URL detected, using placeholder:', url);
    return '/placeholder.svg';
  }
  
  // If it's a Supabase storage path, don't convert it - use placeholder instead
  if (url.startsWith('public/') || url.startsWith('items/')) {
    // We're blocking all Supabase storage items, so return placeholder
    console.log('Supabase storage path detected, using placeholder instead:', url);
    return '/placeholder.svg';
  }
  
  // If it's already a full URL, check if it's from blocked storage
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Block all URLs from Supabase storage items path
    if (isBlockedUrl(url)) {
      console.log('Blocked full URL detected, using placeholder:', url);
      return '/placeholder.svg';
    }
    
    // For other URLs, use as is
    return url;
  }
  
  // If it's a relative path from public folder
  if (url.startsWith('/')) {
    return url;
  }
  
  // For any other case, use placeholder to be safe
  console.log('Using placeholder for unrecognized URL pattern:', url);
  return '/placeholder.svg';
};

// Get default images by item type
export const getDefaultImageByType = (type: string): string => {
  // Always return placeholder for any type to avoid problematic URLs
  return '/placeholder.svg';
};
