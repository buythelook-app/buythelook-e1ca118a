
import { ItemType } from "@/types/canvasTypes";

export const mapItemType = (type: string): ItemType => {
  if (!type) {
    console.warn('Empty type received in mapItemType');
    return 'top';
  }

  const lowerType = type.toLowerCase().trim().replace(/\s+/g, ' ');

  // Filter out underwear items
  const underwearTerms = ['underwear', 'lingerie', 'bra', 'panties', 'briefs', 'boxer', 'thong'];
  for (const term of underwearTerms) {
    if (lowerType.includes(term)) {
      console.log(`Detected underwear term: ${term} in type: ${lowerType}, skipping`);
      return 'top';
    }
  }

  // Check for bottom keywords
  const bottomKeywords = ['pants', 'skirt', 'shorts', 'jeans', 'trousers', 'bottom'];
  for (const keyword of bottomKeywords) {
    if (lowerType.includes(keyword)) {
      return 'bottom';
    }
  }

  // Type mapping with proper ItemType return
  if (lowerType.includes('shirt') || lowerType.includes('blouse') || lowerType.includes('top')) {
    return 'top';
  } else if (lowerType.includes('dress')) {
    return 'dress';
  } else if (lowerType.includes('shoe') || lowerType.includes('sneaker') || lowerType.includes('boot')) {
    return 'shoes';
  } else if (lowerType.includes('sunglasses')) {
    return 'sunglasses';
  } else if (lowerType.includes('jacket') || lowerType.includes('coat') || lowerType.includes('outerwear')) {
    return 'outerwear';
  } else if (lowerType.includes('necklace') || lowerType.includes('bracelet') || lowerType.includes('jewelry')) {
    return 'accessory';
  }

  console.warn(`No exact match found for type: ${lowerType}, defaulting to top`);
  return 'top';
};
