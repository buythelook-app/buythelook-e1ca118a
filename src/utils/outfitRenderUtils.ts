
import { 
  setupCanvas,
  loadImage,
  calculateDimensions
} from "@/utils/canvas";
import { transformImageUrl } from "@/utils/imageUtils";

interface OutfitItem {
  image?: string[];
  color?: string;
}

/**
 * Draws a simplified human silhouette on the canvas
 */
export const drawSilhouette = ({ 
  ctx, 
  centerX, 
  topPositionY, 
  bottomPositionY,
  shoesPositionY,
  canvasWidth,
  canvasHeight
}: {
  ctx: CanvasRenderingContext2D;
  centerX: number;
  topPositionY: number;
  bottomPositionY: number;
  shoesPositionY: number;
  canvasWidth: number;
  canvasHeight: number;
}) => {
  ctx.strokeStyle = "#EEEEEE";
  ctx.lineWidth = 1;
  
  // Head - centered
  ctx.beginPath();
  const headRadius = canvasWidth * 0.1;
  ctx.arc(centerX, topPositionY - headRadius, headRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Torso - centered
  ctx.beginPath();
  ctx.moveTo(centerX, topPositionY);
  ctx.lineTo(centerX, bottomPositionY + canvasHeight * 0.1);
  ctx.stroke();
  
  // Arms - symmetrical from center
  ctx.beginPath();
  ctx.moveTo(centerX - canvasWidth * 0.2, topPositionY + canvasHeight * 0.15);
  ctx.lineTo(centerX, topPositionY + canvasHeight * 0.05);
  ctx.lineTo(centerX + canvasWidth * 0.2, topPositionY + canvasHeight * 0.15);
  ctx.stroke();
  
  // Legs - symmetrical from center
  ctx.beginPath();
  ctx.moveTo(centerX, bottomPositionY + canvasHeight * 0.1);
  ctx.lineTo(centerX - canvasWidth * 0.1, shoesPositionY);
  ctx.moveTo(centerX, bottomPositionY + canvasHeight * 0.1);
  ctx.lineTo(centerX + canvasWidth * 0.1, shoesPositionY);
  ctx.stroke();
};

/**
 * Checks if any outfit item has valid images
 */
export const hasValidImages = (outfitData: any): boolean => {
  if (!outfitData) return false;
  
  const hasTopImage = outfitData.top && 
    typeof outfitData.top !== 'string' && 
    outfitData.top.image && 
    outfitData.top.image.length > 0;
  
  const hasBottomImage = outfitData.bottom && 
    typeof outfitData.bottom !== 'string' && 
    outfitData.bottom.image && 
    outfitData.bottom.image.length > 0;
  
  const hasShoesImage = outfitData.shoes && 
    typeof outfitData.shoes !== 'string' && 
    outfitData.shoes.image && 
    outfitData.shoes.image.length > 0;
  
  return hasTopImage || hasBottomImage || hasShoesImage;
};

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
 * Renders a color block at the specified position
 */
export const renderColorBlock = ({ 
  ctx, 
  centerX, 
  positionY, 
  width, 
  height, 
  color 
}: {
  ctx: CanvasRenderingContext2D;
  centerX: number;
  positionY: number;
  width: number;
  height: number;
  color: string;
}) => {
  ctx.fillStyle = color || "#CCCCCC"; // Default to gray if no color provided
  
  // Exact center positioning
  ctx.fillRect(centerX - (width / 2), positionY, width, height);
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
    const img = await loadImage(item.image![0]);
    
    // Calculate dimensions while preserving aspect ratio
    const { width: drawWidth, height: drawHeight } = calculateDimensions(
      img.width,
      img.height,
      maxWidth,
      maxHeight
    );
    
    // Calculate X position for exact center alignment
    const xPos = centerX - (drawWidth / 2);
    
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      img,
      xPos, 
      positionY, 
      drawWidth, 
      drawHeight
    );
  } catch (error) {
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
