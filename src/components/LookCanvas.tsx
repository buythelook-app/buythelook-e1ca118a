
import { useCanvasRenderer } from "@/hooks/useCanvasRenderer";
import { type CanvasItem } from "@/types/canvasTypes";
import { Button } from "./ui/button";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/components/Cart";
import { useToast } from "@/hooks/use-toast";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

interface LookCanvasProps {
  items: CanvasItem[];
  width?: number;
  height?: number;
  occasion?: string;
  originalItems?: any[]; // Original items data for cart
  showButtons?: boolean;
}

export const LookCanvas = ({ 
  items, 
  width = 600, 
  height = 900,
  occasion,
  originalItems,
  showButtons = true
}: LookCanvasProps) => {
  const { canvasRef, isLoading, error: canvasError } = useCanvasRenderer({
    items,
    width,
    height,
    occasion
  });
  
  const navigate = useNavigate();
  const { addItems } = useCartStore();
  const { toast } = useToast();
  const { addFavorite } = useFavoritesStore();

  const handleAddToFavorites = () => {
    if (originalItems && originalItems.length > 0) {
      // Create a look object for My List
      const look = {
        id: `look-${Date.now()}`,
        image: originalItems[0].image || "",
        title: `${occasion || 'Style'} Look`,
        price: calculateTotalPrice(),
        category: occasion || "Look",
        items: originalItems
      };
      
      addFavorite(look);
      
      toast({
        title: "Added to My List",
        description: "Look has been added to your favorites",
      });
    }
  };

  const calculateTotalPrice = () => {
    if (!originalItems) return "$0.00";
    
    let total = 0;
    originalItems.forEach(item => {
      const priceString = item.price || "0";
      const priceNumber = parseFloat(priceString.replace(/[^0-9.]/g, ''));
      if (!isNaN(priceNumber)) {
        total += priceNumber;
      }
    });
    
    return `$${total.toFixed(2)}`;
  };

  const handleBuyLook = () => {
    if (originalItems && originalItems.length > 0) {
      const cartItems = originalItems.map(item => ({
        id: item.id,
        title: item.name || "",
        price: item.price || "$0.00",
        image: item.image
      }));
      
      addItems(cartItems);
      
      toast({
        title: "Success",
        description: "Look added to your cart",
      });
      
      navigate('/cart');
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
      <div className="relative">
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
        
        {showButtons && originalItems && originalItems.length > 0 && (
          <div 
            className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-50"
            style={{ pointerEvents: 'auto' }}
          >
            <Button 
              onClick={handleAddToFavorites}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-lg flex-1 h-10 opacity-100 text-white font-bold border border-white"
              style={{ opacity: 1 }}
            >
              <Heart className="w-5 h-5" />
            </Button>
            
            <Button 
              onClick={handleBuyLook}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-lg flex-1 h-10 opacity-100 text-white font-bold border border-white"
              style={{ opacity: 1 }}
            >
              <ShoppingCart className="w-5 h-5" />
            </Button>
            
            <Button
              onClick={handleViewDetails}
              className="bg-[#D946EF] hover:bg-[#C026D3] shadow-lg flex-1 h-10 opacity-100 text-white font-bold border border-white"
              style={{ opacity: 1 }}
            >
              <Eye className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
