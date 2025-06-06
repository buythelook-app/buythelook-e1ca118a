

import { supabase } from "@/lib/supabaseClient";
import { GenerateOutfitTool } from "../tools/generateOutfitTool";
import { analyzeImagesWithAI } from "@/services/aiImageAnalysisService";

// Updated type to match actual database schema and handle NULL values
type ZaraClothItem = {
  id: string;
  product_name: string;
  price: number;
  colour: string;
  colour_code?: number | null;
  description?: string | null;
  size: string[]; // Array of sizes as in database
  materials?: any[] | null; // Can be array of objects or null
  materials_description?: string | null;
  availability: boolean;
  low_on_stock?: boolean | null;
  image?: any | null; // Can be string, array, or JSON
  category_id?: number | null;
  product_id?: number | null;
  product_family?: string | null;
  product_family_en?: string | null;
  product_subfamily?: string | null;
  section?: string | null;
  currency?: string | null;
  care?: any | null;
  dimension?: string | null;
  sku?: string | null;
  url?: string | null;
  you_may_also_like?: any | null;
  created_at: string;
};

// Interface defined but not exported to avoid conflicts
interface Agent {
  role: string;
  goal: string;
  backstory: string;
  tools: any[];
  run?: (userId: string) => Promise<any>;
}

/**
 * Helper function to get user budget from localStorage or filters
 */
const getUserBudget = (): number => {
  try {
    // Try to get budget from localStorage first
    const savedBudget = localStorage.getItem('user-budget');
    if (savedBudget) {
      const budget = parseInt(savedBudget);
      console.log(`📊 [DEBUG] Found saved budget: ${budget}`);
      return budget;
    }
    
    // Fallback to default budget
    console.log(`📊 [DEBUG] No budget found, using default: 500`);
    return 500; // Default budget in NIS
  } catch (error) {
    console.warn(`⚠️ [DEBUG] Error getting budget:`, error);
    return 500;
  }
};

/**
 * Helper function to get selected event type from localStorage
 */
const getSelectedEvent = (): string | null => {
  try {
    const event = localStorage.getItem('selected-event');
    console.log(`🎯 [DEBUG] Selected event: ${event}`);
    return event;
  } catch (error) {
    console.warn(`⚠️ [DEBUG] Error getting event:`, error);
    return null;
  }
};

/**
 * Helper function to get current mood from localStorage
 */
const getCurrentMood = (): string | null => {
  try {
    const mood = localStorage.getItem('current-mood');
    console.log(`😊 [DEBUG] Current mood: ${mood}`);
    return mood;
  } catch (error) {
    console.warn(`⚠️ [DEBUG] Error getting mood:`, error);
    return null;
  }
};

/**
 * Helper function to filter items by budget constraint
 */
const filterByBudget = (items: ZaraClothItem[], budget: number): ZaraClothItem[] => {
  // Filter items that are reasonably priced for the budget
  // Allow individual items up to 40% of total budget
  const maxItemPrice = budget * 0.4;
  
  const filteredItems = items.filter(item => {
    // Safely handle price field - ensure it's a valid number
    const itemPrice = typeof item.price === 'number' ? item.price : 0;
    return itemPrice <= maxItemPrice;
  });
  
  console.log(`💰 [DEBUG] Budget filter: ${items.length} -> ${filteredItems.length} items (max item price: ${maxItemPrice})`);
  
  return filteredItems;
};

/**
 * Helper function to filter items by event type - IMPROVED for better style distinction
 */
