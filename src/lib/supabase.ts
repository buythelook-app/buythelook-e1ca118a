
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aqkeprwxxsryropnhfvm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2Vwcnd4eHNyeXJvcG5oZnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MzE4MjksImV4cCI6MjA1MzQwNzgyOX0.1nstrLtlahU3kGAu-UrzgOVw6XwyKU6n5H5q4Taqtus';

// Blocked paths
const BLOCKED_PATHS = [
  'items/default_shoes.png',
  'PzAHrXN.png',
  'RWCV0G0.png',
  '1j9ZXed.png'
];

// Connection status tracking
let isConnected = false;
let hasLoggedConnectionStatus = false;

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
  // Block all paths in the 'items' folder
  if (path.startsWith('items/')) {
    return true;
  }
  
  return BLOCKED_PATHS.some(blockedPath => path.includes(blockedPath));
};

// Helper for getting public URLs for images
export const getImageUrl = (path: string): string => {
  if (!path || path.trim() === '') {
    return '/placeholder.svg';
  }
  
  // Block all storage items paths
  if (path.startsWith('items/')) {
    return '/placeholder.svg';
  }
  
  // Check if path is blocked
  if (isBlockedPath(path)) {
    return '/placeholder.svg';
  }
  
  // Skip empty and invalid paths
  if (path === 'null' || path === 'undefined' || path.length < 3) {
    return '/placeholder.svg';
  }
  
  // If it's already a URL, verify it's not from blocked storage
  if (path.startsWith('http://') || path.startsWith('https://')) {
    // Block all URLs from the items storage
    if (path.includes('/storage/v1/object/public/items/')) {
      return '/placeholder.svg';
    }
    
    if (path.includes('null') || path.includes('undefined') || isBlockedPath(path)) {
      return '/placeholder.svg';
    }
    return path;
  }
  
  // Block all storage items paths
  if (path.startsWith('public/') || path.startsWith('items/')) {
    return '/placeholder.svg';
  }
  
  // For any other case, use placeholder to be safe
  return '/placeholder.svg';
};

// Log initialization only once
if (!hasLoggedConnectionStatus) {
  console.log('[Supabase] Client initialized with URL:', supabaseUrl);
  hasLoggedConnectionStatus = true;
}

// Helper to check Supabase connectivity with caching
export const checkSupabaseConnection = async () => {
  try {
    // Skip check if we've already verified connection
    if (isConnected) {
      return true;
    }
    
    const { count, error } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      if (!hasLoggedConnectionStatus) {
        console.error('[Supabase] Connection test failed:', error);
        hasLoggedConnectionStatus = true;
      }
      return false;
    }
    
    isConnected = true;
    
    if (!hasLoggedConnectionStatus) {
      console.log('[Supabase] Connection test successful. Items count:', count);
      hasLoggedConnectionStatus = true;
    }
    
    return true;
  } catch (err) {
    if (!hasLoggedConnectionStatus) {
      console.error('[Supabase] Connection test exception:', err);
      hasLoggedConnectionStatus = true;
    }
    return false;
  }
};

// Run a connection test on init, but don't log the result
checkSupabaseConnection();
