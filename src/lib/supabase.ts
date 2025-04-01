
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
    console.log('[Supabase] Blocking all items paths:', path);
    return true;
  }
  
  return BLOCKED_PATHS.some(blockedPath => path.includes(blockedPath));
};

// Helper for getting public URLs for images
export const getImageUrl = (path: string): string => {
  if (!path || path.trim() === '') {
    console.log('[Supabase] Empty path, using placeholder');
    return '/placeholder.svg';
  }
  
  // Block all storage items paths
  if (path.startsWith('items/')) {
    console.log('[Supabase] Blocking all items paths:', path);
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
  
  // If it's already a URL, verify it's not from blocked storage
  if (path.startsWith('http://') || path.startsWith('https://')) {
    // Block all URLs from the items storage
    if (path.includes('/storage/v1/object/public/items/')) {
      console.log('[Supabase] Blocking URL from items storage:', path);
      return '/placeholder.svg';
    }
    
    if (path.includes('null') || path.includes('undefined') || isBlockedPath(path)) {
      console.log('[Supabase] Invalid or blocked URL, using placeholder:', path);
      return '/placeholder.svg';
    }
    return path;
  }
  
  // Block all storage items paths
  if (path.startsWith('public/') || path.startsWith('items/')) {
    console.log('[Supabase] Blocking all storage paths:', path);
    return '/placeholder.svg';
  }
  
  // For any other case, use placeholder to be safe
  console.log('[Supabase] Using placeholder for unrecognized path pattern:', path);
  return '/placeholder.svg';
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
