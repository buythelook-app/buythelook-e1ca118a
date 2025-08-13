
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { HomeButton } from "./HomeButton";
import { QuizProgress } from "./quiz/QuizProgress";
import { QuizNavigation } from "./quiz/QuizNavigation";
import { QuizContainer } from "./quiz/QuizContainer";
import { QuizProvider, useQuizContext } from "./quiz/QuizContext";
import { QuizStepRenderer } from "./quiz/QuizStepRenderer";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const TOTAL_STEPS = 13;

const QuizSummary = () => {
  const { formData } = useQuizContext();
  
  if (!formData.gender) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-center mb-4">Your Answers</h3>
      <div className="space-y-2 text-sm">
        {formData.gender && (
          <div className="bg-netflix-background/50 p-2 rounded">
            <strong>Gender:</strong><br />{formData.gender}
          </div>
        )}
        {formData.height && (
          <div className="bg-netflix-background/50 p-2 rounded">
            <strong>Height:</strong><br />{formData.height} cm
          </div>
        )}
        {formData.weight && (
          <div className="bg-netflix-background/50 p-2 rounded">
            <strong>Weight:</strong><br />{formData.weight !== "prefer_not_to_answer" ? 
              `${formData.weight} lbs` : "N/A"}
          </div>
        )}
        {formData.bodyShape && (
          <div className="bg-netflix-background/50 p-2 rounded">
            <strong>Body:</strong><br />{formData.bodyShape}
          </div>
        )}
        {formData.colorPreferences.length > 0 && (
          <div className="bg-netflix-background/50 p-2 rounded">
            <strong>Colors:</strong><br />{formData.colorPreferences.slice(0, 3).join(", ")}{formData.colorPreferences.length > 3 ? "..." : ""}
          </div>
        )}
        {formData.stylePreferences.length > 0 && (
          <div className="bg-netflix-background/50 p-2 rounded">
            <strong>Style:</strong><br />{formData.stylePreferences.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
};

const QuizContent = () => {
  const { step, handleNext, handleBack, handleSubmit, handleSaveForLater } = useQuizContext();
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
    <div className="flex flex-col h-full">
      <QuizProgress currentStep={step} totalSteps={TOTAL_STEPS} />
      <div className="flex-1 flex flex-col min-h-0">
        <QuizStepRenderer />
      </div>
      <div className="mt-auto pt-4">
        <QuizNavigation
          currentStep={step}
          totalSteps={TOTAL_STEPS}
          onNext={handleNext}
          onBack={handleBack}
          onComplete={handleSubmit}
          onSaveForLater={handleSaveForLater}
        />
      </div>
    </div>
  );
};

export const StyleQuiz = () => {
  return (
    <div>
      <QuizProvider>
        <QuizContainer>
          {{
            summary: <QuizSummary />,
            content: <QuizContent />
          }}
        </QuizContainer>
      </QuizProvider>
      <HomeButton />
    </div>
  );
};
