import { Heart, ShoppingCart } from "lucide-react";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useCartStore } from "./Cart";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { AspectRatio } from "./ui/aspect-ratio";

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
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
      <AspectRatio ratio={3/4} className="relative overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300"
          onError={(e) => {
            console.error(`Error loading image: ${image}`);
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
      </AspectRatio>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-purple-600 font-medium mb-1 tracking-wide uppercase">{category}</p>
            <h3 className="text-lg font-semibold mb-1 text-gray-900">{title}</h3>
            <p className="text-sm text-gray-700 font-medium">{price}</p>
          </div>
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
        </div>
      </div>
    </div>
  );
};