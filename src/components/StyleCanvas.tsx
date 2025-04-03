
import { useRef, useEffect } from "react";
import { useStyleCanvasRenderer } from "@/hooks/useStyleCanvasRenderer";

interface StyleCanvasProps {
  id: string;
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
    // Ensure the canvas element exists and assign it to our ref
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (canvas) {
      canvasRef.current = canvas;
    }
  }, [id]);
  
  // Use our custom hook for canvas rendering
  const { isLoading, error } = useStyleCanvasRenderer({
    canvasRef,
    styleType,
    outfitData,
    occasion,
    width,
    height
  });

  return null; // This component doesn't render anything directly, it manipulates the canvas element with ID
};
