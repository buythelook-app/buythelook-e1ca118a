
import { useNavigate } from "react-router-dom";
import { LookCanvas } from "@/components/LookCanvas";
import { Shuffle, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardItem } from "@/types/lookTypes";
import { useState } from "react";

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
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  
  // Organize items by type
  const itemsByType: Record<string, DashboardItem[]> = {};
  if (items && items.length > 0) {
    items.forEach(item => {
      const type = item.type.toLowerCase();
      if (!itemsByType[type]) {
        itemsByType[type] = [];
      }
      itemsByType[type].push(item);
    });
  }
  
  // Create outfits by combining top, bottom, shoes
  const outfits: DashboardItem[][] = [];
  const tops = itemsByType['top'] || [];
  const bottoms = itemsByType['bottom'] || [];
  const shoes = itemsByType['shoes'] || [];
  
  // Create outfit combinations
  const maxItems = Math.max(
    tops.length || 0, 
    bottoms.length || 0, 
    shoes.length || 0
  );
  
  for (let i = 0; i < maxItems; i++) {
    const outfit: DashboardItem[] = [];
    if (tops[i % tops.length]) outfit.push(tops[i % tops.length]);
    if (bottoms[i % bottoms.length]) outfit.push(bottoms[i % bottoms.length]);
    if (shoes[i % shoes.length]) outfit.push(shoes[i % shoes.length]);
    outfits.push(outfit);
  }
  
  if (outfits.length === 0) return null;
  
  const currentOutfit = outfits[currentItemIndex % outfits.length];
  
  const lookItems = currentOutfit.map(item => ({
    id: item.id,
    image: item.image,
    type: item.type.toLowerCase() as 'top' | 'bottom' | 'shoes'
  }));
  
  let totalPrice = 0;
  currentOutfit.forEach(item => {
    const itemPrice = item.price?.replace(/[^0-9.]/g, '') || '0';
    totalPrice += parseFloat(itemPrice);
  });
  
  const look = {
    id: `look-${occasion}-${index}-${currentItemIndex}`,
    title: `${occasion} Look`,
    items: lookItems,
    price: totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : '$0.00',
    category: userStyle?.analysis?.styleProfile || "Casual",
    occasion: occasion
  };

  const handleViewDetails = () => {
    // Store the full item details for the suggestions page
    localStorage.setItem(`selected-look-items`, JSON.stringify(currentOutfit));
    localStorage.setItem(`selected-look-occasion`, occasion);
    navigate(`/suggestions`);
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentItemIndex((prev) => 
      prev === 0 ? outfits.length - 1 : prev - 1
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentItemIndex((prev) => 
      (prev + 1) % outfits.length
    );
  };

  return (
    <div 
      className="bg-netflix-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow max-w-md mx-auto w-full"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">{look.title}</h3>
        <span className="text-sm text-netflix-accent">{look.occasion}</span>
      </div>
      <div 
        className="mb-4 bg-white rounded-lg overflow-hidden relative group cursor-pointer"
        onClick={handleViewDetails}
      >
        <LookCanvas items={look.items} width={300} height={500} occasion={occasion} />
        
        {/* Navigation arrows */}
        <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handlePrevious}
            className="bg-netflix-accent text-white p-2 rounded-full"
            aria-label="Previous outfit"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="bg-netflix-accent text-white p-2 rounded-full"
            aria-label="Next outfit"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the canvas click
            onShuffleLook(look.occasion);
          }}
          className="absolute bottom-4 right-4 bg-netflix-accent text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          title="Try different combination"
          disabled={isRefreshing}
        >
          <Shuffle className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
        
        {/* Outfit counter indicator */}
        <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {currentItemIndex + 1}/{outfits.length}
        </div>
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
