import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type QuizStep = 'gender' | 'height' | 'weight' | 'waist' | 'chest' | 'bodyShape' | 'photo' | 'colorPalette';

export const StyleQuiz = () => {
  const [currentStep, setCurrentStep] = useState<QuizStep>('gender');
  const [quizData, setQuizData] = useState({
    gender: '',
    height: '',
    weight: '',
    waist: '',
    chest: '',
    bodyShape: '',
    photo: null as File | null,
    colorPalette: '',
  });

  const handleNext = () => {
    const steps: QuizStep[] = ['gender', 'height', 'weight', 'waist', 'chest', 'bodyShape', 'photo', 'colorPalette'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'gender':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-center mb-8">
              Which gender do you most identify with?
            </h2>
            <RadioGroup
              className="grid grid-cols-1 gap-4"
              value={quizData.gender}
              onValueChange={(value) => setQuizData({ ...quizData, gender: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="women" id="women" />
                <Label htmlFor="women">Women</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="men" id="men" />
                <Label htmlFor="men">Men</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non-binary" id="non-binary" />
                <Label htmlFor="non-binary">Non-Binary</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="prefer-not-to-say" id="prefer-not-to-say" />
                <Label htmlFor="prefer-not-to-say">Prefer not to say</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 'height':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-center mb-8">
              What is your height?
            </h2>
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                placeholder="Height in cm"
                value={quizData.height}
                onChange={(e) => setQuizData({ ...quizData, height: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
        );

      // Add similar cases for other steps...
      default:
        return null;
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6 bg-netflix-card text-netflix-text">
      <div className="min-h-[400px] flex flex-col justify-between">
        {renderStep()}
        <div className="flex justify-end mt-8">
          <Button
            onClick={handleNext}
            className="bg-netflix-accent hover:bg-netflix-accent/90"
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};