
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateOutfitFromUserPreferences } from "@/services/api/outfitGenerationService";

export const useOutfitSuggestions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [outfitSuggestions, setOutfitSuggestions] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const generateInitialOutfit = async () => {
      try {
        console.log("Generating initial outfit suggestions on home page load");
        const response = await generateOutfitFromUserPreferences();
        
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
      handleGenerateNewLooks();
    };
    
    window.addEventListener('mood-changed', handleMoodChange);
    return () => window.removeEventListener('mood-changed', handleMoodChange);
  }, []);

  const handleGenerateNewLooks = async () => {
    setIsLoading(true);
    
    try {
      const response = await generateOutfitFromUserPreferences();
      
      if (response && response.data && Array.isArray(response.data)) {
        setOutfitSuggestions(response.data);
        
        toast({
          title: "Success",
          description: "New outfit suggestions have been generated!",
        });
      } else {
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
