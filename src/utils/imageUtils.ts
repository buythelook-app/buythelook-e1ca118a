
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
 * Enhanced function to extract usable image URL from Zara's image data
 * Now with better handling for shoes and fallback options
 * @param imageData - The image data from Zara API or database
 * @returns A usable image URL with suitable pattern or placeholder
 */
export const extractZaraImageUrl = (imageData: ZaraImageData): string => {
  try {
    // Handle null/undefined
    if (imageData === null || imageData === undefined) {
      console.log('🔍 [ImageUtils] Image data is null or undefined');
      return '/placeholder.svg';
    }
    
    let imageUrls: string[] = [];
    
    // Direct handling for arrays (jsonb arrays from zara_cloth table)
    if (Array.isArray(imageData) && imageData.length > 0) {
      imageUrls = imageData.filter(url => typeof url === 'string' && url.trim() !== '');
      console.log(`🔍 [ImageUtils] Found ${imageUrls.length} URLs in array`);
    }
    
    // Handle string URL directly
    else if (typeof imageData === 'string') {
      const trimmedData = imageData.trim();
      
      // If it's already a URL, check if it's a suitable no-model image
      if (trimmedData.startsWith('https://') || trimmedData.startsWith('http://')) {
        // Check for 6th+ image without model pattern
        if (/_[6-9]_\d+_1\.jpg/.test(trimmedData)) {
          console.log(`✅ [ImageUtils] Found direct no-model URL: ${trimmedData}`);
          return trimmedData;
        }
        imageUrls = [trimmedData];
      }
      
      // Handle JSON string arrays like "[\"https://static.zara.net/photos/...jpg\"]"
      else {
        try {
          const parsed = JSON.parse(trimmedData);
          
          // If parsed into array, get all items
          if (Array.isArray(parsed)) {
            imageUrls = parsed.filter(url => typeof url === 'string' && url.trim() !== '');
            console.log(`✅ [ImageUtils] Successfully parsed JSON string array with ${imageUrls.length} URLs`);
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
          console.warn('⚠️ [ImageUtils] JSON parsing failed for image data:', trimmedData.substring(0, 100), e);
          // If parsing fails, return the string as-is (might be a URL)
          imageUrls = [trimmedData];
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
    
    // Remove duplicates and empty URLs
    imageUrls = [...new Set(imageUrls.filter(url => url && url.trim() !== ''))];
    
    console.log(`🔍 [ImageUtils] Total unique URLs found: ${imageUrls.length}`);
    
    // Enhanced selection strategy for best images
    // 1. First priority: 6th+ images without model (best for shoes)
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
      
      console.log(`✅ [ImageUtils] Found ${noModelImages.length} no-model images, using: ${noModelImages[0]}`);
      return noModelImages[0];
    }
    
    // 2. Second priority: Any image with reasonable pattern (_\d+_\d+_\d+\.jpg)
    const reasonableImages = imageUrls.filter(url => /_\d+_\d+_\d+\.jpg/.test(url));
    
    if (reasonableImages.length > 0) {
      console.log(`⚠️ [ImageUtils] No ideal no-model images found, using reasonable image: ${reasonableImages[0]}`);
      return reasonableImages[0];
    }
    
    // 3. Third priority: Any HTTPS URL that looks like an image
    const anyImageUrls = imageUrls.filter(url => 
      url.startsWith('https://') && 
      (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.webp'))
    );
    
    if (anyImageUrls.length > 0) {
      console.log(`⚠️ [ImageUtils] Using fallback image URL: ${anyImageUrls[0]}`);
      return anyImageUrls[0];
    }
    
    // 4. Last resort: Any URL
    if (imageUrls.length > 0) {
      console.log(`⚠️ [ImageUtils] Using last resort URL: ${imageUrls[0]}`);
      return imageUrls[0];
    }
    
    // NO suitable images found
    console.log('❌ [ImageUtils] No suitable images found, using placeholder. Available URLs:', imageUrls.slice(0, 3));
    return '/placeholder.svg';
    
  } catch (error) {
    console.error('❌ [ImageUtils] Error extracting image URL:', error);
    return '/placeholder.svg';
  }
};

/**
 * Specific function for shoes image extraction with enhanced fallbacks
 */
export const extractShoesImageUrl = (imageData: ZaraImageData): string => {
  const url = extractZaraImageUrl(imageData);
  
  // If we got a placeholder, it means we couldn't find any suitable image
  if (url === '/placeholder.svg') {
    console.log('👟 [ImageUtils] Using shoe placeholder due to no suitable images found');
    // You could return a specific shoe placeholder here if you have one
    return '/placeholder.svg';
  }
  
  console.log(`👟 [ImageUtils] Selected shoe image: ${url}`);
  return url;
};
