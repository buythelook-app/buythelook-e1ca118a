
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthCheck } from "@/hooks/useAuthCheck";

export const Entrance = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthCheck();

  useEffect(() => {
    // Only redirect once we've checked authentication status
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          console.log("User is authenticated, navigating to home");
          navigate("/home");
        } else {
          console.log("User is not authenticated, navigating to auth");
          navigate("/auth");
        }
      }, 2000); // Short delay to show splash screen

      return () => clearTimeout(timer);
    }
  }, [navigate, isAuthenticated, isLoading]);

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
        {isLoading && (
          <div className="mt-4">
            <div className="h-8 w-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
};
