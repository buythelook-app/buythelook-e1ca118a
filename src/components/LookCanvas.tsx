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
          img.src = item.image;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          // Get position based on item type or use provided position
          const position = item.position || defaultPositions[item.type];
          if (position) {
            ctx.drawImage(img, position.x, position.y, position.width, position.height);
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