
import { useRef } from "react";
import { useStyleCanvasRenderer } from "@/hooks/useStyleCanvasRenderer";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/components/Cart";
import { useToast } from "@/hooks/use-toast";

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
  const navigate = useNavigate();
  const { addItems } = useCartStore();
  const { toast } = useToast();
  
  // Use our custom hook for canvas rendering
  const { isLoading, error } = useStyleCanvasRenderer({
    canvasRef,
    styleType,
    outfitData,
    occasion,
    width,
    height
  });
  
  // Get items from localStorage
  const handleBuyLook = () => {
    // Get the items to add to cart from localStorage
    const storedItems = localStorage.getItem('selected-look-items');
    if (storedItems) {
      try {
        const items = JSON.parse(storedItems);
        const cartItems = items.map((item: any) => ({
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
      } catch (e) {
        console.error('Error adding look to cart:', e);
      }
    }
  };

  const handleViewLook = () => {
    navigate('/suggestions');
  };

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
      <div className="relative">
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
        
        {/* Always visible buttons at the bottom of canvas */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
          <Button 
            onClick={handleBuyLook}
            className="bg-netflix-accent hover:bg-netflix-accent/80 shadow-md flex-1 text-xs h-8"
          >
            <ShoppingCart className="mr-1 h-3 w-3" />
            Buy the look
          </Button>
          
          <Button
            onClick={handleViewLook}
            className="bg-netflix-accent hover:bg-netflix-accent/80 shadow-md flex-1 text-xs h-8"
          >
            <Eye className="mr-1 h-3 w-3" />
            Watch this look
          </Button>
        </div>
      </div>
    </div>
  );
};
