import { QuizFormData } from "./types";

export const STORAGE_KEY = 'style-quiz-data';

export const loadQuizData = (): QuizFormData => {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    return { ...parsedData, photo: null };
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

export const saveQuizData = (formData: QuizFormData) => {
  const dataToSave = { ...formData };
  delete (dataToSave as any).photo;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
};

export const validateQuizStep = (step: number, formData: QuizFormData): boolean => {
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
      return true;
    case 7:
      return formData.colorPreferences.length > 0;
    case 8:
    case 9:
    case 10:
      return true;
    default:
      return true;
  }
};

export const analyzeStyleWithAI = async (formData: QuizFormData) => {
  // Format measurements as numbers
  const measurements = {
    height: parseFloat(formData.height) || 0,
    weight: parseFloat(formData.weight) || 0,
    waist: parseFloat(formData.waist) || 0,
    chest: parseFloat(formData.chest) || 0,
  };

  // Ensure we have at least one style preference
  const stylePreferences = formData.stylePreferences.length > 0 
    ? formData.stylePreferences 
    : ['casual']; // Default style if none selected

  // Ensure we have at least one color preference
  const colorPreferences = formData.colorPreferences.length > 0 
    ? formData.colorPreferences 
    : ['neutral']; // Default color if none selected

  const response = await fetch('https://preview--ai-bundle-construct-20.lovable.app/api/analyze-style', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bodyShape: formData.bodyShape || 'average',
      colorPreferences,
      stylePreferences,
      measurements,
      gender: formData.gender || 'neutral',
      preferences: {
        colors: colorPreferences,
        styles: stylePreferences,
      }
    }),
  });

  if (!response.ok) {
    console.error('API Response:', await response.text());
    throw new Error('Failed to analyze style');
  }

  return response.json();
};