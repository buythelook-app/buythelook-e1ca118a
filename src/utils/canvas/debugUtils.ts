
/**
 * Utilities for debug rendering and information
 */

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
