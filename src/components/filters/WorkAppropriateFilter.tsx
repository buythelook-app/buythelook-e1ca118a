
import { Category, Mode } from "./StyleFilterButton";

// Define work-appropriate clothing categories
export const WORK_APPROPRIATE_CATEGORIES = [
  'blazers',
  'blouses', 
  'dress_shirts',
  'formal_trousers',
  'midi_skirts',
  'long_skirts',
  'pencil_skirts',
  'formal_dresses',
  'cardigans',
  'sweaters',
  'formal_shoes',
  'loafers',
  'oxford_shoes'
];

// Define inappropriate items for work
export const WORK_INAPPROPRIATE_ITEMS = [
  'crop_tops',
  'tank_tops',
  'tube_tops',
  'mini_skirts',
  'short_shorts',
  'revealing_dresses',
  'deep_v_neck',
  'backless_tops',
  'sheer_clothing',
  'swimwear',
  'lingerie',
  'flip_flops',
  'athletic_wear'
];

// Function to filter work-appropriate items
export const filterWorkAppropriateItems = (items: any[]) => {
  return items.filter(item => {
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
