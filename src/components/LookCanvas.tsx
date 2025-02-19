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

    // Set canvas resolution to be higher for better quality
    const scale = window.devicePixelRatio || 1;
    canvas.width = width * scale;
    canvas.height = height * scale;
    
    // Scale the context to match the high-resolution canvas
    ctx.scale(scale, scale);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background to make canvas visible
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    console.log('Drawing items:', items);

    // Define default positions for each item type with even larger sizes
    const defaultPositions = {
      outerwear: { x: width * 0.02, y: height * 0.02, width: width * 0.96, height: height * 0.6 },
      top: { x: width * 0.02, y: height * 0.05, width: width * 0.96, height: height * 0.6 },
      bottom: { x: width * 0.05, y: height * 0.32, width: width * 0.9, height: height * 0.65 },
      dress: { x: width * 0.02, y: height * 0.02, width: width * 0.96, height: height * 0.95 },
      shoes: { x: width * 0.15, y: height * 0.65, width: width * 0.7, height: height * 0.3 },
      accessory: { x: width * 0.2, y: height * 0.45, width: width * 0.6, height: height * 0.4 },
      sunglasses: { x: width * 0.2, y: height * 0.02, width: width * 0.6, height: height * 0.25 }
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

              // Create an offscreen canvas for image processing with original dimensions
              const offscreenCanvas = document.createElement('canvas');
              const offscreenCtx = offscreenCanvas.getContext('2d');
              if (!offscreenCtx) {
                console.error('Could not get offscreen context');
                continue;
              }

              // Use original image dimensions for the offscreen canvas
              offscreenCanvas.width = img.width;
              offscreenCanvas.height = img.height;

              // Draw the original image to offscreen canvas at full resolution
              offscreenCtx.drawImage(img, 0, 0, img.width, img.height);

              // Remove background (more aggressive white and gray color removal)
              const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
              const data = imageData.data;
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Check if pixel is white, light gray, or medium gray
                if (r > 220 && g > 220 && b > 220) {
                  data[i + 3] = 0; // Set alpha to 0
                }
                
                // Remove gray pixels (where R, G, and B values are close to each other)
                const avgColor = (r + g + b) / 3;
                if (avgColor > 180 && Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15) {
                  data[i + 3] = 0;
                }
              }
              offscreenCtx.putImageData(imageData, 0, 0);

              // Calculate aspect ratio and dimensions
              const aspectRatio = img.width / img.height;
              let drawWidth = position.width;
              let drawHeight = position.height;

              if (drawWidth / drawHeight > aspectRatio) {
                drawWidth = drawHeight * aspectRatio;
              } else {
                drawHeight = drawWidth / aspectRatio;
              }

              // Center the image
              const centerX = position.x + (position.width - drawWidth) / 2;
              const centerY = position.y + (position.height - drawHeight) / 2;

              // Save the current context state
              ctx.save();

              // Draw the image (removing rotation for shoes)
              ctx.drawImage(
                offscreenCanvas,
                centerX,
                centerY,
                drawWidth,
                drawHeight
              );

              // Restore the context state
              ctx.restore();
              
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
      className="border rounded-lg shadow-lg bg-white"
      style={{ 
        maxWidth: '100%',
        width: `${width}px`,
        height: `${height}px`
      }}
    />
  );
};
