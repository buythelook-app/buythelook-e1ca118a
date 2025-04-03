
/**
 * Color-related utilities for outfit rendering
 */

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

