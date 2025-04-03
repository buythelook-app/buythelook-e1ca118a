
import { useState, useEffect, RefObject } from "react";
import { 
  setupCanvas,
  loadImage,
  calculateDimensions
} from "@/utils/canvasUtils";
import { transformImageUrl } from "@/utils/imageUtils";

interface OutfitItem {
  image?: string[];
  color?: string;
}

interface OutfitData {
  top?: OutfitItem | string;
  bottom?: OutfitItem | string;
  shoes?: OutfitItem | string;
  coat?: OutfitItem | string;
}

interface UseStyleCanvasRendererProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  styleType: number;
  outfitData?: OutfitData;
  occasion?: string;
  width: number;
  height: number;
}

export const useStyleCanvasRenderer = ({
  canvasRef,
  styleType,
  outfitData,
  occasion,
  width,
  height
}: UseStyleCanvasRendererProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = setupCanvas(canvas, width, height);
    if (!ctx) {
      setError("Canvas context could not be created");
      setIsLoading(false);
      return;
    }

    // Calculate exact center of canvas
    const centerX = width / 2;
    
    // Define positions for different outfit parts
    const topPositionY = height * 0.15;
    const bottomPositionY = height * 0.5;
    const shoesPositionY = height * 0.75;

    // No outfit data to render
    if (!outfitData) {
      setIsLoading(false);
      return;
    }

    const renderOutfit = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Array to track promises for parallel image loading
        const imagePromises = [];
        
        // Render top item
        if (outfitData.top) {
          const topPromise = renderOutfitItem({
            item: outfitData.top,
            ctx,
            centerX,
            positionY: topPositionY,
            maxWidth: width * 0.7,
            maxHeight: height * 0.3
          });
          imagePromises.push(topPromise);
        }
        
        // Render bottom item
        if (outfitData.bottom) {
          const bottomPromise = renderOutfitItem({
            item: outfitData.bottom,
            ctx,
            centerX,
            positionY: bottomPositionY,
            maxWidth: width * 0.5,
            maxHeight: height * 0.35
          });
          imagePromises.push(bottomPromise);
        }
        
        // Render shoes
        if (outfitData.shoes) {
          const shoesPromise = renderOutfitItem({
            item: outfitData.shoes,
            ctx,
            centerX,
            positionY: shoesPositionY,
            maxWidth: width * 0.4,
            maxHeight: height * 0.2
          });
          imagePromises.push(shoesPromise);
        }
        
        // If no actual images, draw a simple silhouette
        if (!hasValidImages(outfitData)) {
          drawSilhouette({
            ctx,
            centerX,
            topPositionY,
            bottomPositionY,
            shoesPositionY,
            canvasWidth: width,
            canvasHeight: height
          });
        }
        
        // Wait for all images to load
        await Promise.all(imagePromises);
        setIsLoading(false);
      } catch (error) {
        console.error("Error rendering outfit:", error);
        setError("Failed to render outfit images");
        setIsLoading(false);
      }
    };
    
    renderOutfit();
  }, [canvasRef, styleType, outfitData, occasion, width, height]);

  return {
    isLoading,
    error
  };
};

// Helper function to check if the outfit has any valid images
const hasValidImages = (outfitData: OutfitData): boolean => {
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

// Helper function to render a single outfit item (either image or color block)
const renderOutfitItem = async ({ 
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
}) => {
  try {
    // Handle case where item is a color string
    if (typeof item === 'string') {
      ctx.fillStyle = item;
      const width = maxWidth;
      const height = maxHeight;
      
      // Exact center positioning
      ctx.fillRect(centerX - (width / 2), positionY, width, height);
      return;
    }
    
    // Try to load and render image
    if (item.image && item.image.length > 0) {
      try {
        const img = await loadImage(item.image[0]);
        
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
        if (item.color) {
          ctx.fillStyle = item.color;
        } else {
          ctx.fillStyle = "#CCCCCC"; // Default gray
        }
        const width = maxWidth;
        const height = maxHeight;
        
        // Exact center positioning for fallback
        ctx.fillRect(centerX - (width / 2), positionY, width, height);
      }
    } else if (item.color) {
      // Use color block if no image available
      ctx.fillStyle = item.color;
      const width = maxWidth;
      const height = maxHeight;
      
      // Exact center positioning
      ctx.fillRect(centerX - (width / 2), positionY, width, height);
    }
  } catch (error) {
    console.error("Error rendering outfit item:", error);
  }
};

// Helper function to draw a human silhouette
const drawSilhouette = ({ 
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
