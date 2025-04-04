
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateOutfitFromUserPreferences } from "@/services/api/outfitApi";

export const useOutfitSuggestions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [outfitSuggestions, setOutfitSuggestions] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const generateInitialOutfit = async () => {
      try {
        console.log("Generating initial outfit suggestions on home page load");
        const response = await generateOutfitFromUserPreferences();
        console.log("Initial outfit suggestions generated successfully", response);
        
        if (response && response.data && Array.isArray(response.data)) {
          setOutfitSuggestions(response.data);
        }
      } catch (error) {
        console.error("Error generating initial outfit suggestions:", error);
      }
    };
    
    generateInitialOutfit();
  }, []);

  // Listen for mood changes to regenerate outfits
  useEffect(() => {
    const handleMoodChange = () => {
      console.log("Mood changed event detected, regenerating outfits");
      handleGenerateNewLooks();
    };
    
    window.addEventListener('mood-changed', handleMoodChange);
    
    return () => {
      window.removeEventListener('mood-changed', handleMoodChange);
    };
  }, []);

  // Make the refetch function available globally for direct trigger from mood changes
  useEffect(() => {
    // @ts-ignore
    window.refetchOutfits = handleGenerateNewLooks;
    
    return () => {
      // @ts-ignore
      delete window.refetchOutfits;
    };
  }, []);

  const handleGenerateNewLooks = async () => {
    setIsLoading(true);
    console.log("Generate new looks button clicked, sending API request...");
    
    try {
      // Get user preferences from localStorage
      const quizData = localStorage.getItem('styleAnalysis');
      const styleAnalysis = quizData ? JSON.parse(quizData) : null;
      const currentMoodData = localStorage.getItem('current-mood');
      
      console.log("User preferences:", { 
        styleAnalysis: styleAnalysis?.analysis, 
        mood: currentMoodData 
      });
      
      // Call the API with user preferences
      const response = await generateOutfitFromUserPreferences();
      console.log("API response received:", response);
      
      if (response && response.data && Array.isArray(response.data)) {
        // Update the outfit suggestions with the new data from the API
        console.log("Updating outfit suggestions with new data:", response.data);
        setOutfitSuggestions(response.data);
        
        toast({
          title: "Success",
          description: "New outfit suggestions have been generated!",
        });
      } else {
        console.error("Invalid API response format:", response);
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error('Error generating outfit suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate new outfit looks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    outfitSuggestions,
    handleGenerateNewLooks
  };
};
