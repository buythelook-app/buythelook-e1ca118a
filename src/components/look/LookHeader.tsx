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
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <img 
          src={image} 
          alt={title}
          className="w-full h-[600px] object-cover rounded-lg"
        />
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold mb-2">{title}</h1>
          <p className="text-netflix-text/60">{description}</p>
        </div>
      </div>
    </div>
  );
};