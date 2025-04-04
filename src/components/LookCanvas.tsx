
import { useCanvasRenderer } from "@/hooks/useCanvasRenderer";
import { type CanvasItem } from "@/types/canvasTypes";
import { useState, useRef } from "react";

interface LookCanvasProps {
  items: CanvasItem[];
  width?: number;
  height?: number;
  occasion?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export const LookCanvas = ({ 
  items, 
  width = 600, 
  height = 900,
  occasion,
  onSwipeLeft,
  onSwipeRight
}: LookCanvasProps) => {
  const { canvasRef, isLoading, error: canvasError } = useCanvasRenderer({
    items,
    width,
    height,
    occasion
  });
  
  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const diffX = touchStartX.current - touchEndX.current;
    
    // Minimum swipe distance to trigger action (20px)
    if (Math.abs(diffX) > 20) {
      if (diffX > 0 && onSwipeLeft) {
        // Swiped left
        onSwipeLeft();
      } else if (diffX < 0 && onSwipeRight) {
        // Swiped right
        onSwipeRight();
      }
    }
    
    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
  };

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
        className="bg-white border-2 border-gray-800 rounded-lg shadow-lg mx-auto"
        style={{ 
          maxWidth: '100%',
          width: `${width}px`,
          height: `${height}px`,
          display: 'block',
          margin: '0 auto'
        }}
        onTouchStart={onSwipeLeft || onSwipeRight ? handleTouchStart : undefined}
        onTouchMove={onSwipeLeft || onSwipeRight ? handleTouchMove : undefined}
        onTouchEnd={onSwipeLeft || onSwipeRight ? handleTouchEnd : undefined}
      />
    </div>
  );
};
