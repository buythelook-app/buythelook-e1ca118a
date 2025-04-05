
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { LookCard } from "./LookCard";
import { HomeButton } from "./HomeButton";
import { useEffect, useState } from "react";
import { LookBreakdown } from "./look/LookBreakdown";
import { toast } from "sonner";
import { useCartStore } from "./Cart";

export const MyList = () => {
  const navigate = useNavigate();
  const { favorites, loadFavorites, removeFavorite } = useFavoritesStore();
  const { addLook } = useCartStore();
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites when component mounts
  useEffect(() => {
    console.log("MyList component mounted, loading favorites");
    const loadData = async () => {
      await loadFavorites();
      setIsLoading(false);
    };
    loadData();
  }, [loadFavorites]);

  console.log("Current favorites in MyList:", favorites);
  
  const handleRemoveFavorite = (id: string) => {
    removeFavorite(id);
    toast.success("Look removed from favorites");
  };
  
  const handleAddToCart = (look: any) => {
    // Ensure we have lookItems to add
    const lookItems = look.items && look.items.length > 0 
      ? look.items.map((item: any) => ({
          id: item.id,
          title: item.name || `Item from ${look.title}`,
          price: item.price || "",
          image: item.image,
          lookId: look.id
        }))
      : [{
          id: `item-${look.id}`,
          image: look.image,
          title: `${look.title || look.category}`,
          price: look.price || "$49.99",
          lookId: look.id
        }];
    
    addLook({
      id: look.id,
      title: look.title || look.category,
      items: lookItems,
      totalPrice: look.price || "$49.99"
    });
    
    toast.success('Look added to cart');
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

        <div className="flex items-center gap-2 mb-6">
          <Heart className="text-netflix-accent" />
          <h1 className="text-2xl font-semibold">My List</h1>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-pulse text-netflix-text/60">Loading your favorites...</div>
          </div>
        ) : favorites.length > 0 ? (
          <div className="space-y-8">
            {favorites.map((look) => {
              // Ensure we have valid items to display
              const items = look.items && look.items.length > 0 
                ? look.items 
                : [{ 
                    id: look.id, 
                    name: look.title || look.category, 
                    image: look.image,
                    price: look.price || "$49.99",
                    type: look.category
                  }];
                  
              console.log(`Rendering look ${look.id} with items:`, items);
              
              return (
                <div key={look.id} className="bg-netflix-card rounded-lg overflow-hidden shadow-lg">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Left side - Look card with smaller canvas */}
                    <div className="p-4">
                      <LookCard
                        key={look.id}
                        {...look}
                        items={items}
                        isCompact={true}
                      />
                    </div>
                    
                    {/* Right side - Look items breakdown */}
                    <div className="p-4 border-t md:border-t-0 md:border-l border-gray-700">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">{look.title || look.category} Items</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAddToCart(look)}
                            className="text-netflix-text hover:text-netflix-accent"
                            title="Add to cart"
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFavorite(look.id)}
                            className="text-netflix-text hover:text-red-500"
                            title="Remove from favorites"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <LookBreakdown 
                        items={items.map(item => ({
                          id: item.id || `item-${Date.now()}-${Math.random()}`,
                          name: item.name || `Item from ${look.title || look.category}`,
                          type: item.type || "Item",
                          price: item.price || "$49.99",
                          image: item.image || "/placeholder.svg",
                          description: item.name || `Part of ${look.title || look.category} look`
                        }))}
                        occasion={look.category}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-netflix-card/30 rounded-lg">
            <Heart className="h-12 w-12 text-netflix-text/30 mx-auto mb-4" />
            <p className="text-netflix-text/60 mb-4">Your favorites list is empty</p>
            <Button 
              onClick={() => navigate('/home')}
              className="bg-netflix-accent hover:bg-netflix-accent/80"
            >
              Discover outfits
            </Button>
          </div>
        )}
      </div>
      <HomeButton />
    </div>
  );
};
