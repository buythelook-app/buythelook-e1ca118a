
import { QuizFormData } from "@/components/quiz/types";

interface StyleAnalysis {
  analysis: {
    styleProfile: string;
    bodyShape: string;
    preferences: string[];
    colorPreference?: string;
  };
}

export const analyzeStyleWithAI = (quizData: QuizFormData): StyleAnalysis => {
  console.log("Analyzing style with AI", quizData);
  // Simple analysis based on quiz data
  // Map the style preferences from the quiz
  let styleProfile = quizData.stylePreferences?.[0] || "Classic";
  
  // Transform user's style choices to match our style naming conventions
  if (styleProfile === "Minimalist" || styleProfile === "Modern" || styleProfile === "Nordic" || styleProfile === "Minimal") {
    // Consolidate the minimalist and modern styles as they're similar
    styleProfile = "Minimalist";
  }
  
  // Determine color preference based on style and user color choices
  let colorPreference = "neutral";
  
  // If the user has selected Minimalist style, prioritize neutral colors
  if (styleProfile === "Minimalist") {
    colorPreference = "neutral";
    
    try {
      // Store minimalist style recommendations
      const recommendations = [
        "Focus on quality over quantity with timeless pieces",
        "Opt for clean lines and simple silhouettes",
        "Stick to a neutral color palette with occasional subtle accent colors",
        "Choose natural fabrics like cotton, linen, and wool",
        "Look for functional details and avoid excessive embellishments"
      ];
      
      localStorage.setItem('style-recommendations', JSON.stringify(recommendations));
      
      // Store a minimalist color palette
      const outfitColors = {
        top: "#FFFFFF",
        bottom: "#333333",
        shoes: "#000000",
        accessories: "#CCCCCC"
      };
      
      localStorage.setItem('outfit-colors', JSON.stringify(outfitColors));
      console.log("Stored style recommendations and color palette");
    } catch (error) {
      console.error("Error storing data in localStorage:", error);
    }
  } 
  // Otherwise use their color preferences if available
  else if (quizData.colorPreferences && quizData.colorPreferences.length > 0) {
    if (quizData.colorPreferences.includes("neutral")) {
      colorPreference = "neutral";
    } else if (quizData.colorPreferences.includes("warm")) {
      colorPreference = "warm";
    } else if (quizData.colorPreferences.includes("cool")) {
      colorPreference = "cool";
    }
  }
  
  // Make minimalist more consistent in naming for API
  if (styleProfile === "Minimalist") {
    console.log("Setting user style profile to Minimalist");
  }
  
  const result = {
    analysis: {
      styleProfile: styleProfile,
      bodyShape: quizData.bodyShape || "hourglass",
      preferences: quizData.stylePreferences || [],
      colorPreference: colorPreference
    }
  };
  
  console.log("Style analysis result:", result);
  return result;
};
