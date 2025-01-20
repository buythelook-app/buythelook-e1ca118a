import { useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "./Cart";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { HomeButton } from "./HomeButton";

const mockLookDetails = {
  id: "1",
  title: "Summer Beach Look",
  description: "Perfect for a day at the beach or a casual summer outing.",
  price: "$299.99",
  category: "Summer Collection",
  image: "/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png",
  items: [
    {
      id: "item1",
      title: "Floral Dress",
      price: "$89.99",
      image: "/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png"
    },
    {
      id: "item2",
      title: "Straw Hat",
      price: "$29.99",
      image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png"
    }
  ]
};

export const LookDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addItem } = useCartStore();
  const { addFavorite, removeFavorite, favorites } = useFavoritesStore();

  const look = mockLookDetails;
  const isFavorite = favorites.some(fav => fav.id === look.id);

  const handleAddItemToCart = (item: typeof look.items[0]) => {
    addItem({
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
    });
    toast.success(`${item.title} added to cart`);
  };

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFavorite(look.id);
      toast.success("Removed from favorites");
    } else {
      addFavorite({
        id: look.id,
        title: look.title,
        price: look.price,
        category: look.category,
        image: look.image
      });
      toast.success("Added to favorites");
    }
  };

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

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <img 
              src={look.image} 
              alt={look.title}
              className="w-full h-[600px] object-cover rounded-lg"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-semibold mb-2">{look.title}</h1>
              <p className="text-netflix-text/60">{look.description}</p>
            </div>

            <div>
              <p className="text-2xl text-netflix-accent mb-4">{look.price}</p>
              <div className="flex gap-4">
                <Button
                  variant={isFavorite ? "destructive" : "secondary"}
                  onClick={handleToggleFavorite}
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Included Items</h2>
              <div className="space-y-4">
                {look.items.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center gap-4 bg-netflix-card p-4 rounded-lg group relative"
                  >
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-netflix-accent">{item.price}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAddItemToCart(item)}
                      className="text-netflix-text hover:text-netflix-accent transition-colors"
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <HomeButton />
    </div>
  );
};