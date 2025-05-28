
/**
 * Helper function to check if an image URL has the specific _6_x_1.jpg pattern
 * Only accepts Zara main product photos with this specific pattern
 */
export const isValidImagePattern = (imageData: any): boolean => {
  if (!imageData) {
    console.log('🔍 [DEBUG] No image data provided');
    return false;
  }
  
  // Handle different image data formats
  let imageUrls: string[] = [];
  
  if (typeof imageData === 'string') {
    // Handle JSON string arrays like "[\"https://static.zara.net/photos/...jpg\"]"
    try {
      const parsed = JSON.parse(imageData);
      if (Array.isArray(parsed)) {
        imageUrls = parsed.filter(url => typeof url === 'string');
        console.log(`🔍 [DEBUG] Parsed JSON array with ${imageUrls.length} URLs`);
      } else {
        imageUrls = [imageData];
        console.log(`🔍 [DEBUG] Using string directly: ${imageData}`);
      }
    } catch {
      imageUrls = [imageData];
      console.log(`🔍 [DEBUG] Failed to parse JSON, using string directly: ${imageData}`);
    }
  } else if (Array.isArray(imageData)) {
    imageUrls = imageData.filter(url => typeof url === 'string');
    console.log(`🔍 [DEBUG] Using array with ${imageUrls.length} URLs`);
  } else if (typeof imageData === 'object' && imageData.url) {
    imageUrls = [imageData.url];
    console.log(`🔍 [DEBUG] Using URL from object: ${imageData.url}`);
  } else {
    console.log(`🔍 [DEBUG] Unknown image data format:`, typeof imageData, imageData);
    return false;
  }
  
  // STRICTLY check if any URL contains the _6_x_1.jpg pattern (main product photos)
  const hasValidPattern = imageUrls.some(url => /_6_\d+_1\.jpg/.test(url));
  
  console.log(`🔍 [DEBUG] Found ${imageUrls.length} URLs, has _6_x_1.jpg pattern: ${hasValidPattern}`);
  if (hasValidPattern) {
    const validUrl = imageUrls.find(url => /_6_\d+_1\.jpg/.test(url));
    console.log(`🔍 [DEBUG] Valid URL found: ${validUrl}`);
  } else {
    console.log(`🔍 [DEBUG] NO _6_x_1.jpg pattern found in URLs:`, imageUrls);
  }
  
  return hasValidPattern;
};

/**
 * Helper function to extract the main product image URL (_6_x_1.jpg pattern)
 * Returns placeholder if no _6_x_1.jpg pattern is found
 */
export const extractMainProductImage = (imageData: any): string => {
  if (!imageData) {
    return '/placeholder.svg';
  }
  
  let imageUrls: string[] = [];
  
  if (typeof imageData === 'string') {
    try {
      const parsed = JSON.parse(imageData);
      if (Array.isArray(parsed)) {
        imageUrls = parsed.filter(url => typeof url === 'string');
      } else {
        imageUrls = [imageData];
      }
    } catch {
      imageUrls = [imageData];
    }
  } else if (Array.isArray(imageData)) {
    imageUrls = imageData.filter(url => typeof url === 'string');
  } else if (typeof imageData === 'object' && imageData.url) {
    imageUrls = [imageData.url];
  }
  
  // STRICTLY find the first URL with _6_x_1.jpg pattern - NO FALLBACK
  const mainImage = imageUrls.find(url => /_6_\d+_1\.jpg/.test(url));
  
  if (mainImage) {
    console.log(`🔍 [DEBUG] Found _6_x_1.jpg image: ${mainImage}`);
    return mainImage;
  } else {
    console.log(`🔍 [DEBUG] NO _6_x_1.jpg image found, using placeholder`);
    return '/placeholder.svg';
  }
};
