import { QuizFormData } from "@/components/quiz/types";

interface StyleAnalysis {
  analysis: {
    styleProfile: string;
    preferences: string[];
  };
}

export const analyzeStyleWithAI = (quizData: QuizFormData): StyleAnalysis => {
  // Simple analysis based on quiz data
  return {
    analysis: {
      styleProfile: quizData.stylePreferences?.[0] || "Classic",
      preferences: quizData.stylePreferences || []
    }
  };
};