import { Heart } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

interface LookActionsProps {
  look: {
    id: string;
    title: string;
    price: string;
    category: string;
    image: string;
  };
}

export const LookActions = ({ look }: LookActionsProps) => {
  const { addFavorite, removeFavorite, favorites } = useFavoritesStore();
  const isFavorite = favorites.some(fav => fav.id === look.id);

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFavorite(look.id);
      toast.success("Removed from favorites");
    } else {
      addFavorite({
        id: look.id,
        title: look.title,
        price: look.price,
        category: look.category,
        image: look.image
      });
      toast.success("Added to favorites");
    }
  };

  return (
    <div className="bg-netflix-card p-6 rounded-lg shadow-lg">
      <p className="text-2xl text-netflix-accent mb-4">{look.price}</p>
      <div className="flex gap-4">
        <Button
          variant={isFavorite ? "destructive" : "secondary"}
          onClick={handleToggleFavorite}
          className="w-full md:w-auto"
        >
          <Heart className="h-4 w-4 mr-2" />
          {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </Button>
      </div>
    </div>
  );
};