
import { Button } from "../ui/button";
import { Trash2, ExternalLink } from "lucide-react";

interface CartItem {
  id: string;
  image: string;
  title: string;
  price: string;
}

interface LookCartItemProps {
  id: string;
  title: string;
  items: CartItem[];
  totalPrice: string;
  onRemoveLook: (lookId: string) => void;
  onRemoveItem: (lookId: string, itemId: string) => void;
}

export const LookCartItem = ({ 
  id, 
  title, 
  items, 
  totalPrice, 
  onRemoveLook, 
  onRemoveItem 
}: LookCartItemProps) => {
  return (
    <div className="bg-netflix-background rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{title}</h3>
        <div className="flex items-center gap-4">
          <span className="text-netflix-accent">{totalPrice}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemoveLook(id)}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(item.title + " Zara")}`;
          
          return (
            <div 
              key={`${id}-${item.id}`}
              className="flex flex-col gap-2 bg-netflix-card p-3 rounded-lg relative group"
            >
              <div className="aspect-[3/4] mb-2">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover rounded-md cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => window.open(searchUrl, '_blank')}
                />
              </div>
              <div className="flex-1">
                <p 
                  className="font-medium cursor-pointer hover:text-netflix-accent transition-colors"
                  onClick={() => window.open(searchUrl, '_blank')}
                >
                  {item.title}
                </p>
                <p className="text-sm text-netflix-accent">{item.price}</p>
                <button
                  onClick={() => window.open(searchUrl, '_blank')}
                  className="text-xs text-gray-400 hover:text-netflix-accent transition-colors flex items-center gap-1 mt-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Product
                </button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveItem(id, item.id)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
