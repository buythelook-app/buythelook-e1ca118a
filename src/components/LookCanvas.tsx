import { useEffect, useRef } from "react";

interface LookCanvasProps {
  items: Array<{
    id: string;
    image: string;
  }>;
  width?: number;
  height?: number;
}

export const LookCanvas = ({ items, width = 400, height = 400 }: LookCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Load and draw all images
    const loadImages = async () => {
      try {
        for (let i = 0; i < items.length; i++) {
          const img = new Image();
          img.src = items[i].image;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          // Calculate position for each item (you can adjust this logic)
          const x = (i % 2) * (width / 2);
          const y = Math.floor(i / 2) * (height / 2);
          const itemWidth = width / 2;
          const itemHeight = height / 2;

          // Draw the image maintaining aspect ratio
          ctx.drawImage(img, x, y, itemWidth, itemHeight);
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
      className="border rounded-lg shadow-lg"
    />
  );
};