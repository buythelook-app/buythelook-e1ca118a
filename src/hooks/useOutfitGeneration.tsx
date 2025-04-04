
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateOutfit } from "@/services/api/outfitApi";
import { mapBodyShape, mapStyle } from "@/services/mappers/styleMappers";
import { validateMood } from "@/services/utils/validationUtils";
import { storeOutfitColors, storeStyleRecommendations, OutfitColors } from "@/services/utils/outfitStorageUtils";
import { findBestColorMatch } from "@/services/fetchers/itemsFetcher";
import { getFallbackItems } from "@/services/fallbacks/outfitFallbacks";
import { getRecommendationsForUserStyle } from "@/components/quiz/constants/styleRecommendations";
import { DashboardItem } from "@/types/lookTypes";

export const useOutfitGeneration = (refetch: () => Promise<any>) => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [outfitColors, setOutfitColors] = useState<OutfitColors | null>(null);

  // Generate a new outfit based on the user's preferences
  const handleTryDifferentLook = async () => {
    setIsRefreshing(true);
    console.log("Trying different look - generating new outfit...");
    try {
      const quizData = localStorage.getItem('styleAnalysis');
      const styleAnalysis = quizData ? JSON.parse(quizData) : null;
      
      if (!styleAnalysis?.analysis) {
        throw new Error("Style analysis data missing");
      }
      
      const bodyShape = mapBodyShape(styleAnalysis.analysis.bodyShape || 'H');
      const preferredStyle = styleAnalysis.analysis.styleProfile || 'classic';
      
      // Use the standardized style mapping for consistency
      const mappedStylePreference = getRecommendationsForUserStyle(preferredStyle);
      const style = mapStyle(preferredStyle);
      
      const currentMoodData = localStorage.getItem('current-mood');
      const mood = validateMood(currentMoodData);
      
      console.log("Generating new outfit with params:", { 
        bodyStructure: bodyShape, 
        style, 
        mood,
        userStylePreference: preferredStyle 
      });
      
      const response = await generateOutfit(bodyShape, style, mood);
      console.log("Outfit API response:", response);
      
      if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
        throw new Error("Invalid API response");
      }
      
      const outfitSuggestion = response.data[0];
      
      if (outfitSuggestion.recommendations && Array.isArray(outfitSuggestion.recommendations)) {
        storeStyleRecommendations(outfitSuggestion.recommendations);
      }
      
      const newOutfitColors: OutfitColors = {
        top: outfitSuggestion.top,
        bottom: outfitSuggestion.bottom,
        shoes: outfitSuggestion.shoes
      };
      
      if (outfitSuggestion.coat) {
        newOutfitColors.coat = outfitSuggestion.coat;
      }
      
      storeOutfitColors(newOutfitColors);
      setOutfitColors(newOutfitColors);
      
      const topItem = await findBestColorMatch(outfitSuggestion.top, 'top');
      const bottomItem = await findBestColorMatch(outfitSuggestion.bottom, 'bottom');
      const shoesItem = await findBestColorMatch(outfitSuggestion.shoes, 'shoes');
      
      const items = [
        topItem || getFallbackItems()[0],
        bottomItem || getFallbackItems()[1],
        shoesItem || getFallbackItems()[2]
      ];
      
      if (outfitSuggestion.coat) {
        const coatItem = await findBestColorMatch(outfitSuggestion.coat, 'outerwear');
        if (coatItem) {
          items.push(coatItem);
        }
      }
      
      await refetch();
      
      toast({
        title: "New Look Generated",
        description: `New outfit synced with your ${preferredStyle} style!`,
      });
    } catch (error) {
      console.error("Error generating outfit:", error);
      toast({
        title: "Error",
        description: "Failed to generate a new look. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load stored outfit colors from localStorage
  const loadOutfitColors = () => {
    const storedColors = localStorage.getItem('outfit-colors');
    if (storedColors) {
      try {
        const parsedColors = JSON.parse(storedColors) as OutfitColors;
        setOutfitColors(parsedColors);
      } catch (e) {
        console.error('Error parsing outfit colors:', e);
      }
    }
  };

  return {
    isRefreshing,
    outfitColors,
    setOutfitColors,
    handleTryDifferentLook,
    loadOutfitColors
  };
};
