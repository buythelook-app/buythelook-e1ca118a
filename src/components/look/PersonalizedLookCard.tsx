
import { memo, useState } from "react";
import { Shuffle, ShoppingCart, ThumbsUp, ThumbsDown } from "lucide-react";
import { LookCanvas } from "@/components/LookCanvas";
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
    
    // Dispatch feedback event for learning immediately
    window.dispatchEvent(new CustomEvent('outfit-feedback', {
      detail: { 
        lookId: look.id, 
        liked: liked, 
        disliked: !liked,
        lookData: look // 🧠 Include full look data for learning
      }
    }));
    
    toast.info(liked ? 'תודה! הלוק נשמר בהעדפות שלך' : 'תודה על המשוב! נשתמש בו כדי לשפר את ההמלצות');
  };
  
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
      
      {/* Feedback buttons - centered below canvas */}
      <div className="flex justify-center gap-3 mb-4">
        <button
          onClick={() => handleFeedback(true)}
          className={`flex items-center justify-center p-3 rounded-full transition-all duration-300 ${
            userLiked === true 
              ? 'bg-fashion-accent text-white scale-110 shadow-lg' 
              : 'bg-fashion-accent/60 text-white hover:bg-fashion-accent hover:scale-105'
          }`}
          title="Like"
        >
          <ThumbsUp className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleFeedback(false)}
          className={`flex items-center justify-center p-3 rounded-full transition-all duration-300 ${
            userLiked === false 
              ? 'bg-fashion-primary text-white scale-110 shadow-lg' 
              : 'bg-fashion-primary/60 text-white hover:bg-fashion-primary hover:scale-105'
          }`}
          title="Dislike"
        >
          <ThumbsDown className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex flex-col gap-3">
        {/* Actions */}
        <div className="flex justify-between items-center">
          <p className="text-fashion-accent font-semibold text-lg">{look.price}</p>
          <div className="flex gap-3">
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
