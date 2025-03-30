
/**
 * Filter functions for outfit style rules
 */

export const isUnderwear = (item: any): boolean => {
  if (!item) return false;
  
  const name = (item.product_name || item.name || "").toLowerCase();
  const description = (item.description || "").toLowerCase();
  
  const underwearTerms = [
    "underwear", "bra", "panty", "panties", "boxer", "brief", 
    "thong", "lingerie", "swimwear", "swimsuit", "bikini", "trunk"
  ];
  
  return underwearTerms.some(term => name.includes(term) || description.includes(term));
};

export const scoreItem = (item: any, type: string): number => {
  if (!item) return 0;
  
  const name = (item.product_name || item.name || "").toLowerCase();
  const description = (item.description || "").toLowerCase();
  
  let score = 50; // Base score
  
  // Neutral colors increase score
  const neutralColors = ["black", "white", "gray", "beige", "cream", "ivory", "navy", "taupe", "tan", "khaki", "camel", "brown"];
  neutralColors.forEach(color => {
    if (name.includes(color) || description.includes(color)) {
      score += 10;
    }
  });
  
  // Quality materials increase score
  const qualityMaterials = ["cotton", "linen", "silk", "wool", "cashmere", "leather"];
  qualityMaterials.forEach(material => {
    if (name.includes(material) || description.includes(material)) {
      score += 8;
    }
  });
  
  // Minimalist terms increase score
  const minimalistTerms = ["minimal", "simple", "classic", "basic", "clean", "essential"];
  minimalistTerms.forEach(term => {
    if (name.includes(term) || description.includes(term)) {
      score += 15;
    }
  });
  
  // Non-minimalist features decrease score
  const nonMinimalistFeatures = [
    "floral", "graphic", "print", "pattern", "logo", "embellish", 
    "sequin", "rhinestone", "bead", "embroidery", "distress", 
    "ripped", "ruffle", "frill"
  ];
  
  nonMinimalistFeatures.forEach(feature => {
    if (name.includes(feature) || description.includes(feature)) {
      score -= 20;
    }
  });
  
  // Specific item type bonuses
  if (type === 'top') {
    const topStyles = ["button-down", "turtleneck", "crew neck", "v-neck"];
    topStyles.forEach(style => {
      if (name.includes(style) || description.includes(style)) {
        score += 10;
      }
    });
  } else if (type === 'bottom') {
    const bottomStyles = ["tailored", "straight leg", "wide leg", "pencil"];
    bottomStyles.forEach(style => {
      if (name.includes(style) || description.includes(style)) {
        score += 10;
      }
    });
  } else if (type === 'shoes') {
    const shoeStyles = ["loafer", "ballet flat", "pump", "chelsea boot", "oxford"];
    shoeStyles.forEach(style => {
      if (name.includes(style) || description.includes(style)) {
        score += 10;
      }
    });
  }
  
  return score;
};

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

const isMinimalistTop = (item: any): boolean => {
  if (!item) return false;
  
  const name = (item.product_name || item.name || "").toLowerCase();
  const description = (item.description || "").toLowerCase();
  
  // Check for inherently minimalist items
  const minimalistItems = [
    "white button", "oxford shirt", "cotton shirt", "basic tee", 
    "plain t-shirt", "turtleneck", "crew neck", "v-neck", 
    "cashmere", "silk blouse", "linen shirt"
  ];
  
  for (const itemType of minimalistItems) {
    if (name.includes(itemType) || description.includes(itemType)) {
      return true;
    }
  }
  
  // Calculate score and use threshold
  const score = scoreItem(item, 'top');
  return score >= 60; // Higher threshold for confidence
};

const isMinimalistBottom = (item: any): boolean => {
  if (!item) return false;
  
  const name = (item.product_name || item.name || "").toLowerCase();
  const description = (item.description || "").toLowerCase();
  
  // Check for inherently minimalist items
  const minimalistItems = [
    "tailored", "straight leg", "wide leg", "pencil skirt", 
    "midi skirt", "chino", "cotton pants", "linen trousers"
  ];
  
  for (const itemType of minimalistItems) {
    if (name.includes(itemType) || description.includes(itemType)) {
      return true;
    }
  }
  
  // Calculate score and use threshold
  const score = scoreItem(item, 'bottom');
  return score >= 55; // Slightly lower threshold
};

const isMinimalistShoe = (item: any): boolean => {
  if (!item) return false;
  
  const name = (item.product_name || item.name || "").toLowerCase();
  const description = (item.description || "").toLowerCase();
  
  // Check for inherently minimalist items
  const minimalistItems = [
    "loafer", "ballet flat", "oxford", "chelsea boot", "derby", 
    "leather boot", "minimal sneaker", "simple pump", "mule"
  ];
  
  for (const itemType of minimalistItems) {
    if (name.includes(itemType) || description.includes(itemType)) {
      return true;
    }
  }
  
  // Calculate score and use threshold
  const score = scoreItem(item, 'shoes');
  return score >= 50; // Lower threshold for shoes
};
