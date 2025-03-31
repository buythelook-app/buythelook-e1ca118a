
/**
 * Utility functions for handling image URLs and transformations.
 */

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

// Get a fallback image if the primary image fails
export const getFallbackImage = (type: string): string => {
  const fallbacks: Record<string, string> = {
    'top': 'https://i.imgur.com/1j9ZXed.png',
    'bottom': 'https://i.imgur.com/RWCV0G0.png',
    'shoes': 'https://i.imgur.com/PzAHrXN.png',
    'dress': 'https://i.imgur.com/1j9ZXed.png',
    'accessory': 'https://i.imgur.com/PzAHrXN.png',
    'sunglasses': 'https://i.imgur.com/PzAHrXN.png',
    'outerwear': 'https://i.imgur.com/1j9ZXed.png'
  };
  
  return fallbacks[type.toLowerCase()] || 'https://i.imgur.com/1j9ZXed.png';
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
