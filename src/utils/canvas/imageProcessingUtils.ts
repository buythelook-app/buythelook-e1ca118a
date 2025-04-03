
/**
 * Utilities for processing images on canvas
 */

/**
 * Process image for background removal
 */
export const processImageForCanvas = async (
  img: HTMLImageElement
): Promise<HTMLCanvasElement> => {
  const offscreenCanvas = document.createElement('canvas');
  const offscreenCtx = offscreenCanvas.getContext('2d', { alpha: true, willReadFrequently: true });
  
  if (!offscreenCtx) {
    throw new Error("Could not create offscreen canvas context");
  }

  offscreenCanvas.width = img.width;
  offscreenCanvas.height = img.height;

  // Ensure high quality image rendering
  offscreenCtx.imageSmoothingEnabled = true;
  offscreenCtx.imageSmoothingQuality = 'high';
  
  // Draw the image onto the offscreen canvas
  offscreenCtx.drawImage(img, 0, 0);
  
  // Background removal for all items
  const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
  const data = imageData.data;
  
  // Improved background detection algorithm
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Calculate color difference to detect white/light gray background
    const avgColor = (r + g + b) / 3;
    const colorDeviation = Math.abs(r - avgColor) + Math.abs(g - avgColor) + Math.abs(b - avgColor);
    
    // More precise background detection
    if (avgColor > 240 && colorDeviation < 30) {
      data[i + 3] = 0; // Make fully transparent
    } else if (avgColor > 200 && colorDeviation < 20) {
      data[i + 3] = Math.max(0, data[i + 3] - 200); // Make partially transparent
    }
  }
  
  offscreenCtx.putImageData(imageData, 0, 0);
  return offscreenCanvas;
};
