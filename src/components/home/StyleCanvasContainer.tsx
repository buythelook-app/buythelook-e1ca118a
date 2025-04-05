
import { useNavigate } from "react-router-dom";
import { StyleCanvas } from "@/components/StyleCanvas";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/components/Cart";
import { useToast } from "@/hooks/use-toast";

export const StyleCanvasContainer = () => {
  const navigate = useNavigate();
  const [outfitData, setOutfitData] = useState<any>(null);
  const [styleType, setStyleType] = useState<number>(0);
  const { addItems } = useCartStore();
  const { toast } = useToast();
  
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
      </Card>
    </div>
  );
};
