
import { useCanvasRenderer } from "@/hooks/useCanvasRenderer";
import { type CanvasItem } from "@/types/canvasTypes";

interface LookCanvasProps {
  items: CanvasItem[];
  width?: number;
  height?: number;
}

export const LookCanvas = ({ items, width = 600, height = 900 }: LookCanvasProps) => {
  const { canvasRef, isLoading, error: canvasError } = useCanvasRenderer({
    items,
    width,
    height
  });

  return (
    <div className="relative text-center w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
          <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-netflix-accent animate-spin"></div>
        </div>
      )}
      {canvasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
          <div className="text-red-500 text-center p-4">
            <p>{canvasError}</p>
            <p className="text-sm mt-2">Please try refreshing the page</p>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="bg-white border rounded-lg shadow-lg mx-auto"
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
