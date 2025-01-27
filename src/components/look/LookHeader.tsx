import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

interface LookHeaderProps {
  title: string;
  description: string;
  image: string;
}

export const LookHeader = ({ title, description, image }: LookHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-8">
      <div className="order-2 md:order-1">
        <img 
          src={image} 
          alt={title}
          className="w-full h-[300px] md:h-[600px] object-cover rounded-lg shadow-lg"
        />
      </div>

      <div className="order-1 md:order-2 space-y-4">
        <div className="bg-netflix-card p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl md:text-3xl font-semibold mb-3">{title}</h1>
          <p className="text-netflix-text/80 text-sm md:text-base">{description}</p>
        </div>
      </div>
    </div>
  );
};