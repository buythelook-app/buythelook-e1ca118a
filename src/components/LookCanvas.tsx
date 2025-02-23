
import { useEffect, useRef } from "react";

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas with device pixel ratio for higher quality
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

    // Define positions with improved spacing
    const defaultPositions = {
      outerwear: { x: width * 0.05, y: height * 0.02, width: width * 0.9, height: height * 0.5 },
      top: { x: width * 0.05, y: height * 0.02, width: width * 0.9, height: height * 0.5 },
      bottom: { x: width * 0.05, y: height * 0.25, width: width * 0.9, height: height * 0.5 },
      dress: { x: width * 0.05, y: height * 0.02, width: width * 0.9, height: height * 0.9 },
      shoes: { x: width * 0.2, y: height * 0.5, width: width * 0.6, height: height * 0.3 },
      accessory: { x: width * 0.05, y: height * 0.25, width: width * 0.9, height: height * 0.5 },
      sunglasses: { x: width * 0.05, y: height * 0.02, width: width * 0.9, height: height * 0.5 },
      cart: { x: width * 0.05, y: height * 0.02, width: width * 0.9, height: height * 0.5 }
    };

    const loadImages = async () => {
      try {
        for (const item of sortedItems) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          
          // Remove timestamp to prevent unnecessary image reloading
          img.src = item.image;

          try {
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });

            const position = item.position || defaultPositions[item.type];
            if (position) {
              const offscreenCanvas = document.createElement('canvas');
              const offscreenCtx = offscreenCanvas.getContext('2d', { 
                alpha: true,
                willReadFrequently: true 
              });
              
              if (!offscreenCtx) {
                console.error('Could not get offscreen context');
                continue;
              }

              // Set offscreen canvas size to match original image dimensions
              offscreenCanvas.width = img.width;
              offscreenCanvas.height = img.height;

              // Draw the original image
              offscreenCtx.drawImage(img, 0, 0, img.width, img.height);

              const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
              const data = imageData.data;

              // More precise background removal with improved thresholds
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                // Skip fully transparent pixels
                if (a === 0) continue;

                const brightness = (r + g + b) / 3;
                const colorDiff = Math.max(
                  Math.abs(r - g),
                  Math.abs(g - b),
                  Math.abs(r - b)
                );

                if (item.type === 'shoes') {
                  // Special handling for shoes to preserve details
                  if (brightness > 245 && colorDiff < 15) {
                    data[i + 3] = 0;
                  }
                } else {
                  // Improved background detection for other items
                  if (brightness > 240 && colorDiff < 20) {
                    data[i + 3] = 0;
                  }
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

              const centerX = position.x + (position.width - drawWidth) / 2;
              const centerY = position.y + (position.height - drawHeight) / 2;

              // Apply high-quality image rendering
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';

              // Draw the processed image
              ctx.drawImage(
                offscreenCanvas,
                centerX,
                centerY,
                drawWidth,
                drawHeight
              );
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
        height: `${height}px`,
        imageRendering: 'high-quality'
      }}
    />
  );
};
