
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

// Helper type for our image extraction function - now exported
export type ZaraImageData = string | string[] | { url?: string } | { [key: string]: any } | null | undefined;

/**
 * Extracts a usable image URL from Zara's various image data formats
 * Looks for images 6th and higher without models (_6_x_1.jpg and up)
 * @param imageData - The image data from Zara API or database
 * @returns A usable image URL with suitable pattern or placeholder
 */
export const extractZaraImageUrl = (imageData: ZaraImageData): string => {
  try {
    // Handle null/undefined
    if (imageData === null || imageData === undefined) {
      console.log('Image data is null or undefined');
      return '/placeholder.svg';
    }
    
    let imageUrls: string[] = [];
    
    // Direct handling for arrays (jsonb arrays from zara_cloth table)
    if (Array.isArray(imageData) && imageData.length > 0) {
      imageUrls = imageData.filter(url => typeof url === 'string');
    }
    
    // Handle string URL directly
    else if (typeof imageData === 'string') {
      // If it's already a URL, check if it's a suitable no-model image
      if (imageData.startsWith('https://') || imageData.startsWith('http://')) {
        // Check for 6th+ image without model pattern
        if (/_[6-9]_\d+_1\.jpg/.test(imageData)) {
          console.log(`Found direct no-model URL: ${imageData}`);
          return imageData;
        }
        imageUrls = [imageData];
      }
      
      // Handle JSON string arrays like "[\"https://static.zara.net/photos/...jpg\"]"
      else {
        try {
          const parsed = JSON.parse(imageData);
          
          // If parsed into array, get all items
          if (Array.isArray(parsed)) {
            imageUrls = parsed.filter(url => typeof url === 'string');
            console.log(`Successfully parsed JSON string array with ${imageUrls.length} URLs`);
          }
          
          // If parsed into object, look for URL
          else if (parsed && typeof parsed === 'object') {
            if (typeof parsed.url === 'string') {
              imageUrls = [parsed.url];
            }
            
            // Search for URL-like strings in object properties
            for (const key in parsed) {
              if (Object.prototype.hasOwnProperty.call(parsed, key)) {
                const value = parsed[key];
                if (typeof value === 'string' && (value.startsWith('https://') || value.startsWith('http://'))) {
                  imageUrls.push(value);
                }
              }
            }
          }
        } catch (e) {
          console.warn('JSON parsing failed for image data:', imageData, e);
          // If parsing fails, return the string as-is (might be a URL)
          imageUrls = [imageData];
        }
      }
    }
    
    // Handle object with URL property
    else if (typeof imageData === 'object' && imageData !== null) {
      const objData = imageData as { url?: string; [key: string]: any };
      
      if (typeof objData.url === 'string') {
        imageUrls = [objData.url];
      }
      
      // Search for URL-like strings in object properties
      for (const key in objData) {
        if (Object.prototype.hasOwnProperty.call(objData, key)) {
          const value = objData[key];
          if (typeof value === 'string' && (value.startsWith('https://') || value.startsWith('http://'))) {
            imageUrls.push(value);
          }
          
          // Check for arrays that might contain URLs
          if (Array.isArray(value) && value.length > 0) {
            const urlsInArray = value.filter(item => 
              typeof item === 'string' && (item.startsWith('https://') || item.startsWith('http://'))
            );
            imageUrls.push(...urlsInArray);
          }
        }
      }
    }
    
    // Find the best no-model image (6th and higher without model)
    const noModelImages = imageUrls.filter(url => /_[6-9]_\d+_1\.jpg/.test(url));
    
    if (noModelImages.length > 0) {
      // Sort by image number to get the best one (prefer 6th, then 7th, etc.)
      noModelImages.sort((a, b) => {
        const aMatch = a.match(/_([6-9])_\d+_1\.jpg/);
        const bMatch = b.match(/_([6-9])_\d+_1\.jpg/);
        if (aMatch && bMatch) {
          return parseInt(aMatch[1]) - parseInt(bMatch[1]);
        }
        return 0;
      });
      
      console.log(`Found ${noModelImages.length} no-model images, using: ${noModelImages[0]}`);
      return noModelImages[0];
    }
    
    // NO FALLBACK - return placeholder if no suitable images found
    console.log('No suitable no-model images found, using placeholder. Available URLs:', imageUrls);
    return '/placeholder.svg';
    
  } catch (error) {
    console.error('Error extracting image URL:', error);
    return '/placeholder.svg';
  }
};
