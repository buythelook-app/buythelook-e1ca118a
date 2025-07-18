import { ShoppingCart, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useCartStore } from "../Cart";
import { ClickTrackingService } from "../../services/clickTrackingService";

interface LookItemProps {
  item: {
    id: string;
    title: string;
    price: string;
    image: string;
    type?: string;
    url?: string;
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

  const handlePurchaseClick = async () => {
    // Map item type to category for tracking
    const getCategory = (type?: string): 'top' | 'bottom' | 'shoes' => {
      if (!type) return 'top';
      const lowerType = type.toLowerCase();
      if (lowerType.includes('shoe') || lowerType.includes('boot') || lowerType.includes('sandal')) return 'shoes';
      if (lowerType.includes('pant') || lowerType.includes('jean') || lowerType.includes('skirt') || lowerType.includes('bottom')) return 'bottom';
      return 'top';
    };

    // Track the click
    await ClickTrackingService.trackClick({
      item_id: item.id,
      category: getCategory(item.type)
    });

    // Open product URL in new tab
    if (item.url) {
      window.open(item.url, '_blank');
    } else {
      // Fallback - try to construct a generic search URL
      const searchQuery = encodeURIComponent(item.title);
      window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
    }
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
      <div className="flex items-center gap-2">
        <Button
          onClick={handlePurchaseClick}
          className="bg-netflix-accent hover:bg-netflix-accent/80 text-white flex items-center gap-1"
          size="sm"
        >
          <ExternalLink className="h-4 w-4" />
          לרכישה
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAddItemToCart}
          className="text-netflix-text hover:text-netflix-accent transition-colors"
        >
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};