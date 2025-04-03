
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

  // Preserve aspect ratio while fitting within maximum dimensions
  if (drawWidth / drawHeight > aspectRatio) {
    drawWidth = drawHeight * aspectRatio;
  } else {
    drawHeight = drawWidth / aspectRatio;
  }

  return { width: Math.round(drawWidth), height: Math.round(drawHeight) };
};

/**
 * Load an image with timeout and error handling
 */
export const loadImage = (
  imageUrl: string, 
  timeout = 8000
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    // Enable better image quality
    if (CSS.supports('image-rendering', 'crisp-edges')) {
      (img as any).style.imageRendering = 'crisp-edges';
    } else if (CSS.supports('image-rendering', 'pixelated')) {
      (img as any).style.imageRendering = 'pixelated';
    }
    
    // Use original URL without cache-busting for better CDN caching
    // Only append timestamp for local development or debugging
    const isDev = window.location.hostname === 'localhost';
    const finalUrl = isDev 
      ? `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${new Date().getTime()}`
      : imageUrl;
    
    let isResolved = false;
    
    img.onload = () => {
      if (!isResolved) {
        isResolved = true;
        console.log(`Image loaded successfully: ${finalUrl}, size: ${img.width}x${img.height}`);
        resolve(img);
      }
    };
    
    img.onerror = (e) => {
      if (!isResolved) {
        isResolved = true;
        console.error(`Failed to load image: ${finalUrl}`, e);
        reject(new Error(`Failed to load image: ${finalUrl}`));
      }
    };
    
    // Set a timeout in case the image never loads or errors
    setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        console.warn(`Image load timed out: ${finalUrl}`);
        reject(new Error(`Image load timed out: ${finalUrl}`));
      }
    }, timeout);
    
    img.src = finalUrl;
  });
};
