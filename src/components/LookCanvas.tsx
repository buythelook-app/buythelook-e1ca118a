
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

    const scale = window.devicePixelRatio || 1;
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Sort items so shirts are drawn first, then bottoms, then shoes
    const sortedItems = [...items].sort((a, b) => {
      if (a.type === 'top') return -1;
      if (b.type === 'top') return 1;
      if (a.type === 'bottom') return 0;
      if (a.type === 'shoes') return 1;
      return 0;
    });

    console.log('Drawing items:', sortedItems);

    const defaultPositions = {
      outerwear: { x: width * 0.02, y: height * 0.01, width: width * 0.96, height: height * 0.35 },
      top: { x: width * 0.02, y: height * 0.02, width: width * 0.96, height: height * 0.35 }, // Reduced height for top
      bottom: { x: width * 0.05, y: height * 0.38, width: width * 0.9, height: height * 0.35 }, // Moved down below top
      dress: { x: width * 0.02, y: height * 0.01, width: width * 0.96, height: height * 0.85 },
      shoes: { x: width * 0.25, y: height * 0.65, width: width * 0.5, height: height * 0.2 },
      accessory: { x: width * 0.2, y: height * 0.35, width: width * 0.6, height: height * 0.4 },
      sunglasses: { x: width * 0.2, y: height * 0.01, width: width * 0.6, height: height * 0.25 },
      cart: { x: width * 0.35, y: height * 0.01, width: width * 0.3, height: height * 0.15 }
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
              console.log('Drawing item with position:', position);

              const offscreenCanvas = document.createElement('canvas');
              const offscreenCtx = offscreenCanvas.getContext('2d');
              if (!offscreenCtx) {
                console.error('Could not get offscreen context');
                continue;
              }

              offscreenCanvas.width = img.width;
              offscreenCanvas.height = img.height;

              // For shoes, focus on the center of the image
              if (item.type === 'shoes') {
                const cropX = img.width * 0.15; // 15% margin from left
                const cropWidth = img.width * 0.7; // Use 70% of width
                const cropY = img.height * 0.15; // 15% margin from top
                const cropHeight = img.height * 0.7; // Use 70% of height
                
                offscreenCtx.drawImage(
                  img,
                  cropX, cropY, cropWidth, cropHeight,
                  0, 0, img.width, img.height
                );
              } else {
                offscreenCtx.drawImage(img, 0, 0, img.width, img.height);
              }

              const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
              const data = imageData.data;
              
              // Enhanced background removal for shoes
              if (item.type === 'shoes') {
                for (let i = 0; i < data.length; i += 4) {
                  const r = data[i];
                  const g = data[i + 1];
                  const b = data[i + 2];
                  
                  // Remove white and light backgrounds
                  if (r > 240 && g > 240 && b > 240) {
                    data[i + 3] = 0;
                  }
                  
                  // Remove gray backgrounds
                  const avgColor = (r + g + b) / 3;
                  if (avgColor > 200 && Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && Math.abs(r - b) < 10) {
                    data[i + 3] = 0;
                  }
                }
              } else {
                for (let i = 0; i < data.length; i += 4) {
                  const r = data[i];
                  const g = data[i + 1];
                  const b = data[i + 2];
                  
                  const avgColor = (r + g + b) / 3;
                  if (avgColor > 180 && Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15) {
                    data[i + 3] = 0;
                  }
                }
              }
              
              offscreenCtx.putImageData(imageData, 0, 0);

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
