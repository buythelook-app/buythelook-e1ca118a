import { Button } from "../ui/button";
import { Trash2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface CartItemProps {
  id: string;
  image: string;
  title: string;
  price: string;
  onRemove: (id: string) => void;
}

export const CartItem = ({ id, image, title, price, onRemove }: CartItemProps) => {
  // Create a search URL for the product
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(title + " Zara")}`;

  return (
    <div className="flex items-center justify-between gap-4 bg-netflix-background p-4 rounded-lg">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-32 h-40 flex-shrink-0">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover rounded-md cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => window.open(searchUrl, '_blank')}
          />
        </div>
        <div className="flex-1">
          <h3 
            className="font-medium cursor-pointer hover:text-netflix-accent transition-colors"
            onClick={() => window.open(searchUrl, '_blank')}
          >
            {title}
          </h3>
          <p className="text-netflix-accent">{price}</p>
          <button
            onClick={() => window.open(searchUrl, '_blank')}
            className="text-sm text-gray-400 hover:text-netflix-accent transition-colors flex items-center gap-1 mt-1"
          >
            <ExternalLink className="h-3 w-3" />
            View Product
          </button>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(id)}
        className="text-red-500 hover:text-red-600"
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  );
};