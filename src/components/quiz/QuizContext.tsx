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
    navigate('/home');
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