
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

    // If we have outfit data, draw the outfit items to look like a human outfit
    if (outfitData) {
      // Define layout dimensions
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // Position calculations for a human-like outfit visualization
      const topPositionY = canvasHeight * 0.1; // Top of the canvas for top item
      const bottomPositionY = canvasHeight * 0.4; // Middle part for bottom item
      const shoesPositionY = canvasHeight * 0.8; // Bottom part for shoes
      
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
              const drawHeight = canvasHeight * 0.3; // Top takes 30% of canvas height
              const drawWidth = drawHeight * aspectRatio;
              const xPos = (canvasWidth - drawWidth) / 2;
              
              ctx.drawImage(topImg, xPos, topPositionY, drawWidth, drawHeight);
            };
            
            topImg.onerror = () => {
              // Fallback to color block if image fails to load
              ctx.fillStyle = outfitData.top;
              const topWidth = canvasWidth * 0.7;
              const topHeight = canvasHeight * 0.3;
              ctx.fillRect((canvasWidth - topWidth) / 2, topPositionY, topWidth, topHeight);
            };
          } else if (outfitData.top) {
            // Use color block if no image available
            ctx.fillStyle = outfitData.top;
            const topWidth = canvasWidth * 0.7;
            const topHeight = canvasHeight * 0.3;
            ctx.fillRect((canvasWidth - topWidth) / 2, topPositionY, topWidth, topHeight);
          }
          
          // Draw bottom item
          if (outfitData.bottom && outfitData.bottom.image && outfitData.bottom.image.length > 0) {
            const bottomImg = new Image();
            bottomImg.crossOrigin = "anonymous";
            bottomImg.src = outfitData.bottom.image[0];
            
            bottomImg.onload = () => {
              const aspectRatio = bottomImg.width / bottomImg.height;
              const drawHeight = canvasHeight * 0.35; // Bottom takes 35% of canvas height
              const drawWidth = Math.min(drawHeight * aspectRatio, canvasWidth * 0.6);
              const xPos = (canvasWidth - drawWidth) / 2;
              
              ctx.drawImage(bottomImg, xPos, bottomPositionY, drawWidth, drawHeight);
            };
            
            bottomImg.onerror = () => {
              // Fallback to color block if image fails to load
              ctx.fillStyle = outfitData.bottom;
              const bottomWidth = canvasWidth * 0.5;
              const bottomHeight = canvasHeight * 0.35;
              ctx.fillRect((canvasWidth - bottomWidth) / 2, bottomPositionY, bottomWidth, bottomHeight);
            };
          } else if (outfitData.bottom) {
            // Use color block if no image available
            ctx.fillStyle = outfitData.bottom;
            const bottomWidth = canvasWidth * 0.5;
            const bottomHeight = canvasHeight * 0.35;
            ctx.fillRect((canvasWidth - bottomWidth) / 2, bottomPositionY, bottomWidth, bottomHeight);
          }
          
          // Draw shoes
          if (outfitData.shoes && outfitData.shoes.image && outfitData.shoes.image.length > 0) {
            const shoesImg = new Image();
            shoesImg.crossOrigin = "anonymous";
            shoesImg.src = outfitData.shoes.image[0];
            
            shoesImg.onload = () => {
              const aspectRatio = shoesImg.width / shoesImg.height;
              const drawHeight = canvasHeight * 0.15; // Shoes take 15% of canvas height
              const drawWidth = drawHeight * aspectRatio;
              const xPos = (canvasWidth - drawWidth) / 2;
              
              ctx.drawImage(shoesImg, xPos, shoesPositionY, drawWidth, drawHeight);
            };
            
            shoesImg.onerror = () => {
              // Fallback to color block if image fails to load
              ctx.fillStyle = outfitData.shoes;
              const shoesWidth = canvasWidth * 0.4;
              const shoesHeight = canvasHeight * 0.15;
              ctx.fillRect((canvasWidth - shoesWidth) / 2, shoesPositionY, shoesWidth, shoesHeight);
            };
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
        } catch (error) {
          console.error("Error loading outfit images:", error);
        }
      };
      
      loadImages();
    }
  }, [id, styleType, outfitData]);

  return null; // This component doesn't render anything, it just manipulates the canvas
};
