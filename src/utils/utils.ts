// Utility function to map product types to our type system
export const mapProductToType = (productType: string): 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' | 'cart' => {
  const lowerType = productType.toLowerCase();
  
  if (lowerType.includes('shoe') || lowerType.includes('sandal') || lowerType.includes('boot') || lowerType.includes('sneaker')) {
    return 'shoes';
  }
  if (lowerType.includes('dress') || lowerType.includes('jumpsuit')) {
    return 'dress';
  }
  if (lowerType.includes('pant') || lowerType.includes('jean') || lowerType.includes('trouser') || lowerType.includes('skirt') || lowerType.includes('short')) {
    return 'bottom';
  }
  if (lowerType.includes('jacket') || lowerType.includes('coat') || lowerType.includes('blazer')) {
    return 'outerwear';
  }
  if (lowerType.includes('glass') || lowerType.includes('sunglass')) {
    return 'sunglasses';
  }
  if (lowerType.includes('bag') || lowerType.includes('belt') || lowerType.includes('watch') || lowerType.includes('jewelry')) {
    return 'accessory';
  }
  
  // Default to top for shirts, blouses, tops, etc.
  return 'top';
};

// Other utility functions can be added here as needed
export const extractImageUrl = (image: string): string => {
  const parts = image.split(';');
  const urlPart = parts.find(part => part.startsWith('url:'));
  return urlPart ? urlPart.substring(4) : image;
};
