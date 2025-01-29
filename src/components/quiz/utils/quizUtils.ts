import { QuizFormData } from '../types';
import { StyleAnalysis } from '../types/styleTypes';
import { colorPalettes } from '../constants/colorPalettes';
import { styleRecommendations } from '../constants/styleRecommendations';

export const analyzeStyleWithAI = (formData: QuizFormData): StyleAnalysis => {
  try {
    console.log('Submitting form data:', formData);

    // Ensure we have default values
    const stylePreferences = formData.stylePreferences || ['Classic'];
    const colorPreferences = formData.colorPreferences || ['neutral'];
    
    // Get the last selected style or default to Classic
    const finalStyle = stylePreferences[stylePreferences.length - 1] || 'Classic';
    
    // Get the first color preference or default to neutral
    const colorPreference = colorPreferences[0] || 'neutral';
    
    // Get corresponding palette and recommendations
    const selectedPalette = colorPalettes[colorPreference] || colorPalettes.neutral;
    const styleRecs = styleRecommendations[finalStyle] || styleRecommendations.Classic;

    const analysis: StyleAnalysis = {
      analysis: {
        styleProfile: finalStyle,
        colorPalette: selectedPalette,
        fitRecommendations: {
          top: formData.chest ? (parseInt(formData.chest) > 100 ? "relaxed" : "regular") : "regular",
          bottom: formData.waist ? (parseInt(formData.waist) > 90 ? "comfort" : "fitted") : "regular",
          shoes: "true to size"
        }
      },
      recommendations: styleRecs
    };

    console.log('Generated local style analysis:', analysis);
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
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Error loading quiz data:', error);
  }
  
  // Return default values if no data is found or there's an error
  return {
    gender: "",
    height: "",
    weight: "",
    waist: "",
    chest: "",
    bodyShape: "",
    photo: null,
    colorPreferences: [],
    stylePreferences: []
  };
};