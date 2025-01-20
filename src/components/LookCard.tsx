import { Heart, ShoppingCart } from "lucide-react";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useCartStore } from "./Cart";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface LookCardProps {
  id: string;
  image: string;
  title: string;
  price: string;
  category: string;
  items?: Array<{
    id: string;
    image: string;
  }>;
}

export const LookCard = ({ id, image, title, price, category, items = [] }: LookCardProps) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const { addLook } = useCartStore();

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
    const lookItems = items.map(item => ({
      ...item,
      title: `Item from ${title}`,
      price: (parseFloat(price) / items.length).toFixed(2),
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

  return (
    <div className="look-card group">
      <img 
        src={image} 
        alt={title} 
        className="w-full h-[400px] object-cover rounded-lg transition-transform duration-300 group-hover:scale-105" 
      />
      <div className="look-card-content rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-netflix-accent font-medium mb-1 tracking-wide uppercase">{category}</p>
            <h3 className="text-lg font-display font-semibold mb-1 text-white">{title}</h3>
            <p className="text-sm text-white/90 font-medium">{price}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-netflix-accent transition-colors"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon" 
              className="hover:text-netflix-accent transition-colors"
              onClick={handleFavoriteClick}
            >
              <Heart 
                className="h-5 w-5"
                fill={isFavorite(id) ? "currentColor" : "none"}
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};