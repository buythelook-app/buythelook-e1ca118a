import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

export const MoodSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="container max-w-md mx-auto">
        <h1 className="text-2xl font-display font-semibold mb-8">How are you feeling today?</h1>
        
        <div className="grid grid-cols-2 gap-4">
          <button className="p-4 bg-netflix-card rounded-lg hover:bg-netflix-accent/10 transition-colors">
            <span className="text-3xl mb-2 block">😊</span>
            <span className="text-sm">Happy</span>
          </button>
          <button className="p-4 bg-netflix-card rounded-lg hover:bg-netflix-accent/10 transition-colors">
            <span className="text-3xl mb-2 block">😴</span>
            <span className="text-sm">Tired</span>
          </button>
          <button className="p-4 bg-netflix-card rounded-lg hover:bg-netflix-accent/10 transition-colors">
            <span className="text-3xl mb-2 block">🤔</span>
            <span className="text-sm">Confused</span>
          </button>
          <button className="p-4 bg-netflix-card rounded-lg hover:bg-netflix-accent/10 transition-colors">
            <span className="text-3xl mb-2 block">😎</span>
            <span className="text-sm">Cool</span>
          </button>
        </div>
      </div>
    </div>
  );
};