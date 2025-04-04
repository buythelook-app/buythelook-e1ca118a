
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFirstOutfitSuggestion } from "@/services/lookService";
import { storeStyleRecommendations } from "@/services/utils/outfitStorageUtils";

// Import our refactored hooks
import { useStylePreferences } from "./useStylePreferences";
import { useOutfitGeneration } from "./useOutfitGeneration";
import { useQuizValidation } from "./useQuizValidation";

export const useOutfitGenerator = () => {
  const { hasQuizData } = useQuizValidation();
  
  const {
    recommendations,
    setRecommendations,
    userStylePreference,
    elegance, 
    colorIntensity,
    handleEleganceChange,
    handleColorIntensityChange
  } = useStylePreferences();

  // Query for outfit suggestions based on user preferences
  const { data: dashboardItems, isLoading, error, refetch } = useQuery({
    queryKey: ['firstOutfitSuggestion', elegance, colorIntensity, userStylePreference],
    queryFn: fetchFirstOutfitSuggestion,
    retry: 3,
    staleTime: 0,
    refetchOnWindowFocus: false,
    enabled: hasQuizData,
    meta: {
      onError: () => {
        console.error("Failed to load outfit suggestions");
      }
    }
  });

  const {
    isRefreshing,
    outfitColors,
    handleTryDifferentLook,
    loadOutfitColors
  } = useOutfitGeneration(refetch);

  // Load stored recommendations and colors
  useEffect(() => {
    if (!hasQuizData) return;

    const storedRecommendations = localStorage.getItem('style-recommendations');
    
    if (storedRecommendations) {
      try {
        setRecommendations(JSON.parse(storedRecommendations));
      } catch (e) {
        console.error('Error parsing recommendations:', e);
      }
    }
    
    loadOutfitColors();
  }, [hasQuizData]);

  // Listen for mood changes to trigger refetch
  useEffect(() => {
    const handleMoodChange = () => {
      refetch();
    };

    window.addEventListener('mood-changed', handleMoodChange);
    return () => window.removeEventListener('mood-changed', handleMoodChange);
  }, [refetch]);

  return {
    dashboardItems,
    isLoading,
    error,
    isRefreshing,
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
