
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
    <Card className="w-full mb-8 bg-fashion-neutral/30 border-fashion-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-fashion-dark">Your Profile Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {formData.gender && (
            <div className="flex flex-col">
              <span className="font-medium text-fashion-dark">Gender</span>
              <span className="text-fashion-muted">{formData.gender}</span>
            </div>
          )}
          {formData.height && (
            <div className="flex flex-col">
              <span className="font-medium text-fashion-dark">Height</span>
              <span className="text-fashion-muted">{formData.height} cm</span>
            </div>
          )}
          {formData.weight && (
            <div className="flex flex-col">
              <span className="font-medium text-fashion-dark">Weight</span>
              <span className="text-fashion-muted">
                {formData.weight !== "prefer_not_to_answer" ? 
                  `${formData.weight} lbs` : "Prefer not to answer"}
              </span>
            </div>
          )}
          {formData.waist && (
            <div className="flex flex-col">
              <span className="font-medium text-fashion-dark">Waist</span>
              <span className="text-fashion-muted">
                {formData.waist === "prefer_not_to_answer" ? 
                  "Prefer not to answer" : `${Math.round(parseInt(formData.waist) / 2.54)} inches`}
              </span>
            </div>
          )}
          {formData.chest && (
            <div className="flex flex-col">
              <span className="font-medium text-fashion-dark">Chest</span>
              <span className="text-fashion-muted">
                {formData.chest === "prefer_not_to_answer" ? 
                  "Prefer not to answer" : `${Math.round(parseInt(formData.chest) / 2.54)} inches`}
              </span>
            </div>
          )}
          {formData.bodyShape && (
            <div className="flex flex-col">
              <span className="font-medium text-fashion-dark">Body Shape</span>
              <span className="text-fashion-muted">{formData.bodyShape}</span>
            </div>
          )}
          {formData.colorPreferences.length > 0 && (
            <div className="flex flex-col md:col-span-2">
              <span className="font-medium text-fashion-dark">Color Preferences</span>
              <span className="text-fashion-muted">{formData.colorPreferences.join(", ")}</span>
            </div>
          )}
          {formData.stylePreferences.length > 0 && (
            <div className="flex flex-col md:col-span-2">
              <span className="font-medium text-fashion-dark">Style Preferences</span>
              <span className="text-fashion-muted">{formData.stylePreferences.join(", ")}</span>
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
