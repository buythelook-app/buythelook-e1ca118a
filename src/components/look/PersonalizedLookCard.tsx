
import { memo } from "react";
import { Shuffle, ShoppingCart } from "lucide-react";
import { LookCanvas } from "@/components/LookCanvas";
import { TryMeButton } from "@/components/TryMeButton";
import { useNavigate } from "react-router-dom";
import { Look } from "@/hooks/usePersonalizedLooks";

interface LookCardProps {
  look: Look;
  onShuffle?: (occasion: string) => void;
  onAddToCart: (look: Look) => void;
  userStyleProfile?: string;
  customCanvas?: React.ReactElement;
}

// Use memo to prevent unnecessary re-renders
export const PersonalizedLookCard = memo(({ look, onShuffle, onAddToCart, userStyleProfile, customCanvas }: LookCardProps) => {
  const navigate = useNavigate();
  
  // Filter items for TryMe button - exclude cart items and only include valid avatar types
  const avatarItems = look.items.filter(item => 
    item.type !== 'cart' && 
    ['top', 'bottom', 'dress', 'shoes', 'outerwear', 'accessory', 'sunglasses'].includes(item.type)
  ).map(item => ({
    id: item.id,
    image: item.image,
    type: item.type as 'top' | 'bottom' | 'dress' | 'shoes' | 'outerwear' | 'accessory' | 'sunglasses',
    name: item.name
  }));
  
  return (
    <div 
      className="bg-netflix-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">{look.title}</h3>
        <span className="text-sm text-netflix-accent">{look.occasion}</span>
      </div>
      <div className="mb-4 bg-white rounded-lg overflow-hidden relative group">
        {customCanvas || <LookCanvas items={look.items} width={300} height={480} />}
        {onShuffle && (
          <button
            onClick={() => onShuffle(look.occasion)}
            className="absolute bottom-4 right-4 bg-netflix-accent text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            title="Try different combination"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex justify-between items-center">
        <p className="text-netflix-accent font-semibold">{look.price}</p>
        <div className="flex space-x-2">
          <TryMeButton items={avatarItems} />
          <button
            onClick={() => onAddToCart(look)}
            className="bg-netflix-accent text-white p-2 rounded-lg hover:bg-netflix-accent/90 transition-colors"
            title="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              localStorage.setItem(`look-${look.id}`, JSON.stringify({
                ...look,
                description: `A curated ${look.occasion.toLowerCase()} look that matches your ${userStyleProfile || 'personal'} style preference.`
              }));
              navigate(`/look/${look.id}`);
            }}
            className="bg-netflix-accent text-white px-4 py-2 rounded-lg hover:bg-netflix-accent/90 transition-colors text-sm flex items-center gap-2"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
});

PersonalizedLookCard.displayName = "PersonalizedLookCard";
