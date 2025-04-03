import { useRef } from "react";
import { useStyleCanvasRenderer } from "@/hooks/useStyleCanvasRenderer";

interface OutfitCanvasProps {
  styleType?: number;
  outfitData?: any;
  occasion?: string;
  width?: number;
  height?: number;
  className?: string;
}

export const OutfitCanvas = ({ 
  styleType = 0, 
  outfitData, 
  occasion,
  width = 300,
  height = 600, // Increased height for better aspect ratio
  className = ""
}: OutfitCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Use our custom hook for canvas rendering
  const { isLoading, error } = useStyleCanvasRenderer({
    canvasRef,
    styleType,
    outfitData,
    occasion,
    width,
    height
  });

  return (
    <div className={`relative text-center w-full ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
          <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-netflix-accent animate-spin"></div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
          <div className="text-red-500 text-center p-4">
            <p>{error}</p>
            <p className="text-sm mt-2">Please try refreshing the page</p>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="border rounded-lg shadow-lg bg-white mx-auto"
        style={{ 
          maxWidth: '100%',
          width: `${width}px`,
          height: `${height}px`,
          display: 'block',
          margin: '0 auto'
        }}
      />
    </div>
  );
};
