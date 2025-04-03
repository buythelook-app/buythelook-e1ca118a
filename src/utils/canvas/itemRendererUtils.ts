
import { loadImage, calculateDimensions, getDefaultPositions } from "@/utils/canvas";
import { transformImageUrl } from "@/utils/imageUtils";
import { type CanvasItem } from "@/types/canvasTypes";

/**
 * Renders a collection of items on the canvas
 */
export interface RenderCanvasItemsProps {
  ctx: CanvasRenderingContext2D;
  items: CanvasItem[];
  width: number; 
  height: number;
  onComplete: () => void;
  onError: (message: string) => void;
  occasion?: string; // Added optional occasion parameter
}

export const renderCanvasItems = async ({
  ctx,
  items,
  width,
  height,
  onComplete,
  onError,
  occasion
}: RenderCanvasItemsProps): Promise<void> => {
  try {
    if (items.length === 0) {
      // Handle empty items case
      ctx.font = '16px Arial';
      ctx.fillStyle = '#666666';
      ctx.textAlign = 'center';
      ctx.fillText('No items to display', width / 2, height / 2);
      onComplete();
      return;
    }

    // Sort items in correct rendering order (back to front)
    const renderOrder = { outerwear: 0, top: 1, bottom: 2, shoes: 3 };
    const sortedItems = [...items].sort((a, b) => {
      const orderA = renderOrder[a.type] ?? 999;
      const orderB = renderOrder[b.type] ?? 999;
      return orderA - orderB;
    });

    // Get default positions based on canvas dimensions
    const defaultPositions = getDefaultPositions(width, height);
    
    // Render each item
    let loadedCount = 0;
    const totalItems = sortedItems.length;
    let hasErrors = false;
    
    for (const item of sortedItems) {
      if (!item.image) {
        console.warn('Missing image for item:', item.id, item.type);
        loadedCount++;
        continue;
      }
      
      try {
        const transformedUrl = transformImageUrl(item.image);
        
        // Load the image
        const img = await loadImage(transformedUrl).catch(() => null);
        
        if (!img || img.naturalWidth === 0) {
          loadedCount++;
          continue;
        }

        // Get position for the item
        const position = item.position || defaultPositions[item.type];
        if (position) {
          // Calculate dimensions while preserving aspect ratio
          const { width: drawWidth, height: drawHeight } = calculateDimensions(
            img.width,
            img.height,
            position.width,
            position.height
          );

          // Use exact center
          const centerX = width / 2;
          
          // Calculate drawing position from center point
          const drawX = Math.round(centerX - (drawWidth / 2));
          const drawY = Math.round(position.y);
          
          // Draw the item at the calculated position
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        }
      } catch (itemError) {
        console.error('Error processing item:', itemError);
        hasErrors = true;
      }
      
      loadedCount++;
    }
    
    // Render occasion text at the bottom if provided
    if (occasion) {
      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = '#333333';
      ctx.textAlign = 'center';
      ctx.fillText(occasion, width / 2, height - 20); // Position text at the bottom with 20px padding
    }
    
    // All items processed
    if (loadedCount >= totalItems) {
      onComplete();
      
      if (hasErrors) {
        onError("Some images could not be displayed");
      }
    }
  } catch (error) {
    console.error('Error rendering items:', error);
    onError("Failed to render items");
  }
};

/**
 * Processes an image for display on canvas
 * (This function should be moved to a separate image processing utility in the future)
 */
export const processItemImage = async (
  img: HTMLImageElement,
  position: { width: number; height: number; }
): Promise<{
  width: number;
  height: number;
  processedImage: HTMLImageElement;
}> => {
  // Calculate dimensions while preserving aspect ratio
  const { width: drawWidth, height: drawHeight } = calculateDimensions(
    img.width,
    img.height,
    position.width,
    position.height
  );
  
  return {
    width: drawWidth,
    height: drawHeight,
    processedImage: img
  };
};
