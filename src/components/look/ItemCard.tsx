
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

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
    <Card key={id} className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-500">{description}</p>
        <p className="text-netflix-accent font-bold mt-2">{price}</p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onAddToCart}
          className="w-full"
          disabled={isRefreshing}
        >
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};
