
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

    // Define default positions for each item type
    const defaultPositions = {
      top: { x: width * 0.25, y: height * 0.1, width: width * 0.5, height: height * 0.25 },
      bottom: { x: width * 0.25, y: height * 0.4, width: width * 0.5, height: height * 0.3 },
      dress: { x: width * 0.25, y: height * 0.1, width: width * 0.5, height: height * 0.6 },
      shoes: { x: width * 0.25, y: height * 0.75, width: width * 0.2, height: height * 0.15 },
      accessory: { x: width * 0.1, y: height * 0.1, width: width * 0.15, height: height * 0.15 },
      sunglasses: { x: width * 0.75, y: height * 0.1, width: width * 0.15, height: height * 0.1 },
      outerwear: { x: width * 0.75, y: height * 0.25, width: width * 0.2, height: height * 0.4 }
    };

    // Load and draw all images
    const loadImages = async () => {
      try {
        for (const item of items) {
          const img = new Image();
          img.crossOrigin = "anonymous"; // Handle CORS
          img.src = item.image;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = (e) => {
              console.error('Error loading image:', item.image, e);
              reject(e);
            };
          });

          // Get position based on item type or use provided position
          const position = item.position || defaultPositions[item.type];
          if (position) {
            // Create an offscreen canvas for image processing
            const offscreenCanvas = document.createElement('canvas');
            const offscreenCtx = offscreenCanvas.getContext('2d');
            if (!offscreenCtx) continue;

            // Set offscreen canvas size
            offscreenCanvas.width = img.width;
            offscreenCanvas.height = img.height;

            // Draw the original image to offscreen canvas
            offscreenCtx.drawImage(img, 0, 0);

            // Remove background (simple white background removal)
            const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
              // If pixel is white or very close to white
              if (data[i] > 250 && data[i + 1] > 250 && data[i + 2] > 250) {
                data[i + 3] = 0; // Set alpha to 0
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
          }
        }
      } catch (error) {
        console.error('Error loading images:', error);
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
    />
  );
};
