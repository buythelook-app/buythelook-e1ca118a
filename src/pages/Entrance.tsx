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
      <div className="text-center space-y-8 animate-fade-in">
        <img
          src="/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png"
          alt="Buy the Look Logo"
          className="w-64 mx-auto mb-8"
        />
        <p className="text-netflix-text text-xl">
          Your Personal Style Journey Begins
        </p>
      </div>
    </div>
  );
};