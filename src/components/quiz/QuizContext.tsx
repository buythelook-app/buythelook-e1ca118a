import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface QuizFormData {
  gender: string;
  height: string;
  weight: string;
  waist: string;
  chest: string;
  bodyShape: string;
  photo: File | null;
  colorPreferences: string[];
  stylePreferences: string[];
}

interface QuizContextType {
  formData: QuizFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuizFormData>>;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  handleNext: () => void;
  handleBack: () => void;
  handleSubmit: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuizContext = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuizContext must be used within a QuizProvider");
  }
  return context;
};

export const QuizProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<QuizFormData>({
    gender: "",
    height: "",
    weight: "",
    waist: "",
    chest: "",
    bodyShape: "",
    photo: null,
    colorPreferences: [],
    stylePreferences: [],
  });

  const analyzeStyleWithAI = async () => {
    try {
      const response = await fetch('https://preview--ai-bundle-construct-20.lovable.app/api/analyze-style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bodyShape: formData.bodyShape,
          colorPreferences: formData.colorPreferences,
          stylePreferences: formData.stylePreferences,
          measurements: {
            height: formData.height,
            weight: formData.weight,
            waist: formData.waist,
            chest: formData.chest,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze style');
      }

      return await response.json();
    } catch (error) {
      console.error('Style analysis error:', error);
      toast({
        title: "Style Analysis Error",
        description: "Failed to analyze your style preferences. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

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

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Analyzing your style...",
      description: "Our AI is processing your preferences.",
    });

    const styleAnalysis = await analyzeStyleWithAI();
    
    if (styleAnalysis) {
      toast({
        title: "Analysis complete!",
        description: "We've created your personalized style profile.",
      });
      // Store the analysis results in localStorage for use in suggestions
      localStorage.setItem('styleAnalysis', JSON.stringify(styleAnalysis));
      navigate('/suggestions');
    }
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

  return (
    <QuizContext.Provider
      value={{
        formData,
        setFormData,
        step,
        setStep,
        handleNext,
        handleBack,
        handleSubmit,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};