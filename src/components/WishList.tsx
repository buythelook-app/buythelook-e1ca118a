import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Heart } from "lucide-react";

const mockWishlist = [
  {
    id: 1,
    title: "Summer Dress",
    price: "$89.99",
    image: "https://example.com/dress.jpg"
  },
  {
    id: 2,
    title: "Leather Jacket",
    price: "$199.99",
    image: "https://example.com/jacket.jpg"
  }
];

export const WishList = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          ← Back
        </Button>

        <div className="flex items-center gap-2 mb-6">
          <Heart className="text-netflix-accent" />
          <h1 className="text-2xl font-semibold">My Wishlist</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockWishlist.map((item) => (
            <div 
              key={item.id}
              className="bg-netflix-card rounded-lg overflow-hidden"
            >
              <div className="aspect-square bg-gray-800" />
              <div className="p-4">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-netflix-accent">{item.price}</p>
                <Button className="w-full mt-4">Add to Cart</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};