
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

    // Define positions with enhanced shoe positioning and cropping
    const defaultPositions = {
      outerwear: { x: width * 0.02, y: height * 0.02, width: width * 0.96, height: height * 0.5 },
      top: { x: width * 0.02, y: height * 0.02, width: width * 0.96, height: height * 0.5 },
      bottom: { x: width * 0.02, y: height * 0.25, width: width * 0.96, height: height * 0.5 },
      dress: { x: width * 0.02, y: height * 0.02, width: width * 0.96, height: height * 0.9 },
      shoes: { x: width * 0.2, y: height * 0.6, width: width * 0.6, height: height * 0.3 }, // Adjusted position and size for shoes
      accessory: { x: width * 0.02, y: height * 0.25, width: width * 0.96, height: height * 0.5 },
      sunglasses: { x: width * 0.02, y: height * 0.02, width: width * 0.96, height: height * 0.5 },
      cart: { x: width * 0.02, y: height * 0.02, width: width * 0.96, height: height * 0.5 }
    };

    const loadImages = async () => {
      try {
        for (const item of sortedItems) {
          console.log('Loading image for item:', item);
          
          const img = new Image();
          img.crossOrigin = "anonymous";
          
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

            const position = item.position || defaultPositions[item.type];
            if (position) {
              const offscreenCanvas = document.createElement('canvas');
              const offscreenCtx = offscreenCanvas.getContext('2d');
              if (!offscreenCtx) continue;

              offscreenCanvas.width = img.width;
              offscreenCanvas.height = img.height;

              // Special handling for shoes - more aggressive cropping and background removal
              if (item.type === 'shoes') {
                // Crop more aggressively for shoes to focus on the item
                const cropX = img.width * 0.2;
                const cropWidth = img.width * 0.6;
                const cropY = img.height * 0.2;
                const cropHeight = img.height * 0.6;
                
                offscreenCtx.drawImage(
                  img,
                  cropX, cropY, cropWidth, cropHeight,
                  0, 0, img.width, img.height
                );

                // Enhanced background removal for shoes
                const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
                const data = imageData.data;

                for (let i = 0; i < data.length; i += 4) {
                  const r = data[i];
                  const g = data[i + 1];
                  const b = data[i + 2];
                  
                  // More aggressive background removal for shoes
                  const brightness = (r + g + b) / 3;
                  const whiteness = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
                  
                  if (brightness > 240 || (brightness > 200 && whiteness < 15)) {
                    data[i + 3] = 0; // Make pixel transparent
                  }
                }

                offscreenCtx.putImageData(imageData, 0, 0);
              } else {
                // Normal handling for other items
                offscreenCtx.drawImage(img, 0, 0);
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
              }

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

              ctx.save();
              ctx.drawImage(
                offscreenCanvas,
                centerX,
                centerY,
                drawWidth,
                drawHeight
              );
              ctx.restore();
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
