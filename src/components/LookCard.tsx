import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { toast } from "sonner";

interface LookCardProps {
  id: string;
  image: string;
  title: string;
  price: string;
  category: string;
}

export const LookCard = ({ id, image, title, price, category }: LookCardProps) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

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
          <button 
            className="p-2 hover:text-netflix-accent transition-colors"
            onClick={handleFavoriteClick}
          >
            <Heart 
              size={24} 
              fill={isFavorite(id) ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>
    </div>
  );
};