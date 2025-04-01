
import { useEffect, useRef } from "react";

interface StyleCanvasProps {
  id: string;
  styleType: number;
}

export const StyleCanvas = ({ id, styleType }: StyleCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw different patterns based on styleType
    switch (styleType) {
      case 0: // Basic style visualization - diagonal stripes
        drawDiagonalStripes(ctx, canvas.width, canvas.height);
        break;
      case 1: // Circles pattern
        drawCirclesPattern(ctx, canvas.width, canvas.height);
        break;
      case 2: // Grid pattern
        drawGridPattern(ctx, canvas.width, canvas.height);
        break;
      case 3: // Wave pattern
        drawWavePattern(ctx, canvas.width, canvas.height);
        break;
      default:
        drawDiagonalStripes(ctx, canvas.width, canvas.height);
    }
  }, [id, styleType]);

  const drawDiagonalStripes = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "#E86A33";
    ctx.lineWidth = 3;
    
    for (let i = -width; i < width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }
  };

  const drawCirclesPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const colors = ["#7752FE", "#8E8FFA", "#C2DEDC", "#ECF4D6"];
    
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = 5 + Math.random() * 25;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
    }
  };

  const drawGridPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "#3A4F7A";
    ctx.lineWidth = 1;
    
    // Draw horizontal lines
    for (let y = 0; y <= height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw vertical lines
    for (let x = 0; x <= width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  };

  const drawWavePattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "#219C90";
    ctx.lineWidth = 2;
    
    for (let y = 20; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      
      for (let x = 0; x < width; x += 10) {
        ctx.lineTo(x, y + Math.sin(x * 0.05) * 10);
      }
      
      ctx.stroke();
    }
  };

  return null; // This component doesn't render anything, it just manipulates the canvas
};
