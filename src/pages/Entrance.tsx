import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Entrance = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically navigate to auth page after 3 seconds
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-netflix-accent/20 via-netflix-background to-netflix-card flex items-center justify-center">
      <div className="text-center space-y-8 animate-fade-in bg-netflix-card/30 p-12 rounded-2xl backdrop-blur-sm">
        <img
          src="/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png"
          alt="Buy the Look Logo"
          className="w-64 mx-auto mb-8 drop-shadow-2xl hover:scale-105 transition-transform duration-300"
        />
        <p className="text-netflix-text text-xl font-light tracking-wide">
          Your Personal Style Journey Begins
        </p>
      </div>
    </div>
  );
};