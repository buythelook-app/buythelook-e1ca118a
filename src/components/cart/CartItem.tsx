import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "../Cart";

interface CartItemProps {
  item: CartItemType;
  onRemove: (itemId: string) => void;
}

export const CartItem = ({ item, onRemove }: CartItemProps) => {
  return (
    <div 
      className="flex items-center justify-between gap-4 bg-netflix-background p-4 rounded-lg"
    >
      <div className="flex items-center gap-4">
        <img 
          src={item.image} 
          alt={item.title} 
          className="w-24 h-24 object-cover rounded-md"
        />
        <div>
          <h3 className="font-medium">{item.title}</h3>
          <p className="text-netflix-accent">{item.price}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(item.id)}
        className="text-red-500 hover:text-red-600"
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  );
};