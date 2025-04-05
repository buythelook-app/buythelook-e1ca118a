export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
}

export interface StyleRecommendation {
  type: string;
  color: string;
  style: string;
}

export interface StyleRecommendations {
  top: StyleRecommendation;
  bottom: StyleRecommendation;
  shoes: StyleRecommendation;
  accessory: StyleRecommendation;
  sunglasses: StyleRecommendation;
  outerwear: StyleRecommendation;
}

export interface FitRecommendations {
  top: string;
  bottom: string;
  shoes: string;
}

export interface StyleAnalysis {
  analysis: {
    styleProfile: string;
    colorPalette: ColorPalette;
    fitRecommendations: FitRecommendations;
  };
  recommendations: StyleRecommendations;
}