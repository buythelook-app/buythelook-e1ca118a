import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { fetchFirstOutfitSuggestion } from "@/services/lookService";
import { generateOutfit } from "@/services/api/outfitApi";
import { useNavigate } from "react-router-dom";
import { mapBodyShape, mapStyle } from "@/services/mappers/styleMappers";
import { storeOutfitColors, storeStyleRecommendations, OutfitColors } from "@/services/utils/outfitStorageUtils";
import { validateMood } from "@/services/utils/validationUtils";
import { findBestColorMatch } from "@/services/fetchers/itemsFetcher";
import { getFallbackItems } from "@/services/fallbacks/outfitFallbacks";

export const useOutfitGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [outfitColors, setOutfitColors] = useState<OutfitColors | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);
  const [elegance, setElegance] = useState(75);
  const [colorIntensity, setColorIntensity] = useState(60);
  const [userStylePreference, setUserStylePreference] = useState<string | null>(null);

  const hasQuizData = localStorage.getItem('styleAnalysis') !== null;

  useEffect(() => {
    const styleData = localStorage.getItem('styleAnalysis');
    if (styleData) {
      try {
        const parsedData = JSON.parse(styleData);
        const styleProfile = parsedData?.analysis?.styleProfile || null;
        setUserStylePreference(styleProfile);
        console.log("Loaded user style preference:", styleProfile);
        
        if (styleProfile?.toLowerCase().includes('minimalist') || 
            styleProfile?.toLowerCase().includes('minimal') || 
            styleProfile?.toLowerCase().includes('nordic') || 
            styleProfile?.toLowerCase().includes('modern')) {
          setElegance(85);
          setColorIntensity(30);
        } else if (styleProfile?.toLowerCase().includes('boohoo') || 
                  styleProfile?.toLowerCase().includes('bohemian')) {
          setElegance(60);
          setColorIntensity(80);
        } else if (styleProfile?.toLowerCase().includes('classic') || 
                  styleProfile?.toLowerCase().includes('elegant')) {
          setElegance(90);
          setColorIntensity(50);
        }
      } catch (error) {
        console.error("Error parsing style data:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!hasQuizData) {
      toast({
        title: "Style Quiz Required",
        description: "Please complete the style quiz first to get personalized suggestions.",
        variant: "destructive",
      });
      navigate('/quiz');
      return;
    }

    const storedRecommendations = localStorage.getItem('style-recommendations');
    const storedColors = localStorage.getItem('outfit-colors');
    
    if (storedRecommendations) {
      try {
        setRecommendations(JSON.parse(storedRecommendations));
      } catch (e) {
        console.error('Error parsing recommendations:', e);
      }
    }
    
    if (storedColors) {
      try {
        const parsedColors = JSON.parse(storedColors) as OutfitColors;
        setOutfitColors(parsedColors);
      } catch (e) {
        console.error('Error parsing outfit colors:', e);
      }
    }
  }, [hasQuizData, navigate, toast]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'current-mood') {
        refetch();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const { data: dashboardItems, isLoading, error, refetch } = useQuery({
    queryKey: ['firstOutfitSuggestion', elegance, colorIntensity, userStylePreference],
    queryFn: fetchFirstOutfitSuggestion,
    retry: 3,
    staleTime: 0,
    refetchOnWindowFocus: false,
    enabled: hasQuizData,
    meta: {
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to load outfit suggestions. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  const handleTryDifferentLook = async () => {
    setIsRefetching(true);
    try {
      // Get user preferences from quiz data
      const quizData = localStorage.getItem('styleAnalysis');
      const styleAnalysis = quizData ? JSON.parse(quizData) : null;
      
      if (!styleAnalysis?.analysis) {
        throw new Error("Style analysis data missing");
      }
      
      // Extract necessary parameters for API request
      const bodyShape = mapBodyShape(styleAnalysis.analysis.bodyShape || 'H');
      const preferredStyle = styleAnalysis.analysis.styleProfile || 'classic';
      const style = mapStyle(preferredStyle);
      
      // Get the current mood or use default
      const currentMoodData = localStorage.getItem('current-mood');
      const mood = validateMood(currentMoodData);
      
      console.log("Generating new outfit with params:", { bodyStructure: bodyShape, style, mood });
      
      // Make direct API request following the documentation
      const response = await generateOutfit(bodyShape, style, mood);
      console.log("Outfit API response:", response);
      
      if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
        throw new Error("Invalid API response");
      }
      
      // Process the first outfit suggestion
      const outfitSuggestion = response.data[0];
      
      // Store recommendations and color palette
      if (outfitSuggestion.recommendations && Array.isArray(outfitSuggestion.recommendations)) {
        storeStyleRecommendations(outfitSuggestion.recommendations);
        setRecommendations(outfitSuggestion.recommendations);
      }
      
      // Store and set color palette
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
      
      // Find matching items for each color
      const topItem = await findBestColorMatch(outfitSuggestion.top, 'top');
      const bottomItem = await findBestColorMatch(outfitSuggestion.bottom, 'bottom');
      const shoesItem = await findBestColorMatch(outfitSuggestion.shoes, 'shoes');
      
      const items = [
        topItem || getFallbackItems()[0],
        bottomItem || getFallbackItems()[1],
        shoesItem || getFallbackItems()[2]
      ];
      
      // Add coat if present in the suggestion
      if (outfitSuggestion.coat) {
        const coatItem = await findBestColorMatch(outfitSuggestion.coat, 'outerwear');
        if (coatItem) {
          items.push(coatItem);
        }
      }
      
      // Trigger refetch to update the UI
      await refetch();
      
      toast({
        title: "New Look Generated",
        description: "Here's a fresh style combination for you!",
      });
    } catch (error) {
      console.error("Error generating outfit:", error);
      toast({
        title: "Error",
        description: "Failed to generate a new look. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefetching(false);
    }
  };

  const handleEleganceChange = (value: number[]) => {
    setElegance(value[0]);
  };

  const handleColorIntensityChange = (value: number[]) => {
    setColorIntensity(value[0]);
  };

  return {
    dashboardItems,
    isLoading,
    error,
    isRefetching,
    recommendations,
    outfitColors,
    elegance,
    colorIntensity,
    userStylePreference,
    hasQuizData,
    handleTryDifferentLook,
    handleEleganceChange,
    handleColorIntensityChange,
    refetch
  };
};
