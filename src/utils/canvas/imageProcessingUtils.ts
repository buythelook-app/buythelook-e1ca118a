
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
  const offscreenCtx = offscreenCanvas.getContext('2d');
  
  if (!offscreenCtx) {
    throw new Error("Could not create offscreen canvas context");
  }

  offscreenCanvas.width = img.width;
  offscreenCanvas.height = img.height;

  // Draw the image onto the offscreen canvas
  offscreenCtx.drawImage(img, 0, 0);
  
  // Background removal for all items
  const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    const avgColor = (r + g + b) / 3;
    if (avgColor > 180 && Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15) {
      data[i + 3] = 0;
    }
  }
  
  offscreenCtx.putImageData(imageData, 0, 0);
  return offscreenCanvas;
};
