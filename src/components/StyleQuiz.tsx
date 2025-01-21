import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { HomeButton } from "./HomeButton";
import { QuizProgress } from "./quiz/QuizProgress";
import { QuizNavigation } from "./quiz/QuizNavigation";
import { QuizContainer } from "./quiz/QuizContainer";
import { QuizProvider } from "./quiz/QuizContext";
import { QuizStepRenderer } from "./quiz/QuizStepRenderer";

const TOTAL_STEPS = 10;

export const StyleQuiz = () => {
  const { toast } = useToast();

  useEffect(() => {
    const savedData = localStorage.getItem('style-quiz-data');
    if (savedData) {
      toast({
        title: "Previous quiz data loaded",
        description: "You can continue from where you left off.",
      });
    }
  }, [toast]);

  return (
    <div>
      <QuizProvider>
        <QuizContainer>
          <QuizProgress currentStep={step} totalSteps={TOTAL_STEPS} />
          <QuizStepRenderer />
          <QuizNavigation
            currentStep={step}
            totalSteps={TOTAL_STEPS}
            onNext={handleNext}
            onBack={handleBack}
            onComplete={handleSubmit}
          />
        </QuizContainer>
      </QuizProvider>
      <HomeButton />
    </div>
  );
};