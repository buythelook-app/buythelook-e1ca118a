
import { useEffect, useRef } from "react";

interface StyleCanvasProps {
  id: string;
  styleType: number;
  outfitData?: any;
  occasion?: string;
}

export const StyleCanvas = ({ id, styleType, outfitData, occasion }: StyleCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: false });
    if (!ctx) return;

    // High-resolution canvas with device pixel ratio
    const scale = window.devicePixelRatio || 1;
    const originalWidth = canvas.width;
    const originalHeight = canvas.height;
    
    // Set display size (css pixels) and actual size (rendered pixels)
    canvas.style.width = originalWidth + 'px';
    canvas.style.height = originalHeight + 'px';
    canvas.width = Math.floor(originalWidth * scale);
    canvas.height = Math.floor(originalHeight * scale);
    
    // Scale the context to ensure correct drawing operations
    ctx.scale(scale, scale);
    
    // Configure for highest quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Clear canvas and set a white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, originalWidth, originalHeight);

    // If we have outfit data, draw the outfit items to look like a human outfit
    if (outfitData) {
      // Define layout dimensions
      const canvasWidth = originalWidth;
      const canvasHeight = originalHeight;
      
      // Position calculations for a human-like outfit visualization
      const topPositionY = canvasHeight * 0.1; // Top of the canvas for top item
      const bottomPositionY = canvasHeight * 0.4; // Middle part for bottom item
      const shoesPositionY = canvasHeight * 0.8; // Bottom part for shoes
      
      // Draw each outfit component based on images in the API response
      const loadImages = async () => {
        try {
          // Array to track promises for parallel image loading
          const imagePromises = [];
          
          // Draw top item
          if (outfitData.top && outfitData.top.image && outfitData.top.image.length > 0) {
            const topPromise = new Promise<void>((resolve) => {
              const topImg = new Image();
              topImg.crossOrigin = "anonymous";
              
              // Append timestamp to prevent caching
              const timestamp = new Date().getTime();
              const imageUrl = outfitData.top.image[0].includes('?') 
                ? `${outfitData.top.image[0]}&t=${timestamp}` 
                : `${outfitData.top.image[0]}?t=${timestamp}`;
              
              topImg.src = imageUrl;
              
              topImg.onload = () => {
                // Preserve original aspect ratio for best quality
                const aspectRatio = topImg.width / topImg.height;
                const drawHeight = canvasHeight * 0.3; // Top takes 30% of canvas height
                const drawWidth = drawHeight * aspectRatio;
                const xPos = (canvasWidth - drawWidth) / 2;
                
                // Draw at full quality without compression
                ctx.imageSmoothingQuality = 'high';
                
                // Use createPattern for better quality of repeating patterns
                if (topImg.width > 0 && topImg.height > 0) {
                  const offscreenCanvas = document.createElement('canvas');
                  const offscreenCtx = offscreenCanvas.getContext('2d', { alpha: true });
                  
                  if (offscreenCtx) {
                    // High resolution offscreen canvas
                    offscreenCanvas.width = topImg.width;
                    offscreenCanvas.height = topImg.height;
                    
                    // Configure for quality
                    offscreenCtx.imageSmoothingEnabled = true;
                    offscreenCtx.imageSmoothingQuality = 'high';
                    
                    // Draw original image to offscreen
                    offscreenCtx.drawImage(topImg, 0, 0, topImg.width, topImg.height);
                    
                    // Draw to main canvas with crisp edges
                    ctx.drawImage(
                      offscreenCanvas,
                      xPos, 
                      topPositionY, 
                      drawWidth, 
                      drawHeight
                    );
                  } else {
                    // Fallback direct draw
                    ctx.drawImage(topImg, xPos, topPositionY, drawWidth, drawHeight);
                  }
                }
                
                resolve();
              };
              
              topImg.onerror = () => {
                // Fallback to color block if image fails to load
                ctx.fillStyle = outfitData.top;
                const topWidth = canvasWidth * 0.7;
                const topHeight = canvasHeight * 0.3;
                ctx.fillRect((canvasWidth - topWidth) / 2, topPositionY, topWidth, topHeight);
                resolve();
              };
              
              // Set timeout to prevent hanging
              setTimeout(() => {
                if (!topImg.complete) {
                  console.warn("Top image load timeout");
                  ctx.fillStyle = outfitData.top;
                  const topWidth = canvasWidth * 0.7;
                  const topHeight = canvasHeight * 0.3;
                  ctx.fillRect((canvasWidth - topWidth) / 2, topPositionY, topWidth, topHeight);
                  resolve();
                }
              }, 5000);
            });
            
            imagePromises.push(topPromise);
          } else if (outfitData.top) {
            // Use color block if no image available
            ctx.fillStyle = outfitData.top;
            const topWidth = canvasWidth * 0.7;
            const topHeight = canvasHeight * 0.3;
            ctx.fillRect((canvasWidth - topWidth) / 2, topPositionY, topWidth, topHeight);
          }
          
          // Draw bottom item
          if (outfitData.bottom && outfitData.bottom.image && outfitData.bottom.image.length > 0) {
            const bottomPromise = new Promise<void>((resolve) => {
              const bottomImg = new Image();
              bottomImg.crossOrigin = "anonymous";
              
              // Append timestamp to prevent caching
              const timestamp = new Date().getTime();
              const imageUrl = outfitData.bottom.image[0].includes('?') 
                ? `${outfitData.bottom.image[0]}&t=${timestamp}` 
                : `${outfitData.bottom.image[0]}?t=${timestamp}`;
              
              bottomImg.src = imageUrl;
              
              bottomImg.onload = () => {
                // Preserve original aspect ratio for best quality
                const aspectRatio = bottomImg.width / bottomImg.height;
                const drawHeight = canvasHeight * 0.35; // Bottom takes 35% of canvas height
                const drawWidth = Math.min(drawHeight * aspectRatio, canvasWidth * 0.6);
                const xPos = (canvasWidth - drawWidth) / 2;
                
                // Draw at full quality without compression
                ctx.imageSmoothingQuality = 'high';
                
                // Use offscreen canvas for better quality
                if (bottomImg.width > 0 && bottomImg.height > 0) {
                  const offscreenCanvas = document.createElement('canvas');
                  const offscreenCtx = offscreenCanvas.getContext('2d', { alpha: true });
                  
                  if (offscreenCtx) {
                    // High resolution offscreen canvas
                    offscreenCanvas.width = bottomImg.width;
                    offscreenCanvas.height = bottomImg.height;
                    
                    // Configure for quality
                    offscreenCtx.imageSmoothingEnabled = true;
                    offscreenCtx.imageSmoothingQuality = 'high';
                    
                    // Draw original image to offscreen
                    offscreenCtx.drawImage(bottomImg, 0, 0, bottomImg.width, bottomImg.height);
                    
                    // Draw to main canvas with proper settings
                    ctx.drawImage(
                      offscreenCanvas,
                      xPos, 
                      bottomPositionY, 
                      drawWidth, 
                      drawHeight
                    );
                  } else {
                    // Fallback direct draw
                    ctx.drawImage(bottomImg, xPos, bottomPositionY, drawWidth, drawHeight);
                  }
                }
                
                resolve();
              };
              
              bottomImg.onerror = () => {
                // Fallback to color block if image fails to load
                ctx.fillStyle = outfitData.bottom;
                const bottomWidth = canvasWidth * 0.5;
                const bottomHeight = canvasHeight * 0.35;
                ctx.fillRect((canvasWidth - bottomWidth) / 2, bottomPositionY, bottomWidth, bottomHeight);
                resolve();
              };
              
              // Set timeout to prevent hanging
              setTimeout(() => {
                if (!bottomImg.complete) {
                  console.warn("Bottom image load timeout");
                  ctx.fillStyle = outfitData.bottom;
                  const bottomWidth = canvasWidth * 0.5;
                  const bottomHeight = canvasHeight * 0.35;
                  ctx.fillRect((canvasWidth - bottomWidth) / 2, bottomPositionY, bottomWidth, bottomHeight);
                  resolve();
                }
              }, 5000);
            });
            
            imagePromises.push(bottomPromise);
          } else if (outfitData.bottom) {
            // Use color block if no image available
            ctx.fillStyle = outfitData.bottom;
            const bottomWidth = canvasWidth * 0.5;
            const bottomHeight = canvasHeight * 0.35;
            ctx.fillRect((canvasWidth - bottomWidth) / 2, bottomPositionY, bottomWidth, bottomHeight);
          }
          
          // Draw shoes
          if (outfitData.shoes && outfitData.shoes.image && outfitData.shoes.image.length > 0) {
            const shoesPromise = new Promise<void>((resolve) => {
              const shoesImg = new Image();
              shoesImg.crossOrigin = "anonymous";
              
              // Append timestamp to prevent caching
              const timestamp = new Date().getTime();
              const imageUrl = outfitData.shoes.image[0].includes('?') 
                ? `${outfitData.shoes.image[0]}&t=${timestamp}` 
                : `${outfitData.shoes.image[0]}?t=${timestamp}`;
              
              shoesImg.src = imageUrl;
              
              shoesImg.onload = () => {
                // Preserve original aspect ratio for best quality
                const aspectRatio = shoesImg.width / shoesImg.height;
                const drawHeight = canvasHeight * 0.15; // Shoes take 15% of canvas height
                const drawWidth = drawHeight * aspectRatio;
                const xPos = (canvasWidth - drawWidth) / 2;
                
                // Draw at full quality without compression
                ctx.imageSmoothingQuality = 'high';
                
                // Use offscreen canvas for better quality
                if (shoesImg.width > 0 && shoesImg.height > 0) {
                  const offscreenCanvas = document.createElement('canvas');
                  const offscreenCtx = offscreenCanvas.getContext('2d', { alpha: true });
                  
                  if (offscreenCtx) {
                    // High resolution offscreen canvas
                    offscreenCanvas.width = shoesImg.width;
                    offscreenCanvas.height = shoesImg.height;
                    
                    // Configure for quality
                    offscreenCtx.imageSmoothingEnabled = true;
                    offscreenCtx.imageSmoothingQuality = 'high';
                    
                    // Draw original image to offscreen
                    offscreenCtx.drawImage(shoesImg, 0, 0, shoesImg.width, shoesImg.height);
                    
                    // Draw to main canvas with proper settings
                    ctx.drawImage(
                      offscreenCanvas,
                      xPos, 
                      shoesPositionY, 
                      drawWidth, 
                      drawHeight
                    );
                  } else {
                    // Fallback direct draw
                    ctx.drawImage(shoesImg, xPos, shoesPositionY, drawWidth, drawHeight);
                  }
                }
                
                resolve();
              };
              
              shoesImg.onerror = () => {
                // Fallback to color block if image fails to load
                ctx.fillStyle = outfitData.shoes;
                const shoesWidth = canvasWidth * 0.4;
                const shoesHeight = canvasHeight * 0.15;
                ctx.fillRect((canvasWidth - shoesWidth) / 2, shoesPositionY, shoesWidth, shoesHeight);
                resolve();
              };
              
              // Set timeout to prevent hanging
              setTimeout(() => {
                if (!shoesImg.complete) {
                  console.warn("Shoes image load timeout");
                  ctx.fillStyle = outfitData.shoes;
                  const shoesWidth = canvasWidth * 0.4;
                  const shoesHeight = canvasHeight * 0.15;
                  ctx.fillRect((canvasWidth - shoesWidth) / 2, shoesPositionY, shoesWidth, shoesHeight);
                  resolve();
                }
              }, 5000);
            });
            
            imagePromises.push(shoesPromise);
          } else if (outfitData.shoes) {
            // Use color block if no image available
            ctx.fillStyle = outfitData.shoes;
            const shoesWidth = canvasWidth * 0.4;
            const shoesHeight = canvasHeight * 0.15;
            ctx.fillRect((canvasWidth - shoesWidth) / 2, shoesPositionY, shoesWidth, shoesHeight);
          }
          
          // Optional: Draw a simple silhouette to better visualize the outfit on a person
          if (!outfitData.top?.image && !outfitData.bottom?.image && !outfitData.shoes?.image) {
            // If no images are available, draw a basic silhouette outline
            ctx.strokeStyle = "#EEEEEE";
            ctx.lineWidth = 1;
            
            // Head
            ctx.beginPath();
            const headRadius = canvasWidth * 0.1;
            ctx.arc(canvasWidth / 2, topPositionY - headRadius, headRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Torso
            ctx.beginPath();
            ctx.moveTo(canvasWidth / 2, topPositionY);
            ctx.lineTo(canvasWidth / 2, bottomPositionY + canvasHeight * 0.1);
            ctx.stroke();
            
            // Arms
            ctx.beginPath();
            ctx.moveTo(canvasWidth / 2 - canvasWidth * 0.2, topPositionY + canvasHeight * 0.15);
            ctx.lineTo(canvasWidth / 2, topPositionY + canvasHeight * 0.05);
            ctx.lineTo(canvasWidth / 2 + canvasWidth * 0.2, topPositionY + canvasHeight * 0.15);
            ctx.stroke();
            
            // Legs
            ctx.beginPath();
            ctx.moveTo(canvasWidth / 2, bottomPositionY + canvasHeight * 0.1);
            ctx.lineTo(canvasWidth / 2 - canvasWidth * 0.1, shoesPositionY);
            ctx.moveTo(canvasWidth / 2, bottomPositionY + canvasHeight * 0.1);
            ctx.lineTo(canvasWidth / 2 + canvasWidth * 0.1, shoesPositionY);
            ctx.stroke();
          }
          
          // Wait for all images to load
          await Promise.all(imagePromises);
          
        } catch (error) {
          console.error("Error loading outfit images:", error);
        }
      };
      
      loadImages();
    }
  }, [id, styleType, outfitData]);

  return null; // This component doesn't render anything, it just manipulates the canvas
};
