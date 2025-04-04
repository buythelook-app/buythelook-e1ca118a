
export function mapItemType(type: string): string {
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
      return 'coat';
    default:
      return 'accessory';
  }
}
