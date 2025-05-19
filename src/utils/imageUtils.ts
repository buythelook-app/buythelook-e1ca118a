
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

// Helper type for our image extraction function
type ZaraImageData = string | string[] | { url?: string } | { [key: string]: any } | null | undefined;

/**
 * Extracts a usable image URL from Zara's various image data formats
 * @param imageData - The image data from Zara API or database
 * @returns A usable image URL or placeholder
 */
export const extractZaraImageUrl = (imageData: ZaraImageData): string => {
  try {
    // Handle null/undefined
    if (imageData === null || imageData === undefined) {
      console.log('Image data is null or undefined');
      return '/placeholder.svg';
    }
    
    // Handle string URL directly
    if (typeof imageData === 'string') {
      if (imageData.startsWith('https://') || imageData.startsWith('http://')) {
        return imageData;
      }
      
      // Try parsing JSON string
      try {
        const parsed = JSON.parse(imageData);
        
        // Handle array of URLs
        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstItem = parsed[0];
          if (typeof firstItem === 'string') {
            return firstItem;
          }
        }
        
        // Handle object with URL property
        if (parsed && typeof parsed === 'object') {
          if (typeof parsed.url === 'string') {
            return parsed.url;
          }
          
          // Search for URL-like strings in object properties
          for (const key in parsed) {
            if (Object.prototype.hasOwnProperty.call(parsed, key)) {
              const value = parsed[key];
              if (typeof value === 'string' && (value.startsWith('https://') || value.startsWith('http://'))) {
                return value;
              }
            }
          }
        }
      } catch (e) {
        // If parsing fails, return the string as-is
        return imageData;
      }
    }
    
    // Handle array directly
    if (Array.isArray(imageData) && imageData.length > 0) {
      const firstItem = imageData[0];
      if (typeof firstItem === 'string') {
        return firstItem;
      }
    }
    
    // Handle object with URL property - FIX: Check if it's an object first and not an array
    if (typeof imageData === 'object' && imageData !== null && !Array.isArray(imageData)) {
      // Now we know it's an object and not an array, so this is safe
      const objData = imageData as { url?: string; [key: string]: any };
      
      if (typeof objData.url === 'string') {
        return objData.url;
      }
      
      // Search for URL-like strings in object properties
      for (const key in objData) {
        if (Object.prototype.hasOwnProperty.call(objData, key)) {
          const value = objData[key];
          if (typeof value === 'string' && (value.startsWith('https://') || value.startsWith('http://'))) {
            return value;
          }
          
          // Check for arrays that might contain URLs
          if (Array.isArray(value) && value.length > 0) {
            const firstInArray = value[0];
            if (typeof firstInArray === 'string' && (firstInArray.startsWith('https://') || firstInArray.startsWith('http://'))) {
              return firstInArray;
            }
          }
        }
      }
    }
    
    console.log('No suitable image URL found in data', imageData);
    return '/placeholder.svg';
  } catch (error) {
    console.error('Error extracting image URL:', error);
    return '/placeholder.svg';
  }
};
