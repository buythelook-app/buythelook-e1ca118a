
import { useNavigate } from "react-router-dom";
import { LookCanvas } from "@/components/LookCanvas";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart, Shuffle } from "lucide-react";
import { DashboardItem } from "@/types/lookTypes";
import { useCartStore } from "@/components/Cart";
import { useToast } from "@/hooks/use-toast";

interface LookItemProps {
  occasion: string;
  items: DashboardItem[];
  isRefreshing: boolean;
  userStyle: any;
  onShuffleLook: (occasion: string) => void;
  index: number;
}

export const LookItem = ({ 
  occasion, 
  items, 
  isRefreshing, 
  userStyle,
  onShuffleLook,
  index
}: LookItemProps) => {
  const navigate = useNavigate();
  const { addItems } = useCartStore();
  const { toast } = useToast();
  
  if (!items || items.length === 0) return null;
  
  const lookItems = items.map(item => ({
    id: item.id,
    image: item.image,
    type: item.type.toLowerCase() as 'top' | 'bottom' | 'shoes'
  }));
  
  let totalPrice = 0;
  items.forEach(item => {
    const itemPrice = item.price?.replace(/[^0-9.]/g, '') || '0';
    totalPrice += parseFloat(itemPrice);
  });
  
  const look = {
    id: `look-${occasion}-${index}`,
    title: `${occasion} Look`,
    items: lookItems,
    price: totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : '$0.00',
    category: userStyle?.analysis?.styleProfile || "Casual",
    occasion: occasion
  };

  const handleViewDetails = () => {
    // Store the full item details for the suggestions page
    localStorage.setItem(`selected-look-items`, JSON.stringify(items));
    localStorage.setItem(`selected-look-occasion`, occasion);
    navigate(`/suggestions`);
  };

  const handleBuyLook = () => {
    const cartItems = items.map(item => ({
      id: item.id,
      title: item.name || "", 
      price: item.price || "$0.00",
      image: item.image
    }));
    
    addItems(cartItems);
    
    toast({
      title: "Success",
      description: `${occasion} look added to your cart`,
    });
    
    navigate('/cart');
  };

  return (
    <div 
      key={look.id}
      className="bg-netflix-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white">{look.title}</h3>
        <span className="text-sm text-netflix-accent">{look.occasion}</span>
      </div>
      <div 
        className="mb-4 bg-white rounded-lg overflow-hidden relative group"
      >
        <div className="relative">
          <LookCanvas 
            items={look.items} 
            width={300} 
            height={500} 
            occasion={occasion} 
            originalItems={items}
            showButtons={false}
          />
          
          {/* Fixed position buttons with improved styling for visibility */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-50">
            <Button 
              onClick={handleBuyLook}
              className="bg-purple-600 hover:bg-purple-700 shadow-md flex-1 text-xs h-8 opacity-100 text-white"
            >
              <ShoppingCart className="mr-1 h-3 w-3" />
              Buy the look
            </Button>
            
            <Button
              onClick={handleViewDetails}
              className="bg-purple-600 hover:bg-purple-700 shadow-md flex-1 text-xs h-8 opacity-100 text-white"
            >
              <Eye className="mr-1 h-3 w-3" />
              Watch this look
            </Button>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShuffleLook(look.occasion);
          }}
          className="absolute top-4 right-4 bg-purple-600 text-white p-2 rounded-full opacity-100 hover:bg-purple-700"
          title="Try different combination"
          disabled={isRefreshing}
        >
          <Shuffle className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-netflix-accent font-semibold">{look.price}</p>
      </div>
    </div>
  );
};
