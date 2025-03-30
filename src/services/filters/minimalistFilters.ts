
/**
 * Filters and criteria for minimalist style items
 */

import { MinimalistCriteria } from "@/types/lookTypes";

export const MINIMALIST_CRITERIA: MinimalistCriteria = {
  naturalColors: [
    'black', 'white', 'grey', 'gray', 'beige', 'cream', 'ivory', 'tan', 
    'camel', 'navy', 'olive', 'brown', 'khaki', 'taupe', 'nude', 'charcoal',
    'stone', 'sand', 'oatmeal', 'neutral', 'off-white', 'ecru', 'bone',
    'ash', 'slate', 'pewter', 'greige', 'putty', 'chalk', 'champagne',
    'alabaster', 'eggshell', 'flax', 'vanilla'
  ],
  nonMinimalistPatterns: [
    'floral', 'animal', 'graphic', 'print', 'logo', 'pattern', 'plaid', 'check',
    'stripe', 'polka', 'dot', 'sequin', 'glitter', 'embellish', 'embroidery',
    'neon', 'vibrant', 'bright', 'multi-color', 'colorful', 'paisley', 'abstract',
    'chevron', 'argyle', 'zig-zag', 'ikat', 'ornate', 'baroque', 'metallics',
    'tropical', 'hawaiian', 'cartoon', 'tie-dye', 'camo', 'camouflage', 'leopard',
    'zebra', 'snakeskin', 'crocodile', 'glittery', 'sparkling', 'rhinestone',
    'appliqué', 'beaded', 'ruffled', 'fringe', 'tassels'
  ],
  acceptableTopTypes: [
    't-shirt', 'tee', 'shirt', 'blouse', 'sweater', 'pullover', 'tunic',
    'turtleneck', 'mock neck', 'tank', 'camisole', 'button-up', 'button-down',
    'oxford', 'henley', 'v-neck', 'crewneck', 'cotton shirt', 'cashmere',
    'merino', 'silk', 'linen', 'jersey', 'ribbed', 'basic', 'simple',
    'fitted', 'loose', 'oversized', 'boxy', 'crop', 'longline', 'classic',
    'essential', 'sleeveless', 'short sleeve', 'long sleeve', 'three-quarter sleeve',
    'boat neck', 'scoop neck', 'bodysuit', 'knit', 'cardigan'
  ],
  acceptableBottomTypes: [
    'pant', 'trouser', 'jean', 'denim', 'chino', 'skirt', 'short',
    'straight leg', 'wide leg', 'tailored', 'cigarette', 'high waist',
    'linen', 'cotton', 'wool', 'culotte', 'palazzo', 'slim', 'relaxed',
    'tapered', 'pleated', 'flat front', 'pencil', 'a-line', 'midi',
    'maxi', 'mini', 'ankle', 'cropped', 'full length', 'classic', 'basic',
    'essential', 'simple', 'clean', 'minimal', 'tailored', 'elegant'
  ],
  acceptableShoeTypes: [
    'loafer', 'oxford', 'flat', 'mule', 'slide', 'ballet', 'pump',
    'leather', 'minimal', 'simple', 'clean', 'sneaker', 'derby', 'sandal',
    'ankle boot', 'chelsea boot', 'court', 'slingback', 'mary jane',
    'block heel', 'kitten heel', 'low heel', 'penny loafer', 'slip-on',
    'monk strap', 'desert boot', 'brogue', 'espadrille', 'moccasin',
    'minimal sneaker', 'leather sneaker', 'classic', 'basic', 'timeless',
    'clean-line', 'structured', 'unadorned', 'suede', 'nubuck'
  ],
  preferredColors: {
    top: [
      'white', 'cream', 'beige', 'ivory', 'oatmeal', 'sand', 'off-white', 
      'ecru', 'grey', 'gray', 'light gray', 'bone', 'eggshell', 'alabaster',
      'chalk', 'vanilla', 'flax', 'stone', 'greige', 'champagne'
    ],
    bottom: [
      'black', 'navy', 'charcoal', 'grey', 'gray', 'tan', 'taupe', 'khaki', 
      'olive', 'brown', 'dark brown', 'camel', 'slate', 'ash', 'pewter',
      'dark blue', 'midnight', 'indigo', 'deep navy', 'espresso'
    ],
    shoes: [
      'black', 'brown', 'tan', 'white', 'beige', 'nude', 'camel', 'taupe',
      'navy', 'charcoal', 'gray', 'cognac', 'sand', 'stone', 'dark brown',
      'light brown', 'cream', 'natural'
    ],
    accessories: [
      'black', 'brown', 'tan', 'white', 'silver', 'gold', 'bronze', 'copper',
      'rose gold', 'natural', 'navy', 'nude', 'stone', 'tortoise'
    ]
  },
  colorPalette: {
    neutrals: [
      '#000000', '#FFFFFF', '#222222', '#333333', '#444444', '#555555', 
      '#666666', '#777777', '#888888', '#999999', '#AAAAAA', '#F5F5F5',
      '#F8F8F8', '#F1F1F1', '#EEEEEE', '#E5E5E5', '#D9D9D9', '#CCCCCC'
    ],
    accent: [
      '#CAAC90', '#D4C8BE', '#B0A99F', '#A69F96', '#9B8E89', '#8C857E',
      '#7D7975', '#6F6E6C', '#475657', '#2B3A42'
    ],
    monochrome: [
      '#000000', '#111111', '#222222', '#333333', '#444444', '#555555',
      '#666666', '#777777', '#888888', '#999999', '#AAAAAA', '#BBBBBB',
      '#CCCCCC', '#DDDDDD', '#EEEEEE', '#FFFFFF'
    ]
  },
  avoidanceTerms: [
    'trendy', 'fashion-forward', 'statement', 'bold', 'loud', 'flashy',
    'busy', 'ornate', 'decorative', 'elaborate', 'fussy', 'complex',
    'over-designed', 'maximalist', 'novelty', 'themed', 'seasonal',
    'festive', 'holiday', 'party', 'costume', 'extravagant', 'showy',
    'ostentatious', 'flamboyant', 'gaudy', 'garish', 'tacky'
  ],
  preferredMaterials: [
    'cotton', 'wool', 'linen', 'silk', 'cashmere', 'leather', 'denim',
    'canvas', 'jersey', 'twill', 'merino', 'modal', 'lyocell', 'tencel',
    'organic', 'natural', 'breathable', 'sustainable', 'recycled'
  ],
  silhouettes: {
    top: [
      'fitted', 'relaxed', 'loose', 'oversized', 'boxy', 'straight', 
      'clean-line', 'simple', 'tailored', 'structured'
    ],
    bottom: [
      'straight-leg', 'slim', 'tapered', 'wide-leg', 'relaxed', 'high-waist',
      'mid-rise', 'a-line', 'pencil', 'midi', 'maxi'
    ],
    dress: [
      'shift', 'sheath', 'wrap', 'slip', 'shirt dress', 'a-line', 'straight', 
      'column', 'simple', 'minimal', 'clean-line'
    ]
  }
};
