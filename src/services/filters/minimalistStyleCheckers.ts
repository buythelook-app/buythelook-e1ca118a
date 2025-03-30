
/**
 * Functions to check if items match minimalist style criteria
 */

import { hasMinimalistColor, hasNonMinimalistPattern, extractText } from "./styleFilters";
import { MINIMALIST_CRITERIA } from "./minimalistFilters";

export const isMinimalistTop = (item: any): boolean => {
  if (!item) return false;
  
  const text = extractText(item);
  
  // Check for non-minimalist patterns
  if (hasNonMinimalistPattern(item)) {
    console.log(`Top rejected (pattern/embellishment): ${text.name}`);
    return false;
  }
  
  // Check for priority colors
  const hasPriorityColor = hasMinimalistColor(item, MINIMALIST_CRITERIA.preferredColors.top);
  if (hasPriorityColor) {
    console.log(`Top has priority color: ${text.name}`);
  } else {
    // Check for natural colors
    const hasNeutralColor = hasMinimalistColor(item);
    if (!hasNeutralColor) {
      console.log(`Top rejected (non-neutral color): ${text.name}`);
      return false;
    }
  }
  
  // Check for avoidance terms
  if (MINIMALIST_CRITERIA.avoidanceTerms.some(term => 
    text.name.includes(term) || text.description.includes(term))) {
    console.log(`Top rejected (non-minimalist term): ${text.name}`);
    return false;
  }
  
  // Check for acceptable top types
  const isAcceptableType = MINIMALIST_CRITERIA.acceptableTopTypes.some(type => 
    text.name.includes(type) || 
    text.description.includes(type) ||
    text.type.includes(type)
  );
  
  if (isAcceptableType) {
    console.log(`Top accepted (minimalist criteria): ${text.name}`);
    return true;
  }
  
  // Conditionally accept based on color
  if (hasPriorityColor && !hasNonMinimalistPattern(item)) {
    console.log(`Top conditionally accepted (natural color, no pattern): ${text.name}`);
    return true;
  }
  
  console.log(`Top rejected (doesn't match minimalist criteria): ${text.name}`);
  return false;
};

export const isMinimalistBottom = (item: any): boolean => {
  if (!item) return false;
  
  const text = extractText(item);
  
  // Check for non-minimalist patterns
  if (hasNonMinimalistPattern(item)) {
    console.log(`Bottom rejected (pattern/embellishment): ${text.name}`);
    return false;
  }
  
  // Check for priority colors
  const hasPriorityColor = hasMinimalistColor(item, MINIMALIST_CRITERIA.preferredColors.bottom);
  if (hasPriorityColor) {
    console.log(`Bottom has priority color: ${text.name}`);
  } else {
    // Check for natural colors
    const hasNeutralColor = hasMinimalistColor(item);
    if (!hasNeutralColor) {
      console.log(`Bottom rejected (non-neutral color): ${text.name}`);
      return false;
    }
  }
  
  // Check for avoidance terms
  if (MINIMALIST_CRITERIA.avoidanceTerms.some(term => 
    text.name.includes(term) || text.description.includes(term))) {
    console.log(`Bottom rejected (non-minimalist term): ${text.name}`);
    return false;
  }
  
  // Check for acceptable bottom types
  const isAcceptableType = MINIMALIST_CRITERIA.acceptableBottomTypes.some(type => 
    text.name.includes(type) || 
    text.description.includes(type) ||
    text.type.includes(type)
  );
  
  if (isAcceptableType) {
    console.log(`Bottom accepted (minimalist criteria): ${text.name}`);
    return true;
  }
  
  // Conditionally accept based on color
  if (hasPriorityColor && !hasNonMinimalistPattern(item)) {
    console.log(`Bottom conditionally accepted (natural color, no pattern): ${text.name}`);
    return true;
  }
  
  console.log(`Bottom rejected (doesn't match minimalist criteria): ${text.name}`);
  return false;
};

export const isMinimalistShoe = (item: any): boolean => {
  if (!item) return false;
  
  const text = extractText(item);
  
  const nonMinimalistShoeTerms = [
    'platform', 'chunky', 'high heel', 'stiletto', 'wedge', 
    'glitter', 'sequin', 'rhinestone', 'embellish', 'studded',
    'metallic', 'neon', 'bright', 'multi-color', 'spike', 'printed',
    'ornate', 'flashy', 'decorative', 'over-designed', 'colorful',
    'extreme', 'novelty', 'themed', 'costume', 'festival', 'party',
    'statement', 'flamboyant', 'gaudy', 'extravagant'
  ];
  
  // Check for non-minimalist features
  const hasNonMinimalistFeature = nonMinimalistShoeTerms.some(term => 
    text.name.includes(term) || 
    text.description.includes(term)
  );
  
  if (hasNonMinimalistFeature) {
    console.log(`Shoes rejected (non-minimalist feature): ${text.name}`);
    return false;
  }
  
  // Check for priority colors
  const hasPriorityColor = hasMinimalistColor(item, MINIMALIST_CRITERIA.preferredColors.shoes);
  if (hasPriorityColor) {
    console.log(`Shoes have priority color: ${text.name}`);
  } else {
    // Check for natural colors
    const hasNeutralColor = hasMinimalistColor(item);
    if (!hasNeutralColor) {
      console.log(`Shoes rejected (non-neutral color): ${text.name}`);
      return false;
    }
  }
  
  // Check for acceptable shoe types
  const isAcceptableType = MINIMALIST_CRITERIA.acceptableShoeTypes.some(type => 
    text.name.includes(type) || 
    text.description.includes(type)
  );
  
  if (isAcceptableType) {
    console.log(`Shoes accepted (minimalist criteria): ${text.name}`);
    return true;
  }
  
  // Conditionally accept based on color
  if (hasPriorityColor && !hasNonMinimalistPattern(item)) {
    console.log(`Shoes conditionally accepted (natural color, no pattern): ${text.name}`);
    return true;
  }
  
  console.log(`Shoes rejected (doesn't match minimalist criteria): ${text.name}`);
  return false;
};

export const isMinimalistStyleItem = (item: any, type: string): boolean => {
  if (!item) return false;
  
  switch (type.toLowerCase()) {
    case 'top':
      return isMinimalistTop(item);
    case 'bottom':
      return isMinimalistBottom(item);
    case 'shoes':
      return isMinimalistShoe(item);
    default:
      return hasMinimalistColor(item) && !hasNonMinimalistPattern(item);
  }
};
