
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
    <Card className="w-full mb-6 bg-netflix-card text-netflix-text">
      <CardHeader>
        <CardTitle className="text-lg">Your Answers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <strong>Weight:</strong> {formData.weight} kg
            </div>
          )}
          {formData.waist && (
            <div>
              <strong>Waist:</strong> {formData.waist} cm
            </div>
          )}
          {formData.chest && (
            <div>
              <strong>Chest:</strong> {formData.chest} cm
            </div>
          )}
          {formData.bodyShape && (
            <div>
              <strong>Body Shape:</strong> {formData.bodyShape}
            </div>
          )}
          {formData.colorPreferences.length > 0 && (
            <div className="md:col-span-2">
              <strong>Color Preferences:</strong>{" "}
              {formData.colorPreferences.join(", ")}
            </div>
          )}
          {formData.stylePreferences.length > 0 && (
            <div className="md:col-span-2">
              <strong>Style Preferences:</strong>{" "}
              {formData.stylePreferences.join(", ")}
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
      <QuizProgress currentStep={step} totalSteps={TOTAL_STEPS} />
      <QuizStepRenderer />
      <QuizNavigation
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        onNext={handleNext}
        onBack={handleBack}
        onComplete={handleSubmit}
        onSaveForLater={handleSaveForLater}
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
