
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aqkeprwxxsryropnhfvm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2Vwcnd4eHNyeXJvcG5oZnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MzE4MjksImV4cCI6MjA1MzQwNzgyOX0.1nstrLtlahU3kGAu-UrzgOVw6XwyKU6n5H5q4Taqtus';

// Blacklisted paths
const BLOCKED_PATHS = [
  'items/default_shoes.png',
  'PzAHrXN.png',
  'RWCV0G0.png',
  '1j9ZXed.png'
];

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: fetch,
  },
});

// Helper method to safely get the URL
export const getSupabaseUrl = () => {
  return supabaseUrl;
};

// Check if a path is blocked
const isBlockedPath = (path: string): boolean => {
  return BLOCKED_PATHS.some(blockedPath => path.includes(blockedPath));
};

// Helper for getting public URLs for images
export const getImageUrl = (path: string): string => {
  if (!path || path.trim() === '') {
    console.log('[Supabase] Empty path, using placeholder');
    return '/placeholder.svg';
  }
  
  // Check if path is blocked
  if (isBlockedPath(path)) {
    console.log('[Supabase] Blocked path detected, using placeholder:', path);
    return '/placeholder.svg';
  }
  
  // Skip empty and invalid paths
  if (path === 'null' || path === 'undefined' || path.length < 3) {
    console.log('[Supabase] Invalid path, using placeholder:', path);
    return '/placeholder.svg';
  }
  
  // If it's already a URL, verify before returning
  if (path.startsWith('http://') || path.startsWith('https://')) {
    if (path.includes('null') || path.includes('undefined') || isBlockedPath(path)) {
      console.log('[Supabase] Invalid or blocked URL, using placeholder:', path);
      return '/placeholder.svg';
    }
    return path;
  }
  
  // If it's a path in storage
  if (path.startsWith('public/') || path.startsWith('items/')) {
    // Check if path is blocked
    if (isBlockedPath(path)) {
      console.log('[Supabase] Blocked storage path, using placeholder:', path);
      return '/placeholder.svg';
    }
    
    try {
      // Construct URL to storage with cache busting
      const timestamp = Date.now();
      const imageUrl = `${supabaseUrl}/storage/v1/object/public/${path}?t=${timestamp}`;
      console.log('[Supabase] Generated storage URL:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('[Supabase] Error generating storage URL:', error);
      return '/placeholder.svg';
    }
  }
  
  // Try to interpret as a storage path with default bucket
  try {
    const fullPath = `items/${path}`;
    
    // Check if constructed path is blocked
    if (isBlockedPath(fullPath)) {
      console.log('[Supabase] Blocked constructed path, using placeholder:', fullPath);
      return '/placeholder.svg';
    }
    
    const timestamp = Date.now();
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/${fullPath}?t=${timestamp}`;
    console.log('[Supabase] Generated storage URL with default bucket:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('[Supabase] Error generating storage URL with default bucket:', error);
    return '/placeholder.svg';
  }
};

// Log initialization for debugging
console.log('[Supabase] Client initialized with URL:', supabaseUrl);

// Helper to check Supabase connectivity
export const checkSupabaseConnection = async () => {
  try {
    const { count, error } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('[Supabase] Connection test failed:', error);
      return false;
    }
    
    console.log('[Supabase] Connection test successful. Items count:', count);
    return true;
  } catch (err) {
    console.error('[Supabase] Connection test exception:', err);
    return false;
  }
};

// Run a connection test on init
checkSupabaseConnection();
