
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
    <div className="fashion-card rounded-3xl overflow-hidden fashion-hover group">
      {/* Look Image Section */}
      <div className="relative bg-fashion-background">
        {customCanvas || <LookCanvas items={look.items} width={300} height={400} />}
        
        {/* Shuffle Button - Premium styling */}
        {onShuffle && (
          <button
            onClick={() => onShuffle(look.occasion)}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-fashion-text p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
            title="Try different combination"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        )}
        
        {/* Occasion Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-fashion-accent/90 text-white px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase">
            {look.occasion}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-display fashion-text mb-2">{look.title}</h3>
          <p className="text-2xl font-bold fashion-text">{look.price}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary CTA */}
          <button
            onClick={() => onAddToCart(look)}
            className="w-full fashion-button-primary flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add Complete Look
          </button>
          
          {/* Secondary Actions */}
          <div className="flex gap-2">
            <TryMeButton items={avatarItems} />
            <button
              onClick={() => {
                localStorage.setItem(`look-${look.id}`, JSON.stringify({
                  ...look,
                  description: `A curated ${look.occasion.toLowerCase()} look that matches your ${userStyleProfile || 'personal'} style preference.`
                }));
                navigate(`/look/${look.id}`);
              }}
              className="flex-1 fashion-button-secondary text-sm"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="pt-4 border-t border-fashion-border">
          <p className="fashion-muted text-xs text-center mb-3">How do you like this look?</p>
          <div className="flex justify-center gap-4">
            <button 
              className="flex items-center gap-1 fashion-muted hover:text-fashion-success transition-colors text-sm"
              title="Love this look"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              Love
            </button>
            <button 
              className="flex items-center gap-1 fashion-muted hover:text-fashion-accent transition-colors text-sm"
              title="Not quite right"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

PersonalizedLookCard.displayName = "PersonalizedLookCard";
