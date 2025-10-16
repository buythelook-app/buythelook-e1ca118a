
import { supabase } from "@/integrations/supabase/client";
import { QuizFormData } from "./types";

// Simple local storage fallback since we're having DB issues
export const saveQuizResults = async (quizData: QuizFormData, userId?: string) => {
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
export const generateStyleAnalysis = (quizData: QuizFormData) => {
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

// Export functions needed by QuizContext
export const loadQuizData = () => {
  try {
    const savedData = localStorage.getItem('style-quiz-data');
    if (savedData) {
      return JSON.parse(savedData);
    }
    return {
      gender: "",
      height: "",
      weight: "",
      waist: "",
      chest: "",
      bodyShape: "",
      photo: null,
      colorPreferences: [],
      stylePreferences: [],
    };
  } catch (error) {
    console.error("Error loading quiz data:", error);
    return {
      gender: "",
      height: "",
      weight: "",
      waist: "",
      chest: "",
      bodyShape: "",
      photo: null,
      colorPreferences: [],
      stylePreferences: [],
    };
  }
};

export const saveQuizData = (data: QuizFormData) => {
  try {
    localStorage.setItem('style-quiz-data', JSON.stringify(data));
  } catch (error) {
    console.error("Error saving quiz data:", error);
  }
};

export const validateQuizStep = (step: number, formData: QuizFormData): boolean => {
  console.log("Validating step", step, "with data:", formData);
  switch (step) {
    case 1:
      return formData.gender !== "";
    case 2:
      return formData.height !== "";
    case 3:
      return formData.weight !== "";
    case 4:
      return formData.waist !== "" && formData.chest !== "";
    case 5:
      return formData.bodyShape !== "";
    case 6:
      return true; // Photo is optional
    case 7:
      return formData.colorPreferences.length > 0;
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
    case 13:
      return true; // Style comparison steps don't require validation
    default:
      return true;
  }
};

export const analyzeStyleWithAI = async (formData: QuizFormData) => {
  try {
    // Try to get authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    // Convert weight to kg for analysis if it's a number
    let weightInKg = formData.weight;
    if (weightInKg && weightInKg !== "prefer_not_to_answer" && !isNaN(parseInt(weightInKg))) {
      // Convert pounds to kg
      weightInKg = Math.round(parseInt(weightInKg) / 2.2).toString();
    }

    // If user is authenticated, try to save to Supabase
    if (user) {
      try {
        const { error: upsertError } = await (supabase as any)
          .from('style_quiz_results')
          .upsert({
            user_id: user.id,
            gender: formData.gender,
            height: formData.height,
            weight: weightInKg,
            waist: formData.waist,
            chest: formData.chest,
            body_shape: formData.bodyShape,
            photo_url: null,
            color_preferences: formData.colorPreferences,
            style_preferences: formData.stylePreferences,
            updated_at: new Date().toISOString()
          });

        if (upsertError) {
          console.error('Error saving to Supabase:', upsertError);
        }
      } catch (saveError) {
        console.error('Error saving quiz results:', saveError);
      }
    }

    // Generate style analysis
    const measurements = {
      height: parseFloat(formData.height) || 0,
      weight: weightInKg ? parseFloat(weightInKg) : 0,
      waist: parseFloat(formData.waist) || 0,
      chest: parseFloat(formData.chest) || 0,
    };

    const finalStyle = formData.stylePreferences[formData.stylePreferences.length - 1] || 'Classy';
    
    const analysis = {
      analysis: {
        styleProfile: finalStyle,
        colorPalette: formData.colorPreferences || ['neutral'],
        fitRecommendations: {
          top: measurements.chest > 100 ? "relaxed" : "regular",
          bottom: measurements.waist > 90 ? "comfort" : "fitted",
          shoes: "true to size"
        },
        bodyShape: formData.bodyShape || 'H'
      },
      recommendations: [
        `Your ${finalStyle} style preference creates elegant outfits`,
        `Perfect fit recommendations based on your measurements`,
        'Mix and match pieces for versatile looks'
      ]
    };

    return analysis;
  } catch (error) {
    console.error('Style analysis error:', error);
    throw error;
  }
};
