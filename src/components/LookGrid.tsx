import { useNavigate } from "react-router-dom";
import { LookCard } from "./LookCard";
import { Button } from "./ui/button";
import { ShoppingBag } from "lucide-react";

interface LookGridProps {
  looks: Array<{
    id: string;
    image: string;
    title: string;
    price: string;
    category: string;
    items: Array<{
      id: string;
      image: string;
    }>;
  }>;
}

export const LookGrid = ({ looks }: LookGridProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {looks.map((look) => (
          <div 
            key={look.id} 
            onClick={() => navigate(`/look/${look.id}`)}
            className="cursor-pointer"
          >
            <LookCard {...look} />
          </div>
        ))}
      </div>
      
      <div className="flex justify-center mt-12">
        <Button 
          onClick={() => navigate('/suggestions')}
          className="bg-netflix-accent hover:bg-netflix-accent/80 text-white gap-2"
        >
          <ShoppingBag className="h-4 w-4" />
          For more personal looks
        </Button>
      </div>
    </div>
  );
};