
import { useState, useEffect, RefObject } from "react";
import { setupCanvas } from "@/utils/canvasUtils";
import { 
  drawSilhouette, 
  hasValidImages, 
  renderOutfitItem 
} from "@/utils/outfitRenderUtils";

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
      
      // Define positions for different outfit parts
      const topPositionY = height * 0.15;
      const bottomPositionY = height * 0.5;
      const shoesPositionY = height * 0.75;

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
