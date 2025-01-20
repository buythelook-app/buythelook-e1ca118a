import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export const HomeButton = () => {
  const navigate = useNavigate();

  return (
    <Button 
      variant="ghost" 
      onClick={() => navigate('/home')}
      className="fixed bottom-4 right-4 z-50"
    >
      <Home className="h-6 w-6" />
    </Button>
  );
};