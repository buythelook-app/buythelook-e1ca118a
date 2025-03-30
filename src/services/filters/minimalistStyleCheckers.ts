/**
 * Checkers for minimalist style criteria
 */

const NEUTRAL_COLORS = ["black", "white", "gray", "beige", "cream", "ivory", "navy", "taupe", "tan", "khaki", "camel", "brown"];
const MINIMALIST_MATERIALS = ["cotton", "linen", "silk", "wool", "cashmere", "leather"];

// Less restrictive top checks
export const isMinimalistTop = (item: any): boolean => {
  if (!item) return false;
  
  const name = (item.product_name || item.name || "").toLowerCase();
  const description = (item.description || "").toLowerCase();
  
  // Automatically allow certain minimalist items
  const minimalistKeywords = [
    "basic", "minimal", "simple", "classic", "plain", "oxford", 
    "button-down", "turtleneck", "crew neck", "v-neck", "mock neck",
    "cotton tee", "cashmere", "merino wool", "linen"
  ];
  
  for (const keyword of minimalistKeywords) {
    if (name.includes(keyword) || description.includes(keyword)) {
      return true;
    }
  }
  
  // Check for color neutrality
  const hasNeutralColor = NEUTRAL_COLORS.some(color => name.includes(color) || description.includes(color));
  
  // Check for minimalist materials
  const hasMinimalistMaterial = MINIMALIST_MATERIALS.some(material => 
    name.includes(material) || description.includes(material)
  );
  
  // Check for non-minimalist indicators
  const nonMinimalistPatterns = [
    "floral", "graphic", "print", "pattern", "logo", "embellish", 
    "sequin", "rhinestone", "bead", "embroidery", "distress", 
    "ripped", "ruffle", "frill", "puff", "animal print"
  ];
  
  const hasNonMinimalistPattern = nonMinimalistPatterns.some(pattern => 
    name.includes(pattern) || description.includes(pattern)
  );
  
  if (hasNonMinimalistPattern) {
    console.log(`Top rejected (pattern/embellishment): ${name}`);
    return false;
  }
  
  // Relaxed criteria: neutral color OR minimalist material is enough
  if (hasNeutralColor || hasMinimalistMaterial) {
    // Check for preferred colors in this item
    if (hasNeutralColor) {
      console.log(`Found preferred color in item: ${name}`);
    }
    return true;
  }
  
  console.log(`Top rejected (non-neutral color): ${name}`);
  return false;
};

// Less restrictive bottom checks
export const isMinimalistBottom = (item: any): boolean => {
  if (!item) return false;
  
  const name = (item.product_name || item.name || "").toLowerCase();
  const description = (item.description || "").toLowerCase();
  
  // Automatically allow certain minimalist styles
  const minimalistKeywords = [
    "tailored", "straight leg", "wide leg", "pencil", "classic", 
    "simple", "midi", "chino", "slim fit", "regular fit", "minimalist"
  ];
  
  for (const keyword of minimalistKeywords) {
    if (name.includes(keyword) || description.includes(keyword)) {
      return true;
    }
  }
  
  // Check for color neutrality
  const hasNeutralColor = NEUTRAL_COLORS.some(color => name.includes(color) || description.includes(color));
  
  // Check for minimalist materials
  const hasMinimalistMaterial = MINIMALIST_MATERIALS.some(material => 
    name.includes(material) || description.includes(material)
  );
  
  // Check for non-minimalist indicators
  const nonMinimalistPatterns = [
    "floral", "graphic", "print", "pattern", "embellish", "sequin", 
    "rhinestone", "bead", "embroidery", "distress", "ripped", 
    "ruffle", "frill", "animal print"
  ];
  
  const hasNonMinimalistPattern = nonMinimalistPatterns.some(pattern => 
    name.includes(pattern) || description.includes(pattern)
  );
  
  if (hasNonMinimalistPattern) {
    console.log(`Bottom rejected (pattern/embellishment): ${name}`);
    return false;
  }
  
  // Relaxed criteria: neutral color OR minimalist material is enough
  if (hasNeutralColor || hasMinimalistMaterial) {
    // Check for preferred colors in this item
    if (hasNeutralColor) {
      console.log(`Found preferred color in item: ${name}`);
    }
    return true;
  }
  
  console.log(`Bottom rejected (non-neutral color): ${name}`);
  return false;
};

// Less restrictive shoe checks
export const isMinimalistShoe = (item: any): boolean => {
  if (!item) return false;
  
  const name = (item.product_name || item.name || "").toLowerCase();
  const description = (item.description || "").toLowerCase();
  
  // Automatically allow certain minimalist styles
  const minimalistKeywords = [
    "loafer", "ballet flat", "pump", "chelsea boot", "oxford", "derby",
    "minimal", "simple", "classic", "leather", "suede", "plain"
  ];
  
  for (const keyword of minimalistKeywords) {
    if (name.includes(keyword) || description.includes(keyword)) {
      return true;
    }
  }
  
  // Check for color neutrality
  const hasNeutralColor = NEUTRAL_COLORS.some(color => name.includes(color) || description.includes(color));
  
  // Check for minimalist materials
  const hasMinimalistMaterial = MINIMALIST_MATERIALS.some(material => 
    name.includes(material) || description.includes(material)
  );
  
  // Check for non-minimalist indicators
  const nonMinimalistFeatures = [
    "platform", "embellish", "glitter", "rhinestone", "sequin", 
    "print", "pattern", "graphic", "logo", "animal print"
  ];
  
  const hasNonMinimalistFeature = nonMinimalistFeatures.some(feature => 
    name.includes(feature) || description.includes(feature)
  );
  
  if (hasNonMinimalistFeature) {
    console.log(`Shoes rejected (non-minimalist feature): ${name}`);
    return false;
  }
  
  // For shoes, we'll be even more relaxed
  if (hasNeutralColor) {
    console.log(`Found preferred color in item: ${name}`);
    console.log(`Shoes have priority color: ${name}`);
    console.log(`Shoes accepted (minimalist criteria): ${name}`);
    return true;
  }
  
  if (hasMinimalistMaterial) {
    console.log(`Shoes accepted due to minimalist material: ${name}`);
    return true;
  }
  
  console.log(`Shoes rejected (non-neutral color): ${name}`);
  return false;
};

// Add the missing function that routes to the appropriate checker based on item type
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
