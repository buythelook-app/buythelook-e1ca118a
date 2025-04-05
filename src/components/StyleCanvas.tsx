
import { useRef, useEffect } from "react";
import { useStyleCanvasRenderer } from "@/hooks/useStyleCanvasRenderer";

interface StyleCanvasProps {
  id?: string; // Make id optional by adding the ? symbol
  styleType: number;
  outfitData?: any;
  occasion?: string;
  width?: number;
  height?: number;
}

export const StyleCanvas = ({ 
  id, 
  styleType, 
  outfitData, 
  occasion,
  width = 300,
  height = 500 
}: StyleCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  useEffect(() => {
    // If an id is provided, find the canvas by ID, otherwise create a new one
    if (id) {
      const canvas = document.getElementById(id) as HTMLCanvasElement;
      if (canvas) {
        canvasRef.current = canvas;
      }
    } else {
      // Create a new canvas element if no id is provided
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Append to the DOM
      const container = document.getElementById('canvas-container');
      if (container) {
        container.innerHTML = ''; // Clear previous canvas
        container.appendChild(canvas);
        canvasRef.current = canvas;
      }
    }
  }, [id, width, height]);
  
  // Use our custom hook for canvas rendering
  const { isLoading, error } = useStyleCanvasRenderer({
    canvasRef,
    styleType,
    outfitData,
    occasion,
    width,
    height
  });

  // Return a div container for the canvas when no id is provided
  return !id ? <div id="canvas-container" className="w-full h-full"></div> : null;
};
