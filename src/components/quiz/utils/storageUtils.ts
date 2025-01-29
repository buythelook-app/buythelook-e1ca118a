import { QuizFormData } from '../types';

export const STORAGE_KEY = 'style-quiz-data';

export const loadQuizData = (): QuizFormData => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
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

export const saveQuizData = (formData: QuizFormData) => {
  try {
    const dataToSave = {
      ...formData,
      photo: null
    };
    console.log("Saving quiz data:", dataToSave);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error("Error saving quiz data:", error);
  }
};