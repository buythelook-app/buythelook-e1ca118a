import { QuizFormData } from './types';
import { StyleAnalysis } from './types/styleTypes';
import { colorPalettes } from './constants/colorPalettes';
import { styleRecommendations } from './constants/styleRecommendations';
import { loadQuizData, saveQuizData, STORAGE_KEY } from './utils/storageUtils';

export { loadQuizData, saveQuizData, STORAGE_KEY };

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

export const analyzeStyleWithAI = async (formData: QuizFormData): Promise<StyleAnalysis> => {
  try {
    console.log('Submitting form data:', formData);

    const measurements = {
      height: parseFloat(formData.height) || 0,
      weight: parseFloat(formData.weight) || 0,
      waist: parseFloat(formData.waist) || 0,
      chest: parseFloat(formData.chest) || 0,
    };

    const finalStyle = formData.stylePreferences[formData.stylePreferences.length - 1] || 'Classy';
    const colorPreference = formData.colorPreferences[0] || 'neutral';
    const selectedPalette = colorPalettes[colorPreference];
    const styleRecs = styleRecommendations[finalStyle] || styleRecommendations.Classy;

    const analysis: StyleAnalysis = {
      analysis: {
        styleProfile: finalStyle,
        colorPalette: selectedPalette,
        fitRecommendations: {
          top: measurements.chest > 100 ? "relaxed" : "regular",
          bottom: measurements.waist > 90 ? "comfort" : "fitted",
          shoes: "true to size"
        }
      },
      recommendations: styleRecs
    };

    console.log('Generated local style analysis:', analysis);
    return analysis;

  } catch (error) {
    console.error('Style analysis error:', error);
    throw error;
  }
};