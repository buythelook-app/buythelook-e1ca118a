
import { Category, Mode } from "./StyleFilterButton";

// Define work-appropriate clothing categories
export const WORK_APPROPRIATE_CATEGORIES = [
  'blazers',
  'blouses', 
  'dress_shirts',
  'button_down',
  'collar_shirt',
  'formal_shirt',
  'business_shirt',
  'formal_trousers',
  'midi_skirts',
  'long_skirts',
  'pencil_skirts',
  'formal_dresses',
  'cardigans',
  'sweaters',
  'turtleneck',
  'formal_shoes',
  'loafers',
  'oxford_shoes'
];

// Define inappropriate items for work
export const WORK_INAPPROPRIATE_ITEMS = [
  'crop_tops',
  'tank_tops',
  'tube_tops',
  'camisole',
  'spaghetti_strap',
  'halter_top',
  'off_shoulder',
  'mini_skirts',
  'short_shorts',
  'revealing_dresses',
  'deep_v_neck',
  'plunging_neckline',
  'backless_tops',
  'cut_out',
  'sheer_clothing',
  'transparent',
  'see_through',
  'mesh',
  'lace_top',
  'swimwear',
  'lingerie',
  'flip_flops',
  'athletic_wear',
  'sports_bra',
  'sleeveless'
];

// Function to filter work-appropriate items
export const filterWorkAppropriateItems = (items: any[]) => {
  return items.filter(item => {
    // Special strict filtering for tops in work environment
    if (isTopItem(item)) {
      return checkWorkAppropriateTop(item);
    }
    
    // Check if item category is work appropriate
    const isAppropriate = WORK_APPROPRIATE_CATEGORIES.some(category => 
      item.category?.toLowerCase().includes(category.toLowerCase()) ||
      item.product_family?.toLowerCase().includes(category.toLowerCase()) ||
      item.product_name?.toLowerCase().includes(category.toLowerCase())
    );
    
    // Check if item is specifically inappropriate
    const isInappropriate = WORK_INAPPROPRIATE_ITEMS.some(inappropriate => 
      item.product_name?.toLowerCase().includes(inappropriate.toLowerCase()) ||
      item.description?.toLowerCase().includes(inappropriate.toLowerCase()) ||
      item.product_family?.toLowerCase().includes(inappropriate.toLowerCase())
    );
    
    // Filter based on clothing length and coverage
    const hasModestCoverage = checkModestCoverage(item);
    
    return isAppropriate && !isInappropriate && hasModestCoverage;
  });
};

// Helper function to identify top items
const isTopItem = (item: any) => {
  const subfamily = item.product_subfamily?.toLowerCase() || '';
  const family = item.product_family?.toLowerCase() || '';
  const name = (item.product_name || '').toLowerCase();
  
  const topKeywords = [
    'blouses', 'shirts', 'tops', 'sweaters', 'cardigans',
    'blazers', 'jackets', 'tees', 'tank', 'camisole',
    'חולצה', 'בלוזה', 'חולצת', 'סוודר', 'קרדיגן'
  ];
  
  return topKeywords.some(keyword => 
    subfamily.includes(keyword) || family.includes(keyword) || name.includes(keyword)
  );
};

// Strict filtering for work-appropriate tops
const checkWorkAppropriateTop = (item: any) => {
  const itemName = item.product_name?.toLowerCase() || '';
  const description = item.description?.toLowerCase() || '';
  const family = item.product_family?.toLowerCase() || '';
  
  // Required for work tops - must have sleeves and collar or be very conservative
  const workTopKeywords = [
    'blouse', 'dress shirt', 'button down', 'collar', 'formal shirt',
    'business shirt', 'long sleeve', 'turtleneck', 'blazer', 'cardigan',
    'sweater', 'חולצה מכופתרת', 'חולצת עבודה', 'בלוזה', 'צווארון'
  ];
  
  // Forbidden for work tops
  const forbiddenTopKeywords = [
    'tank', 'camisole', 'tube', 'crop', 'halter', 'strapless', 'backless',
    'off shoulder', 'sleeveless', 'spaghetti', 'deep v', 'plunging', 'low cut',
    'sheer', 'transparent', 'mesh', 'cut out', 'חשופה', 'ללא שרוולים', 'חשוף'
  ];
  
  const hasWorkAppropriate = workTopKeywords.some(keyword => 
    itemName.includes(keyword) || description.includes(keyword) || family.includes(keyword)
  );
  
  const hasForbidden = forbiddenTopKeywords.some(keyword => 
    itemName.includes(keyword) || description.includes(keyword)
  );
  
  // For tops, must explicitly be work appropriate AND not have forbidden elements
  return hasWorkAppropriate && !hasForbidden;
};

// Function to check if clothing provides modest coverage
const checkModestCoverage = (item: any) => {
  const itemName = item.product_name?.toLowerCase() || '';
  const description = item.description?.toLowerCase() || '';
  
  // Check for revealing keywords
  const revealingKeywords = [
    'מיני', 'קצר', 'חשוף', 'שקוף', 'סקסי', 'חושפני',
    'mini', 'short', 'revealing', 'sheer', 'sexy', 'low cut',
    'deep v', 'backless', 'strapless', 'crop'
  ];
  
  // Check for modest keywords
  const modestKeywords = [
    'ארוך', 'סגור', 'צנוע', 'פורמלי', 'עסקי',
    'long', 'closed', 'modest', 'formal', 'business',
    'professional', 'conservative', 'covered'
  ];
  
  const hasRevealingKeywords = revealingKeywords.some(keyword => 
    itemName.includes(keyword) || description.includes(keyword)
  );
  
  const hasModestKeywords = modestKeywords.some(keyword => 
    itemName.includes(keyword) || description.includes(keyword)
  );
  
  // For work wear, prefer modest items and avoid revealing ones
  return hasModestKeywords || !hasRevealingKeywords;
};

// Updated mode mapping with work-appropriate considerations
export const getWorkAppropriateMode = (mode: Mode): boolean => {
  const workAppropriateModes: Mode[] = [
    'Work',
    'Relaxing', // Can be work appropriate if filtered properly
    'Casual'    // Can be work appropriate if filtered properly
  ];
  
  return workAppropriateModes.includes(mode);
};
