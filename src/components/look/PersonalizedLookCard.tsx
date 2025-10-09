
import { memo, useState } from "react";
import { Shuffle, ShoppingCart, ThumbsUp, ThumbsDown } from "lucide-react";
import { LookCanvas } from "@/components/LookCanvas";
import { TryMeButton } from "@/components/TryMeButton";
import { useNavigate } from "react-router-dom";
import { Look } from "@/hooks/usePersonalizedLooks";
import { toast } from "sonner";

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
  const [userLiked, setUserLiked] = useState<boolean | undefined>(undefined);

  const handleFeedback = (liked: boolean) => {
    setUserLiked(liked);
    
    // Dispatch feedback event for learning
    window.dispatchEvent(new CustomEvent('outfit-feedback', {
      detail: { 
        lookId: look.id, 
        liked: liked, 
        disliked: !liked 
      }
    }));
    
    toast.info(liked ? 'תודה! הלוק נשמר בהעדפות שלך' : 'נשמע, ננסה להציע משהו אחר');
  };
  
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
      className="bg-fashion-glass rounded-3xl p-6 border border-white/20 backdrop-blur-xl shadow-lg fashion-card-hover"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white">{look.title}</h3>
        <span className="text-sm text-fashion-accent bg-fashion-accent/10 px-3 py-1 rounded-full">{look.occasion}</span>
      </div>
      <div className="mb-4 bg-white/5 rounded-2xl overflow-hidden relative group backdrop-blur-sm">
        {customCanvas || <LookCanvas items={look.items} width={300} height={480} />}
        {onShuffle && (
          <button
            onClick={() => onShuffle(look.occasion)}
            className="absolute bottom-4 right-4 bg-fashion-accent text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            title="Try different combination"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {/* Feedback buttons */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handleFeedback(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
              userLiked === true 
                ? 'bg-fashion-accent text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm">אהבתי</span>
          </button>
          <button
            onClick={() => handleFeedback(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
              userLiked === false 
                ? 'bg-fashion-accent text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            <span className="text-sm">לא מתאים</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <p className="text-fashion-accent font-semibold text-lg">{look.price}</p>
          <div className="flex space-x-3">
            <TryMeButton items={avatarItems} />
            <button
              onClick={() => onAddToCart(look)}
              className="bg-fashion-accent text-white p-3 rounded-2xl hover:bg-fashion-accent/90 transition-all duration-300 hover:scale-105"
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
              className="bg-gradient-to-r from-fashion-primary to-fashion-accent text-white px-6 py-3 rounded-2xl hover:from-fashion-primary/90 hover:to-fashion-accent/90 transition-all duration-300 text-sm font-medium"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

PersonalizedLookCard.displayName = "PersonalizedLookCard";
