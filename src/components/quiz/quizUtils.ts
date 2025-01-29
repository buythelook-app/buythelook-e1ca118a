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
  delete (dataToSave as any).photo; // Remove photo before saving as it can't be serialized
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
  const response = await fetch('https://preview--ai-bundle-construct-20.lovable.app/api/analyze-style', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bodyShape: formData.bodyShape,
      colorPreferences: formData.colorPreferences,
      stylePreferences: formData.stylePreferences,
      measurements: {
        height: formData.height,
        weight: formData.weight,
        waist: formData.waist,
        chest: formData.chest,
      }
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze style');
  }

  return response.json();
};