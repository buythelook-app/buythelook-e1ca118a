
import { QuizFormData } from '../types';

export const STORAGE_KEY = 'style-quiz-data';

export const saveQuizData = (data: QuizFormData): void => {
  // No storage - data only exists in memory
  console.log('Quiz data saved to memory');
};

export const loadQuizData = (): QuizFormData => {
  // Return default empty form data
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
