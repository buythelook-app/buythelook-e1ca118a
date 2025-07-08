
import { Heart, Share2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TryMeButton } from "@/components/TryMeButton";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

interface LookActionsProps {
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

export const LookActions = ({ id, image, title, price, category, items = [] }: LookActionsProps) => {
  const { favorites, addToFavorites, removeFromFavorites } = useFavoritesStore();
  const isFavorite = favorites.some(fav => fav.id === id);

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(id);
    } else {
      addToFavorites({ id, image, title, price, category });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Check out this look: ${title}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Convert items to the format expected by TryMeButton
  const tryMeItems = items.map(item => ({
    id: item.id,
    image: item.image,
    type: 'top' as const, // Default type, will be overridden by actual item data
    name: title
  }));

  return (
    <div className="flex flex-col gap-2">
      <TryMeButton items={tryMeItems} />
      
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleFavorite}
          className={`p-2 ${isFavorite ? 'text-red-500' : 'text-gray-500'}`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="p-2 text-gray-500"
        >
          <Share2 className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="p-2 text-gray-500"
        >
          <ShoppingCart className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
