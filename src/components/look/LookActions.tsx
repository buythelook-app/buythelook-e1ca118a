
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
  name?: string;
  price?: string;
  type?: string;
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
    
    // Ensure we have properly formatted items
    let itemsToSave = items;
    
    // If no items provided, create a fallback item
    if (!itemsToSave || itemsToSave.length === 0) {
      itemsToSave = [{
        id: `item-${id}`,
        image: image,
        name: title,
        price: price,
        type: category
      }];
    }
    
    console.log("Items being saved to favorites:", itemsToSave);
    
    const look = { 
      id, 
      image, 
      title, 
      price, 
      category,
      items: itemsToSave
    };
    
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
    
    // Ensure we have lookItems to add
    const lookItems = items.length > 0 
      ? items.map(item => ({
          ...item,
          title: item.name || `Item from ${title}`,
          price: item.price || (parseFloat(price.replace(/[^0-9.]/g, '') || '0') / Math.max(items.length, 1)).toFixed(2),
          lookId: id
        }))
      : [{
          id: `item-${id}`,
          image,
          title: `Item from ${title}`,
          price,
          lookId: id
        }];
    
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
    
    // Use items array if it exists
    const itemsToStore = items.length > 0 
      ? items 
      : [{
          id: `item-${id}`,
          image,
          name: title,
          price,
          type: category
        }];
    
    // Store the look items for viewing in suggestions
    localStorage.setItem('selected-look-items', JSON.stringify(itemsToStore));
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
