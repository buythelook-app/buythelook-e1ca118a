import { ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useCartStore } from "../Cart";

interface LookItemProps {
  item: {
    id: string;
    title: string;
    price: string;
    image: string;
  };
}

export const LookItem = ({ item }: LookItemProps) => {
  const { addItem } = useCartStore();

  const handleAddItemToCart = () => {
    addItem({
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
    });
    toast.success(`${item.title} added to cart`);
  };

  return (
    <div className="flex items-center gap-4 bg-netflix-background p-4 rounded-lg group relative hover:bg-netflix-card/80 transition-colors">
      <img 
        src={item.image} 
        alt={item.title}
        className="w-20 h-20 object-cover rounded-md"
      />
      <div className="flex-1">
        <h3 className="font-medium">{item.title}</h3>
        <p className="text-netflix-accent">{item.price}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleAddItemToCart}
        className="text-netflix-text hover:text-netflix-accent transition-colors"
      >
        <ShoppingCart className="h-5 w-5" />
      </Button>
    </div>
  );
};