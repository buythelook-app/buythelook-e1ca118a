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

    if (selectedItems.length === look.items.length) {
      // If all items are selected, add as a complete look
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
    } else {
      // Add only selected items individually
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
    }

    // Reset selection after adding to cart
    setSelectedItems([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Items in this Look</h2>
        <Button
          onClick={handleAddToCart}
          className="bg-netflix-accent hover:bg-netflix-accent/80"
        >
          Add Selected to Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {look.items.map((item) => (
          <div 
            key={item.id}
            className="flex items-center gap-4 bg-netflix-background p-4 rounded-lg group relative"
          >
            <Checkbox
              id={`item-${item.id}`}
              checked={selectedItems.includes(item.id)}
              onCheckedChange={() => handleItemSelect(item.id)}
            />
            <img 
              src={item.image} 
              alt={item.title}
              className="w-20 h-20 object-cover rounded-md"
            />
            <div>
              <label 
                htmlFor={`item-${item.id}`}
                className="font-medium cursor-pointer"
              >
                {item.title}
              </label>
              <p className="text-netflix-accent">{item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};