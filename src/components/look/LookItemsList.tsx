
import { useState } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { useCartStore } from "../Cart";
import { toast } from "sonner";

interface Item {
  id: string;
  title: string;
  price: string;
  image: string;
}

interface Look {
  id: string;
  title: string;
  items: Item[];
  price: string;
}

interface LookItemsListProps {
  look: Look;
}

export const LookItemsList = ({ look }: LookItemsListProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { addLook, addItems } = useCartStore();

  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleAddToCart = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item");
      return;
    }

    const selectedItemsData = look.items
      .filter(item => selectedItems.includes(item.id))
      .map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image
      }));
    
    addItems(selectedItemsData);
    toast.success('Selected items added to cart');
    setSelectedItems([]);
  };

  const handleAddCompleteLook = () => {
    const lookItems = look.items.map(item => ({
      ...item,
      lookId: look.id
    }));
    
    addLook({
      id: look.id,
      title: look.title,
      items: lookItems,
      totalPrice: look.price
    });
    
    toast.success('Complete look added to cart');
    setSelectedItems([]);
  };

  return (
    <div className="space-y-6 bg-netflix-card p-6 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-semibold">Items in this Look</h2>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <Button
            onClick={handleAddToCart}
            className="bg-netflix-accent hover:bg-netflix-accent/80 w-full md:w-auto"
            disabled={selectedItems.length === 0}
          >
            Add Selected to Cart
          </Button>
          <Button
            onClick={handleAddCompleteLook}
            variant="outline"
            className="border-netflix-accent text-netflix-accent hover:bg-netflix-accent/10 w-full md:w-auto"
          >
            Buy the Look
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {look.items.map((item) => (
          <div 
            key={item.id}
            className="flex items-center gap-4 p-4 rounded-lg group relative hover:bg-netflix-card/80 transition-colors border border-gray-700"
          >
            <Checkbox
              id={`item-${item.id}`}
              checked={selectedItems.includes(item.id)}
              onCheckedChange={() => handleItemSelect(item.id)}
            />
            <img 
              src={item.image} 
              alt={item.title}
              className="w-24 h-24 object-contain rounded-md bg-white"
            />
            <div className="flex-1">
              <label 
                htmlFor={`item-${item.id}`}
                className="font-medium cursor-pointer block"
              >
                {item.title}
              </label>
              <p className="text-netflix-accent text-sm">{item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
