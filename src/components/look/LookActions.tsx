
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useCartStore } from "../Cart";
import { clearGlobalItemTrackers } from "@/services/lookService";

interface LookActionsProps {
  id: string;
  image: string;
  title: string;
  price: string;
  category: string;
  items?: Array<{ 
    id: string; 
    image: string;
    title?: string;
    price?: string;
    type?: string;
  }>;
}

export const LookActions = ({ id, image, title, price, category, items = [] }: LookActionsProps) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const { addLook, looks } = useCartStore();
  const isInCart = looks.some(look => look.id === id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const look = { id, image, title, price, category };
    
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
    
    // Make sure all items have the necessary properties
    const lookItems = items.map(item => ({
      id: item.id,
      image: item.image,
      title: item.title || `Item from ${title}`,
      price: item.price || (parseFloat(price) / items.length).toFixed(2),
      size: "M", // Default size
      type: item.type || 'unknown'
    }));
    
    addLook({
      id,
      title,
      items: lookItems,
      totalPrice: price
    });
    
    // Reset global item trackers when adding to cart to allow fresh suggestions
    clearGlobalItemTrackers();
    
    toast.success('Look added to cart');
  };

  return (
    <div className="flex gap-2">
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
        onClick={handleFavoriteClick}
      >
        <Heart 
          className="h-5 w-5"
          fill={isFavorite(id) ? "currentColor" : "none"}
        />
      </Button>
    </div>
  );
};
