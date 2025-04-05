
import { LookCanvas } from "@/components/LookCanvas";
import { Button } from "@/components/ui/button";
import { type CanvasItem } from "@/types/canvasTypes";
import { ShoppingCart, Shuffle, Loader2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/components/Cart";
import { useToast } from "@/hooks/use-toast";

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
  const navigate = useNavigate();
  const { addItems } = useCartStore();
  const { toast } = useToast();

  const handleBuyLook = () => {
    if (originalItems && originalItems.length > 0) {
      onAddToCart();
    }
  };

  const handleViewDetails = () => {
    if (originalItems && originalItems.length > 0) {
      // Store the full item details for the suggestions page
      localStorage.setItem(`selected-look-items`, JSON.stringify(originalItems));
      localStorage.setItem(`selected-look-occasion`, occasion || '');
      navigate(`/suggestions`);
    }
  };

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
            
            <div className="relative">
              <LookCanvas 
                items={canvasItems} 
                width={300} 
                height={480} 
                occasion={occasion}
                originalItems={originalItems}
              />
              
              {/* Always visible buttons on the canvas */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
                <Button 
                  onClick={handleBuyLook}
                  className="bg-netflix-accent hover:bg-netflix-accent/80 shadow-md flex-1 text-xs h-8"
                  disabled={!originalItems?.length}
                >
                  <ShoppingCart className="mr-1 h-3 w-3" />
                  Buy the look
                </Button>
                
                <Button
                  onClick={handleViewDetails}
                  className="bg-netflix-accent hover:bg-netflix-accent/80 shadow-md flex-1 text-xs h-8"
                  disabled={!originalItems?.length}
                >
                  <Eye className="mr-1 h-3 w-3" />
                  Watch this look
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
