
import { QuizFormData } from "@/components/quiz/types";

interface StyleAnalysis {
  analysis: {
    styleProfile: string;
    bodyShape: string;
    preferences: string[];
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
  
  return {
    analysis: {
      styleProfile: styleProfile,
      bodyShape: quizData.bodyShape || "hourglass",
      preferences: quizData.stylePreferences || []
    }
  };
};
