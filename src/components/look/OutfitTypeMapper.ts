
import { ItemType } from "@/types/canvasTypes";

export function mapItemType(type: string): ItemType {
  switch (type.toLowerCase()) {
    case 'top':
    case 'shirt':
    case 'blouse':
    case 't-shirt':
      return 'top';
    case 'bottom':
    case 'pants':
    case 'skirt':
    case 'shorts':
      return 'bottom';
    case 'shoes':
    case 'footwear':
    case 'sneakers':
    case 'boots':
      return 'shoes';
    case 'coat':
    case 'jacket':
    case 'outerwear':
      return 'outerwear';
    case 'dress':
      return 'dress';
    case 'sunglasses':
      return 'sunglasses';
    case 'accessory':
    case 'necklace':
    case 'bracelet':
      return 'accessory';
    default:
      console.warn(`Unknown item type: ${type}, defaulting to accessory`);
      return 'accessory';
  }
}
