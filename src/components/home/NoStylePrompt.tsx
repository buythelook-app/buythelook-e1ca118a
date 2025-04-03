
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

export const NoStylePrompt = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-netflix-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Complete Your Style Quiz</h2>
        <p className="text-gray-600 mb-8">
          Take our style quiz to get personalized look suggestions that match your style.
        </p>
        <Button
          onClick={() => navigate('/quiz')}
          className="bg-netflix-accent text-white px-6 py-3 rounded-lg hover:bg-netflix-accent/90 transition-colors"
        >
          Take Style Quiz
        </Button>
      </div>
    </div>
  );
};
