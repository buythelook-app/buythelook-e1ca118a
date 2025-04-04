
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const QuizPrompt = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
      <h1 className="text-3xl font-bold mb-4">Complete Your Style Quiz</h1>
      <p className="mb-6">
        To get personalized outfit recommendations, please complete your style quiz first.
      </p>
      <Button onClick={() => navigate('/quiz')} className="bg-netflix-accent hover:bg-netflix-accent/80">
        Take Style Quiz
      </Button>
    </div>
  );
};
