
import { supabase } from "@/lib/supabaseClient";
import { QuizData } from "./types";

// Simple local storage fallback since we're having DB issues
export const saveQuizResults = async (quizData: QuizData, userId?: string) => {
  try {
    // Save to localStorage as fallback
    localStorage.setItem('quiz-results', JSON.stringify({
      ...quizData,
      userId,
      timestamp: new Date().toISOString()
    }));
    
    console.log("Quiz results saved to localStorage");
    return true;
  } catch (error) {
    console.error("Error saving quiz results:", error);
    return false;
  }
};

export const getQuizResults = async (userId?: string) => {
  try {
    // Try to get from localStorage first
    const localData = localStorage.getItem('quiz-results');
    if (localData) {
      return JSON.parse(localData);
    }
    
    return null;
  } catch (error) {
    console.error("Error getting quiz results:", error);
    return null;
  }
};

// Generate style analysis based on quiz responses
export const generateStyleAnalysis = (quizData: QuizData) => {
  // Simple analysis logic
  const { bodyShape, colorPreferences, stylePreferences, gender } = quizData;
  
  let styleProfile = 'classic';
  if (stylePreferences?.includes('bohemian') || stylePreferences?.includes('artistic')) {
    styleProfile = 'boho';
  } else if (stylePreferences?.includes('modern') || stylePreferences?.includes('minimalist')) {
    styleProfile = 'minimalist';
  } else if (stylePreferences?.includes('romantic') || stylePreferences?.includes('feminine')) {
    styleProfile = 'romantic';
  } else if (stylePreferences?.includes('casual') || stylePreferences?.includes('sporty')) {
    styleProfile = 'casual';
  }
  
  const analysis = {
    bodyShape: bodyShape || 'H',
    styleProfile,
    colorPalette: colorPreferences || ['neutral'],
    recommendations: [
      `Based on your ${bodyShape} body shape, we recommend...`,
      `Your ${styleProfile} style preference suggests...`,
      'Consider incorporating versatile pieces that can be mixed and matched.'
    ]
  };
  
  return {
    analysis,
    confidence: 85,
    completedAt: new Date().toISOString()
  };
};
