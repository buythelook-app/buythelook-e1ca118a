import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-[80vh] w-full">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-background via-netflix-background/50 to-transparent" />
      </div>
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4">
            Your Personal Style,<br />
            <span className="text-netflix-accent">Curated</span>
          </h1>
          <p className="text-xl mb-8 max-w-xl">
            Discover personalized looks that match your style, occasion, and budget.
            Let our AI stylist create the perfect outfit for you.
          </p>
          <Button 
            className="bg-netflix-accent hover:bg-netflix-accent/90 text-white"
            size="lg"
            onClick={() => navigate('/quiz')}
          >
            Take Style Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};