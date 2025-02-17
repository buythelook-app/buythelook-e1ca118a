
import { useNavigate } from "react-router-dom";
import { LookCard } from "./LookCard";
import { Button } from "./ui/button";
import { Wand2 } from "lucide-react";

interface LookSectionProps {
  title: string;
  looks: Array<{
    id: string;
    image: string;
    title: string;
    price: string;
    category: string;
  }>;
}

export const LookSection = ({ title, looks }: LookSectionProps) => {
  const navigate = useNavigate();

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-display font-semibold relative">
            {title}
            <span className="absolute -bottom-2 left-0 w-24 h-1 bg-netflix-accent rounded-full"></span>
          </h2>
          <Button 
            onClick={() => navigate('/suggestions')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white gap-2"
          >
            <Wand2 className="h-4 w-4" />
            Generate Looks
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {looks.map((look) => (
            <div 
              key={look.id} 
              onClick={() => navigate(`/look/${look.id}`)}
              className="cursor-pointer transform transition-transform duration-300 hover:-translate-y-1"
            >
              <LookCard {...look} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
