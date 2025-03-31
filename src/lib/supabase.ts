
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aqkeprwxxsryropnhfvm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2Vwcnd4eHNyeXJvcG5oZnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MzE4MjksImV4cCI6MjA1MzQwNzgyOX0.1nstrLtlahU3kGAu-UrzgOVw6XwyKU6n5H5q4Taqtus';

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

// Helper for getting public URLs for images
export const getImageUrl = (path: string): string => {
  if (!path) return '';
  
  // If it's already an HTTPS URL, return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it's a path in storage
  if (path.startsWith('public/') || path.startsWith('items/')) {
    // Construct URL to storage
    return `${supabaseUrl}/storage/v1/object/public/${path}`;
  }
  
  // Return as is if we can't determine the type
  return path;
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
