
import { useEffect, useRef, useState } from "react";
import { transformImageUrl } from "@/utils/imageUtils";

interface OutfitItem {
  id: string;
  image: string;
  type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' | 'cart';
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface LookCanvasProps {
  items: OutfitItem[];
  width?: number;
  height?: number;
}

export const LookCanvas = ({ items, width = 600, height = 800 }: LookCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canvasError, setCanvasError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Canvas context could not be created");
      setCanvasError("Canvas context could not be created");
      setIsLoading(false);
      return;
    }

    // Set up canvas with device pixel ratio
    const scale = window.devicePixelRatio || 1;
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);

    // Clear and set background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Sort items in correct rendering order
    const renderOrder = { outerwear: 0, top: 1, bottom: 2, shoes: 3 };
    const sortedItems = [...items].sort((a, b) => {
      const orderA = renderOrder[a.type] ?? 999;
      const orderB = renderOrder[b.type] ?? 999;
      return orderA - orderB;
    });

    console.log("Rendering canvas with items:", sortedItems);

    // Improved centrally positioned items with more precise centering
    const defaultPositions = {
      outerwear: { x: width * 0.5, y: height * 0.15, width: width * 0.7, height: height * 0.4 },
      top: { x: width * 0.5, y: height * 0.15, width: width * 0.7, height: height * 0.4 },
      bottom: { x: width * 0.5, y: height * 0.5, width: width * 0.6, height: height * 0.4 },
      dress: { x: width * 0.5, y: height * 0.3, width: width * 0.7, height: height * 0.7 },
      shoes: { x: width * 0.5, y: height * 0.75, width: width * 0.5, height: height * 0.2 }, 
      accessory: { x: width * 0.5, y: height * 0.4, width: width * 0.4, height: height * 0.4 },
      sunglasses: { x: width * 0.5, y: height * 0.1, width: width * 0.5, height: height * 0.2 },
      cart: { x: width * 0.5, y: height * 0.4, width: width * 0.7, height: height * 0.4 }
    };

    // Check if there are any items to render
    if (sortedItems.length === 0) {
      console.log("No items to render in canvas");
      ctx.font = '16px Arial';
      ctx.fillStyle = '#666666';
      ctx.textAlign = 'center';
      ctx.fillText('No items to display', width / 2, height / 2);
      setIsLoading(false);
      return;
    }

    const loadImages = async () => {
      setIsLoading(true);
      setCanvasError(null);
      
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
          
          const img = new Image();
          img.crossOrigin = "anonymous";
          
          // Transform the image URL and append a timestamp to bypass cache
          const timestamp = new Date().getTime();
          let transformedUrl;
          
          try {
            transformedUrl = transformImageUrl(item.image);
            console.log('Transformed URL for item:', transformedUrl);
          } catch (error) {
            console.error('Error transforming URL:', error);
            transformedUrl = '/placeholder.svg';
            hasErrors = true;
          }
          
          const imageUrl = transformedUrl.includes('?') 
            ? `${transformedUrl}&t=${timestamp}` 
            : `${transformedUrl}?t=${timestamp}`;
          
          console.log('Attempting to load image from URL:', imageUrl);
          img.src = imageUrl;

          try {
            await new Promise((resolve, reject) => {
              img.onload = () => {
                console.log('Image loaded successfully:', imageUrl);
                resolve(null);
              };
              img.onerror = (e) => {
                console.error('Error loading image:', imageUrl, e);
                hasErrors = true;
                // Continue with the next image instead of stopping the whole process
                resolve(null);
              };
              
              // Set a timeout in case the image never loads or errors
              setTimeout(() => {
                if (!img.complete) {
                  console.warn('Image load timed out:', imageUrl);
                  hasErrors = true;
                  resolve(null);
                }
              }, 5000);
            });

            // Skip rendering if there was an error loading the image
            if (img.naturalWidth === 0) {
              console.log('Skipping image with zero width:', imageUrl);
              loadedCount++;
              continue;
            }

            const position = item.position || defaultPositions[item.type];
            if (position) {
              const offscreenCanvas = document.createElement('canvas');
              const offscreenCtx = offscreenCanvas.getContext('2d');
              if (!offscreenCtx) {
                loadedCount++;
                continue;
              }

              offscreenCanvas.width = img.width;
              offscreenCanvas.height = img.height;

              // Draw the image onto the offscreen canvas
              offscreenCtx.drawImage(img, 0, 0);
              
              // Background removal for all items
              const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
              const data = imageData.data;
              
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                const avgColor = (r + g + b) / 3;
                if (avgColor > 180 && Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15) {
                  data[i + 3] = 0;
                }
              }
              
              offscreenCtx.putImageData(imageData, 0, 0);

              // Calculate dimensions while preserving aspect ratio
              const aspectRatio = img.width / img.height;
              let drawWidth = position.width;
              let drawHeight = position.height;

              if (drawWidth / drawHeight > aspectRatio) {
                drawWidth = drawHeight * aspectRatio;
              } else {
                drawHeight = drawWidth / aspectRatio;
              }

              // Perfect center alignment - ensure exact center positioning
              const centerX = position.x - (drawWidth / 2);
              
              ctx.save();
              ctx.drawImage(
                offscreenCanvas,
                centerX,
                position.y,
                drawWidth,
                drawHeight
              );
              ctx.restore();
              
              // Debug centerline (uncomment if needed for debugging)
              // ctx.beginPath();
              // ctx.moveTo(width/2, 0);
              // ctx.lineTo(width/2, height);
              // ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
              // ctx.stroke();
            }
            
            loadedCount++;
          } catch (imgError) {
            console.error('Error processing image:', imgError);
            hasErrors = true;
            loadedCount++;
          }
        }
        
        // Set loading to false once all items are processed
        if (loadedCount >= totalItems) {
          setIsLoading(false);
          
          if (hasErrors) {
            // Add a subtle indication of errors on the canvas
            ctx.font = '10px Arial';
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.textAlign = 'center';
            ctx.fillText('Some images could not be displayed', width / 2, height - 10);
          }
        }
      } catch (error) {
        console.error('Error in loadImages:', error);
        setIsLoading(false);
        setCanvasError("Failed to load images");
        
        // Display error on canvas
        ctx.font = '16px Arial';
        ctx.fillStyle = '#ff0000';
        ctx.textAlign = 'center';
        ctx.fillText('Error loading images', width / 2, height / 2);
      }
    };

    // Start loading images
    loadImages();
    
    // Cleanup function
    return () => {
      // Any cleanup code if needed
    };
  }, [items, width, height]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
          <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-netflix-accent animate-spin"></div>
        </div>
      )}
      {canvasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
          <div className="text-red-500 text-center p-4">
            <p>{canvasError}</p>
            <p className="text-sm mt-2">Please try refreshing the page</p>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="border rounded-lg shadow-lg bg-white mx-auto"
        style={{ 
          maxWidth: '100%',
          width: `${width}px`,
          height: `${height}px`,
          display: 'block'  // Ensure canvas is displayed as block
        }}
      />
    </div>
  );
};

