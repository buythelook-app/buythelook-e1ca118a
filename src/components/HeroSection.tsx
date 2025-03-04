
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-[80vh] w-full mt-16">
      <div className="absolute inset-0 w-screen bg-[url('https://images.unsplash.com/photo-1445205170230-053b83016050')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-background via-netflix-background/70 to-transparent" />
      </div>
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Your Personal Style,<br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Curated</span>
          </h1>
          <p className="text-xl mb-8 max-w-xl text-gray-200">
            Discover personalized looks that match your style, occasion, and budget.
            Let our AI stylist create the perfect outfit for you.
          </p>
          <Button 
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
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
