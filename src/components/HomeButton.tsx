
import { Home, Layout } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export const HomeButton = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/landing')}
        className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
        title="View Landing Page"
      >
        <Layout className="h-5 w-5" />
      </Button>
      <Button 
        variant="ghost" 
        onClick={() => navigate('/home')}
        className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
        title="Go to Home"
      >
        <Home className="h-5 w-5" />
      </Button>
    </div>
  );
};
