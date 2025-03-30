
/**
 * Checkers for minimalist style criteria
 */

import { MINIMALIST_CRITERIA } from "./minimalistFilters";

// More restrictive top checks with better pattern detection
export const isMinimalistTop = (item: any): boolean => {
  if (!item) return false;
  
  const name = (item.product_name || item.name || "").toLowerCase();
  const description = (item.description || "").toLowerCase();
  const text = name + " " + description;
  
  // Check for solid color preference first
  const hasSolidColorIndicator = text.includes("solid") || text.includes("plain") || 
    text.includes("basic") || text.includes("simple") || text.includes("monochrome");
  
  // Improved pattern rejection - this is more comprehensive than before
  const nonMinimalistPatterns = MINIMALIST_CRITERIA.nonMinimalistPatterns;
  const hasNonMinimalistPattern = nonMinimalistPatterns.some(pattern => text.includes(pattern));
  
  if (hasNonMinimalistPattern) {
    console.log(`Top rejected (pattern/embellishment): "${name}"`);
    return false;
  }
  
  // Check for specific keywords in the example images
  const minimalistKeywords = [
    "basic", "minimal", "simple", "classic", "plain", "solid", "oxford", 
    "button-down", "turtleneck", "crew neck", "v-neck", "mock neck",
    "cotton tee", "cashmere", "merino wool", "linen", "silk", "sleeveless",
    "tank", "camisole", "bodysuit", "tee", "t-shirt", "blouse"
  ];
  
  const hasMinimalistKeyword = minimalistKeywords.some(keyword => text.includes(keyword));
  
  // Check for neutral colors - prioritize these
  const neutralColors = MINIMALIST_CRITERIA.naturalColors;
  const hasNeutralColor = neutralColors.some(color => text.includes(color));
  
  // If it has solid color indicator and no patterns, high preference
  if (hasSolidColorIndicator && !hasNonMinimalistPattern) {
    console.log(`Top accepted (solid color indicator): "${name}"`);
    return true;
  }
  
  // If it has minimalist keyword and neutral color, also high preference
  if (hasMinimalistKeyword && hasNeutralColor) {
    console.log(`Top accepted (minimalist style + neutral color): "${name}"`);
    return true;
  }
  
  // If it has neutral color and no pattern, medium preference
  if (hasNeutralColor && !hasNonMinimalistPattern) {
    console.log(`Top accepted (neutral color, no pattern): "${name}"`);
    return true;
  }
  
  // If it just has minimalist keyword but not necessarily neutral color
  if (hasMinimalistKeyword && !hasNonMinimalistPattern) {
    console.log(`Top accepted (minimalist style): "${name}"`);
    return true;
  }
  
  console.log(`Top rejected (doesn't meet minimalist criteria): "${name}"`);
  return false;
};

// More restrictive bottom checks with better pattern detection
export const isMinimalistBottom = (item: any): boolean => {
  if (!item) return false;
  
  const name = (item.product_name || item.name || "").toLowerCase();
  const description = (item.description || "").toLowerCase();
  const text = name + " " + description;
  
  // Check for specific keywords in the example images
  const minimalistKeywords = [
    "tailored", "straight leg", "wide leg", "palazzo", "classic", 
    "simple", "midi", "maxi", "high-waisted", "flared", "wrap skirt",
    "linen", "cotton", "wool", "silk", "trousers", "pants", "slacks",
    "skirt", "culottes", "solid", "plain"
  ];
  
  const hasMinimalistKeyword = minimalistKeywords.some(keyword => text.includes(keyword));
  
  // Improved pattern rejection
  const nonMinimalistPatterns = MINIMALIST_CRITERIA.nonMinimalistPatterns;
  const hasNonMinimalistPattern = nonMinimalistPatterns.some(pattern => text.includes(pattern));
  
  if (hasNonMinimalistPattern) {
    console.log(`Bottom rejected (pattern/embellishment): "${name}"`);
    return false;
  }
  
  // Check for neutral colors
  const neutralColors = MINIMALIST_CRITERIA.naturalColors;
  const hasNeutralColor = neutralColors.some(color => text.includes(color));
  
  // Like in the images - brown, black, clean looks
  if (hasMinimalistKeyword && hasNeutralColor) {
    console.log(`Bottom accepted (minimalist style + neutral color): "${name}"`);
    return true;
  }
  
  if (hasNeutralColor && !hasNonMinimalistPattern) {
    console.log(`Bottom accepted (neutral color, no pattern): "${name}"`);
    return true;
  }
  
  if (hasMinimalistKeyword && !hasNonMinimalistPattern) {
    console.log(`Bottom accepted (minimalist style): "${name}"`);
    return true;
  }
  
  console.log(`Bottom rejected (doesn't meet minimalist criteria): "${name}"`);
  return false;
};

// More restrictive shoe checks with better pattern detection
export const isMinimalistShoe = (item: any): boolean => {
  if (!item) return false;
  
  const name = (item.product_name || item.name || "").toLowerCase();
  const description = (item.description || "").toLowerCase();
  const text = name + " " + description;
  
  // Like the flat sandals in the images
  const minimalistKeywords = [
    "loafer", "ballet flat", "flat", "sandal", "slide", "mule",
    "minimal", "simple", "classic", "leather", "suede", "plain",
    "oxford", "chelsea boot", "slip-on", "mary jane", "slingback"
  ];
  
  const hasMinimalistKeyword = minimalistKeywords.some(keyword => text.includes(keyword));
  
  // Improved pattern rejection
  const nonMinimalistPatterns = MINIMALIST_CRITERIA.nonMinimalistPatterns;
  const hasNonMinimalistPattern = nonMinimalistPatterns.some(pattern => text.includes(pattern));
  
  if (hasNonMinimalistPattern) {
    console.log(`Shoes rejected (pattern/embellishment): "${name}"`);
    return false;
  }
  
  // Check for specific non-minimalist features
  const nonMinimalistFeatures = [
    "platform", "embellish", "glitter", "rhinestone", "sequin", 
    "print", "pattern", "graphic", "logo", "chunky", "block heel", "stiletto"
  ];
  
  const hasNonMinimalistFeature = nonMinimalistFeatures.some(feature => text.includes(feature));
  
  if (hasNonMinimalistFeature) {
    console.log(`Shoes rejected (non-minimalist feature): "${name}"`);
    return false;
  }
  
  // Check for neutral colors
  const neutralColors = MINIMALIST_CRITERIA.naturalColors;
  const hasNeutralColor = neutralColors.some(color => text.includes(color));
  
  if (hasMinimalistKeyword && hasNeutralColor) {
    console.log(`Shoes accepted (minimalist style + neutral color): "${name}"`);
    return true;
  }
  
  if (hasNeutralColor && !hasNonMinimalistPattern) {
    console.log(`Shoes accepted (neutral color, no pattern): "${name}"`);
    return true;
  }
  
  if (hasMinimalistKeyword && !hasNonMinimalistPattern) {
    console.log(`Shoes accepted (minimalist style): "${name}"`);
    return true;
  }
  
  console.log(`Shoes rejected (doesn't meet minimalist criteria): "${name}"`);
  return false;
};

// Routing function to direct to the appropriate checker based on item type
export const isMinimalistStyleItem = (item: any, type: string): boolean => {
  if (type === 'top') {
    return isMinimalistTop(item);
  } else if (type === 'bottom') {
    return isMinimalistBottom(item);
  } else if (type === 'shoes') {
    return isMinimalistShoe(item);
  }
  return false;
};
