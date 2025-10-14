
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { useCartStore } from "../Cart";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ExternalLink } from "lucide-react";
import { AffiliateLink } from "../AffiliateLink";
import { useUserSizes } from "@/hooks/useUserSizes";

interface Item {
  id: string;
  title: string;
  price: string;
  image: string;
  description?: string;
  type?: string;
  sizes?: string[];
  url?: string;
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
  const [autoFilledSizes, setAutoFilledSizes] = useState<Record<string, boolean>>({});
  const { addLook, addItems } = useCartStore();
  const { sizes: userSizes, isLoading: sizesLoading } = useUserSizes();

  const defaultSizes = ["XS", "S", "M", "L", "XL"];
  const shoeSizes = ["36", "37", "38", "39", "40", "41", "42"];

  // Auto-fill sizes from user profile when component mounts
  useEffect(() => {
    if (!sizesLoading && look.items) {
      const autoSizes: Record<string, string> = {};
      const autoFilledFlags: Record<string, boolean> = {};
      
      look.items.forEach(item => {
        const itemType = item.type?.toLowerCase();
        
        if (itemType === 'top' && userSizes.top) {
          autoSizes[item.id] = userSizes.top;
          autoFilledFlags[item.id] = true;
        } else if (itemType === 'bottom' && userSizes.bottom) {
          autoSizes[item.id] = userSizes.bottom;
          autoFilledFlags[item.id] = true;
        } else if (itemType === 'shoes' && userSizes.shoes) {
          autoSizes[item.id] = userSizes.shoes;
          autoFilledFlags[item.id] = true;
        }
      });
      
      if (Object.keys(autoSizes).length > 0) {
        setSelectedSizes(autoSizes);
        setAutoFilledSizes(autoFilledFlags);
      }
    }
  }, [look.items, userSizes, sizesLoading]);

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
    // Mark as manually selected (not auto-filled)
    setAutoFilledSizes(prev => ({
      ...prev,
      [itemId]: false
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
    <div className="space-y-6 bg-card/50 backdrop-blur-sm border border-fashion-primary/20 p-6 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-fashion-primary to-fashion-accent bg-clip-text text-transparent">
          Items in this Look
        </h2>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <Button
            onClick={handleAddToCart}
            className="bg-gradient-to-r from-fashion-primary to-fashion-accent hover:opacity-90 w-full md:w-auto"
            disabled={selectedItems.length === 0}
          >
            Add Selected to Cart ({selectedItems.length})
          </Button>
          <Button
            onClick={handleAddCompleteLook}
            variant="outline"
            className="border-fashion-primary text-fashion-primary hover:bg-fashion-primary/10 w-full md:w-auto"
          >
            Buy the Look
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {look.items.map((item) => (
          <div 
            key={item.id}
            className="flex flex-col md:flex-row items-start gap-4 p-6 rounded-lg group relative hover:bg-fashion-primary/5 transition-all border border-fashion-primary/20 hover:border-fashion-primary/40 hover:shadow-lg hover:shadow-fashion-primary/10"
          >
            <div className="flex items-center gap-4">
              <Checkbox
                id={`item-${item.id}`}
                checked={selectedItems.includes(item.id)}
                onCheckedChange={() => handleItemSelect(item.id)}
                className="border-fashion-primary data-[state=checked]:bg-fashion-primary data-[state=checked]:text-white"
              />
              <img 
                src={item.image} 
                alt={item.title}
                className="w-32 h-32 object-contain rounded-md bg-white ring-1 ring-fashion-primary/20"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <label 
                  htmlFor={`item-${item.id}`}
                  className="text-lg font-medium cursor-pointer block hover:text-fashion-primary transition-colors"
                >
                  {item.title}
                </label>
                <p className="text-fashion-accent text-lg font-semibold">{item.price}</p>
              </div>
              <p className="text-muted-foreground text-sm">{item.description || `${item.type || 'Item'} for your collection`}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-sm text-muted-foreground">Size:</span>
                <Select
                  value={selectedSizes[item.id] || ""}
                  onValueChange={(value) => handleSizeSelect(item.id, value)}
                >
                  <SelectTrigger className={`w-32 ${autoFilledSizes[item.id] ? 'border-fashion-primary bg-fashion-primary/5' : 'border-fashion-primary/20'}`}>
                    <SelectValue placeholder={sizesLoading ? "Loading..." : "Select size"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(item.sizes || (item.type?.toLowerCase() === 'shoes' ? shoeSizes : defaultSizes)).map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {autoFilledSizes[item.id] && selectedSizes[item.id] && (
                  <span className="text-xs text-fashion-primary font-medium">
                    ✓ מולא אוטומטית מהפרופיל
                  </span>
                )}
              </div>
              {item.type && (
                <p className="text-sm text-muted-foreground mt-2">Type: {item.type}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <AffiliateLink item={item} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
