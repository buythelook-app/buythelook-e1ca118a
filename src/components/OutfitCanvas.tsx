
import { useRef } from "react";
import { useStyleCanvasRenderer } from "@/hooks/useStyleCanvasRenderer";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/components/Cart";
import { useToast } from "@/hooks/use-toast";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

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
  const { addFavorite } = useFavoritesStore();
  
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
  const handleAddToFavorites = () => {
    // Get the items from localStorage
    const storedItems = localStorage.getItem('selected-look-items');
    if (storedItems) {
      try {
        const items = JSON.parse(storedItems);
        // Create a look object for My List
        const look = {
          id: `look-${Date.now()}`,
          image: outfitData?.top || "",
          title: `${occasion || 'Style'} Look`,
          price: "$0.00", // Default price
          category: occasion || "Look"
        };
        
        addFavorite(look);
        
        toast({
          title: "Added to My List",
          description: "Look has been added to your favorites",
        });
      } catch (e) {
        console.error('Error adding look to favorites:', e);
      }
    }
  };
  
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
        
        {/* Fixed position buttons at the bottom of canvas with icons */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-50">
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
            onClick={handleViewLook}
            className="bg-[#D946EF] hover:bg-[#C026D3] shadow-lg flex-1 h-10 opacity-100 text-white font-bold border border-white"
            style={{ opacity: 1 }}
          >
            <Eye className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
