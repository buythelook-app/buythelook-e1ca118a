import { Heart } from "lucide-react";

interface LookCardProps {
  image: string;
  title: string;
  price: string;
  category: string;
}

export const LookCard = ({ image, title, price, category }: LookCardProps) => {
  return (
    <div className="look-card">
      <img src={image} alt={title} className="w-full h-[400px] object-cover" />
      <div className="look-card-content">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-netflix-accent mb-1">{category}</p>
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <p className="text-sm opacity-90">{price}</p>
          </div>
          <button className="p-2 hover:text-netflix-accent">
            <Heart size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};