
import { useEffect } from "react";
import { StyleCanvas } from "../StyleCanvas";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/components/Cart";
import { useToast } from "@/hooks/use-toast";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

interface StyleVisualizationProps {
  outfitSuggestions: any[];
}

export const StyleVisualization = ({ outfitSuggestions }: StyleVisualizationProps) => {
  const navigate = useNavigate();
  const { addItems } = useCartStore();
  const { toast } = useToast();
  const { addFavorite } = useFavoritesStore();

  useEffect(() => {
    outfitSuggestions.forEach((_, index) => {
      const canvas = document.getElementById(`style-canvas-${index}`) as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    });
  }, [outfitSuggestions]);

  const handleAddToFavorites = (outfit: any, index: number) => {
    // Add the items to favorites
    const look = {
      id: `generated-look-${index}`,
      image: `canvas-${index}-image`,
      title: `${outfit.occasion || 'Style'} Look`,
      price: outfit.price || "$0.00",
      category: outfit.occasion || "Look"
    };
    
    addFavorite(look);
    
    toast({
      title: "Added to My List",
      description: "Look has been added to your favorites",
    });
  };

  const handleAddToCart = (outfit: any, index: number) => {
    // Add the items to cart
    const cartItems = [{
      id: `generated-item-${index}`,
      title: `${outfit.occasion || 'Style'} Look`,
      price: outfit.price || "$0.00",
      image: outfit.top || ""
    }];
    
    addItems(cartItems);
    
    toast({
      title: "Added to Cart",
      description: "Look has been added to your cart",
    });
  };

  const handleViewDetails = (outfit: any) => {
    // Store the outfit data for viewing in suggestions
    localStorage.setItem('selected-look-occasion', outfit.occasion || '');
    navigate('/suggestions');
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Style Visualization</h3>
      <div className="grid grid-cols-2 gap-4">
        {outfitSuggestions.length > 0 ? (
          outfitSuggestions.map((outfit, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <canvas 
                  id={`style-canvas-${index}`} 
                  className="w-full h-[500px] object-cover"
                  width="450"
                  height="600"
                ></canvas>
                <StyleCanvas 
                  id={`style-canvas-${index}`} 
                  styleType={index} 
                  outfitData={outfit}
                  occasion={outfit.occasion}
                />
                
                {/* Action buttons with icons */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-50">
                  <Button 
                    onClick={() => handleAddToFavorites(outfit, index)}
                    className="bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-lg flex-1 h-10 opacity-100 text-white font-bold border border-white"
                    style={{ opacity: 1 }}
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                  
                  <Button 
                    onClick={() => handleAddToCart(outfit, index)}
                    className="bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-lg flex-1 h-10 opacity-100 text-white font-bold border border-white"
                    style={{ opacity: 1 }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    onClick={() => handleViewDetails(outfit)}
                    className="bg-[#D946EF] hover:bg-[#C026D3] shadow-lg flex-1 h-10 opacity-100 text-white font-bold border border-white"
                    style={{ opacity: 1 }}
                  >
                    <Eye className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="p-3 text-center">
                <p className="text-sm font-medium">
                  {outfit.occasion ? outfit.occasion.charAt(0).toUpperCase() + outfit.occasion.slice(1) : `Style Option ${index + 1}`}
                </p>
              </div>
            </div>
          ))
        ) : (
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <canvas 
                  id={`style-canvas-${index}`} 
                  className="w-full h-[500px] object-cover"
                  width="450"
                  height="600"
                ></canvas>
                
                {/* Placeholder buttons for loading state */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-50">
                  <Button 
                    disabled
                    className="bg-gray-300 flex-1 h-10 opacity-100"
                    style={{ opacity: 1 }}
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                  
                  <Button 
                    disabled
                    className="bg-gray-300 flex-1 h-10 opacity-100"
                    style={{ opacity: 1 }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    disabled
                    className="bg-gray-300 flex-1 h-10 opacity-100"
                    style={{ opacity: 1 }}
                  >
                    <Eye className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="p-3 text-center">
                <p className="text-sm font-medium">Loading styles...</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
