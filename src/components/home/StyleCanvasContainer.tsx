
import { useNavigate } from "react-router-dom";
import { StyleCanvas } from "@/components/StyleCanvas";
import { Card } from "@/components/ui/card";
import { Eye, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useCartStore } from "@/components/Cart";
import { useToast } from "@/hooks/use-toast";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

export const StyleCanvasContainer = () => {
  const navigate = useNavigate();
  const [outfitData, setOutfitData] = useState<any>(null);
  const [styleType, setStyleType] = useState<number>(0);
  const { addItems } = useCartStore();
  const { toast } = useToast();
  const { addFavorite } = useFavoritesStore();
  
  useEffect(() => {
    // Load initial outfit data from localStorage
    const storedOutfitData = localStorage.getItem('last-generated-outfit');
    if (storedOutfitData) {
      try {
        setOutfitData(JSON.parse(storedOutfitData));
      } catch (e) {
        console.error('Error parsing stored outfit data:', e);
      }
    }
  }, []);

  const handleAddToFavorites = () => {
    // Get the items from localStorage
    const storedItems = localStorage.getItem('selected-look-items') || 
                        localStorage.getItem('dashboard-items');
                        
    if (storedItems) {
      try {
        const items = JSON.parse(storedItems);
        // Create a look object for My List
        const look = {
          id: `look-${Date.now()}`,
          image: outfitData?.top || "",
          title: "Today's Look For You",
          price: "$0.00", // Default price
          category: "Daily Look"
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

  const handleViewLook = () => {
    navigate('/suggestions');
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
        toast({
          title: "Error",
          description: "Failed to add look to cart",
          variant: "destructive",
        });
      }
    } else {
      // If no stored items, use the dashboard items for the current outfit
      const fallbackItems = localStorage.getItem('dashboard-items');
      if (fallbackItems) {
        try {
          const items = JSON.parse(fallbackItems);
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
          toast({
            title: "Error",
            description: "Failed to add look to cart",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Notice",
          description: "No items available for this look",
        });
      }
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Today's Look For You</h2>
      <Card className="p-4">
        <div className="relative">
          <StyleCanvas 
            styleType={styleType} 
            outfitData={outfitData} 
            width={300} 
            height={400} 
          />
          
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
      </Card>
    </div>
  );
};