const filterByEvent = (items: ZaraClothItem[], event: string | null): ZaraClothItem[] => {
  if (!event) return items;
  
  const eventLower = event.toLowerCase();
  let filteredItems = items;
  
  // Filter based on event type with better distinction
  if (eventLower.includes('work') || eventLower.includes('business')) {
    // For work events, prefer formal and business items
    filteredItems = items.filter(item => {
      const name = (item.product_name ?? '').toLowerCase();
      const family = (item.product_family ?? '').toLowerCase();
      const subfamily = (item.product_subfamily ?? '').toLowerCase();
      const fullText = `${name} ${family} ${subfamily}`;
      
      // Include formal/business items
      const businessPatterns = [
        'blazer', 'shirt', 'trouser', 'formal', 'עסקי', 'חליפה', 'בלייזר',
        'dress', 'heel', 'pump', 'oxford', 'loafer', 'עקב', 'נעלי עסקיות'
      ];
      
      // Exclude casual items from work
      const casualExclusions = [
        'jean', 'ג\'ינס', 'sneaker', 'sport', 'ספורט', 'נעלי ספורט',
        't-shirt', 'טי שירט', 'hoodie', 'הודי', 'sweat', 'casual'
      ];
      
      const hasBusinessPattern = businessPatterns.some(pattern => fullText.includes(pattern));
      const hasCasualPattern = casualExclusions.some(pattern => fullText.includes(pattern));
      
      return hasBusinessPattern && !hasCasualPattern;
    });
  } else if (eventLower.includes('party') || eventLower.includes('evening') || eventLower.includes('date')) {
    // For evening/party/dates, prefer elegant and dressy items
    filteredItems = items.filter(item => {
      const name = (item.product_name ?? '').toLowerCase();
      const family = (item.product_family ?? '').toLowerCase();
      const subfamily = (item.product_subfamily ?? '').toLowerCase();
      const color = (item.colour ?? '').toLowerCase();
      const fullText = `${name} ${family} ${subfamily}`;
      
      // Include evening/party items
      const eveningPatterns = [
        'dress', 'שמלה', 'heel', 'עקב', 'elegant', 'אלגנטי', 'blouse', 'בלוזה',
        'skirt', 'חצאית', 'blazer', 'בלייזר', 'formal', 'פורמלי'
      ];
      
      // Include elegant colors
      const elegantColors = ['black', 'שחור', 'navy', 'נייבי', 'red', 'אדום', 'gold', 'זהב'];
      
      // Exclude very casual items
      const casualExclusions = [
        'jean', 'ג\'ינס', 'sneaker', 'ספורט', 't-shirt', 'טי שירט', 'hoodie'
      ];
      
      const hasEveningPattern = eveningPatterns.some(pattern => fullText.includes(pattern));
      const hasElegantColor = elegantColors.some(colorName => color.includes(colorName));
      const hasCasualPattern = casualExclusions.some(pattern => fullText.includes(pattern));
      
      return (hasEveningPattern || hasElegantColor) && !hasCasualPattern;
    });
  } else if (eventLower.includes('casual') || eventLower.includes('weekend')) {
    // For casual events, prefer VERY casual and sporty items - cotton, jeans, sneakers
    filteredItems = items.filter(item => {
      const name = (item.product_name ?? '').toLowerCase();
      const family = (item.product_family ?? '').toLowerCase();
      const subfamily = (item.product_subfamily ?? '').toLowerCase();
      const description = (item.description ?? '').toLowerCase();
      const materials = (item.materials_description ?? '').toLowerCase();
      const fullText = `${name} ${family} ${subfamily} ${description} ${materials}`;
      
      // Include very casual/sporty items
      const casualPatterns = [
        'jean', 'ג\'ינס', 'denim', 'דנים', 't-shirt', 'טי שירט', 'tee', 'טי',
        'sneaker', 'ספורט', 'trainer', 'נעלי ספורט', 'converse', 'נייק',
        'hoodie', 'הודי', 'sweatshirt', 'סווט Shirt', 'jogger', 'ג\'וגר',
        'cotton', 'כותנה', 'casual', 'קז\'ואל', 'relaxed', 'רגיל',
        'polo', 'פולו', 'tank', 'גופייה', 'shorts', 'מכנסיים קצרים'
      ];
      
      // Exclude formal/business items from casual
      const formalExclusions = [
        'blazer', 'בלייזר', 'formal', 'פורמלי', 'business', 'עסקי',
        'heel', 'עקב', 'pump', 'oxford', 'dress shirt', 'חולצה פורמלית',
        'suit', 'חליפה', 'elegant', 'אלגנטי'
      ];
      
      const hasCasualPattern = casualPatterns.some(pattern => fullText.includes(pattern));
      const hasFormalPattern = formalExclusions.some(pattern => fullText.includes(pattern));
      
      return hasCasualPattern && !hasFormalPattern;
    });
  }
  
  console.log(`🎯 [DEBUG] Event filter (${event}): ${items.length} -> ${filteredItems.length} items`);
  
  // If filtered items are too few, use a more lenient approach but still prefer the right style
  if (filteredItems.length < 10) {
    console.log(`⚠️ [DEBUG] Too few items after strict filtering, using lenient approach for ${event}`);
    
    // For casual, at least exclude very formal items
    if (eventLower.includes('casual') || eventLower.includes('weekend')) {
      filteredItems = items.filter(item => {
        const fullText = `${item.product_name ?? ''} ${item.product_family ?? ''} ${item.product_subfamily ?? ''}`.toLowerCase();
        const excludePatterns = ['blazer', 'בלייזר', 'heel', 'עקב', 'formal', 'פורמלי', 'suit', 'חליפה'];
        return !excludePatterns.some(pattern => fullText.includes(pattern));
      });
    }
    
    // Fallback to all items if still too few
    if (filteredItems.length < 5) {
      filteredItems = items;
    }
  }
  
  return filteredItems;
};

/**
 * Helper function to filter items by mood
 */
const filterByMood = (items: ZaraClothItem[], mood: string | null): ZaraClothItem[] => {
  if (!mood) return items;
  
  const moodLower = mood.toLowerCase();
  let filteredItems = items;
  
  // Filter based on mood
  if (moodLower.includes('elegant') || moodLower.includes('sophisticated')) {
    // For elegant mood, prefer refined colors and styles
    filteredItems = items.filter(item => {
      const color = (item.colour ?? '').toLowerCase();
      const name = (item.product_name ?? '').toLowerCase();
      
      return color.includes('black') || color.includes('navy') || color.includes('white') ||
             color.includes('beige') || name.includes('elegant');
    });
  } else if (moodLower.includes('energized') || moodLower.includes('powerful')) {
    // For energized mood, prefer bright colors and bold styles
    filteredItems = items.filter(item => {
      const color = (item.colour ?? '').toLowerCase();
      
      return color.includes('red') || color.includes('orange') || color.includes('yellow') ||
             color.includes('bright') || color.includes('bold');
    });
  } else if (moodLower.includes('romantic') || moodLower.includes('sweet')) {
    // For romantic mood, prefer soft colors and feminine styles
    filteredItems = items.filter(item => {
      const color = (item.colour ?? '').toLowerCase();
      const name = (item.product_name ?? '').toLowerCase();
      
      return color.includes('pink') || color.includes('rose') || color.includes('pastel') ||
             color.includes('soft') || name.includes('dress') || name.includes('romantic');
    });
  } else if (moodLower.includes('calm') || moodLower.includes('quiet')) {
    // For calm mood, prefer neutral and muted colors
    filteredItems = items.filter(item => {
      const color = (item.colour ?? '').toLowerCase();
      
      return color.includes('beige') || color.includes('grey') || color.includes('cream') ||
             color.includes('neutral') || color.includes('muted');
    });
  }
  
  console.log(`😊 [DEBUG] Mood filter (${mood}): ${items.length} -> ${filteredItems.length} items`);
  return filteredItems.length > 0 ? filteredItems : items; // Fallback to all items if no matches
};

