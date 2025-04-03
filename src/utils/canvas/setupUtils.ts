
/**
 * Core utilities for canvas setup and configuration
 */

import { PositionData } from '@/types/canvasTypes';

/**
 * Configure canvas with device pixel ratio for high-resolution rendering
 */
export const setupCanvas = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D | null => {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    console.error("Canvas context could not be created");
    return null;
  }

  // Set up canvas with device pixel ratio for higher quality on high-DPI displays
  const scale = window.devicePixelRatio || 1;
  
  // Set the canvas dimensions in actual pixels
  canvas.width = width * scale;
  canvas.height = height * scale;
  
  // Set rendering size in CSS pixels
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  
  // Scale the context to account for the device pixel ratio
  ctx.scale(scale, scale);
  
  // Configure for high quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Clear canvas with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  return ctx;
};

/**
 * Default positions for different item types - adjusted to start from top
 */
export const getDefaultPositions = (width: number, height: number): Record<string, PositionData> => {
  // Calculate the horizontal center of the canvas
  const centerX = Math.round(width / 2);
  
  return {
    outerwear: { x: centerX, y: height * 0.05, width: width * 0.8, height: height * 0.35 },
    top: { x: centerX, y: height * 0.05, width: width * 0.8, height: height * 0.35 },
    bottom: { x: centerX, y: height * 0.4, width: width * 0.7, height: height * 0.35 },
    dress: { x: centerX, y: height * 0.1, width: width * 0.8, height: height * 0.7 },
    shoes: { x: centerX, y: height * 0.75, width: width * 0.6, height: height * 0.2 },
    accessory: { x: centerX, y: height * 0.3, width: width * 0.5, height: height * 0.3 },
    sunglasses: { x: centerX, y: height * 0.05, width: width * 0.6, height: height * 0.15 },
    cart: { x: centerX, y: height * 0.3, width: width * 0.8, height: height * 0.4 }
  };
};
