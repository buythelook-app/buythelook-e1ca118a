
import { useState, useEffect, RefObject } from "react";
import { setupCanvas } from "@/utils/canvas";
import { 
  drawSilhouette, 
  hasValidImages, 
  renderOutfitItem 
} from "@/utils/outfit";

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

interface StyleCanvasRenderingResult {
  isLoading: boolean;
  error: string | null;
}

export const useStyleCanvasRenderer = ({
  canvasRef,
  styleType,
  outfitData,
  occasion,
  width,
  height
}: UseStyleCanvasRendererProps): StyleCanvasRenderingResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderOutfit = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Initialize canvas and context
      const ctx = setupCanvas(canvas, width, height);
      if (!ctx) {
        setError("Canvas context could not be created");
        setIsLoading(false);
        return;
      }

      // Calculate exact center of canvas
      const centerX = width / 2;
      
      // Define positions for different outfit parts with improved vertical spacing
      // These values are based on the provided example image's proportions
      const topPositionY = height * 0.22;       // Top item at approximately 22% from top
      const bottomPositionY = height * 0.52;    // Bottom item at approximately 52% from top (middle)
      const shoesPositionY = height * 0.82;     // Shoes at approximately 82% from top (bottom area)

      // No outfit data to render
      if (!outfitData) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Array to track promises for parallel image loading
        const imagePromises = [];
        
        // Render top item
        if (outfitData.top) {
          const topPromise = renderOutfitItem({
            item: outfitData.top,
            ctx,
            centerX,
            positionY: topPositionY,
            maxWidth: width * 0.6,  // Allow top to take up to 60% of width
            maxHeight: height * 0.2  // Allow top to take up to 20% of height
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
            maxWidth: width * 0.5,    // Allow bottom to take up to 50% of width
            maxHeight: height * 0.25   // Allow bottom to take up to 25% of height
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
            maxWidth: width * 0.4,    // Allow shoes to take up to 40% of width
            maxHeight: height * 0.15   // Allow shoes to take up to 15% of height
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
