
/**
 * Utilities for storing outfit data in localStorage
 */

/**
 * Interface for outfit colors
 */
export interface OutfitColors {
  top: string;
  bottom: string;
  shoes: string;
  coat?: string;
  [key: string]: string | undefined;
}

/**
 * Store outfit colors in localStorage
 */
export const storeOutfitColors = (colors: OutfitColors): void => {
  localStorage.setItem('outfit-colors', JSON.stringify(colors));
};

/**
 * Store style recommendations in localStorage
 */
export const storeStyleRecommendations = (recommendations: string[]): void => {
  localStorage.setItem('style-recommendations', JSON.stringify(recommendations));
};
