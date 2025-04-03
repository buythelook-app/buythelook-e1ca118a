
/**
 * Utility functions for canvas operations and image handling
 */

import { transformImageUrl } from "./imageUtils";

/**
 * Interface for position data
 */
export interface PositionData {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Configure canvas with device pixel ratio for high-resolution rendering
 */
export const setupCanvas = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D | null => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error("Canvas context could not be created");
    return null;
  }

  // Set up canvas with device pixel ratio
  const scale = window.devicePixelRatio || 1;
  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);

  // Clear and set background
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  return ctx;
};

/**
 * Draw a debug center line
 */
export const drawCenterLine = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  const centerX = width / 2;
  ctx.beginPath();
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, height);
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
  ctx.stroke();
};

/**
 * Draw debug information for an image placement
 */
export const drawDebugInfo = (
  ctx: CanvasRenderingContext2D,
  xPos: number,
  yPos: number,
  width: number,
  height: number,
  itemType: string,
  centerPoint: number
) => {
  ctx.save();
  
  // Draw a vertical line at the center of the item position
  ctx.beginPath();
  ctx.moveTo(centerPoint, yPos - 20);
  ctx.lineTo(centerPoint, yPos + height + 20);
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
  ctx.stroke();
  
  // Draw outline of the image bounds
  ctx.strokeStyle = 'rgba(0, 0, 255, 0.3)';
  ctx.strokeRect(xPos, yPos, width, height);
  
  // Draw item type label
  ctx.font = '12px Arial';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillText(itemType, xPos + 5, yPos + 15);
  
  ctx.restore();
};

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

/**
 * Default positions for different item types
 */
export const getDefaultPositions = (width: number, height: number): Record<string, PositionData> => {
  const centerX = width / 2;
  
  return {
    outerwear: { x: centerX, y: height * 0.15, width: width * 0.7, height: height * 0.4 },
    top: { x: centerX, y: height * 0.15, width: width * 0.7, height: height * 0.4 },
    bottom: { x: centerX, y: height * 0.5, width: width * 0.6, height: height * 0.4 },
    dress: { x: centerX, y: height * 0.3, width: width * 0.7, height: height * 0.7 },
    shoes: { x: centerX, y: height * 0.75, width: width * 0.5, height: height * 0.2 }, 
    accessory: { x: centerX, y: height * 0.4, width: width * 0.4, height: height * 0.4 },
    sunglasses: { x: centerX, y: height * 0.1, width: width * 0.5, height: height * 0.2 },
    cart: { x: centerX, y: height * 0.4, width: width * 0.7, height: height * 0.4 }
  };
};
