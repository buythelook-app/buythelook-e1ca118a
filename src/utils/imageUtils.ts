
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
      console.log('Image data is null or undefined');
      return '/placeholder.svg';
    }
    
    // If it's already a string URL
    if (typeof imageData === 'string') {
      console.log('Image data is a string:', imageData);
      if (imageData.startsWith('https://static.zara.net/')) {
        return imageData;
      }
      
      try {
        // Check if it's a stringified JSON
        const parsed = JSON.parse(imageData);
        console.log('Parsed JSON from string:', parsed);
        
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('Parsed data is an array, using first element:', parsed[0]);
          return parsed[0];
        }
        
        if (parsed && typeof parsed === 'object') {
          if (parsed.url) {
            console.log('Found URL in parsed object:', parsed.url);
            return parsed.url;
          }
          
          // Look for any string that looks like a URL
          for (const key in parsed) {
            const value = parsed[key];
            if (typeof value === 'string' && value.startsWith('http')) {
              console.log('Found URL-like string in parsed object:', value);
              return value;
            }
          }
        }
        
        console.log('No URL found in parsed object, using placeholder');
        return '/placeholder.svg';
      } catch (parseError) {
        console.log('Failed to parse string as JSON:', parseError);
        return imageData || '/placeholder.svg';
      }
    }
    
    // If it's an array, take the first element
    if (Array.isArray(imageData)) {
      console.log('Image data is an array of length:', imageData.length);
      if (imageData.length === 0) {
        console.log('Empty array, using placeholder');
        return '/placeholder.svg';
      }
      
      const firstItem = imageData[0];
      console.log('First item in array:', firstItem);
      
      if (typeof firstItem === 'string') {
        console.log('Using first string item from array');
        return firstItem;
      } else {
        console.log('First array item is not a string, using placeholder');
        return '/placeholder.svg';
      }
    }
    
    // If it's an object, look for common URL patterns
    if (typeof imageData === 'object' && imageData !== null) {
      console.log('Image data is an object:', JSON.stringify(imageData).slice(0, 100) + '...');
      
      // If the object has an explicit "url" property
      if (imageData.url && typeof imageData.url === 'string') {
        console.log('Found direct url property:', imageData.url);
        return imageData.url;
      }
      
      // Check for arrays in the object that might contain URLs
      for (const key in imageData) {
        if (Array.isArray(imageData[key]) && imageData[key].length > 0) {
          const firstInArray = imageData[key][0];
          if (typeof firstInArray === 'string' && firstInArray.startsWith('http')) {
            console.log(`Found URL in array at key "${key}":`, firstInArray);
            return firstInArray;
          }
        }
      }
      
      // Return the first URL-like string we find
      for (const key in imageData) {
        const value = imageData[key];
        if (typeof value === 'string' && value.startsWith('http')) {
          console.log(`Found URL at key "${key}":`, value);
          return value;
        }
      }
      
      console.log('No URL found in object properties, using placeholder');
      return '/placeholder.svg';
    }
    
    console.log('Unhandled image data type, using placeholder');
    return '/placeholder.svg';
  } catch (error) {
    console.error('Error extracting image URL:', error);
    return '/placeholder.svg';
  }
};
