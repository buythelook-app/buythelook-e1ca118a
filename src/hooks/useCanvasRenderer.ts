import { useEffect, useRef, useState } from "react";
import { 
  setupCanvas, 
  drawCenterLine, 
  processImageForCanvas, 
  loadImage, 
  getDefaultPositions,
  calculateDimensions,
  drawDebugInfo,
  drawDebugGrid,
  drawCanvasBounds
} from "@/utils/canvas";
import { transformImageUrl } from "@/utils/imageUtils";

type ItemType = 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' | 'cart';

export interface CanvasItem {
  id: string;
  image: string;
  type: ItemType;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface UseCanvasRendererProps {
  items: CanvasItem[];
  width: number;
  height: number;
}

interface UseCanvasRendererResult {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isLoading: boolean;
  error: string | null;
}

export const useCanvasRenderer = ({
  items,
  width,
  height
}: UseCanvasRendererProps): UseCanvasRendererResult => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

    // Draw a center line for debugging
    drawCenterLine(ctx, width, height);
    
    // Draw debug grid to visualize positions
    drawDebugGrid(ctx, width, height);
    
    // Draw canvas bounds to see exact edges
    drawCanvasBounds(ctx, width, height);

    // Sort items in correct rendering order
    const renderOrder = { outerwear: 0, top: 1, bottom: 2, shoes: 3 };
    const sortedItems = [...items].sort((a, b) => {
      const orderA = renderOrder[a.type] ?? 999;
      const orderB = renderOrder[b.type] ?? 999;
      return orderA - orderB;
    });

    console.log("Rendering canvas with items:", sortedItems);

    // Calculate exact center point of canvas
    const centerX = width / 2;

    // Get default positions based on canvas dimensions
    const defaultPositions = getDefaultPositions(width, height);

    // Check if there are any items to render
    if (sortedItems.length === 0) {
      console.log("No items to render in canvas");
      ctx.font = '16px Arial';
      ctx.fillStyle = '#666666';
      ctx.textAlign = 'center';
      ctx.fillText('No items to display', centerX, height / 2);
      setIsLoading(false);
      return;
    }

    const renderItems = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Loading images for items:", sortedItems);
        let loadedCount = 0;
        const totalItems = sortedItems.length;
        let hasErrors = false;
        
        for (const item of sortedItems) {
          console.log('Loading image for item:', item);
          
          if (!item.image) {
            console.warn('Missing image for item:', item.id, item.type);
            loadedCount++;
            continue;
          }
          
          try {
            const transformedUrl = transformImageUrl(item.image);
            console.log('Transformed URL for item:', transformedUrl);
            
            // Load the image
            const img = await loadImage(transformedUrl).catch(() => null);
            
            // Skip rendering if image failed to load
            if (!img || img.naturalWidth === 0) {
              console.log('Skipping image with loading error or zero width');
              loadedCount++;
              continue;
            }

            // Process the image (remove background)
            const processedCanvas = await processImageForCanvas(img);
            
            // Get position for the item
            const position = item.position || defaultPositions[item.type];
            if (position) {
              // Calculate dimensions while preserving aspect ratio
              const { width: drawWidth, height: drawHeight } = calculateDimensions(
                img.width,
                img.height,
                position.width,
                position.height
              );

              // HARD FORCE THE POSITION TO CENTER
              // Calculate center and position regardless of any other factors
              const extreme_x_position = width * 0.75; // Position at 75% of canvas width
              
              // Position from extreme rightward point
              const drawX = Math.round(extreme_x_position - (drawWidth / 2));
              const drawY = Math.round(position.y);
              
              // Log the forced positioning
              console.log(`FORCE POSITIONING ${item.type}: x=${drawX}, extreme_point=${extreme_x_position}`);
              
              // Draw debugging info
              drawDebugInfo(ctx, drawX, drawY, drawWidth, drawHeight, item.type, extreme_x_position);
              
              // Draw the image at the forced position
              ctx.drawImage(
                processedCanvas,
                drawX,
                drawY,
                drawWidth,
                drawHeight
              );
            }
          } catch (itemError) {
            console.error('Error processing item:', itemError);
            hasErrors = true;
          }
          
          loadedCount++;
        }
        
        // Set loading to false once all items are processed
        if (loadedCount >= totalItems) {
          setIsLoading(false);
          
          if (hasErrors) {
            // Add a subtle indication of errors on the canvas
            ctx.font = '10px Arial';
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.textAlign = 'center';
            ctx.fillText('Some images could not be displayed', centerX, height - 10);
          }
        }
      } catch (error) {
        console.error('Error in renderItems:', error);
        setIsLoading(false);
        setError("Failed to render items");
        
        // Display error on canvas
        ctx.font = '16px Arial';
        ctx.fillStyle = '#ff0000';
        ctx.textAlign = 'center';
        ctx.fillText('Error loading images', centerX, height / 2);
      }
    };

    // Start rendering items
    renderItems();
    
  }, [items, width, height]);

  return {
    canvasRef,
    isLoading,
    error
  };
};
