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
    case 11:
    case 12:
    case 13:
      return true; // Style comparison steps don't require validation
    default:
      return true;
  }
};

const colorPalettes = {
  dark: {
    primary: '#1A1F2C',
    secondary: '#403E43',
    accent: '#8B5CF6',
    neutral: '#8E9196'
  },
  light: {
    primary: '#FFFFFF',
    secondary: '#F6F6F7',
    accent: '#1EAEDB',
    neutral: '#C8C8C9'
  },
  neutral: {
    primary: '#8E9196',
    secondary: '#9F9EA1',
    accent: '#6E59A5',
    neutral: '#F1F0FB'
  }
};

const styleRecommendations = {
  Modern: {
    top: { type: "T-shirt", color: "black", style: "fitted" },
    bottom: { type: "Jeans", color: "dark blue", style: "slim" },
    shoes: { type: "Sneakers", color: "white", style: "minimalist" },
    accessory: { type: "Watch", color: "silver", style: "digital" },
    sunglasses: { type: "Wayfarer", color: "black", style: "modern" },
    outerwear: { type: "Bomber Jacket", color: "black", style: "sleek" }
  },
  Classy: {
    top: { type: "Blouse", color: "white", style: "elegant" },
    bottom: { type: "Trousers", color: "navy", style: "tailored" },
    shoes: { type: "Heels", color: "black", style: "classic" },
    accessory: { type: "Pearl Necklace", color: "white", style: "timeless" },
    sunglasses: { type: "Aviator", color: "gold", style: "classic" },
    outerwear: { type: "Blazer", color: "navy", style: "fitted" }
  },
  Nordic: {
    top: { type: "Sweater", color: "cream", style: "oversized" },
    bottom: { type: "Pants", color: "beige", style: "relaxed" },
    shoes: { type: "Boots", color: "brown", style: "minimal" },
    accessory: { type: "Scarf", color: "gray", style: "chunky" },
    sunglasses: { type: "Round", color: "tortoise", style: "vintage" },
    outerwear: { type: "Wool Coat", color: "camel", style: "structured" }
  },
  Sporty: {
    top: { type: "Athletic Shirt", color: "gray", style: "performance" },
    bottom: { type: "Leggings", color: "black", style: "compression" },
    shoes: { type: "Running Shoes", color: "multi", style: "athletic" },
    accessory: { type: "Sports Watch", color: "black", style: "digital" },
    sunglasses: { type: "Sport Wrap", color: "black", style: "performance" },
    outerwear: { type: "Track Jacket", color: "navy", style: "athletic" }
  },
  "Boo Hoo": {
    top: { type: "Crop Top", color: "pink", style: "trendy" },
    bottom: { type: "Mini Skirt", color: "black", style: "fitted" },
    shoes: { type: "Platform Boots", color: "black", style: "chunky" },
    accessory: { type: "Choker", color: "silver", style: "edgy" },
    sunglasses: { type: "Cat Eye", color: "black", style: "dramatic" },
    outerwear: { type: "Leather Jacket", color: "black", style: "cropped" }
  },
  Elegance: {
    top: { type: "Silk Blouse", color: "ivory", style: "flowing" },
    bottom: { type: "Pencil Skirt", color: "black", style: "fitted" },
    shoes: { type: "Pumps", color: "nude", style: "pointed" },
    accessory: { type: "Diamond Studs", color: "silver", style: "classic" },
    sunglasses: { type: "Oversized", color: "tortoise", style: "luxury" },
    outerwear: { type: "Trench Coat", color: "beige", style: "classic" }
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

    const finalStyle = formData.stylePreferences[formData.stylePreferences.length - 1];
    
    if (!finalStyle) {
      throw new Error('No style preference selected');
    }

    // Get color palette based on user preferences
    const colorPreference = formData.colorPreferences[0] || 'neutral';
    const selectedPalette = colorPalettes[colorPreference as keyof typeof colorPalettes];
    
    // Get style recommendations based on final style choice
    const styleRecs = styleRecommendations[finalStyle as keyof typeof styleRecommendations];

    if (!styleRecs) {
      throw new Error('Invalid style selection');
    }

    console.log('Generated local style analysis:', {
      styleProfile: finalStyle,
      colorPalette: selectedPalette,
      recommendations: styleRecs
    });

    return {
      recommendations: styleRecs,
      analysis: {
        styleProfile: finalStyle,
        colorPalette: selectedPalette,
        fitRecommendations: {
          top: measurements.chest > 100 ? "relaxed" : "regular",
          bottom: measurements.waist > 90 ? "comfort" : "fitted",
          shoes: "true to size"
        }
      }
    };

  } catch (error) {
    console.error('Style analysis error:', error);
    throw error;
  }
};
