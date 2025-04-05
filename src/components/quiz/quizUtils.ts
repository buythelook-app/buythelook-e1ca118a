
import { QuizFormData } from './types';
import { StyleAnalysis } from './types/styleTypes';
import { colorPalettes } from './constants/colorPalettes';
import { styleRecommendations } from './constants/styleRecommendations';
import { supabase } from '@/lib/supabase';

export const loadQuizData = (): QuizFormData => {
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
};

export const saveQuizData = (data: QuizFormData): void => {
  localStorage.setItem('style-quiz-data', JSON.stringify(data));
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

export const analyzeStyleWithAI = async (formData: QuizFormData): Promise<StyleAnalysis> => {
  try {
    // Try to get authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    // Ensure weight is in kg for database storage and analysis
    let weightInKg = formData.weight;
    if (weightInKg && weightInKg !== "prefer_not_to_answer" && !isNaN(parseInt(weightInKg))) {
      // If weight is stored in pounds, convert to kg for database
      if (parseInt(weightInKg) > 500) {  // Rough heuristic to detect if weight is in pounds
        weightInKg = Math.round(parseInt(weightInKg) / 2.2).toString();
      }
    }

    // If user is authenticated, save to Supabase
    if (user) {
      const { error: upsertError } = await supabase
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
        // Continue with local analysis even if Supabase save fails
      }
    }

    // Proceed with style analysis regardless of authentication status
    const measurements = {
      height: parseFloat(formData.height) || 0,
      weight: weightInKg ? parseFloat(weightInKg) : 0,
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

    return analysis;
  } catch (error) {
    console.error('Style analysis error:', error);
    throw error;
  }
};

export const loadStoredQuizData = async (): Promise<QuizFormData | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('style_quiz_results')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      gender: data.gender || "",
      height: data.height || "",
      weight: data.weight || "",
      waist: data.waist || "",
      chest: data.chest || "",
      bodyShape: data.body_shape || "",
      photo: null,
      colorPreferences: data.color_preferences || [],
      stylePreferences: data.style_preferences || []
    };
  } catch (error) {
    console.error('Error loading quiz data:', error);
    return null;
  }
};
