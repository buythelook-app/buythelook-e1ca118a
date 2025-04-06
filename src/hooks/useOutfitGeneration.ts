
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { fetchFirstOutfitSuggestion, clearOutfitCache } from "@/services/lookService";

export function useOutfitGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const generateOutfit = async (forceRefresh: boolean = true) => {
    setIsGenerating(true);
    
    try {
      // Get user style data
      const styleData = localStorage.getItem('styleAnalysis');
      if (!styleData) {
        throw new Error('Style data not found');
      }
      
      const parsedData = JSON.parse(styleData);
      const bodyShape = parsedData?.analysis?.bodyShape || 'H';
      const style = parsedData?.analysis?.styleProfile || 'classic';
      const mood = localStorage.getItem('current-mood') || 'energized';
      
      // Clear the outfit cache to force a new generation
      if (forceRefresh) {
        clearOutfitCache(bodyShape, style, mood);
      }
      
      // Fetch a new outfit suggestion
      const outfitItems = await fetchFirstOutfitSuggestion(forceRefresh);
      
      return {
        success: true,
        items: outfitItems
      };
    } catch (error) {
      console.error('Error generating outfit:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate a new outfit. Please try again.",
        variant: "destructive",
      });
      return {
        success: false,
        items: []
      };
    } finally {
      setIsGenerating(false);
    }
  };
  
  return {
    isGenerating,
    generateOutfit
  };
}
