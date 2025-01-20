import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";

interface CartItemProps {
  id: string;
  image: string;
  title: string;
  price: string;
  onRemove: (id: string) => void;
}

export const CartItem = ({ id, image, title, price, onRemove }: CartItemProps) => {
  return (
    <div className="flex items-center justify-between gap-4 bg-netflix-background p-4 rounded-lg">
      <div className="flex items-center gap-4">
        <img 
          src={image} 
          alt={title} 
          className="w-24 h-24 object-cover rounded-md"
        />
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-netflix-accent">{price}</p>
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