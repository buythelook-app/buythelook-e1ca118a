
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const QuizPrompt = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold mb-4">Style Quiz Required</h2>
      <p className="text-gray-600 mb-8">Please complete the style quiz to get personalized outfit suggestions.</p>
      <Button onClick={() => navigate('/quiz')}>Take Style Quiz</Button>
    </div>
  );
};
