
import { useEffect, useRef } from "react";

interface StyleCanvasProps {
  id: string;
  styleType: number;
  outfitData?: any;
  occasion?: string;
}

export const StyleCanvas = ({ id, styleType, outfitData, occasion }: StyleCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas and set a white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // If we have outfit data, draw the outfit items in order
    if (outfitData) {
      const { top, bottom, shoes } = outfitData;
      
      // Draw top (upper third of canvas)
      if (top) {
        ctx.fillStyle = top;
        ctx.fillRect(20, 20, canvas.width - 40, canvas.height / 3 - 30);
      }
      
      // Draw bottom (middle third of canvas)
      if (bottom) {
        ctx.fillStyle = bottom;
        ctx.fillRect(20, canvas.height / 3 + 10, canvas.width - 40, canvas.height / 3 - 20);
      }
      
      // Draw shoes (bottom portion of canvas)
      if (shoes) {
        ctx.fillStyle = shoes;
        ctx.fillRect(60, canvas.height * 2/3 + 20, canvas.width - 120, canvas.height / 3 - 40);
      }
    }
  }, [id, styleType, outfitData]);

  return null; // This component doesn't render anything, it just manipulates the canvas
};
