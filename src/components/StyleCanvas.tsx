
import { useEffect, useRef } from "react";
import { setupCanvas, drawCenterLine, loadImage, calculateDimensions } from "@/utils/canvasUtils";

interface StyleCanvasProps {
  id: string;
  styleType: number;
  outfitData?: any;
  occasion?: string;
}

export const StyleCanvas = ({ id, styleType, outfitData, occasion }: StyleCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    
    canvasRef.current = canvas;
    const ctx = setupCanvas(canvas, canvas.width, canvas.height);
    if (!ctx) return;

    // Draw a centerline for debugging (comment out in production)
    // drawCenterLine(ctx, canvas.width, canvas.height);

    // If we have outfit data, draw the outfit items to look like a human outfit
    if (outfitData) {
      // Define layout dimensions
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // Calculate exact center of canvas
      const centerX = canvasWidth / 2;
      
      // True center-aligned positions for all outfit types
      const topPositionY = canvasHeight * 0.15; // Top of the canvas for top item
      const bottomPositionY = canvasHeight * 0.5; // Middle part for bottom item
      const shoesPositionY = canvasHeight * 0.75; // Bottom part for shoes
      
      // Draw each outfit component based on images in the API response
      const loadImages = async () => {
        try {
          // Array to track promises for parallel image loading
          const imagePromises = [];
          
          // Draw top item with perfect centering
          if (outfitData.top && outfitData.top.image && outfitData.top.image.length > 0) {
            const topPromise = new Promise<void>(async (resolve) => {
              try {
                const topImg = await loadImage(outfitData.top.image[0]);
                
                // Calculate dimensions to maintain aspect ratio and center horizontally
                const { width: drawWidth, height: drawHeight } = calculateDimensions(
                  topImg.width,
                  topImg.height,
                  canvasWidth * 0.7,
                  canvasHeight * 0.3
                );
                
                // Calculate X position to ensure the center of the image aligns with the center of canvas
                const xPos = centerX - (drawWidth / 2);
                
                ctx.imageSmoothingQuality = 'high';
                
                // Draw image with proper centering
                ctx.drawImage(
                  topImg,
                  xPos, 
                  topPositionY, 
                  drawWidth, 
                  drawHeight
                );
              } catch (error) {
                // Fallback to color block if image fails to load
                ctx.fillStyle = outfitData.top;
                const topWidth = canvasWidth * 0.7;
                const topHeight = canvasHeight * 0.3;
                
                // Exact center positioning for fallback color block
                ctx.fillRect(centerX - (topWidth / 2), topPositionY, topWidth, topHeight);
              }
              resolve();
            });
            
            imagePromises.push(topPromise);
          } else if (outfitData.top) {
            // Use color block if no image available
            ctx.fillStyle = outfitData.top;
            const topWidth = canvasWidth * 0.7;
            const topHeight = canvasHeight * 0.3;
            
            // Exact center positioning
            ctx.fillRect(centerX - (topWidth / 2), topPositionY, topWidth, topHeight);
          }
          
          // Draw bottom item with enhanced centering
          if (outfitData.bottom && outfitData.bottom.image && outfitData.bottom.image.length > 0) {
            const bottomPromise = new Promise<void>(async (resolve) => {
              try {
                const bottomImg = await loadImage(outfitData.bottom.image[0]);
                
                // True aspect ratio preservation
                const { width: drawWidth, height: drawHeight } = calculateDimensions(
                  bottomImg.width,
                  bottomImg.height,
                  canvasWidth * 0.5,
                  canvasHeight * 0.35
                );
                
                // Calculate X position for exact center alignment
                const xPos = centerX - (drawWidth / 2);
                
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(
                  bottomImg,
                  xPos, 
                  bottomPositionY, 
                  drawWidth, 
                  drawHeight
                );
              } catch (error) {
                // Fallback to color block if image fails to load
                ctx.fillStyle = outfitData.bottom;
                const bottomWidth = canvasWidth * 0.5;
                const bottomHeight = canvasHeight * 0.35;
                
                // Exact center positioning for fallback
                ctx.fillRect(centerX - (bottomWidth / 2), bottomPositionY, bottomWidth, bottomHeight);
              }
              resolve();
            });
            
            imagePromises.push(bottomPromise);
          } else if (outfitData.bottom) {
            // Use color block if no image available
            ctx.fillStyle = outfitData.bottom;
            const bottomWidth = canvasWidth * 0.5;
            const bottomHeight = canvasHeight * 0.35;
            
            // Exact center positioning
            ctx.fillRect(centerX - (bottomWidth / 2), bottomPositionY, bottomWidth, bottomHeight);
          }
          
          // Draw shoes with perfect centering
          if (outfitData.shoes && outfitData.shoes.image && outfitData.shoes.image.length > 0) {
            const shoesPromise = new Promise<void>(async (resolve) => {
              try {
                const shoesImg = await loadImage(outfitData.shoes.image[0]);
                
                // True aspect ratio preservation
                const { width: drawWidth, height: drawHeight } = calculateDimensions(
                  shoesImg.width,
                  shoesImg.height,
                  canvasWidth * 0.4,
                  canvasHeight * 0.2
                );
                
                // Calculate X position for exact center alignment
                const xPos = centerX - (drawWidth / 2);
                
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(
                  shoesImg,
                  xPos, 
                  shoesPositionY, 
                  drawWidth, 
                  drawHeight
                );
              } catch (error) {
                // Fallback to color block if image fails to load
                ctx.fillStyle = outfitData.shoes;
                const shoesWidth = canvasWidth * 0.4;
                const shoesHeight = canvasHeight * 0.15;
                
                // Exact center positioning for fallback
                ctx.fillRect(centerX - (shoesWidth / 2), shoesPositionY, shoesWidth, shoesHeight);
              }
              resolve();
            });
            
            imagePromises.push(shoesPromise);
          } else if (outfitData.shoes) {
            // Use color block if no image available
            ctx.fillStyle = outfitData.shoes;
            const shoesWidth = canvasWidth * 0.4;
            const shoesHeight = canvasHeight * 0.15;
            
            // Exact center positioning
            ctx.fillRect(centerX - (shoesWidth / 2), shoesPositionY, shoesWidth, shoesHeight);
          }
          
          // Optional: Draw a simple silhouette to better visualize the outfit on a person
          if (!outfitData.top?.image && !outfitData.bottom?.image && !outfitData.shoes?.image) {
            // If no images are available, draw a basic silhouette outline
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
