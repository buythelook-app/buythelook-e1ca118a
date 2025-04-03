
/**
 * Utilities for drawing human silhouette
 */

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

