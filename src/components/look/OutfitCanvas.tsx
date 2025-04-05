
import { LookCanvas } from "@/components/LookCanvas";
import { Button } from "@/components/ui/button";
import { type CanvasItem } from "@/types/canvasTypes";
import { ShoppingCart, Shuffle, Loader2 } from "lucide-react";

interface OutfitCanvasProps {
  canvasItems: CanvasItem[];
  isRefreshing: boolean;
  onAddToCart: () => void;
  onTryDifferent: () => void;
  occasion?: string;
  originalItems?: any[]; // Original items data for cart
}

export const OutfitCanvas = ({ 
  canvasItems, 
  isRefreshing, 
  onAddToCart, 
  onTryDifferent,
  occasion,
  originalItems
}: OutfitCanvasProps) => {
  return (
    <div className="mb-8 flex flex-col items-center">
      <div className="relative w-[300px]">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden pb-4">
          <div className="relative">
            {isRefreshing ? (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-netflix-accent" />
              </div>
            ) : null}
            <LookCanvas 
              items={canvasItems} 
              width={300} 
              height={480} 
              occasion={occasion}
              originalItems={originalItems}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
