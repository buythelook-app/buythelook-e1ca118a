
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

export interface ExtendedStyleRecommendation {
  family: string;
  subfamily: string;
  colors: string[];
  style: string;
}

export interface StyleRecommendations {
  tops?: ExtendedStyleRecommendation[];
  bottoms?: ExtendedStyleRecommendation[];
  shoes?: ExtendedStyleRecommendation[];
  outerwear?: ExtendedStyleRecommendation[];
  accessories?: ExtendedStyleRecommendation[];
  // Legacy support
  top?: StyleRecommendation;
  bottom?: StyleRecommendation;
  accessory?: StyleRecommendation;
  sunglasses?: StyleRecommendation;
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
    bodyShape?: string; // Added bodyShape as an optional property
  };
  recommendations: StyleRecommendations;
}
