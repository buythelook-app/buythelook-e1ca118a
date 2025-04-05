
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { LookCard } from "./LookCard";
import { HomeButton } from "./HomeButton";
import { useEffect } from "react";

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.length > 0 ? (
            favorites.map((look) => (
              <LookCard
                key={look.id}
                {...look}
                items={look.items}
              />
            ))
          ) : (
            <div className="text-center py-12 col-span-full">
              <p className="text-netflix-text/60">No favorites yet</p>
            </div>
          )}
        </div>
      </div>
      <HomeButton />
    </div>
  );
};
