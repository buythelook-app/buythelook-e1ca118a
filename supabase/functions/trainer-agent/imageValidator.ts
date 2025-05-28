
/**
 * Helper function to check if an image URL has a valid product image pattern
 * More permissive approach to accept various product image formats
 */
export const isValidImagePattern = (imageData: any): boolean => {
  if (!imageData) {
    console.log('🔍 [DEBUG] No image data provided');
    return false;
  }
  
  // Handle different image data formats
  let imageUrl = '';
  
  if (typeof imageData === 'string') {
    // Handle JSON string arrays like "[\"https://static.zara.net/photos/...jpg\"]"
    try {
      const parsed = JSON.parse(imageData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        imageUrl = parsed[0];
        console.log(`🔍 [DEBUG] Parsed JSON array, using first image: ${imageUrl}`);
      } else {
        imageUrl = imageData;
        console.log(`🔍 [DEBUG] Using string directly: ${imageUrl}`);
      }
    } catch {
      imageUrl = imageData;
      console.log(`🔍 [DEBUG] Failed to parse JSON, using string directly: ${imageUrl}`);
    }
  } else if (Array.isArray(imageData) && imageData.length > 0) {
    imageUrl = imageData[0];
    console.log(`🔍 [DEBUG] Using first item from array: ${imageUrl}`);
  } else if (typeof imageData === 'object' && imageData.url) {
    imageUrl = imageData.url;
    console.log(`🔍 [DEBUG] Using URL from object: ${imageUrl}`);
  } else {
    console.log(`🔍 [DEBUG] Unknown image data format:`, typeof imageData, imageData);
    return false;
  }
  
  // More permissive validation - accept various product image patterns
  // Accept images that end with common product image patterns like:
  // - 6_x_1.jpg (original pattern)
  // - 2_x_1.jpg, 15_x_1.jpg etc (product variants)
  // - _1_1_1.jpg (zara product images)
  const productImagePattern = /(_\d+_\d+_\d+\.jpg|_\d+_1\.jpg|\d_\d+_1\.jpg)$/i;
  const isValid = productImagePattern.test(imageUrl);
  
  console.log(`🔍 [DEBUG] Image URL: ${imageUrl} | Pattern match: ${isValid}`);
  
  return isValid;
};
