
import { useCanvasRenderer } from "@/hooks/useCanvasRenderer";
import { type CanvasItem } from "@/types/canvasTypes";
import { Button } from "./ui/button";
import { ShoppingCart, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/components/Cart";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

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

  // Log rendering information for debugging
  useEffect(() => {
    console.log("LookCanvas rendering with:", {
      itemsCount: items?.length || 0,
      showButtons,
      hasOriginalItems: !!originalItems && originalItems.length > 0,
      width,
      height,
      occasion
    });
  }, [items, showButtons, originalItems, width, height, occasion]);

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
          <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-purple-600 animate-spin"></div>
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
          className="bg-white border rounded-lg shadow-lg mx-auto outfit-canvas"
          style={{ 
            maxWidth: '100%',
            width: `${width}px`,
            height: `${height}px`,
            display: 'block',
            margin: '0 auto'
          }}
        />
        
        {showButtons && originalItems && originalItems.length > 0 && (
          <div className="fixed-button-container">
            <Button 
              onClick={handleBuyLook}
              className="btn-primary-visible flex-1"
            >
              <ShoppingCart className="mr-1 h-4 w-4" />
              Buy the look
            </Button>
            
            <Button
              onClick={handleViewDetails}
              className="btn-secondary-visible flex-1"
            >
              <Eye className="mr-1 h-4 w-4" />
              Watch this look
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