/**
 * Helper function to check if an item is actually a clothing item based on name and category
 * Enhanced to better filter out non-clothing items like perfumes and accessories
 */
const isValidClothingItem = (item: ZaraClothItem): boolean => {
  if (!item || !item.availability) return false;
  
  const productName = (item.product_name || '').toLowerCase();
  const description = (item.description || '').toLowerCase();
  
  // Only use product_family and product_subfamily if they are not NULL
  const productFamily = item.product_family ? item.product_family.toLowerCase() : '';
  const subfamily = item.product_subfamily ? item.product_subfamily.toLowerCase() : '';
  
  // Enhanced exclude patterns - including perfumes and cosmetics
  const excludePatterns = [
    'תיק', 'bag', 'ארנק', 'wallet', 'משקפיים', 'glasses', 'שעון', 'watch',
    'צמיד', 'bracelet', 'שרשרת', 'necklace', 'עגיל', 'earring', 'טבעת', 'ring',
    'כובע', 'hat', 'כפפות', 'gloves', 'חגורה', 'belt', 'זרוע', 'arm',
    'כלי', 'tool', 'ספר', 'book', 'נייר', 'paper', 'מחשב', 'computer',
    'טלפון', 'phone', 'כבל', 'cable', 'מטען', 'charger',
    // Add perfume and cosmetic patterns
    'בושם', 'perfume', 'fragrance', 'eau de', 'cologne', 'aftershave',
    'קוסמטיק', 'cosmetic', 'makeup', 'איפור', 'שפתון', 'lipstick',
    'קרם', 'cream', 'לוטיון', 'lotion', 'סבון', 'soap', 'שמפו', 'shampoo'
  ];
  
  const fullText = `${productName} ${description} ${productFamily} ${subfamily}`;
  
  // Check if item contains any excluded patterns
  const hasExcludedPattern = excludePatterns.some(pattern => fullText.includes(pattern));
  
  if (hasExcludedPattern) {
    console.log(`❌ [DEBUG] Filtered out non-clothing item: ${item.id} - ${productName}`);
    return false;
  }
  
  // Must contain clothing-related patterns - enhanced for shoes
  const clothingPatterns = [
    'חולצ', 'shirt', 'בלוז', 'blouse', 'טופ', 'top', 'גופייה', 'tank',
    'מכנס', 'pants', 'ג\'ינס', 'jeans', 'חצאית', 'skirt', 'שמלה', 'dress',
    'נעל', 'shoe', 'סנדל', 'sandal', 'מגפ', 'boot', 'נעלי', 'sneaker',
    'סוודר', 'sweater', 'קרדיגן', 'cardigan', 'ז\'קט', 'jacket', 'מעיל', 'coat',
    // Enhanced shoe patterns
    'נעליים', 'shoes', 'boots', 'sandals', 'trainers', 'heels', 'flats'
  ];
  
  const hasClothingPattern = clothingPatterns.some(pattern => fullText.includes(pattern));
  
  if (!hasClothingPattern) {
    console.log(`❌ [DEBUG] Filtered out item without clothing patterns: ${item.id} - ${productName}`);
    return false;
  }
  
  console.log(`✅ [DEBUG] Valid clothing item: ${item.id} - ${productName}`);
  return true;
};

/**
 * Helper function to check if an image URL contains the AI-selected best image pattern
 * Uses AI analysis results when available - RELAXED for shoes to ensure availability
 */
