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
  
  // Use our custom hook for canvas rendering
  const { isLoading, error } = useStyleCanvasRenderer({
    canvasRef,
    styleType,
    outfitData,
    occasion,
    width,
    height
  });

  // Return an actual canvas element with the ref and id
  return (
    <canvas
      ref={canvasRef}
      id={id}
      width={width}
      height={height}
      style={{ display: 'none' }}
    />
  );
};
