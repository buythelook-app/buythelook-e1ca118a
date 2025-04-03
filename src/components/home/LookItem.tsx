
import { useNavigate } from "react-router-dom";
import { LookCanvas } from "@/components/LookCanvas";
import { Shuffle } from "lucide-react";
import { DashboardItem } from "@/types/lookTypes";

interface LookItemProps {
  occasion: string;
  items: DashboardItem[];
  isRefreshing: boolean;
  userStyle: any;
  onShuffleLook: (occasion: string) => void;
  index: number;
}

export const LookItem = ({ 
  occasion, 
  items, 
  isRefreshing, 
  userStyle,
  onShuffleLook,
  index
}: LookItemProps) => {
  const navigate = useNavigate();
  
  if (!items || items.length === 0) return null;
  
  const lookItems = items.map(item => ({
    id: item.id,
    image: item.image,
    type: item.type.toLowerCase() as 'top' | 'bottom' | 'shoes'
  }));
  
  let totalPrice = 0;
  items.forEach(item => {
    const itemPrice = item.price?.replace(/[^0-9.]/g, '') || '0';
    totalPrice += parseFloat(itemPrice);
  });
  
  const look = {
    id: `look-${occasion}-${index}`,
    title: `${occasion} Look`,
    items: lookItems,
    price: totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : '$0.00',
    category: userStyle?.analysis?.styleProfile || "Casual",
    occasion: occasion
  };

  const handleViewDetails = () => {
    localStorage.setItem(`look-${look.id}`, JSON.stringify({
      ...look,
      description: `A curated ${look.occasion.toLowerCase()} look that matches your ${userStyle.analysis.styleProfile} style preference.`
    }));
    navigate(`/look/${look.id}`);
  };

  return (
    <div 
      key={look.id}
      className="bg-netflix-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">{look.title}</h3>
        <span className="text-sm text-netflix-accent">{look.occasion}</span>
      </div>
      <div className="mb-4 bg-white rounded-lg overflow-hidden relative group flex justify-center">
        <LookCanvas items={look.items} width={300} height={500} occasion={occasion} />
        <button
          onClick={() => onShuffleLook(look.occasion)}
          className="absolute bottom-4 right-4 bg-netflix-accent text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          title="Try different combination"
          disabled={isRefreshing}
        >
          <Shuffle className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-netflix-accent font-semibold">{look.price}</p>
        <button
          onClick={handleViewDetails}
          className="bg-netflix-accent text-white px-4 py-2 rounded-lg hover:bg-netflix-accent/90 transition-colors text-sm"
        >
          View Details
        </button>
      </div>
    </div>
  );
};
