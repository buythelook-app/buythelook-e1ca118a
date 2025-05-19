
export const transformImageUrl = (url: string) => {
  if (!url) return '';
  // Only transform URLs from the review environment
  return url.replace(
    'http://review--ai-bundle-construct-20.lovable.app',
    'https://bc0cf4d7-9a35-4a65-b424-9d5ecd554d30.lovableproject.com'
  );
};

export const validateImageUrl = (url: string): boolean => {
  return url && (
    url.startsWith('http://review--ai-bundle-construct-20.lovable.app') ||
    url.startsWith('https://bc0cf4d7-9a35-4a65-b424-9d5ecd554d30.lovableproject.com')
  );
};

// Function to extract URL from Zara image field format
export const extractZaraImageUrl = (imageData: any): string => {
  try {
    // If it's null or undefined
    if (!imageData) {
      return '/placeholder.svg';
    }
    
    // If it's already a string URL
    if (typeof imageData === 'string') {
      if (imageData.startsWith('https://static.zara.net/')) {
        return imageData;
      }
      
      try {
        // Check if it's a stringified JSON
        const parsed = JSON.parse(imageData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
        return parsed.url || parsed.toString() || '/placeholder.svg';
      } catch {
        return imageData || '/placeholder.svg';
      }
    }
    
    // If it's an array, take the first element
    if (Array.isArray(imageData)) {
      if (imageData.length === 0) return '/placeholder.svg';
      return typeof imageData[0] === 'string' ? imageData[0] : '/placeholder.svg';
    }
    
    // If it's an object, look for common URL patterns
    if (typeof imageData === 'object') {
      // Return the first URL-like string we find
      const urlKeys = Object.keys(imageData).find(key => 
        typeof imageData[key] === 'string' && 
        imageData[key].startsWith('https://static.zara.net/')
      );
      
      if (urlKeys) {
        return imageData[urlKeys];
      }
      
      // Try to parse it as JSON string
      return '/placeholder.svg';
    }
    
    return '/placeholder.svg';
  } catch (error) {
    console.error('Error extracting image URL:', error);
    return '/placeholder.svg';
  }
};
