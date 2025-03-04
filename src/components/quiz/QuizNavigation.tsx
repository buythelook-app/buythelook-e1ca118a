
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface QuizNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
  onSaveForLater?: () => void;
}

export const QuizNavigation = ({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onComplete,
  onSaveForLater,
}: QuizNavigationProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSaveForLater = () => {
    if (onSaveForLater) {
      onSaveForLater();
    } else {
      // Default implementation if not provided
      toast({
        title: "Progress saved",
        description: "Your quiz progress has been saved. You can continue later.",
      });
      navigate('/home');
    }
  };

  return (
    <div className="flex justify-between mt-8">
      <Button
        variant="outline"
        onClick={onBack}
        disabled={currentStep === 1}
        className="w-28"
      >
        Back
      </Button>
      <Button
        variant="default"
        onClick={handleSaveForLater}
        className="w-40 ml-2 mr-2 bg-netflix-accent"
      >
        <Clock className="mr-2 h-4 w-4" />
        Continue Later
      </Button>
      {currentStep < totalSteps ? (
        <Button className="bg-netflix-accent w-28" onClick={onNext}>
          Next
        </Button>
      ) : (
        <Button className="bg-netflix-accent w-28" onClick={onComplete}>
          Complete
        </Button>
      )}
    </div>
  );
};
