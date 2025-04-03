
/**
 * Validation utilities for outfit rendering
 */

interface OutfitItem {
  image?: string[];
  color?: string;
}

/**
 * Checks if any outfit item has valid images
 */
export const hasValidImages = (outfitData: any): boolean => {
  if (!outfitData) return false;
  
  const hasTopImage = outfitData.top && 
    typeof outfitData.top !== 'string' && 
    outfitData.top.image && 
    outfitData.top.image.length > 0;
  
  const hasBottomImage = outfitData.bottom && 
    typeof outfitData.bottom !== 'string' && 
    outfitData.bottom.image && 
    outfitData.bottom.image.length > 0;
  
  const hasShoesImage = outfitData.shoes && 
    typeof outfitData.shoes !== 'string' && 
    outfitData.shoes.image && 
    outfitData.shoes.image.length > 0;
  
  return hasTopImage || hasBottomImage || hasShoesImage;
};

