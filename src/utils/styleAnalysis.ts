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
  // Simple analysis based on quiz data
  // Map the style preferences from the quiz
  let styleProfile = quizData.stylePreferences?.[0] || "Classic";
  
  // Transform user's style choices to match our style naming conventions
  if (styleProfile === "Minimalist" || styleProfile === "Modern") {
    // Consolidate the minimalist and modern styles as they're similar
    styleProfile = "Minimalist";
  }
  
  // Determine color preference based on style and user color choices
  let colorPreference = "neutral";
  
  // If the user has selected Minimalist style, prioritize neutral colors
  if (styleProfile === "Minimalist") {
    colorPreference = "neutral";
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
  
  return {
    analysis: {
      styleProfile: styleProfile,
      bodyShape: quizData.bodyShape || "hourglass",
      preferences: quizData.stylePreferences || [],
      colorPreference: colorPreference
    }
  };
};
