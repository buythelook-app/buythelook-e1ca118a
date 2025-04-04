
import { useOutfitPreferences } from "./outfit/useOutfitPreferences";
import { useOutfitState } from "./outfit/useOutfitState";
import { useOutfitGenerationLogic } from "./outfit/useOutfitGenerator";

export const useOutfitGenerator = () => {
  // Get user style preferences and UI controls
  const {
    userStylePreference,
    recommendations,
    elegance,
    colorIntensity,
    hasQuizData,
    handleEleganceChange,
    handleColorIntensityChange,
  } = useOutfitPreferences();

  // Get UI state management
  const {
    isRefreshing,
    setIsRefreshing,
    outfitColors,
    setOutfitColors,
    selectedItems,
    selectedOccasion,
  } = useOutfitState();

  // Get outfit generation functionality
  const {
    dashboardItems,
    isLoading,
    error,
    refetch,
    handleTryDifferentLook
  } = useOutfitGenerationLogic(
    userStylePreference,
    elegance,
    colorIntensity,
    hasQuizData,
    setIsRefreshing,
    setOutfitColors
  );

  return {
    // User preferences
    userStylePreference,
    recommendations,
    elegance,
    colorIntensity,
    handleEleganceChange,
    handleColorIntensityChange,

    // UI state
    isRefreshing, 
    outfitColors,
    selectedItems,
    selectedOccasion,

    // Outfit generation
    dashboardItems,
    isLoading,
    error,
    refetch,
    handleTryDifferentLook,
    
    // Required for navigation and checks
    hasQuizData
  };
};
