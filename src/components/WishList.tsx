import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Heart } from "lucide-react";
import { LookCard } from "./LookCard";

const mockWishlistLooks = [
  {
    id: "1",
    title: "Summer Beach Look",
    price: "$299.99",
    category: "Summer Collection",
    image: "/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png"
  },
  {
    id: "2",
    title: "Evening Elegance",
    price: "$459.99",
    category: "Evening Wear",
    image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png"
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
          <h1 className="text-2xl font-semibold">My Favorite Looks</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockWishlistLooks.map((look) => (
            <LookCard
              key={look.id}
              {...look}
            />
          ))}
        </div>

        {mockWishlistLooks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-netflix-text/60">No favorite looks yet</p>
          </div>
        )}
      </div>
    </div>
  );
};