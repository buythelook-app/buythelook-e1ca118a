
/**
 * Functions for filtering and scoring style items
 */

import { MINIMALIST_CRITERIA } from "./minimalistFilters";

interface ExtractedText {
  name: string;
  description: string;
  color: string;
  type: string;
  materials: string[];
}

export const extractText = (item: any): ExtractedText => {
  if (!item) return { name: '', description: '', color: '', type: '', materials: [] };
  
  const name = (item.product_name || '').toLowerCase();
  const description = (item.description || '').toLowerCase();
  const color = (item.color || '').toLowerCase();
  const type = (item.type || item.category || '').toLowerCase();
  
  // Extract materials mentioned in the item
  const materialMatches = MINIMALIST_CRITERIA.preferredMaterials.filter(material => 
    description.includes(material) || name.includes(material)
  );
  
  return {
    name,
    description,
    color,
    type,
    materials: materialMatches
  };
};

export const hasNonMinimalistPattern = (item: any): boolean => {
  if (!item) return false;
  
  const text = extractText(item);
  
  return MINIMALIST_CRITERIA.nonMinimalistPatterns.some(pattern => 
    text.name.includes(pattern) || 
    text.description.includes(pattern)
  );
};

export const isUnderwear = (item: any): boolean => {
  if (!item) return false;
  
  const text = extractText(item);
  const underwearTerms = ['underwear', 'lingerie', 'bra', 'panties', 'briefs', 'boxer', 'thong', 'bikini', 'swimsuit'];
  
  return underwearTerms.some(term => 
    text.name.includes(term) || 
    text.description.includes(term) ||
    text.type.includes(term)
  );
};

export const scoreItem = (item: any, type: 'top' | 'bottom' | 'shoes' | 'accessories'): number => {
  if (!item) return 0;
  
  let score = 0;
  const text = extractText(item);
  
  // Score for natural colors
  if (MINIMALIST_CRITERIA.naturalColors.some(color => 
    text.name.includes(color) || 
    text.description.includes(color) ||
    text.color.includes(color))) {
    score += 15;
  }
  
  // Score for preferred colors based on item type
  if (type in MINIMALIST_CRITERIA.preferredColors) {
    const preferredColors = MINIMALIST_CRITERIA.preferredColors[type as keyof typeof MINIMALIST_CRITERIA.preferredColors];
    if (preferredColors.some(color => 
      text.name.includes(color) || 
      text.description.includes(color) ||
      text.color.includes(color))) {
      score += 25;
    }
  }
  
  // Penalty for non-minimalist patterns
  if (hasNonMinimalistPattern(item)) {
    score -= 50;
  }
  
  // Bonus for preferred materials
  text.materials.forEach(() => {
    score += 10;
  });
  
  // Penalty for avoidance terms
  MINIMALIST_CRITERIA.avoidanceTerms.forEach(term => {
    if (text.name.includes(term) || text.description.includes(term)) {
      score -= 15;
    }
  });
  
  // Bonus for preferred silhouettes
  if (type === 'top' && MINIMALIST_CRITERIA.silhouettes.top.some(silhouette => 
    text.description.includes(silhouette) || text.name.includes(silhouette))) {
    score += 15;
  } else if (type === 'bottom' && MINIMALIST_CRITERIA.silhouettes.bottom.some(silhouette => 
    text.description.includes(silhouette) || text.name.includes(silhouette))) {
    score += 15;
  }
  
  // Bonus for explicit minimalist mentions
  if (text.name.includes('minimalist') || text.description.includes('minimalist') ||
      text.name.includes('minimal') || text.description.includes('minimal')) {
    score += 25;
  }
  
  return score;
};

export const hasMinimalistColor = (item: any, preferredColors?: string[]): boolean => {
  if (!item) return false;
  
  const text = extractText(item);
  
  // Check against preferred colors if provided
  if (preferredColors && preferredColors.length > 0) {
    if (preferredColors.some(color => 
      text.name.includes(color) || 
      text.description.includes(color) ||
      text.color.includes(color))) {
      console.log(`Found preferred color in item: ${text.name}`);
      return true;
    }
  }
  
  // Check against natural colors
  return MINIMALIST_CRITERIA.naturalColors.some(color => 
    text.name.includes(color) || 
    text.description.includes(color) ||
    text.color.includes(color)
  );
};
