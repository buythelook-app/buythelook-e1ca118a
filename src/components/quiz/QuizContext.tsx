import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { QuizContextType, QuizFormData } from "./types";
import { loadQuizData, saveQuizData, validateQuizStep, analyzeStyleWithAI } from "./quizUtils";

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
  const [formData, setFormData] = useState<QuizFormData>(() => {
    const savedData = loadQuizData();
    if (Object.keys(savedData).length > 0) {
      console.log("Loaded saved data:", savedData);
      return savedData;
    }
    return {
      gender: "",
      height: "",
      weight: "",
      waist: "",
      chest: "",
      bodyShape: "",
      photo: null,
      colorPreferences: [],
      stylePreferences: [],
    };
  });

  // Save data whenever it changes
  useEffect(() => {
    console.log("Saving form data:", formData);
    saveQuizData(formData);
  }, [formData]);

  const handleNext = () => {
    if (!validateQuizStep(step, formData)) {
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
    if (!validateQuizStep(step, formData)) {
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

    try {
      console.log("Submitting form data:", formData);
      const styleAnalysis = await analyzeStyleWithAI(formData);
      
      toast({
        title: "Analysis complete!",
        description: "We've created your personalized style profile.",
      });
      localStorage.setItem('styleAnalysis', JSON.stringify(styleAnalysis));
      navigate('/suggestions');
    } catch (error) {
      console.error('Style analysis error:', error);
      toast({
        title: "Style Analysis Error",
        description: "Failed to analyze your style preferences. Please try again.",
        variant: "destructive",
      });
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