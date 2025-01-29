import { QuizFormData } from "./types";

export const STORAGE_KEY = 'style-quiz-data';

export const loadQuizData = (): QuizFormData => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      console.log("Loading saved quiz data:", savedData);
      const parsedData = JSON.parse(savedData);
      return {
        ...parsedData,
        photo: null // Photo can't be stored in localStorage
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
      photo: null // Remove photo before saving to localStorage
    };
    console.log("Saving quiz data:", dataToSave);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
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
      return true; // Style comparison steps don't require validation
    default:
      return true;
  }
};

export const analyzeStyleWithAI = async (formData: QuizFormData) => {
  try {
    const measurements = {
      height: parseFloat(formData.height) || 0,
      weight: parseFloat(formData.weight) || 0,
      waist: parseFloat(formData.waist) || 0,
      chest: parseFloat(formData.chest) || 0,
    };

    // Get the final preferred style (the last one selected)
    const finalStyle = formData.stylePreferences[formData.stylePreferences.length - 1] || 'casual';

    const requestData = {
      bodyShape: formData.bodyShape || 'average',
      colorPreferences: formData.colorPreferences.length > 0 ? formData.colorPreferences : ['neutral'],
      stylePreferences: [finalStyle], // Send only the final preferred style
      measurements,
      gender: formData.gender || 'neutral',
    };

    console.log('Sending request to AI:', requestData);

    const response = await fetch('https://preview--ai-bundle-construct-20.lovable.app/api/analyze-style', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to analyze style: ${errorText}`);
    }

    const data = await response.json();
    console.log('AI Response:', data);
    return data;
  } catch (error) {
    console.error('Style analysis error:', error);
    throw error;
  }
};