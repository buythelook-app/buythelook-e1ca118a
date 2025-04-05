
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { LookCard } from "./LookCard";
import { HomeButton } from "./HomeButton";
import { useEffect } from "react";
import { LookBreakdown } from "./look/LookBreakdown";

export const MyList = () => {
  const navigate = useNavigate();
  const { favorites, loadFavorites } = useFavoritesStore();

  // Load favorites when component mounts
  useEffect(() => {
    console.log("MyList component mounted, loading favorites");
    loadFavorites();
  }, [loadFavorites]);

  console.log("Current favorites in MyList:", favorites);

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

        {favorites.length > 0 ? (
          <div className="space-y-8">
            {favorites.map((look) => (
              <div key={look.id} className="bg-netflix-card rounded-lg overflow-hidden shadow-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Left side - Look card with smaller canvas */}
                  <div className="p-4">
                    <LookCard
                      key={look.id}
                      {...look}
                      items={look.items || []}
                      isCompact={true} // Use compact mode for My List page
                    />
                  </div>
                  
                  {/* Right side - Look items breakdown */}
                  <div className="p-4 border-t md:border-t-0 md:border-l border-gray-700">
                    <h3 className="text-lg font-semibold mb-3">{look.category || 'Look'} Items</h3>
                    
                    {look.items && look.items.length > 0 ? (
                      <LookBreakdown 
                        items={look.items.map(item => ({
                          id: item.id,
                          name: item.name || `Item from ${look.title}`,
                          type: item.type || "Item",
                          price: item.price || "",
                          image: item.image,
                          description: `Part of ${look.title} look` // Add the required description field
                        }))}
                        occasion={look.category}
                      />
                    ) : (
                      <p className="text-netflix-text/60 text-center py-4">No item details available for this look</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-netflix-text/60">No favorites yet</p>
          </div>
        )}
      </div>
      <HomeButton />
    </div>
  );
};
