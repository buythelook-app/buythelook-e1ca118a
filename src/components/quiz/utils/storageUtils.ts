import { QuizFormData } from '../types';

export const STORAGE_KEY = 'style-quiz-data';

export const saveQuizData = (data: QuizFormData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving quiz data:', error);
  }
};

export const loadQuizData = (): QuizFormData => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Error loading quiz data:', error);
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
    stylePreferences: []
  };
};