
/**
 * Helper function to check if an image URL has the specific _6_1_1.jpg pattern or higher (6th image and up)
 * Only accepts Zara product photos without models (6th image and higher)
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
  
  // Check if any URL contains pattern _6_x_1.jpg or higher (6th image and up, without model)
  const hasValidPattern = imageUrls.some(url => /_[6-9]_\d+_1\.jpg/.test(url));
  
  console.log(`🔍 [DEBUG] Found ${imageUrls.length} URLs, has valid no-model pattern (6th+ image): ${hasValidPattern}`);
  if (hasValidPattern) {
    const validUrl = imageUrls.find(url => /_[6-9]_\d+_1\.jpg/.test(url));
    console.log(`🔍 [DEBUG] Valid no-model URL found: ${validUrl}`);
  } else {
    console.log(`🔍 [DEBUG] NO valid no-model pattern found in URLs:`, imageUrls);
  }
  
  return hasValidPattern;
};

/**
 * Helper function to extract the best product image URL (6th image and up, without model)
 * Returns placeholder if no suitable pattern is found
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
  
  // Find the best image - prioritize 6th, 7th, 8th, 9th images without model
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
    
    console.log(`🔍 [DEBUG] Found ${noModelImages.length} no-model images, using: ${noModelImages[0]}`);
    return noModelImages[0];
  } else {
    console.log(`🔍 [DEBUG] NO suitable no-model images found, using placeholder`);
    return '/placeholder.svg';
  }
};
