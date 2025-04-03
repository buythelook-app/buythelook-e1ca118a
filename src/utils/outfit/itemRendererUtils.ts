
/**
 * Utilities for rendering outfit items
 */

import { loadImage, calculateDimensions } from "../canvas";
import { renderColorBlock } from "./colorUtils";
import { transformImageUrl } from "../imageUtils";

interface OutfitItem {
  image?: string[];
  color?: string;
}

/**
 * Renders a single outfit item (either image or color block)
 */
export const renderOutfitItem = async ({ 
  item, 
  ctx, 
  centerX, 
  positionY, 
  maxWidth, 
  maxHeight 
}: {
  item: OutfitItem | string;
  ctx: CanvasRenderingContext2D;
  centerX: number;
  positionY: number;
  maxWidth: number;
  maxHeight: number;
}): Promise<void> => {
  try {
    // Handle case where item is a color string
    if (typeof item === 'string') {
      renderColorBlock({ ctx, centerX, positionY, width: maxWidth, height: maxHeight, color: item });
      return;
    }
    
    // Try to load and render image
    if (item.image && item.image.length > 0) {
      await renderItemImage({ 
        item, 
        ctx, 
        centerX, 
        positionY, 
        maxWidth, 
        maxHeight 
      });
    } else if (item.color) {
      // Use color block if no image available
      renderColorBlock({ 
        ctx, 
        centerX, 
        positionY, 
        width: maxWidth, 
        height: maxHeight, 
        color: item.color 
      });
    }
  } catch (error) {
    console.error("Error rendering outfit item:", error);
  }
};

/**
 * Renders an image item with background removal
 */
export const renderItemImage = async ({ 
  item, 
  ctx, 
  centerX, 
  positionY, 
  maxWidth, 
  maxHeight 
}: {
  item: OutfitItem;
  ctx: CanvasRenderingContext2D;
  centerX: number;
  positionY: number;
  maxWidth: number;
  maxHeight: number;
}) => {
  try {
    // Apply transformation to ensure best quality
    const imageUrl = transformImageUrl(item.image![0]);
    console.log('Loading image from URL:', imageUrl);
    
    const img = await loadImage(imageUrl);
    console.log(`Image loaded, dimensions: ${img.width}x${img.height}`);
    
    // Calculate dimensions while preserving aspect ratio
    // Increase the scale factor to make images larger
    const scaleFactor = 1.2; // Increase image size by 20%
    const { width: rawWidth, height: rawHeight } = calculateDimensions(
      img.width,
      img.height,
      maxWidth * scaleFactor,
      maxHeight * scaleFactor
    );
    
    // Round dimensions to prevent blurry rendering
    const drawWidth = Math.round(rawWidth);
    const drawHeight = Math.round(rawHeight);
    
    // Calculate X position for exact center alignment
    const xPos = centerX - (drawWidth / 2);
    
    // Calculate Y position to center vertically within the allocated space
    // This centers the image in its designated vertical space
    const yPos = positionY - (maxHeight * 0.1); // Shift up slightly to compensate for visual balance
    
    // Ensure high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(
      img,
      xPos, 
      yPos, 
      drawWidth, 
      drawHeight
    );
    
    console.log(`Image rendered at (${xPos}, ${yPos}) with dimensions ${drawWidth}x${drawHeight}`);
  } catch (error) {
    console.error('Error rendering image:', error);
    // Fallback to color block if image fails to load
    renderColorBlock({ 
      ctx, 
      centerX, 
      positionY, 
      width: maxWidth, 
      height: maxHeight, 
      color: item.color || "#CCCCCC" 
    });
  }
};
