import { Heart } from "lucide-react";

interface LookCardProps {
  image: string;
  title: string;
  price: string;
  category: string;
}

export const LookCard = ({ image, title, price, category }: LookCardProps) => {
  return (
    <div className="look-card group">
      <img 
        src={image} 
        alt={title} 
        className="w-full h-[400px] object-cover rounded-lg transition-transform duration-300 group-hover:scale-105" 
      />
      <div className="look-card-content rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-netflix-accent font-medium mb-1 tracking-wide uppercase">{category}</p>
            <h3 className="text-lg font-display font-semibold mb-1 text-white">{title}</h3>
            <p className="text-sm text-white/90 font-medium">{price}</p>
          </div>
          <button className="p-2 hover:text-netflix-accent transition-colors">
            <Heart size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};