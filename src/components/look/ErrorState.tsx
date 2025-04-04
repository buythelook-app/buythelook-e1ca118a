
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ErrorStateProps {
  message?: string;
}

export const ErrorState = ({ message = "Unable to load outfit suggestions" }: ErrorStateProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <p className="text-red-500 mb-4">{message}</p>
      <div className="space-x-4">
        <Button onClick={() => navigate('/quiz')}>Retake Style Quiz</Button>
        <Button onClick={() => window.location.reload()} variant="outline">
          Refresh Page
        </Button>
      </div>
    </div>
  );
};
