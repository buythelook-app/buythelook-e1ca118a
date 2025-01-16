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
    <div className="min-h-screen bg-netflix-background flex items-center justify-center">
      <div className="text-center space-y-4 animate-fade-in">
        <h1 className="text-6xl font-display font-bold text-netflix-accent">
          Buy the Look
        </h1>
        <p className="text-netflix-text text-xl">
          Your Personal Style Journey Begins
        </p>
      </div>
    </div>
  );
};