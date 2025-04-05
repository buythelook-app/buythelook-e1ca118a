
import { DashboardItem } from "@/types/lookTypes";
import { ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { useCartStore } from "../Cart";
import { toast } from "sonner";

interface LookBreakdownProps {
  items: DashboardItem[];
  occasion?: string;
}

export const LookBreakdown = ({ items, occasion }: LookBreakdownProps) => {
  const { addItem } = useCartStore();
  
  if (!items || items.length === 0) {
    return null;
  }

  const handleAddToCart = (item: DashboardItem) => {
    addItem({
      id: item.id,
      title: item.name || "Fashion Item",
      price: item.price || "$0.00",
      image: item.image,
    });
    toast.success(`${item.name || "Item"} added to cart`);
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-3">{occasion ? `${occasion} Look Items` : "Look Items"}</h3>
      <div className="bg-netflix-background/30 p-3 rounded-lg">
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 bg-netflix-card/50 p-2 rounded-md">
              <div className="w-12 h-12 bg-gray-800 border border-gray-700 rounded-md overflow-hidden flex-shrink-0">
                <img 
                  src={item.image} 
                  alt={item.name || "Fashion item"} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              <div className="flex-grow">
                <p className="font-medium text-sm">{item.name || "Fashion item"}</p>
                <p className="text-xs text-netflix-accent">{item.type || "Item"}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-netflix-text hover:text-netflix-accent"
                onClick={() => handleAddToCart(item)}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
