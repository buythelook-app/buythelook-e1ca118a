import { QuizFormData } from '../types';
import { StyleAnalysis } from '../types/styleTypes';
import { colorPalettes } from '../constants/colorPalettes';
import { styleRecommendations } from '../constants/styleRecommendations';

export const analyzeStyleWithAI = (formData: QuizFormData): StyleAnalysis => {
  try {
    console.log('Analyzing style with form data:', formData);
    
    // Determine style profile based on preferences
    const styleProfile = formData.stylePreferences[formData.stylePreferences.length - 1] || 'Classic';
    
    // Get color palette based on preferences
    const colorPreference = formData.colorPreferences[0] || 'neutral';
    const selectedPalette = colorPalettes[colorPreference];
    
    // Get style recommendations
    const recommendations = styleRecommendations[styleProfile] || styleRecommendations.Classic;

    const analysis: StyleAnalysis = {
      analysis: {
        styleProfile: styleProfile,
        colorPalette: selectedPalette,
        fitRecommendations: {
          top: "regular",
          bottom: "regular",
          shoes: "true to size"
        }
      },
      recommendations: recommendations
    };

    console.log('Generated style analysis:', analysis);
    return analysis;
  } catch (error) {
    console.error('Error in analyzeStyleWithAI:', error);
    throw new Error('Failed to analyze style preferences');
  }
};

export const loadQuizData = (): QuizFormData => {
  try {
    const savedData = localStorage.getItem('style-quiz-data');
    if (savedData) {
      console.log("Loading saved quiz data:", savedData);
      const parsedData = JSON.parse(savedData);
      return {
        ...parsedData,
        photo: null
      };
    }
  } catch (error) {
    console.error("Error loading quiz data:", error);
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
};