
import { useCanvasRenderer } from "@/hooks/useCanvasRenderer";
import { type CanvasItem } from "@/types/canvasTypes";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/components/Cart";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface LookCanvasProps {
  items: CanvasItem[];
  width?: number;
  height?: number;
  occasion?: string;
  originalItems?: any[]; // Original items data for cart
}

export const LookCanvas = ({ 
  items, 
  width = 600, 
  height = 900,
  occasion,
  originalItems
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
  const [isHovering, setIsHovering] = useState(false);

  const handleViewDetails = () => {
    if (originalItems && originalItems.length > 0) {
      // Store the full item details for the suggestions page
      localStorage.setItem(`selected-look-items`, JSON.stringify(originalItems));
      localStorage.setItem(`selected-look-occasion`, occasion || '');
      navigate(`/suggestions`);
    }
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
        description: `${occasion || 'Look'} added to your cart`,
      });
      
      navigate('/cart');
    }
  };

  return (
    <div 
      className="relative text-center w-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
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
      />
      
      {/* Always visible buttons on the canvas */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 opacity-100 transition-opacity">
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
  );
};