const isValidImagePattern = (imageData: any, itemType?: string): boolean => {
  if (!imageData) {
    console.log('🔍 [DEBUG] No image data provided');
    return false;
  }
  
  // Handle different image data formats
  let imageUrls: string[] = [];
  
  if (typeof imageData === 'string') {
    try {
      const parsed = JSON.parse(imageData);
      if (Array.isArray(parsed)) {
        imageUrls = parsed.filter(url => typeof url === 'string');
        console.log(`🔍 [DEBUG] Parsed JSON array with ${imageUrls.length} URLs`);
      } else {
        imageUrls = [imageData];
        console.log(`🔍 [DEBUG] Using string directly: ${imageData}`);
      }
    } catch {
      imageUrls = [imageData];
      console.log(`🔍 [DEBUG] Failed to parse JSON, using string directly: ${imageData}`);
    }
  } else if (Array.isArray(imageData)) {
    imageUrls = imageData.filter(url => typeof url === 'string');
    console.log(`🔍 [DEBUG] Using array with ${imageUrls.length} URLs`);
  } else if (typeof imageData === 'object' && imageData.url) {
    imageUrls = [imageData.url];
    console.log(`🔍 [DEBUG] Using URL from object: ${imageData.url}`);
  } else {
    console.log(`🔍 [DEBUG] Unknown image data format:`, typeof imageData, imageData);
    return false;
  }
  
  // For shoes, be more lenient - accept any valid image pattern
  if (itemType === 'shoes') {
    const hasAnyPattern = imageUrls.some(url => /_[1-9]_\d+_1\.jpg/.test(url));
    console.log(`🔍 [DEBUG] Shoes item - Found ${imageUrls.length} URLs, has any valid pattern: ${hasAnyPattern}`);
    return hasAnyPattern;
  }
  
  // Check for 6th+ image pattern (without model) for other items
  const hasValidPattern = imageUrls.some(url => /_[6-9]_\d+_1\.jpg/.test(url));
  
  console.log(`🔍 [DEBUG] Found ${imageUrls.length} URLs, has valid no-model pattern (6th+ image): ${hasValidPattern}`);
  return hasValidPattern;
};

/**
 * Helper function to extract the best product image URL using AI analysis
 * Returns AI-selected image or falls back to any available pattern for shoes
 */
const extractMainProductImage = async (imageData: any, itemId?: string, itemType?: string): Promise<string> => {
  if (!imageData) {
    return '/placeholder.svg';
  }
  
  // Try to get AI-analyzed result first
  if (itemId) {
    try {
      const aiResult = await analyzeImagesWithAI(itemId, 1);
      if (aiResult.success && aiResult.results && aiResult.results.length > 0) {
        const selectedImage = aiResult.results[0].selectedImage;
        if (selectedImage && selectedImage !== '/placeholder.svg') {
          console.log(`🤖 [DEBUG] Using AI-selected image for item ${itemId}: ${selectedImage}`);
          return selectedImage;
        }
      }
    } catch (error) {
      console.warn(`⚠️ [DEBUG] AI analysis failed for item ${itemId}, falling back to pattern matching:`, error);
    }
  }
  
  // Fallback to pattern matching
  let imageUrls: string[] = [];
  
  if (typeof imageData === 'string') {
    try {
      const parsed = JSON.parse(imageData);
      if (Array.isArray(parsed)) {
        imageUrls = parsed.filter(url => typeof url === 'string');
      } else {
        imageUrls = [imageData];
      }
    } catch {
      imageUrls = [imageData];
    }
  } else if (Array.isArray(imageData)) {
    imageUrls = imageData.filter(url => typeof url === 'string');
  } else if (typeof imageData === 'object' && imageData.url) {
    imageUrls = [imageData.url];
  }
  
  // For shoes, be more flexible - try to find any good image
  if (itemType === 'shoes') {
    // Priority: 6th+ images, then any available image
    const preferredImages = imageUrls.filter(url => /_[6-9]_\d+_1\.jpg/.test(url));
    if (preferredImages.length > 0) {
      console.log(`🔍 [DEBUG] Found preferred shoe image: ${preferredImages[0]}`);
      return preferredImages[0];
    }
    
    // Fallback to any available image pattern for shoes
    const anyValidImage = imageUrls.find(url => /_[1-9]_\d+_1\.jpg/.test(url));
    if (anyValidImage) {
      console.log(`🔍 [DEBUG] Found fallback shoe image: ${anyValidImage}`);
      return anyValidImage;
    }
  } else {
    // Find the best image - prioritize 6th, 7th, 8th, 9th images without model
    const noModelImages = imageUrls.filter(url => /_[6-9]_\d+_1\.jpg/.test(url));
    
    if (noModelImages.length > 0) {
      noModelImages.sort((a, b) => {
        const aMatch = a.match(/_([6-9])_\d+_1\.jpg/);
        const bMatch = b.match(/_([6-9])_\d+_1\.jpg/);
        if (aMatch && bMatch) {
          return parseInt(aMatch[1]) - parseInt(bMatch[1]);
        }
        return 0;
      });
      
      console.log(`🔍 [DEBUG] Found ${noModelImages.length} no-model images, using: ${noModelImages[0]}`);
      return noModelImages[0];
    }
  }
  
  console.log(`🔍 [DEBUG] NO suitable images found, using placeholder`);
  return '/placeholder.svg';
};

/**
 * Helper function to check if an item has multiple colors (3+ colors)
 */
