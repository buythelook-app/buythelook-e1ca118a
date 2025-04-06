
import { useState } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { useCartStore } from "../Cart";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface Item {
  id: string;
  title: string;
  price: string;
  image: string;
  description?: string;
  type?: string;
  sizes?: string[];
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
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const { addLook, addItems } = useCartStore();

  const defaultSizes = ["XS", "S", "M", "L", "XL"];

  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSizeSelect = (itemId: string, size: string) => {
    setSelectedSizes(prev => ({
      ...prev,
      [itemId]: size
    }));
  };

  const handleAddToCart = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item");
      return;
    }

    // Check if sizes are selected for all selected items
    const missingSizes = selectedItems.filter(itemId => !selectedSizes[itemId]);
    if (missingSizes.length > 0) {
      toast.error("Please select sizes for all items");
      return;
    }

    const selectedItemsData = look.items
      .filter(item => selectedItems.includes(item.id))
      .map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        size: selectedSizes[item.id],
        // Make sure we include the type
        type: item.type || 'unknown'
      }));
    
    addItems(selectedItemsData);
    toast.success('Selected items added to cart');
    setSelectedItems([]);
    setSelectedSizes({});
  };

  const handleAddCompleteLook = () => {
    // First set default sizes for all items if not already selected
    const allSizes = look.items.reduce((acc, item) => ({
      ...acc,
      [item.id]: selectedSizes[item.id] || "M"
    }), {});
    
    // Update the size selections
    setSelectedSizes(allSizes);

    // Create the look items with sizes
    const lookItems = look.items.map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      size: allSizes[item.id],
      type: item.type || 'unknown'
    }));
    
    // Make sure we have the essential item types (top, bottom, shoes)
    const hasTop = lookItems.some(item => item.type === 'top');
    const hasBottom = lookItems.some(item => item.type === 'bottom');
    const hasShoes = lookItems.some(item => item.type === 'shoes');
    
    if (!hasTop || !hasBottom || !hasShoes) {
      toast.warning(`This look is missing ${!hasTop ? 'a top' : ''}${!hasBottom ? (!hasTop ? ' and ' : '') + 'a bottom' : ''}${!hasShoes ? (!hasTop && !hasBottom ? ' and ' : !hasTop || !hasBottom ? ' and ' : '') + 'shoes' : ''}`);
    }
    
    // Add the look to the cart
    addLook({
      id: look.id,
      title: look.title,
      items: lookItems,
      totalPrice: look.price
    });
    
    toast.success('Complete look added to cart');
    setSelectedItems([]);
    setSelectedSizes({});
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

      <div className="grid grid-cols-1 gap-4">
        {look.items.map((item) => (
          <div 
            key={item.id}
            className="flex flex-col md:flex-row items-start gap-4 p-6 rounded-lg group relative hover:bg-netflix-card/80 transition-colors border border-gray-700"
          >
            <div className="flex items-center gap-4">
              <Checkbox
                id={`item-${item.id}`}
                checked={selectedItems.includes(item.id)}
                onCheckedChange={() => handleItemSelect(item.id)}
              />
              <img 
                src={item.image} 
                alt={item.title}
                className="w-32 h-32 object-contain rounded-md bg-white"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <label 
                  htmlFor={`item-${item.id}`}
                  className="text-lg font-medium cursor-pointer block"
                >
                  {item.title}
                </label>
                <p className="text-netflix-accent text-lg font-semibold">{item.price}</p>
              </div>
              <p className="text-gray-400 text-sm">{item.description || `${item.type || 'Item'} for your collection`}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-sm text-gray-400">Size:</span>
                <Select
                  value={selectedSizes[item.id] || ""}
                  onValueChange={(value) => handleSizeSelect(item.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {(item.sizes || defaultSizes).map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {item.type && (
                <p className="text-sm text-gray-400 mt-2">Type: {item.type}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
