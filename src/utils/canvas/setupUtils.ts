
/**
 * Core utilities for canvas setup and configuration
 */

import { PositionData } from './types';

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
