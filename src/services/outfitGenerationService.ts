import { supabase } from "@/integrations/supabase/client";
import logger from "@/lib/logger";

// Define the types for request parameters
export type BodyStructure = 'X' | 'V' | 'H' | 'O' | 'A';
export type StylePreference = 'classic' | 'romantic' | 'minimalist' | 'casual' | 'boohoo' | 'sporty';

// Interface for the outfit generation request
interface OutfitGenerationRequest {
  bodyStructure: BodyStructure;
  mood: string;
  style: StylePreference;
}

interface OutfitSuggestion {
  top: string;
  bottom: string;
  shoes: string;
  coat?: string;
  description: string;
  recommendations: string[];
  occasion?: 'work' | 'casual' | 'weekend' | 'date night' | 'general';
}

interface OutfitGenerationResponse {
  success: boolean;
  data?: OutfitSuggestion[];
  error?: string;
}

let cachedRecommendations: string[] = [];

/**
 * Generate outfit suggestions using the Fashion Outfit Generator API
 * @param request The outfit generation request containing bodyStructure, mood, and style
 * @returns A promise containing the outfit suggestion response
 */
export async function generateOutfit(request: OutfitGenerationRequest): Promise<OutfitGenerationResponse> {
  try {
    logger.info("Generating outfit with API", {
      context: "outfitGenerationService",
      data: request
    });

    const { data, error } = await supabase.functions.invoke<OutfitGenerationResponse>('generate-outfit', {
      body: request
    });

    if (error) {
      logger.error("Error calling generate-outfit function:", {
        context: "outfitGenerationService",
        data: error
      });
      return {
        success: false,
        error: error.message
      };
    }

    if (!data) {
      logger.warn("No data received from generate-outfit function", {
        context: "outfitGenerationService"
      });
      return {
        success: false,
        error: "No data received from outfit generation API"
      };
    }

    if (data.success && data.data && data.data.length > 0) {
      const firstOutfit = data.data[0];
      if (firstOutfit.recommendations) {
        cachedRecommendations = firstOutfit.recommendations;
        localStorage.setItem('style-recommendations', JSON.stringify(firstOutfit.recommendations));
      }
      
      const colors = {
        top: firstOutfit.top,
        bottom: firstOutfit.bottom,
        shoes: firstOutfit.shoes,
        coat: firstOutfit.coat
      };
      localStorage.setItem('outfit-colors', JSON.stringify(colors));
      
      localStorage.setItem('last-outfit-data', JSON.stringify(firstOutfit));
    }

    logger.info("Outfit generation successful", {
      context: "outfitGenerationService",
      data: { outfitCount: data.data?.length || 0 }
    });

    return data;
  } catch (error) {
    logger.error("Exception in generateOutfit:", {
      context: "outfitGenerationService",
      data: error
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get style recommendations from the last generated outfit
 * @returns An array of recommendation strings
 */
export function getStyleRecommendations(): string[] {
  if (cachedRecommendations.length > 0) {
    return cachedRecommendations;
  }
  
  try {
    const stored = localStorage.getItem('style-recommendations');
    if (stored) {
      const recommendations = JSON.parse(stored);
      if (Array.isArray(recommendations)) {
        cachedRecommendations = recommendations;
        return recommendations;
      }
    }
  } catch (error) {
    logger.error("Error retrieving cached recommendations:", {
      context: "outfitGenerationService",
      data: error
    });
  }
  
  return [];
}

/**
 * Get the color palette from the last generated outfit
 * @returns An object containing color hex codes
 */
export function getOutfitColors(): Record<string, string> {
  try {
    const colorsData = localStorage.getItem('outfit-colors');
    if (!colorsData) return {};
    
    return JSON.parse(colorsData);
  } catch (error) {
    logger.error("Error retrieving outfit colors", {
      context: "outfitGenerationService",
      data: error
    });
    return {};
  }
}

/**
 * Convert a hex color to a human-readable color name
 * @param hex The hex color code
 * @returns A human-readable color name
 */
export function getColorName(hex: string): string {
  // Basic color mapping (could be expanded)
  const colorMap: Record<string, string> = {
    '#000000': 'שחור',
    '#FFFFFF': 'לבן',
    '#FF0000': 'אדום',
    '#00FF00': 'ירוק',
    '#0000FF': 'כחול',
    '#FFFF00': 'צהוב',
    '#FF00FF': 'מגנטה',
    '#00FFFF': 'טורקיז',
    '#C0C0C0': 'כסוף',
    '#808080': 'אפור',
    '#800000': 'בורדו',
    '#808000': 'זית',
    '#008000': 'ירוק כהה',
    '#800080': 'סגול',
    '#008080': 'טורקיז כהה',
    '#000080': 'כחול נייבי',
    '#FFA500': 'כתום',
    '#A52A2A': 'חום',
    '#FFC0CB': 'ורוד',
    '#F5F5DC': 'בז׳'
  };

  // Normalize hex to uppercase
  const normalizedHex = hex.toUpperCase();
  
  // Return the mapped color name or the hex code if not found
  return colorMap[normalizedHex] || hex;
}

/**
 * Debug function to inspect the image JSON structure
 * @param imageData The image data to inspect
 * @returns A detailed analysis of the image structure
 */
const inspectImageStructure = (imageData: any): string => {
  try {
    if (imageData === null || imageData === undefined) {
      return "Image data is null or undefined";
    }

    if (typeof imageData === 'string') {
      return `Image is a string URL: ${imageData}`;
    }

    if (Array.isArray(imageData)) {
      return `Image is an array with ${imageData.length} items. First item: ${JSON.stringify(imageData[0])}`;
    }

    if (typeof imageData === 'object') {
      const keys = Object.keys(imageData);
      let result = `Image is an object with keys: ${keys.join(', ')}\n`;
      
      // Check for common URL patterns
      if (imageData.urls) {
        result += `urls property found: ${JSON.stringify(imageData.urls)}\n`;
      }
      
      if (imageData.url) {
        result += `url property found: ${imageData.url}\n`;
      }
      
      // Check first-level properties for URL-like strings
      for (const key of keys) {
        const value = imageData[key];
        if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('/'))) {
          result += `URL-like string found in property "${key}": ${value}\n`;
        }
      }
      
      return result;
    }
    
    return `Image data is of unexpected type: ${typeof imageData}`;
  } catch (error) {
    return `Error inspecting image: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

/**
 * Extract image without model - prioritizes images 6-9 (full product shots without models)
 * Pattern: _[6-9]_\d+_1\.jpg indicates a product image without model
 */
function getImageWithoutModel(imageData: any): string {
  if (!imageData) return '/placeholder.svg';
  
  try {
    let images: string[] = [];
    
    if (Array.isArray(imageData)) {
      images = imageData;
    } else if (typeof imageData === 'string') {
      try {
        const parsed = JSON.parse(imageData);
        images = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        images = [imageData];
      }
    } else if (typeof imageData === 'object') {
      if (imageData.image) {
        images = Array.isArray(imageData.image) ? imageData.image : [imageData.image];
      } else if (imageData.images) {
        images = Array.isArray(imageData.images) ? imageData.images : [imageData.images];
      }
    }
    
    // Filter URLs to ensure they're valid strings
    images = images.filter(url => typeof url === 'string' && url.trim() !== '');
    
    if (images.length === 0) return '/placeholder.svg';
    
    // 1st Priority: Look for images 6-9 without model (full product shots)
    const noModelImages = images.filter(url => /_[6-9]_\d+_1\.jpg/.test(url));
    
    if (noModelImages.length > 0) {
      // Sort to prefer earlier image numbers (6 over 7, etc.)
      noModelImages.sort((a, b) => {
        const aMatch = a.match(/_([6-9])_\d+_1\.jpg/);
        const bMatch = b.match(/_([6-9])_\d+_1\.jpg/);
        if (aMatch && bMatch) {
          return parseInt(aMatch[1]) - parseInt(bMatch[1]);
        }
        return 0;
      });
      
      console.log(`✅ [getImageWithoutModel] Found no-model image: ${noModelImages[0]}`);
      return noModelImages[0];
    }
    
    // 2nd Priority: Try second-to-last image (often without model)
    if (images.length >= 2) {
      const secondToLast = images[images.length - 2];
      console.log(`⚠️ [getImageWithoutModel] Using second-to-last image: ${secondToLast}`);
      return secondToLast;
    }
    
    // Fallback: First image
    console.log(`⚠️ [getImageWithoutModel] Using first image as fallback: ${images[0]}`);
    return images[0];
  } catch (error) {
    console.error('❌ [getImageWithoutModel] Error:', error);
    return '/placeholder.svg';
  }
}

/**
 * Extract the image URL from the image JSON field
 * For all items, prefer second-to-last image (usually without model)
 * @param imageJson The image JSON data from the database
 * @param itemType Optional item type (not used anymore - all items use same logic)
 * @returns The image URL or a placeholder
 */
export function extractImageUrl(imageJson: any, itemType?: string): string {
  // Use the no-model logic for all items
  return getImageWithoutModel(imageJson);
}

/**
 * מחזיר תבנית חיפוש משופרת לפי סוג פריט ואירוע
 */
function getCategoryPattern(type: string, occasion?: string): string {
  const basePatterns: Record<string, string> = {
    'top': 'CAMISETA|BLUSA|CAMISA|TOP|JERSEY|SUDADERA',
    'bottom': 'PANTALON|FALDA|VAQUERO|JEANS',
    'shoes': 'ZAPATO|BOTA|SHOE|BOOT|SANDAL',
    'coat': 'CAZADORA|ABRIGO|CHALECO|JACKET|COAT|BLAZER'
  };

  let pattern = basePatterns[type] || '';

  // שיפור החיפוש לפי אירוע
  if (occasion === 'Work') {
    if (type === 'top') pattern += '|BLAZER|AMERICANA';
    if (type === 'bottom') pattern += '|FORMAL';
    if (type === 'shoes') pattern += '|OXFORD|MOCASIN';
  } else if (occasion === 'Evening') {
    if (type === 'top') pattern += '|VESTIDO|ELEGANTE|FIESTA';
    if (type === 'shoes') pattern += '|SALON|TACON';
  } else if (occasion === 'Casual') {
    if (type === 'top') pattern += '|CASUAL|BASICO';
    if (type === 'shoes') pattern += '|DEPORTIVA|SNEAKER';
  }

  return pattern;
}

/**
 * מחזיר תבנית של פריטים לא רלוונטיים לדחות מראש
 */
function getExcludePattern(occasion?: string, type?: string): string {
  // סינון בסיסי - דברים שתמיד לא רלוונטיים
  const alwaysExclude = ['%maquillaje%', '%perfume%', '%cosm%'];
  
  // סינון ספציפי לאירוע - רק דברים ברורים
  const occasionExclude: Record<string, string[]> = {
    'Work': ['%bikini%', '%bañador%', '%pijama%', '%lenceria%'],
    'Evening': ['%deportiva%', '%running%', '%gym%'],
    'Casual': [] // אין דחייה מיוחדת
  };

  const toExclude = [
    ...alwaysExclude,
    ...(occasion ? occasionExclude[occasion] || [] : [])
  ];

  // אם אין מה לדחות, החזר משהו שלא יתאים לכלום
  return toExclude.length > 0 ? toExclude.join('|') : '%xxxnomatchxxx%';
}

/**
 * Find clothing items matching the recommended colors from the agent
 * @param colors Record of item types to hex colors
 * @param occasion Optional occasion for better filtering
 * @returns A record of item types to matching clothing items
 */
export async function findMatchingClothingItems(
  colors: Record<string, string>,
  occasion?: string
): Promise<Record<string, any[]>> {
  
  logger.info('🔍 [findMatchingClothingItems] מתחיל חיפוש', {
    context: 'findMatchingClothingItems',
    data: { colors, occasion }
  });

  const result: Record<string, any[]> = {
    top: [],
    bottom: [],
    shoes: [],
    coat: []
  };

  // לולאה על כל סוג פריט
  for (const [type, color] of Object.entries(colors)) {
    if (!color || type === 'coat') continue;

    // 1. קבל תבנית חיפוש משופרת לפי אירוע
    const categoryPattern = getCategoryPattern(type, occasion);
    
    if (!categoryPattern) continue;

    // 2. פצל לתנאי OR מרובים
    const terms = categoryPattern.split('|');
    const orConditions = terms.map(term =>
      `product_family.ilike.%${term}%,product_name.ilike.%${term}%`
    ).join(',');

    // 3. קבל תבנית דחייה
    const excludePattern = getExcludePattern(occasion, type);

    try {
      // 4. חיפוש משופר עם דחייה מראש
      const { data: items, error } = await supabase
        .from('zara_cloth')
        .select('id, product_name, price, colour, image, product_family, product_subfamily, url')
        .or(orConditions)
        .not('product_family', 'ilike', excludePattern)
        .not('product_subfamily', 'ilike', excludePattern)
        .limit(12); // קצת יותר פריטים למקרה של סינון נוסף

      if (error) {
        logger.error(`❌ [findMatchingClothingItems] שגיאה בחיפוש ${type}:`, {
          context: 'findMatchingClothingItems',
          data: error
        });
        continue;
      }

      if (items && items.length > 0) {
        logger.info(`✅ [findMatchingClothingItems] נמצאו ${items.length} פריטי ${type}`, {
          context: 'findMatchingClothingItems',
          data: {
            id: items[0].id,
            productName: items[0].product_name,
            imageType: typeof items[0].image,
            color: items[0].colour
          }
        });

        // המרה לפורמט הנכון
        result[type] = items.map(item => {
          const imageUrl = extractImageUrl(item.image, type);
          
          return {
            id: item.id,
            name: item.product_name,
            type,
            price: `₪${item.price}`,
            image: imageUrl,
            color: item.colour,
            url: item.url
          };
        });
      }
    } catch (error) {
      logger.error(`❌ [findMatchingClothingItems] שגיאה בחיפוש ${type}:`, {
        context: 'findMatchingClothingItems',
        data: error
      });
    }
  }

  return result;
}
