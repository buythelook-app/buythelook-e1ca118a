import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { Look } from "../Cart";

interface LookItemProps {
  look: Look;
  onRemoveLook: (lookId: string) => void;
  onRemoveItem: (lookId: string, itemId: string) => void;
}

export const LookItem = ({ look, onRemoveLook, onRemoveItem }: LookItemProps) => {
  return (
    <div className="bg-netflix-background rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{look.title}</h3>
        <div className="flex items-center gap-4">
          <span className="text-netflix-accent">{look.totalPrice}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemoveLook(look.id)}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {look.items.map((item) => (
          <div 
            key={item.id}
            className="flex items-center gap-4 bg-netflix-card p-3 rounded-lg relative group"
          >
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-20 h-20 object-cover rounded-md"
            />
            <div className="flex-1">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-netflix-accent">{item.price}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveItem(look.id, item.id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};