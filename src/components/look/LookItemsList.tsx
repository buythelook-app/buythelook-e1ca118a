import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { LookItem } from "./LookItem";
import { useCartStore } from "../Cart";
import { toast } from "sonner";

interface LookItemsListProps {
  look: {
    id: string;
    title: string;
    items: Array<{
      id: string;
      title: string;
      price: string;
      image: string;
    }>;
    price: string;
  };
}

export const LookItemsList = ({ look }: LookItemsListProps) => {
  const { addLook } = useCartStore();

  const handleAddLookToCart = () => {
    const lookItems = look.items.map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      lookId: look.id
    }));
    
    addLook({
      id: look.id,
      title: look.title,
      items: lookItems,
      totalPrice: look.price
    });
    
    toast.success('Complete look added to cart');
  };

  return (
    <Card className="bg-netflix-card border-netflix-accent">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Items in this Look</h2>
        <div className="space-y-4">
          {look.items.map((item) => (
            <LookItem key={item.id} item={item} />
          ))}
        </div>
        <div className="mt-6">
          <Button
            onClick={handleAddLookToCart}
            className="w-full"
          >
            Add Complete Look to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};