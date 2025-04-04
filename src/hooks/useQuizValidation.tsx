
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const useQuizValidation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasQuizData, setHasQuizData] = useState(false);

  useEffect(() => {
    const styleData = localStorage.getItem('styleAnalysis');
    setHasQuizData(styleData !== null);

    if (!styleData) {
      toast({
        title: "Style Quiz Required",
        description: "Please complete the style quiz first to get personalized suggestions.",
        variant: "destructive",
      });
      navigate('/quiz');
    }
  }, [navigate, toast]);

  // Listen for mood changes in local storage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'current-mood') {
        // This will be handled by the parent component
        window.dispatchEvent(new CustomEvent('mood-changed'));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    hasQuizData
  };
};
