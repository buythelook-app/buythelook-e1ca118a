import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { LookCard } from "./LookCard";
import { HomeButton } from "./HomeButton";

export const MyList = () => {
  const navigate = useNavigate();
  const { favorites } = useFavoritesStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-fashion-neutral-dark to-black text-white p-6">
      <div className="container mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 text-white hover:bg-white/10"
        >
          ← Back
        </Button>

        <div className="flex items-center gap-2 mb-6">
          <Heart className="text-fashion-primary" />
          <h1 className="text-3xl font-bold fashion-hero-text">My List</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((look) => (
            <LookCard
              key={look.id}
              {...look}
            />
          ))}
        </div>

        {favorites.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60">No favorites yet</p>
          </div>
        )}
      </div>
      <HomeButton />
    </div>
  );
};