import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

type QuizStep = 'gender' | 'height' | 'weight' | 'waist' | 'chest' | 'bodyShape' | 'photo' | 'colorPalette';

const bodyShapes = [
  { value: 'hourglass', label: 'Hourglass' },
  { value: 'pear', label: 'Pear' },
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'apple', label: 'Apple' },
  { value: 'inverted-triangle', label: 'Inverted Triangle' }
];

const colorPalettes = [
  { value: 'warm', label: 'Warm (earth tones, reds, oranges)' },
  { value: 'cool', label: 'Cool (blues, purples, greens)' },
  { value: 'neutral', label: 'Neutral (blacks, whites, grays)' },
  { value: 'pastel', label: 'Pastel (soft, muted colors)' },
  { value: 'bright', label: 'Bright (vibrant, bold colors)' }
];

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
    
    // Validate current step
    if (!quizData[currentStep]) {
      toast({
        title: "Required Field",
        description: "Please fill out this field before continuing",
        variant: "destructive",
      });
      return;
    }

    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      // Handle quiz completion
      toast({
        title: "Quiz Completed!",
        description: "We'll now generate your personalized style recommendations.",
      });
      console.log('Quiz completed:', quizData);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQuizData({ ...quizData, photo: file });
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

      case 'weight':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-center mb-8">
              What is your weight?
            </h2>
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                placeholder="Weight in kg"
                value={quizData.weight}
                onChange={(e) => setQuizData({ ...quizData, weight: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
        );

      case 'waist':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-center mb-8">
              What is your waist measurement?
            </h2>
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                placeholder="Waist in cm"
                value={quizData.waist}
                onChange={(e) => setQuizData({ ...quizData, waist: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
        );

      case 'chest':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-center mb-8">
              What is your chest measurement?
            </h2>
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                placeholder="Chest in cm"
                value={quizData.chest}
                onChange={(e) => setQuizData({ ...quizData, chest: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
        );

      case 'bodyShape':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-center mb-8">
              What is your body shape?
            </h2>
            <Select
              value={quizData.bodyShape}
              onValueChange={(value) => setQuizData({ ...quizData, bodyShape: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your body shape" />
              </SelectTrigger>
              <SelectContent>
                {bodyShapes.map((shape) => (
                  <SelectItem key={shape.value} value={shape.value}>
                    {shape.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'photo':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-center mb-8">
              Upload a full-body photo (optional)
            </h2>
            <Input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="w-full"
            />
            <p className="text-sm text-gray-400 text-center">
              This helps us better understand your style preferences
            </p>
          </div>
        );

      case 'colorPalette':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-center mb-8">
              What color palette do you prefer?
            </h2>
            <Select
              value={quizData.colorPalette}
              onValueChange={(value) => setQuizData({ ...quizData, colorPalette: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your preferred colors" />
              </SelectTrigger>
              <SelectContent>
                {colorPalettes.map((palette) => (
                  <SelectItem key={palette.value} value={palette.value}>
                    {palette.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-netflix-background py-20">
      <Card className="max-w-md mx-auto p-6 bg-netflix-card text-netflix-text">
        <div className="min-h-[400px] flex flex-col justify-between">
          {renderStep()}
          <div className="flex justify-end mt-8">
            <Button
              onClick={handleNext}
              className="bg-netflix-accent hover:bg-netflix-accent/90"
            >
              {currentStep === 'colorPalette' ? 'Complete' : 'Next'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};