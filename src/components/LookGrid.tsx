import { useNavigate } from "react-router-dom";
import { LookCard } from "./LookCard";

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
  );
};