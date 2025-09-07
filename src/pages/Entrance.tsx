
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Entrance = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically navigate to landing page after 3 seconds
    const timer = setTimeout(() => {
      navigate("/landing");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background flex items-center justify-center">
      <div className="text-center space-y-8 animate-fadeIn bg-fashion-glass p-12 rounded-2xl backdrop-blur-xl border border-white/20">
        <img
          src="/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png"
          alt="Buy the Look Logo"
          className="w-64 mx-auto mb-8 drop-shadow-2xl hover:scale-105 transition-transform duration-300 fashion-glow"
        />
        <div>
          <h1 className="text-3xl font-bold mb-4 fashion-hero-text">
            Your Personal Style Journey Begins
          </h1>
          <p className="text-muted-foreground text-lg font-light tracking-wide">
            Discover outfits that match your unique style
          </p>
        </div>
        <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto"></div>
      </div>
    </div>
  );
};
