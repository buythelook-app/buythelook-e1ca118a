
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
  
  if (!formData.gender) return null; // Don't show summary until quiz starts

  return (
    <Card className="w-full mb-4 bg-netflix-card text-netflix-text">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Your Answers</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {formData.gender && (
            <div>
              <strong>Gender:</strong> {formData.gender}
            </div>
          )}
          {formData.height && (
            <div>
              <strong>Height:</strong> {formData.height} cm
            </div>
          )}
          {formData.weight && (
            <div>
              <strong>Weight:</strong> {formData.weight !== "prefer_not_to_answer" ? 
                `${formData.weight} lbs` : "N/A"}
            </div>
          )}
          {formData.bodyShape && (
            <div>
              <strong>Body:</strong> {formData.bodyShape}
            </div>
          )}
          {formData.colorPreferences.length > 0 && (
            <div className="md:col-span-2">
              <strong>Colors:</strong> {formData.colorPreferences.slice(0, 2).join(", ")}{formData.colorPreferences.length > 2 ? "..." : ""}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
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
    <>
      <QuizSummary />
      <div className="flex-1 min-h-0 flex flex-col">
        <QuizProgress currentStep={step} totalSteps={TOTAL_STEPS} />
        <div className="flex-1 min-h-0">
          <QuizStepRenderer />
        </div>
        <QuizNavigation
          currentStep={step}
          totalSteps={TOTAL_STEPS}
          onNext={handleNext}
          onBack={handleBack}
          onComplete={handleSubmit}
          onSaveForLater={handleSaveForLater}
        />
      </div>
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
