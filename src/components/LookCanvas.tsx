import { useEffect, useRef } from "react";

interface OutfitItem {
  id: string;
  image: string;
  type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear';
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background to make canvas visible
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    console.log('Drawing items:', items);

    // Define default positions for each item type - tighter professional layout
    const defaultPositions = {
      outerwear: { x: width * 0.25, y: height * 0.01, width: width * 0.5, height: height * 0.2 }, // coat at top
      top: { x: width * 0.25, y: height * 0.15, width: width * 0.5, height: height * 0.15 }, // shirt right below coat
      bottom: { x: width * 0.3, y: height * 0.25, width: width * 0.4, height: height * 0.25 }, // pants/skirt immediately below
      dress: { x: width * 0.25, y: height * 0.1, width: width * 0.5, height: height * 0.45 }, // dress with proper spacing
      shoes: { x: width * 0.35, y: height * 0.45, width: width * 0.3, height: height * 0.1 }, // shoes closer to outfit
      accessory: { x: width * 0.4, y: height * 0.52, width: width * 0.2, height: height * 0.1 }, // accessories right after
      sunglasses: { x: width * 0.4, y: height * 0.01, width: width * 0.2, height: height * 0.06 } // sunglasses at top
    };

    // Load and draw all images
    const loadImages = async () => {
      try {
        for (const item of items) {
          console.log('Loading image for item:', item);
          
          const img = new Image();
          img.crossOrigin = "anonymous";
          
          // Add a timestamp to prevent caching
          const timestamp = new Date().getTime();
          const imageUrl = item.image.includes('?') 
            ? `${item.image}&t=${timestamp}` 
            : `${item.image}?t=${timestamp}`;
          
          img.src = imageUrl;

          try {
            await new Promise((resolve, reject) => {
              img.onload = () => {
                console.log('Image loaded successfully:', imageUrl);
                resolve(null);
              };
              img.onerror = (e) => {
                console.error('Error loading image:', imageUrl, e);
                reject(e);
              };
            });

            // Get position based on item type or use provided position
            const position = item.position || defaultPositions[item.type];
            if (position) {
              console.log('Drawing item with position:', position);

              // Create an offscreen canvas for image processing
              const offscreenCanvas = document.createElement('canvas');
              const offscreenCtx = offscreenCanvas.getContext('2d');
              if (!offscreenCtx) {
                console.error('Could not get offscreen context');
                continue;
              }

              // Set offscreen canvas size
              offscreenCanvas.width = img.width;
              offscreenCanvas.height = img.height;

              // Draw the original image to offscreen canvas
              offscreenCtx.drawImage(img, 0, 0);

              // Remove background (more aggressive white and light color removal)
              const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
              const data = imageData.data;
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Check if pixel is white or very light colored
                if (r > 225 && g > 225 && b > 225) {
                  data[i + 3] = 0; // Set alpha to 0
                }
                
                // Also remove very light gray pixels
                const avgColor = (r + g + b) / 3;
                if (avgColor > 240 && Math.abs(r - g) < 10 && Math.abs(g - b) < 10) {
                  data[i + 3] = 0;
                }
              }
              offscreenCtx.putImageData(imageData, 0, 0);

              // Draw the processed image to main canvas
              ctx.drawImage(
                offscreenCanvas,
                position.x,
                position.y,
                position.width,
                position.height
              );
              
              console.log('Successfully drew item:', item.type);
            } else {
              console.error('No position found for item type:', item.type);
            }
          } catch (imgError) {
            console.error('Error processing image:', imgError);
          }
        }
      } catch (error) {
        console.error('Error in loadImages:', error);
      }
    };

    loadImages();
  }, [items, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border rounded-lg shadow-lg bg-white"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
};
