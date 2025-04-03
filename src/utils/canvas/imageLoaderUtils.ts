
/**
 * Utilities for loading and sizing images
 */

/**
 * Calculate dimensions preserving aspect ratio
 */
export const calculateDimensions = (
  imgWidth: number,
  imgHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const aspectRatio = imgWidth / imgHeight;
  let drawWidth = maxWidth;
  let drawHeight = maxHeight;

  if (drawWidth / drawHeight > aspectRatio) {
    drawWidth = drawHeight * aspectRatio;
  } else {
    drawHeight = drawWidth / aspectRatio;
  }

  return { width: drawWidth, height: drawHeight };
};

/**
 * Load an image with timeout and error handling
 */
export const loadImage = (
  imageUrl: string, 
  timeout = 5000
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    // Append a timestamp to bypass cache
    const timestamp = new Date().getTime();
    const finalUrl = imageUrl.includes('?') 
      ? `${imageUrl}&t=${timestamp}` 
      : `${imageUrl}?t=${timestamp}`;
    
    let isResolved = false;
    
    img.onload = () => {
      if (!isResolved) {
        isResolved = true;
        resolve(img);
      }
    };
    
    img.onerror = (e) => {
      if (!isResolved) {
        isResolved = true;
        reject(new Error(`Failed to load image: ${finalUrl}`));
      }
    };
    
    // Set a timeout in case the image never loads or errors
    setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        reject(new Error(`Image load timed out: ${finalUrl}`));
      }
    }, timeout);
    
    img.src = finalUrl;
  });
};
