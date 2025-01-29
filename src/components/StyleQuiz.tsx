import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { HomeButton } from "./HomeButton";
import { QuizProgress } from "./quiz/QuizProgress";
import { QuizNavigation } from "./quiz/QuizNavigation";
import { QuizContainer } from "./quiz/QuizContainer";
import { QuizProvider, useQuizContext } from "./quiz/QuizContext";
import { QuizStepRenderer } from "./quiz/QuizStepRenderer";

const TOTAL_STEPS = 13; // Increased from 10 to 13 to accommodate all style comparisons

const QuizContent = () => {
  const { step, handleNext, handleBack, handleSubmit } = useQuizContext();
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
    <>
      <QuizProgress currentStep={step} totalSteps={TOTAL_STEPS} />
      <QuizStepRenderer />
      <QuizNavigation
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        onNext={handleNext}
        onBack={handleBack}
        onComplete={handleSubmit}
      />
    </>
  );
};

export const StyleQuiz = () => {
  return (
    <div>
      <QuizProvider>
        <QuizContainer>
          <QuizContent />
        </QuizContainer>
      </QuizProvider>
      <HomeButton />
    </div>
  );
};