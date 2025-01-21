import { useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "./Cart";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { HomeButton } from "./HomeButton";

// Import the looks data from Index
const featuredLooks = [
  { 
    id: "look-1", 
    title: "Summer Casual", 
    description: "Perfect for a day at the beach or a casual summer outing.",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050",
    price: "$199.99",
    category: "Casual",
    items: [
      {
        id: "item-1",
        title: "Summer Casual Item",
        price: "$199.99",
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050"
      }
    ]
  },
  { 
    id: "look-2", 
    title: "Business Professional", 
    description: "Perfect for important business meetings and formal occasions.",
    image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2",
    price: "$249.99",
    category: "Formal",
    items: [
      {
        id: "item-2",
        title: "Business Professional Item",
        price: "$249.99",
        image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2"
      }
    ]
  },
  { 
    id: "look-3", 
    title: "Evening Elegance", 
    description: "Sophisticated and stylish for evening events.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
    price: "$299.99",
    category: "Business",
    items: [
      {
        id: "item-3",
        title: "Evening Elegance Item",
        price: "$299.99",
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d"
      }
    ]
  },
  { 
    id: "look-4", 
    title: "Weekend Comfort", 
    description: "Casual and comfortable for weekend activities.",
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e",
    price: "$179.99",
    category: "Casual",
    items: [
      {
        id: "item-4",
        title: "Weekend Comfort Item",
        price: "$179.99",
        image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e"
      }
    ]
  }
];

export const LookDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addItem, addLook } = useCartStore();
  const { addFavorite, removeFavorite, favorites } = useFavoritesStore();

  // Find the look based on the ID from the URL
  const look = featuredLooks.find(look => look.id === id);

  if (!look) {
    return <div>Look not found</div>;
  }

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
          onClick={() => navigate('/home')}
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
              <div className="mt-6 p-4 border border-netflix-accent rounded-lg bg-netflix-card/50">
                <Button
                  onClick={handleAddLookToCart}
                  className="w-full"
                >
                  Add Complete Look to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <HomeButton />
    </div>
  );
};