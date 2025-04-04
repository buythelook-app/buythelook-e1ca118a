
import { useState, useEffect } from "react";
import { mapStylePreference } from "@/components/quiz/constants/styleRecommendations";
import { storeStyleRecommendations } from "@/services/utils/outfitStorageUtils";
import { getRecommendationsForUserStyle } from "@/components/quiz/constants/styleRecommendations";

export const useOutfitPreferences = () => {
  const [userStylePreference, setUserStylePreference] = useState<string | null>(null);
  const [elegance, setElegance] = useState(75);
  const [colorIntensity, setColorIntensity] = useState(60);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [hasQuizData, setHasQuizData] = useState(false);
  
  // Load and apply user style preferences from quiz
  useEffect(() => {
    const styleData = localStorage.getItem('styleAnalysis');
    if (styleData) {
      try {
        const parsedData = JSON.parse(styleData);
        const styleProfile = parsedData?.analysis?.styleProfile || null;
        setUserStylePreference(styleProfile);
        setHasQuizData(true);
        console.log("Loaded user style preference:", styleProfile);
        
        // Apply user preferences to style sliders based on their quiz results
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
        
        // Pre-load style recommendations based on user profile
        if (styleProfile) {
          const userStyleRecs = getRecommendationsForUserStyle(styleProfile);
          if (userStyleRecs.essentials) {
            const essentialRecommendations = userStyleRecs.essentials.flatMap(
              category => [`${category.category.charAt(0).toUpperCase() + category.category.slice(1)} essentials:`, ...category.items.map(item => `- ${item}`)]
            );
            
            // Store these recommendations for initial display
            storeStyleRecommendations(essentialRecommendations);
            setRecommendations(essentialRecommendations);
          }
        }
      } catch (error) {
        console.error("Error parsing style data:", error);
      }
    }
  }, []);

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
  }, [hasQuizData]);

  const handleEleganceChange = (value: number[]) => {
    setElegance(value[0]);
  };

  const handleColorIntensityChange = (value: number[]) => {
    setColorIntensity(value[0]);
  };

  return {
    userStylePreference,
    recommendations,
    elegance,
    colorIntensity,
    hasQuizData,
    handleEleganceChange,
    handleColorIntensityChange,
  };
};
