
import { DashboardItem } from "@/types/lookTypes";
import { ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { useCartStore } from "../Cart";
import { toast } from "sonner";
import { useState } from "react";

interface LookBreakdownProps {
  items: DashboardItem[];
  occasion?: string;
}

export const LookBreakdown = ({ items, occasion }: LookBreakdownProps) => {
  const { addItem } = useCartStore();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  
  console.log("LookBreakdown received items:", items);
  
  const handleAddToCart = (item: DashboardItem) => {
    addItem({
      id: item.id,
      title: item.name || "Fashion Item",
      price: item.price || "$49.99",
      image: item.image || "/placeholder.svg",
    });
    toast.success(`${item.name || "Item"} added to cart`);
  };

  // If no items, show a message
  if (!items || items.length === 0) {
    return <div className="p-4 text-center text-netflix-text/60">No items found for this look</div>;
  }

  const toggleItemDetails = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  return (
    <div className="space-y-4">
      {occasion && (
        <div className="inline-block px-3 py-1 mb-3 text-xs font-medium rounded-full bg-netflix-accent/20 text-netflix-accent">
          {occasion}
        </div>
      )}
      
      <div className="bg-netflix-background/30 p-3 rounded-lg">
        <ul className="space-y-3">
          {items.map((item) => (
            <li 
              key={item.id} 
              className="bg-netflix-card/50 p-3 rounded-md hover:bg-netflix-card/80 transition-colors"
              onClick={() => toggleItemDetails(item.id)}
            >
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-16 h-16 bg-gray-800 border border-gray-700 rounded-md overflow-hidden flex-shrink-0">
                  <img 
                    src={item.image || "/placeholder.svg"} 
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
                  <p className="text-xs mt-1">{item.price || "$49.99"}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-netflix-text hover:text-netflix-accent"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(item);
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Expanded item details */}
              {expandedItem === item.id && item.description && (
                <div className="mt-3 pt-3 border-t border-gray-700 text-sm text-netflix-text/70">
                  <p>{item.description}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
