
import { LookCanvas } from "@/components/LookCanvas";
import { Button } from "@/components/ui/button";
import { type CanvasItem } from "@/types/canvasTypes";
import { ShoppingCart, Shuffle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface OutfitCarouselProps {
  canvasItems: CanvasItem[];
  isRefreshing: boolean;
  onAddToCart: () => void;
  onTryDifferent: () => void;
  occasion?: string;
  outfitCount: number;
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const OutfitCarousel = ({ 
  canvasItems, 
  isRefreshing, 
  onAddToCart, 
  onTryDifferent,
  occasion,
  outfitCount,
  currentIndex,
  onPrevious,
  onNext
}: OutfitCarouselProps) => {
  // Touch handling for swipe gestures
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
    
    // Minimum swipe distance to trigger action (40px)
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        // Swiped left - go to next
        onNext();
      } else {
        // Swiped right - go to previous
        onPrevious();
      }
    }
    
    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="mb-8 flex flex-col items-center">
      <div className="relative w-[300px]">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden pb-4">
          <div 
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {isRefreshing ? (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                <Loader2 className="h-8 w-8 animate-spin text-netflix-accent" />
              </div>
            ) : null}
            
            <LookCanvas items={canvasItems} width={300} height={480} occasion={occasion} />
            
            {/* Navigation arrows */}
            {outfitCount > 1 && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrevious();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-netflix-accent/80 hover:bg-netflix-accent text-white p-2 rounded-full z-10"
                  aria-label="Previous outfit"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-netflix-accent/80 hover:bg-netflix-accent text-white p-2 rounded-full z-10"
                  aria-label="Next outfit"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {/* Outfit counter indicator */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full z-10">
                  {currentIndex + 1}/{outfitCount}
                </div>
              </>
            )}
            
            <div className="absolute bottom-0 left-4 right-4 flex justify-between gap-2">
              <Button 
                onClick={onAddToCart}
                className="bg-netflix-accent hover:bg-netflix-accent/80 shadow-lg flex-1 text-xs h-8"
                disabled={isRefreshing}
              >
                <ShoppingCart className="mr-1 h-3 w-3" />
                Buy the look
              </Button>
              <Button
                onClick={onTryDifferent}
                className="bg-netflix-accent hover:bg-netflix-accent/80 shadow-lg flex-1 text-xs h-8"
                disabled={isRefreshing}
              >
                <Shuffle className="mr-1 h-3 w-3" />
                Try different
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
