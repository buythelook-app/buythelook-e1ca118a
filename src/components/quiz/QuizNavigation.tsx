import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface QuizNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
}

export const QuizNavigation = ({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onComplete,
}: QuizNavigationProps) => {
  return (
    <div className="flex justify-between mt-8 w-full">
      <div className="flex-1">
        {currentStep > 1 && (
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
        )}
      </div>
      <div className="flex-1 flex justify-end">
        {currentStep < totalSteps ? (
          <Button
            onClick={onNext}
            className="bg-netflix-accent hover:bg-netflix-accent/90 flex items-center gap-2"
          >
            Next
            <ArrowRight size={16} />
          </Button>
        ) : (
          <Button
            onClick={onComplete}
            className="bg-netflix-accent hover:bg-netflix-accent/90"
          >
            Complete Quiz
          </Button>
        )}
      </div>
    </div>
  );
};