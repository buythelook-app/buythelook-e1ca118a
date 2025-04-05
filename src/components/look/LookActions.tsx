import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useCartStore } from "../Cart";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface LookItem {
  id: string;
  image: string;
}

interface LookActionsProps {
  id: string;
  image: string;
  title: string;
  price: string;
  category: string;
  items?: LookItem[];
}

export const LookActions = ({ id, image, title, price, category, items = [] }: LookActionsProps) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const { addLook, looks } = useCartStore();
  const isInCart = looks.some(look => look.id === id);
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log(`LookActions mounted for ${id}, isFavorite: ${isFavorite(id)}, items:`, items);
  }, [id, isFavorite, items]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Make sure items have proper format with id and image
    const processedItems = items.map(item => ({
      id: item.id || `item-${Math.random().toString(36).substring(2, 9)}`,
      image: item.image
    }));
    
    const look = { 
      id, 
      image, 
      title, 
      price, 
      category,
      items: processedItems.length > 0 ? processedItems : undefined
    };
    
    console.log("Look being added/removed:", look);
    
    if (isFavorite(id)) {
      removeFavorite(id);
      toast.success('Removed from My List');
    } else {
      addFavorite(look);
      toast.success('Added to My List');
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const lookItems = items.map(item => ({
      ...item,
      title: `Item from ${title}`,
      price: (parseFloat(price.replace(/[^0-9.]/g, '') || '0') / items.length).toFixed(2),
      lookId: id
    }));
    
    addLook({
      id,
      title,
      items: lookItems,
      totalPrice: price
    });
    
    toast.success('Look added to cart');
  };
  
  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Store the look items for viewing in suggestions
    localStorage.setItem('selected-look-items', JSON.stringify(items));
    localStorage.setItem('selected-look-occasion', category);
    
    navigate('/suggestions');
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="icon"
        className={`hover:text-purple-600 transition-colors ${isFavorite(id) ? 'text-purple-600' : ''}`}
        onClick={handleFavoriteClick}
      >
        <Heart 
          className="h-5 w-5"
          fill={isFavorite(id) ? "currentColor" : "none"}
        />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className={`hover:text-purple-600 transition-colors ${isInCart ? 'text-purple-600' : ''}`}
        onClick={handleAddToCart}
      >
        <ShoppingCart 
          className="h-5 w-5"
          fill={isInCart ? "currentColor" : "none"}
        />
      </Button>
      
      <Button
        variant="ghost"
        size="icon" 
        className="hover:text-purple-600 transition-colors"
        onClick={handleViewDetails}
      >
        <Eye className="h-5 w-5" />
      </Button>
    </div>
  );
};
