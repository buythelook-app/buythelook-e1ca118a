
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
    <Card className="w-64 fixed left-6 top-24 bg-netflix-card text-netflix-text">
      <CardHeader>
        <CardTitle className="text-lg">Your Answers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
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
          <div>
            <strong>Color Preferences:</strong>
            <ul className="list-disc list-inside pl-2">
              {formData.colorPreferences.map((color, index) => (
                <li key={index}>{color}</li>
              ))}
            </ul>
          </div>
        )}
        {formData.stylePreferences.length > 0 && (
          <div>
            <strong>Style Preferences:</strong>
            <ul className="list-disc list-inside pl-2">
              {formData.stylePreferences.map((style, index) => (
                <li key={index}>{style}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

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
        <QuizSummary />
        <QuizContainer>
          <QuizContent />
        </QuizContainer>
      </QuizProvider>
      <HomeButton />
    </div>
  );
};
