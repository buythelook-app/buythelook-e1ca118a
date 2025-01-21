import { useNavigate } from "react-router-dom";
import { LookCard } from "./LookCard";

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
        <h2 className="text-3xl font-display font-semibold mb-8 relative">
          {title}
          <span className="absolute -bottom-2 left-0 w-24 h-1 bg-netflix-accent rounded-full"></span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
      </div>
    </section>
  );
};