
export const mapItemType = (type: string): 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' => {
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

  const typeMap: Record<string, 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear'> = {
    'shirt': 'top',
    'blouse': 'top',
    't-shirt': 'top',
    'top': 'top',
    'corset top': 'top',
    'dress': 'dress',
    'heel shoe': 'shoes',
    'shoes': 'shoes',
    'sneakers': 'shoes',
    'boots': 'shoes',
    'slingback shoes': 'shoes',
    'necklace': 'accessory',
    'bracelet': 'accessory',
    'sunglasses': 'sunglasses',
    'jacket': 'outerwear',
    'coat': 'outerwear'
  };

  const mappedType = typeMap[lowerType];

  if (!mappedType) {
    console.warn(`No exact match found for type: ${lowerType}, defaulting to top`);
  }

  return mappedType || 'top';
};
