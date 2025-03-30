
export interface StyleItem {
  type: string;
  color: string;
  style: string;
}

export interface StyleRecommendations {
  top: StyleItem;
  bottom: StyleItem;
  shoes: StyleItem;
  accessory: StyleItem;
  sunglasses: StyleItem;
  outerwear: StyleItem;
  essentials?: Array<{
    category: string;
    items: string[];
  }>;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
}

export interface StyleAnalysis {
  analysis: {
    styleProfile: string;
    colorPalette: ColorPalette;
    fitRecommendations: {
      top: string;
      bottom: string;
      shoes: string;
    };
  };
  recommendations: StyleRecommendations;
}
