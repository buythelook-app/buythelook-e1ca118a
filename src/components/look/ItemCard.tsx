
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

interface ItemCardProps {
  id: string;
  name: string;
  description: string;
  price: string;
  onAddToCart: () => void;
  isRefreshing: boolean;
}

export const ItemCard = ({
  id,
  name,
  description,
  price,
  onAddToCart,
  isRefreshing
}: ItemCardProps) => {
  return (
    <Card key={id} className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{name}</CardTitle>
        <Button
          variant="secondary"
          size="icon"
          onClick={onAddToCart}
          className="bg-white/10 hover:bg-netflix-accent/20 hover:text-netflix-accent rounded-full shadow-md"
          disabled={isRefreshing}
        >
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm mb-2">{description}</p>
        <p className="text-lg font-medium">{price}</p>
      </CardContent>
    </Card>
  );
};
