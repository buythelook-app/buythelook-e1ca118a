
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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas and set a white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // If we have outfit data, draw the outfit items in order
    if (outfitData) {
      // Define layout dimensions
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const itemHeight = canvasHeight / 3;
      
      // Draw each outfit component based on images in the API response
      const loadImages = async () => {
        try {
          // Draw top item
          if (outfitData.top && outfitData.top.image && outfitData.top.image.length > 0) {
            const topImg = new Image();
            topImg.crossOrigin = "anonymous";
            topImg.src = outfitData.top.image[0];
            
            topImg.onload = () => {
              const aspectRatio = topImg.width / topImg.height;
              const drawHeight = itemHeight - 10;
              const drawWidth = drawHeight * aspectRatio;
              const xPos = (canvasWidth - drawWidth) / 2;
              
              ctx.drawImage(topImg, xPos, 5, drawWidth, drawHeight);
            };
            
            topImg.onerror = () => {
              // Fallback to color block if image fails to load
              ctx.fillStyle = outfitData.top;
              ctx.fillRect(20, 5, canvasWidth - 40, itemHeight - 10);
            };
          } else if (outfitData.top) {
            // Use color block if no image available
            ctx.fillStyle = outfitData.top;
            ctx.fillRect(20, 5, canvasWidth - 40, itemHeight - 10);
          }
          
          // Draw bottom item
          if (outfitData.bottom && outfitData.bottom.image && outfitData.bottom.image.length > 0) {
            const bottomImg = new Image();
            bottomImg.crossOrigin = "anonymous";
            bottomImg.src = outfitData.bottom.image[0];
            
            bottomImg.onload = () => {
              const aspectRatio = bottomImg.width / bottomImg.height;
              const drawHeight = itemHeight - 10;
              const drawWidth = drawHeight * aspectRatio;
              const xPos = (canvasWidth - drawWidth) / 2;
              
              ctx.drawImage(bottomImg, xPos, itemHeight + 5, drawWidth, drawHeight);
            };
            
            bottomImg.onerror = () => {
              // Fallback to color block if image fails to load
              ctx.fillStyle = outfitData.bottom;
              ctx.fillRect(20, itemHeight + 5, canvasWidth - 40, itemHeight - 10);
            };
          } else if (outfitData.bottom) {
            // Use color block if no image available
            ctx.fillStyle = outfitData.bottom;
            ctx.fillRect(20, itemHeight + 5, canvasWidth - 40, itemHeight - 10);
          }
          
          // Draw shoes
          if (outfitData.shoes && outfitData.shoes.image && outfitData.shoes.image.length > 0) {
            const shoesImg = new Image();
            shoesImg.crossOrigin = "anonymous";
            shoesImg.src = outfitData.shoes.image[0];
            
            shoesImg.onload = () => {
              const aspectRatio = shoesImg.width / shoesImg.height;
              const drawHeight = itemHeight - 10;
              const drawWidth = drawHeight * aspectRatio;
              const xPos = (canvasWidth - drawWidth) / 2;
              
              ctx.drawImage(shoesImg, xPos, itemHeight * 2 + 5, drawWidth, drawHeight);
            };
            
            shoesImg.onerror = () => {
              // Fallback to color block if image fails to load
              ctx.fillStyle = outfitData.shoes;
              ctx.fillRect(60, itemHeight * 2 + 5, canvasWidth - 120, itemHeight - 10);
            };
          } else if (outfitData.shoes) {
            // Use color block if no image available
            ctx.fillStyle = outfitData.shoes;
            ctx.fillRect(60, itemHeight * 2 + 5, canvasWidth - 120, itemHeight - 10);
          }
        } catch (error) {
          console.error("Error loading outfit images:", error);
        }
      };
      
      loadImages();
    }
  }, [id, styleType, outfitData]);

  return null; // This component doesn't render anything, it just manipulates the canvas
};
