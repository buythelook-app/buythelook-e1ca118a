import { useNavigate } from "react-router-dom";
import { LookCanvas } from "./LookCanvas";

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
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <div className="look-card">
            <LookCanvas items={look.items} />
            <div className="look-card-content">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-netflix-accent mb-1">{look.category}</p>
                  <h3 className="text-lg font-semibold mb-1">{look.title}</h3>
                  <p className="text-sm opacity-90">{look.price}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};