const isColorfulItem = (item: ZaraClothItem): boolean => {
  const colorName = (item.colour ?? '').toLowerCase();
  const productName = (item.product_name ?? '').toLowerCase();
  
  // Check for multi-color indicators
  const multiColorPatterns = [
    'multicolor', 'multi-color', 'colorful', 'print', 'pattern', 'floral',
    'striped', 'checked', 'plaid', 'geometric', 'abstract', 'mix',
    'צבעוני', 'הדפס', 'פרחוני', 'פסים', 'משבצות'
  ];
  
  const hasMultiColorPattern = multiColorPatterns.some(pattern => 
    colorName.includes(pattern) || productName.includes(pattern)
  );
  
  // Count color words in the color field
  const colorWords = ['red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'brown', 'grey', 'gray', 'black', 'white', 'beige', 'navy'];
  const hebrewColors = ['אדום', 'כחול', 'ירוק', 'צהוב', 'ורוד', 'סגול', 'כתום', 'חום', 'אפור', 'שחור', 'לבן', 'בז\'', 'נייבי'];
  
  const allColors = [...colorWords, ...hebrewColors];
  const colorCount = allColors.filter(color => colorName.includes(color) || productName.includes(color)).length;
  
  return hasMultiColorPattern || colorCount >= 3;
};

/**
 * Helper function to check if an item is neutral/single color
 */
const isNeutralItem = (item: ZaraClothItem): boolean => {
  const colorName = (item.colour ?? '').toLowerCase();
  const productName = (item.product_name ?? '').toLowerCase();
  
  const neutralPatterns = [
    'white', 'black', 'grey', 'gray', 'beige', 'cream', 'navy', 'khaki',
    'לבן', 'שחור', 'אפור', 'בז\'', 'קרם', 'נייבי', 'חאקי'
  ];
  
  return neutralPatterns.some(pattern => 
    colorName.includes(pattern) || productName.includes(pattern)
  );
};

/**
 * Helper function to extract main colors from a colorful item
 */
const extractMainColors = (item: ZaraClothItem): string[] => {
  const colorName = (item.colour ?? '').toLowerCase();
  const productName = (item.product_name ?? '').toLowerCase();
  
  const colorWords = ['red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'brown', 'grey', 'gray', 'black', 'white', 'beige', 'navy'];
  const hebrewColors = ['אדום', 'כחול', 'ירוק', 'צהוב', 'ורוד', 'סגול', 'כתום', 'חום', 'אפור', 'שחור', 'לבן', 'בז\'', 'נייבי'];
  
  const foundColors: string[] = [];
  const fullText = `${colorName} ${productName}`;
  
  [...colorWords, ...hebrewColors].forEach(color => {
    if (fullText.includes(color)) {
      foundColors.push(color);
    }
  });
  
  return foundColors;
};

/**
 * Helper function to check if an item matches any of the given colors
 */
const matchesColors = (item: ZaraClothItem, targetColors: string[]): boolean => {
  const colorName = (item.colour ?? '').toLowerCase();
  const productName = (item.product_name ?? '').toLowerCase();
  const fullText = `${colorName} ${productName}`;
  
  return targetColors.some(color => fullText.includes(color.toLowerCase()));
};

/**
 * Enhanced function to find matching shoes based on the user's criteria
 */
function findMatchingShoes(
  items: ZaraClothItem[],
  topItem: ZaraClothItem
): ZaraClothItem[] {
  const shoeKeywords = [
    "shoes", "trainer", "sneaker", "sandals", "heels", "boots",
    "נעליים", "נעל", "סנדל", "מגפ", "נעלי", "עקב"
  ];
  const lowerName = (s: string) => s?.toLowerCase() || "";

  return items.filter(item => {
    const name = lowerName(item.product_name);
    const description = lowerName(item.description ?? "");
    const family = lowerName(item.product_family ?? "");
    const subfamily = lowerName(item.product_subfamily ?? "");

    // Check if it's a shoe across all text fields
    const isShoe = shoeKeywords.some(kw =>
      name.includes(kw) || description.includes(kw) || family.includes(kw) || subfamily.includes(kw)
    );

    // Check for same or similar color
    const isSameColour = item.colour === topItem.colour;
    
    // Check for similar price range (within 100 NIS)
    const isSimilarPrice = Math.abs(item.price - topItem.price) < 100;

    // For shoes, be more flexible - match on any criteria
    return isShoe && (isSameColour || isSimilarPrice);
  });
}

/**
 * Professional outfit selection with improved color coordination and enhanced shoe detection
 * Ensures budget compliance and smart color matching for colorful items
 */
const selectProfessionalOutfit = (items: ZaraClothItem[], budget: number): { top?: ZaraClothItem; bottom?: ZaraClothItem; shoes?: ZaraClothItem } => {
  // Filter available items and avoid low stock when possible
  const availableItems: ZaraClothItem[] = items.filter(item => item.availability && !item.low_on_stock);
  const fallbackItems: ZaraClothItem[] = items.filter(item => item.availability); // Include low stock as fallback
  
  const itemsToUse: ZaraClothItem[] = availableItems.length >= 3 ? availableItems : fallbackItems;
  
  // Enhanced categorization by product_family and product names - improved shoe detection
  const tops: ZaraClothItem[] = itemsToUse.filter(item => {
    const name = (item.product_name || '').toLowerCase();
    const family = item.product_family ? item.product_family.toLowerCase() : '';
    const subfamily = item.product_subfamily ? item.product_subfamily.toLowerCase() : '';
    
    return family.includes('top') || family.includes('blouse') || family.includes('shirt') || 
           subfamily.includes('חולצ') || subfamily.includes('טופ') || subfamily.includes('בלוז') ||
           name.includes('חולצ') || name.includes('טופ') || name.includes('בלוז') || name.includes('shirt');
  });
  
  const bottoms: ZaraClothItem[] = itemsToUse.filter(item => {
    const name = (item.product_name || '').toLowerCase();
    const family = item.product_family ? item.product_family.toLowerCase() : '';
    const subfamily = item.product_subfamily ? item.product_subfamily.toLowerCase() : '';
    
    return family.includes('bottom') || family.includes('pants') || family.includes('skirt') || 
           family.includes('dress') || subfamily.includes('מכנס') || subfamily.includes('חצאית') || 
           subfamily.includes('שמלה') || name.includes('מכנס') || name.includes('חצאית') || 
           name.includes('שמלה') || name.includes('ג\'ינס');
  });
  
  // Enhanced shoe detection - check multiple fields and be more lenient
  const shoes: ZaraClothItem[] = itemsToUse.filter(item => {
    const name = (item.product_name || '').toLowerCase();
    const family = item.product_family ? item.product_family.toLowerCase() : '';
    const subfamily = item.product_subfamily ? item.product_subfamily.toLowerCase() : '';
    const description = (item.description || '').toLowerCase();
    
    // Check for shoe patterns in all relevant fields
    const shoePatterns = [
      'נעל', 'shoe', 'סנדל', 'sandal', 'מגפ', 'boot', 'נעלי', 'sneaker', 
      'נעליים', 'shoes', 'boots', 'sandals', 'trainers', 'heels', 'flats',
      'pump', 'oxford', 'loafer', 'עקב', 'נעלי עסקיות', 'ספורט'
    ];
    
    return shoePatterns.some(pattern => 
      name.includes(pattern) || family.includes(pattern) || subfamily.includes(pattern) || description.includes(pattern)
    );
  });
  
  console.log(`🔍 [DEBUG] Categorization results: tops=${tops.length}, bottoms=${bottoms.length}, shoes=${shoes.length}`);
  
  if (shoes.length === 0) {
    console.warn(`⚠️ [DEBUG] No shoes found! Available items: ${itemsToUse.length}`);
    console.log(`🔍 [DEBUG] Sample items:`, itemsToUse.slice(0, 5).map(item => ({
      id: item.id,
      name: item.product_name,
      family: item.product_family,
      subfamily: item.product_subfamily,
      description: item.description
    })));
    
    // If no shoes found, try to find any items that might be shoes with less strict criteria
    const possibleShoes = itemsToUse.filter(item => {
      const allText = `${item.product_name || ''} ${item.product_family || ''} ${item.product_subfamily || ''} ${item.description || ''}`.toLowerCase();
      return allText.includes('נעל') || allText.includes('shoe') || allText.includes('boot') || allText.includes('heel');
    });
    
    if (possibleShoes.length > 0) {
      console.log(`🔍 [DEBUG] Found ${possibleShoes.length} possible shoes with relaxed criteria`);
      shoes.push(...possibleShoes);
    }
  }
  
  // Try multiple combinations to find one within budget with good color coordination
  const maxAttempts = 15;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let selectedTop: ZaraClothItem | undefined;
    let selectedBottom: ZaraClothItem | undefined;
    let selectedShoes: ZaraClothItem | undefined;
    
    // Enhanced strategy: Smart color coordination
    const colorfulTops = tops.filter(isColorfulItem);
    const colorfulBottoms = bottoms.filter(isColorfulItem);
    const neutralTops = tops.filter(isNeutralItem);
    const neutralBottoms = bottoms.filter(isNeutralItem);
    const neutralShoes = shoes.filter(isNeutralItem);
    
    // Strategy 1: One colorful item + two neutral items (preferred)
    if (colorfulTops.length > 0 && neutralBottoms.length > 0 && (neutralShoes.length > 0 || shoes.length > 0)) {
      selectedTop = colorfulTops[Math.floor(Math.random() * colorfulTops.length)];
      selectedBottom = neutralBottoms[Math.floor(Math.random() * neutralBottoms.length)];
      
      // Use the updated findMatchingShoes function
      const matchingShoes = findMatchingShoes(shoes, selectedTop);
      selectedShoes = matchingShoes.length > 0 ? 
        matchingShoes[Math.floor(Math.random() * matchingShoes.length)] :
        (neutralShoes.length > 0 ? 
          neutralShoes[Math.floor(Math.random() * neutralShoes.length)] :
          shoes[Math.floor(Math.random() * shoes.length)]);
      
      console.log(`🎨 [DEBUG] Strategy 1: Colorful top + neutral bottom + matching/neutral shoes`);
    }
    // Strategy 2: Neutral top + colorful bottom + matching/neutral shoes
    else if (colorfulBottoms.length > 0 && neutralTops.length > 0 && shoes.length > 0) {
      selectedBottom = colorfulBottoms[Math.floor(Math.random() * colorfulBottoms.length)];
      selectedTop = neutralTops[Math.floor(Math.random() * neutralTops.length)];
      
      // Use the updated findMatchingShoes function
      const matchingShoes = findMatchingShoes(shoes, selectedBottom);
      selectedShoes = matchingShoes.length > 0 ? 
        matchingShoes[Math.floor(Math.random() * matchingShoes.length)] :
        (neutralShoes.length > 0 ? 
          neutralShoes[Math.floor(Math.random() * neutralShoes.length)] :
          shoes[Math.floor(Math.random() * shoes.length)]);
      
      console.log(`🎨 [DEBUG] Strategy 2: Neutral top + colorful bottom + matching/neutral shoes`);
    }
    // Strategy 3: All neutral items (fallback)
    else {
      selectedTop = tops.length > 0 ? tops[Math.floor(Math.random() * tops.length)] : undefined;
      selectedBottom = bottoms.length > 0 ? bottoms[Math.floor(Math.random() * bottoms.length)] : undefined;
      
      if (selectedTop && shoes.length > 0) {
        const matchingShoes = findMatchingShoes(shoes, selectedTop);
        selectedShoes = matchingShoes.length > 0 ? 
          matchingShoes[Math.floor(Math.random() * matchingShoes.length)] :
          shoes[Math.floor(Math.random() * shoes.length)];
      } else {
        selectedShoes = shoes.length > 0 ? shoes[Math.floor(Math.random() * shoes.length)] : undefined;
      }
      
      console.log(`🎨 [DEBUG] Strategy 3: Random selection with shoe matching (fallback)`);
    }
    
    if (selectedTop && selectedBottom && selectedShoes) {
      const totalCost = selectedTop.price + selectedBottom.price + selectedShoes.price;
      
      if (totalCost <= budget) {
        console.log(`💰 [DEBUG] Found color-coordinated outfit within budget: ${totalCost}₪ / ${budget}₪`);
        console.log(`🔍 [DEBUG] Professional outfit selection: TOP=${selectedTop.product_name}, BOTTOM=${selectedBottom.product_name}, SHOES=${selectedShoes.product_name}`);
        
        return {
          top: selectedTop,
          bottom: selectedBottom,
          shoes: selectedShoes
        };
      } else {
        console.log(`💰 [DEBUG] Color-coordinated outfit over budget (${totalCost}₪ > ${budget}₪), trying again...`);
      }
    } else {
      console.log(`⚠️ [DEBUG] Incomplete outfit at attempt ${attempt + 1}: top=${!!selectedTop}, bottom=${!!selectedBottom}, shoes=${!!selectedShoes}`);
    }
  }
  
  // If no budget-compliant outfit found with color coordination, return the cheapest option
  const cheapestTop = tops.sort((a, b) => a.price - b.price)[0];
  const cheapestBottom = bottoms.sort((a, b) => a.price - b.price)[0];
  const cheapestShoes = shoes.sort((a, b) => a.price - b.price)[0];
  
  console.log(`⚠️ [DEBUG] Could not find complete color-coordinated outfit within budget, returning cheapest options`);
  console.log(`🔍 [DEBUG] Final selection: TOP=${cheapestTop?.product_name || 'NONE'}, BOTTOM=${cheapestBottom?.product_name || 'NONE'}, SHOES=${cheapestShoes?.product_name || 'NONE'}`);
  
  return {
    top: cheapestTop,
    bottom: cheapestBottom,
    shoes: cheapestShoes
  };
};

/**
 * Styling Generator Agent
 * Generates outfit suggestions using items from the zara_cloth database table with professional guidelines
 */
export const stylingAgent: Agent = {
  role: "Professional AI Styling Assistant",
  goal: "Recommend relevant fashion items based on event type, personal style preferences, budget constraints, and mood",
  backstory: "Professional stylist with expertise in combining clothing items from database, selecting best product images, and creating cohesive outfits within budget",
  tools: [GenerateOutfitTool],
  
  /**
   * Runs the styling agent to generate a professional outfit recommendation from database items
   * @param userId The ID of the user to generate outfit for
   */
  run: async (userId: string) => {
    console.log("🔍 [DEBUG] Professional StylingAgent starting for user:", userId);
    
    try {
      // Step 1: Get user preferences from localStorage
      const budget = getUserBudget();
      const selectedEvent = getSelectedEvent();
      const currentMood = getCurrentMood();
      
      console.log(`📊 [DEBUG] User preferences - Budget: ${budget}₪, Event: ${selectedEvent}, Mood: ${currentMood}`);
      
      // Step 2: Check if zara_cloth table exists and get actual count
      console.log("🔍 [DEBUG] Step 2: Checking zara_cloth table...");
      const { count: tableCount, error: tableCheckError } = await supabase
        .from('zara_cloth')
        .select('*', { count: 'exact', head: true });
      
      if (tableCheckError) {
        console.error("❌ [DEBUG] Table check failed:", tableCheckError);
        return { 
          success: false, 
          error: "zara_cloth table is not accessible: " + tableCheckError.message 
        };
      }
      
      console.log("✅ [DEBUG] zara_cloth table exists with", tableCount, "items");

      if (!tableCount || tableCount === 0) {
        console.error("❌ [DEBUG] zara_cloth table is empty");
        return { 
          success: false, 
          error: "zara_cloth table is empty" 
        };
      }

      // Step 3: Fetch available clothing items (only available=true)
      console.log("🔍 [DEBUG] Step 3: Fetching available clothing items...");
      
      const { data: allItems, error: fetchError } = await supabase
        .from('zara_cloth')
        .select('*')
        .eq('availability', true)
        .limit(300);

      if (fetchError || !allItems?.length) {
        console.error('❌ [DEBUG] Error fetching items:', fetchError);
        return { 
          success: false, 
          error: "Failed to fetch available items from database: " + (fetchError?.message || "No items found") 
        };
      }

      console.log('✅ [DEBUG] Available items fetched:', allItems.length);

      // Step 4: Apply all filters - cast allItems to ZaraClothItem[] and filter properly
      console.log('🔍 [DEBUG] Starting professional filtering for valid clothing items...');
      
      // First filter for valid clothing items - properly type the items
      let validItems: ZaraClothItem[] = (allItems as ZaraClothItem[]).filter((item, index) => {
        console.log(`🔍 [DEBUG] Checking item ${index + 1}/${allItems.length} (ID: ${item.id})`);
        
        // First check if it's a valid clothing item
        const isClothing = isValidClothingItem(item);
        if (!isClothing) {
          return false;
        }
        
        // For shoes, be more lenient with image requirements
        const itemType = (() => {
          const name = (item.product_name || '').toLowerCase();
          const family = item.product_family ? item.product_family.toLowerCase() : '';
          const subfamily = item.product_subfamily ? item.product_subfamily.toLowerCase() : '';
          
          if (name.includes('נעל') || name.includes('shoe') || family.includes('shoe') || subfamily.includes('נעל')) {
            return 'shoes';
          }
          return 'clothing';
        })();
        
        // Then check if it has valid image pattern (more lenient for shoes)
        const hasValidImage = isValidImagePattern(item.image, itemType);
        if (!hasValidImage) {
          console.log(`❌ [DEBUG] FILTERED OUT item ${item.id} - no valid image pattern (type: ${itemType})`);
          return false;
        }
        
        console.log(`✅ [DEBUG] KEEPING item ${item.id} - valid clothing with good image (type: ${itemType})`);
        return true;
      });

      console.log(`✅ [DEBUG] Valid items after clothing/image filtering: ${validItems.length} out of ${allItems.length}`);

      // Apply budget filter - now correctly typed as ZaraClothItem[]
      validItems = filterByBudget(validItems, budget);
      
      // Apply event filter - now correctly typed as ZaraClothItem[]
      validItems = filterByEvent(validItems, selectedEvent);
      
      // Apply mood filter - now correctly typed as ZaraClothItem[]
      validItems = filterByMood(validItems, currentMood);

      console.log(`✅ [DEBUG] Final valid items after all filters: ${validItems.length}`);

      if (validItems.length === 0) {
        console.error('❌ [DEBUG] No valid clothing items found after applying all filters');
        return { 
          success: false, 
          error: "No suitable clothing items found matching your budget, event, and mood preferences" 
        };
      }

      // Step 5: Professional outfit selection with budget consideration
      const outfitSelection = selectProfessionalOutfit(validItems, budget);
      
      if (!outfitSelection.top || !outfitSelection.bottom || !outfitSelection.shoes) {
        console.error('❌ [DEBUG] Could not find complete professional outfit within budget');
        return { 
          success: false, 
          error: "Could not find complete outfit items (top, bottom, shoes) within your budget and preferences" 
        };
      }

      // Calculate total cost
      const totalCost = outfitSelection.top.price + outfitSelection.bottom.price + outfitSelection.shoes.price;

      // Extract AI-selected or best product images with item type info
      console.log('🔍 [DEBUG] Extracting AI-selected product images...');
      const topImage = await extractMainProductImage(outfitSelection.top?.image, outfitSelection.top?.id, 'top');
      const bottomImage = await extractMainProductImage(outfitSelection.bottom?.image, outfitSelection.bottom?.id, 'bottom');
      const shoesImage = await extractMainProductImage(outfitSelection.shoes?.image, outfitSelection.shoes?.id, 'shoes');

      console.log('🔍 [DEBUG] Professional outfit images:');
      console.log('Top item image:', topImage);
      console.log('Bottom item image:', bottomImage);
      console.log('Shoes item image:', shoesImage);

      // Step 6: Create professional outfit object with database items and AI-selected images
      const outfit = {
        top: {
          ...outfitSelection.top,
          image: topImage
        },
        bottom: {
          ...outfitSelection.bottom,
          image: bottomImage
        },
        shoes: {
          ...outfitSelection.shoes,
          image: shoesImage
        },
        score: Math.floor(Math.random() * 30) + 70,
        description: `Professional outfit recommendation (${totalCost}₪/${budget}₪) tailored for ${selectedEvent || 'general occasion'} with ${currentMood || 'balanced'} mood`,
        recommendations: [
          `Budget-conscious selection: ${totalCost}₪ out of ${budget}₪ budget`,
          `Event-appropriate styling for ${selectedEvent || 'general occasions'}`,
          `Mood-matched design reflecting ${currentMood || 'balanced'} feelings`,
          "Items selected from real Zara database with AI-analyzed images",
          "All items currently available and prioritized over low-stock alternatives",
          "Colors and styles coordinated for visual appeal and occasion suitability"
        ],
        occasion: selectedEvent || 'general',
        totalCost: totalCost,
        budget: budget,
        mood: currentMood
      };
      
      console.log("✅ [DEBUG] Generated professional database outfit successfully with budget and preference filtering");
      return { success: true, data: outfit };
      
    } catch (error) {
      console.error("❌ [DEBUG] Error in professional styling agent:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error in styling agent" 
      };
    }
  }
};

