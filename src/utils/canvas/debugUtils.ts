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

/**
 * Draw a comprehensive debug grid to visualize canvas positioning
 */
export const drawDebugGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  // Save context state
  ctx.save();
  
  // Draw center cross
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Draw vertical centerline (Red)
  ctx.beginPath();
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, height);
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Draw horizontal centerline (Blue)
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Draw grid lines
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
  
  // Vertical grid lines
  for (let x = 0; x < width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Horizontal grid lines
  for (let y = 0; y < height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Draw coordinates at center
  ctx.font = '12px Arial';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillText(`Center: (${Math.round(centerX)}, ${Math.round(centerY)})`, centerX + 5, centerY - 5);
  
  // Restore context state
  ctx.restore();
};
