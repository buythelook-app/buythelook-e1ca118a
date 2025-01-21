import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { GenderStep } from "./quiz/GenderStep";
import { MeasurementsStep } from "./quiz/MeasurementsStep";
import { BodyShapeStep } from "./quiz/BodyShapeStep";
import { PhotoUploadStep } from "./quiz/PhotoUploadStep";
import { ColorPreferencesStep } from "./quiz/ColorPreferencesStep";
import { StyleComparisonStep } from "./quiz/StyleComparisonStep";
import { HomeButton } from "./HomeButton";
import { QuizProgress } from "./quiz/QuizProgress";
import { QuizNavigation } from "./quiz/QuizNavigation";
import { QuizContainer } from "./quiz/QuizContainer";

const styleComparisons = [
  {
    style1: { name: "Modern", image: "/placeholder.svg" },
    style2: { name: "Classy", image: "/placeholder.svg" }
  },
  {
    style1: { name: "Boo Hoo", image: "/placeholder.svg" },
    style2: { name: "Nordic", image: "/placeholder.svg" }
  },
  {
    style1: { name: "Sporty", image: "/placeholder.svg" },
    style2: { name: "Elegance", image: "/placeholder.svg" }
  }
];

const STORAGE_KEY = 'style-quiz-data';
const TOTAL_STEPS = 10;

export const StyleQuiz = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: "",
    height: "",
    weight: "",
    waist: "",
    chest: "",
    bodyShape: "",
    photo: null as File | null,
    colorPreferences: [] as string[],
    stylePreferences: [] as string[],
  });

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData(prevData => ({
        ...parsedData,
        photo: prevData.photo
      }));
      toast({
        title: "Previous quiz data loaded",
        description: "You can continue from where you left off.",
      });
    }
  }, [toast]);

  useEffect(() => {
    const dataToSave = {
      ...formData,
      photo: null
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [formData]);

  const handleNext = () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const validateCurrentStep = () => {
    switch (step) {
      case 1:
        return formData.gender !== "";
      case 2:
        return formData.height !== "";
      case 3:
        return formData.weight !== "";
      case 4:
        return formData.waist !== "" && formData.chest !== "";
      case 5:
        return formData.bodyShape !== "";
      case 6:
        return true;
      case 7:
        return formData.colorPreferences.length > 0;
      case 8:
      case 9:
      case 10:
        return true;
      default:
        return true;
    }
  };

  const handleStyleSelect = (selectedStyle: string) => {
    setFormData(prev => ({
      ...prev,
      stylePreferences: [...prev.stylePreferences, selectedStyle]
    }));
    handleNext();
  };

  const handleSubmit = () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Quiz completed!",
      description: "We'll prepare your personalized style recommendations.",
    });
    navigate('/home');  // Changed from '/suggestions' to '/home'
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <GenderStep
            value={formData.gender}
            onChange={(value) => setFormData({ ...formData, gender: value })}
          />
        );
      case 2:
      case 3:
      case 4:
        return (
          <MeasurementsStep
            height={formData.height}
            weight={formData.weight}
            waist={formData.waist}
            chest={formData.chest}
            onHeightChange={(value) => setFormData({ ...formData, height: value })}
            onWeightChange={(value) => setFormData({ ...formData, weight: value })}
            onWaistChange={(value) => setFormData({ ...formData, waist: value })}
            onChestChange={(value) => setFormData({ ...formData, chest: value })}
            step={step}
          />
        );
      case 5:
        return (
          <BodyShapeStep
            value={formData.bodyShape}
            onChange={(value) => setFormData({ ...formData, bodyShape: value })}
          />
        );
      case 6:
        return (
          <PhotoUploadStep
            photo={formData.photo}
            onPhotoChange={(file) => setFormData({ ...formData, photo: file })}
          />
        );
      case 7:
        return (
          <ColorPreferencesStep
            selectedColors={formData.colorPreferences}
            onColorToggle={(color) => {
              const newColors = formData.colorPreferences.includes(color)
                ? formData.colorPreferences.filter((c) => c !== color)
                : [...formData.colorPreferences, color];
              setFormData({ ...formData, colorPreferences: newColors });
            }}
          />
        );
      case 8:
      case 9:
      case 10:
        const comparisonIndex = step - 8;
        return (
          <StyleComparisonStep
            style1={styleComparisons[comparisonIndex].style1}
            style2={styleComparisons[comparisonIndex].style2}
            onSelect={handleStyleSelect}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <QuizContainer>
        <QuizProgress currentStep={step} totalSteps={TOTAL_STEPS} />
        {renderStep()}
        <QuizNavigation
          currentStep={step}
          totalSteps={TOTAL_STEPS}
          onNext={handleNext}
          onBack={handleBack}
          onComplete={handleSubmit}
        />
      </QuizContainer>
      <HomeButton />
    </div>
  );
};
