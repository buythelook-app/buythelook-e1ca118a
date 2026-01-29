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
 * HEX to Color Name Mapping - comprehensive mapping for database search
 * Maps HEX codes to color names that exist in the zara_cloth database
 */
const HEX_TO_COLOR_NAME: Record<string, string[]> = {
  // Blacks
  '#000000': ['negro', 'black', 'noir'],
  '#1A1A1A': ['negro', 'black', 'antracita'],
  '#2D2D2D': ['negro', 'antracita', 'gris oscuro'],
  '#1C2541': ['navy', 'marino', 'azul marino'],
  
  // Whites & Creams
  '#FFFFFF': ['blanco', 'white', 'crudo'],
  '#FAFAFA': ['blanco', 'crudo', 'off-white'],
  '#F5F5DC': ['beige', 'crudo', 'arena'],
  '#FFFFF0': ['marfil', 'ivory', 'crudo'],
  '#FAF0E6': ['lino', 'crudo', 'natural'],
  '#FDF5E6': ['crema', 'crudo', 'beige'],
  
  // Grays
  '#4A4A4A': ['gris', 'antracita', 'marengo'],
  '#6B6B6B': ['gris', 'grey', 'gris medio'],
  '#808080': ['gris', 'grey', 'gris medio'],
  '#A8A8A8': ['gris claro', 'silver', 'gris'],
  '#C0C0C0': ['plata', 'silver', 'gris claro'],
  '#708090': ['gris', 'pizarra', 'slate'],
  
  // Blues
  '#2C3E50': ['marino', 'navy', 'azul oscuro'],
  '#34495E': ['azul grisaceo', 'navy', 'marino'],
  '#000080': ['marino', 'navy', 'azul marino'],
  '#4169E1': ['azul', 'blue', 'royal'],
  '#6495ED': ['azul', 'celeste', 'cornflower'],
  '#87CEEB': ['celeste', 'azul claro', 'sky blue'],
  '#00BFFF': ['turquesa', 'azul', 'celeste'],
  '#1E90FF': ['azul', 'blue', 'royal'],
  
  // Greens
  '#2E4A3E': ['verde', 'verde oscuro', 'forest'],
  '#556B2F': ['oliva', 'verde oliva', 'khaki'],
  '#6B8E23': ['oliva', 'verde', 'khaki'],
  '#8FBC8F': ['verde', 'sage', 'verde claro'],
  '#008000': ['verde', 'green', 'verde oscuro'],
  '#808000': ['oliva', 'khaki', 'verde'],
  '#20B2AA': ['turquesa', 'verde agua', 'teal'],
  '#3CB371': ['verde', 'green', 'esmeralda'],
  '#32CD32': ['verde', 'lime', 'verde lima'],
  
  // Browns & Beiges
  '#5D4E37': ['camel', 'marron', 'brown'],
  '#8B4513': ['marron', 'brown', 'tabaco'],
  '#A0522D': ['marron', 'siena', 'tabaco'],
  '#D2B48C': ['beige', 'tan', 'camel'],
  '#DEB887': ['beige', 'camel', 'arena'],
  '#CD853F': ['marron', 'camel', 'peru'],
  '#8B7355': ['marron', 'brown', 'nuez'],
  '#D4C4A8': ['beige', 'khaki', 'arena'],
  '#C2B8A3': ['piedra', 'stone', 'beige'],
  '#E8DCD0': ['greige', 'beige', 'gris'],
  '#D3C4B5': ['taupe', 'beige', 'gris'],
  
  // Reds & Burgundy
  '#722F37': ['burdeos', 'burgundy', 'granate'],
  '#800000': ['burdeos', 'granate', 'maroon'],
  '#B22222': ['rojo', 'red', 'granate'],
  '#FF0000': ['rojo', 'red', 'vermelho'],
  '#FF4500': ['naranja', 'rojo', 'coral'],
  '#DC143C': ['rojo', 'carmesi', 'red'],
  
  // Pinks
  '#FFB6C1': ['rosa', 'pink', 'rosa claro'],
  '#FFC0CB': ['rosa', 'pink', 'rosa claro'],
  '#FF69B4': ['rosa', 'fucsia', 'hot pink'],
  '#FF1493': ['fucsia', 'rosa', 'magenta'],
  '#DB7093': ['rosa', 'pink', 'rosa palo'],
  '#C71585': ['magenta', 'fucsia', 'rosa'],
  
  // Purples
  '#800080': ['morado', 'purple', 'purpura'],
  '#9400D3': ['morado', 'violeta', 'purple'],
  '#8A2BE2': ['morado', 'violeta', 'blue violet'],
  '#4B0082': ['indigo', 'morado', 'azul oscuro'],
  '#E6E6FA': ['lavanda', 'lila', 'lavender'],
  '#DDA0DD': ['ciruela', 'plum', 'lila'],
  '#D8BFD8': ['lila', 'lavanda', 'thistle'],
  
  // Oranges & Yellows
  '#FFA500': ['naranja', 'orange', 'mandarina'],
  '#FF6347': ['coral', 'naranja', 'tomate'],
  '#FFFF00': ['amarillo', 'yellow'],
  '#FFD700': ['dorado', 'oro', 'gold'],
  '#FFDAB9': ['melocoton', 'peach', 'rosa'],
  
  // Turquoise & Teal
  '#00CED1': ['turquesa', 'teal', 'verde agua'],
  '#008080': ['teal', 'turquesa', 'verde azulado'],
  '#40E0D0': ['turquesa', 'aqua', 'verde agua'],
};

/**
 * Convert a hex color to searchable color names for database queries
 * @param hex The hex color code
 * @returns An array of color names to search for
 */
export function hexToColorNames(hex: string): string[] {
  const normalizedHex = hex.toUpperCase();
  
  // Direct match
  if (HEX_TO_COLOR_NAME[normalizedHex]) {
    return HEX_TO_COLOR_NAME[normalizedHex];
  }
  
  // Find closest color by calculating color distance
  const hexToRgb = (h: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
    return result 
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  };
  
  const colorDistance = (hex1: string, hex2: string): number => {
    const [r1, g1, b1] = hexToRgb(hex1);
    const [r2, g2, b2] = hexToRgb(hex2);
    return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
  };
  
  let closestHex = '#000000';
  let minDistance = Infinity;
  
  for (const knownHex of Object.keys(HEX_TO_COLOR_NAME)) {
    const distance = colorDistance(normalizedHex, knownHex);
    if (distance < minDistance) {
      minDistance = distance;
      closestHex = knownHex;
    }
  }
  
  return HEX_TO_COLOR_NAME[closestHex] || ['negro'];
}

/**
 * Convert a hex color to a human-readable color name (Hebrew)
 * @param hex The hex color code
 * @returns A human-readable color name
 */
export function getColorName(hex: string): string {
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

  const normalizedHex = hex.toUpperCase();
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
 * מוסיף מילות מפתח נוספות לחיפוש רחב יותר
 */
function getCategoryPattern(type: string, occasion?: string): string {
  const basePatterns: Record<string, string> = {
    'top': 'CAMISETA|BLUSA|CAMISA|TOP|JERSEY|SUDADERA',
    'bottom': 'PANTALON|FALDA|VAQUERO|JEANS|SHORT',
    'shoes': 'ZAPATO|BOTA|SHOE|BOOT|SANDAL|DEPORTIVA',
    'coat': 'CAZADORA|ABRIGO|CHALECO|JACKET|COAT|BLAZER'
  };

  let pattern = basePatterns[type] || '';

  // הוספת דגש לפי אירוע (בנוסף לחיפוש הבסיסי, לא במקומו)
  if (occasion === 'Work' && type === 'top') {
    pattern += '|BLAZER|AMERICANA|FORMAL';
  } else if (occasion === 'Evening' && type === 'top') {
    pattern += '|VESTIDO|ELEGANTE|FIESTA';
  }

  return pattern;
}

/**
 * מחזיר תבנית דחייה בסיסית - רק פריטים שברור ש-100% לא בגדים
 */
function getBasicExcludePattern(): string {
  return '%maquillaje%|%perfume%|%fragancia%|%cosmetico%';
}

/**
 * Find clothing items matching the recommended colors from the agent
 * NOW ACTUALLY USES COLOR MATCHING! 🎨
 * @param colors Record of item types to hex colors
 * @param occasion Optional occasion for better filtering
 * @returns A record of item types to matching clothing items
 */
export async function findMatchingClothingItems(
  colors: Record<string, string>,
  occasion?: string
): Promise<Record<string, any[]>> {
  
  logger.info('🔍 [findMatchingClothingItems] Starting search WITH COLOR MATCHING', {
    context: 'findMatchingClothingItems',
    data: { colors, occasion }
  });

  const result: Record<string, any[]> = {
    top: [],
    bottom: [],
    shoes: [],
    coat: []
  };

  const excludePattern = getBasicExcludePattern();

  for (const [type, hexColor] of Object.entries(colors)) {
    if (!hexColor || type === 'coat') continue;

    // 🎨 NEW: Convert HEX to searchable color names
    const colorNames = hexToColorNames(hexColor);
    
    logger.info(`🎨 [findMatchingClothingItems] ${type}: HEX ${hexColor} → Colors: ${colorNames.join(', ')}`, {
      context: 'findMatchingClothingItems',
      data: { type, hexColor, colorNames }
    });

    const categoryPattern = getCategoryPattern(type, occasion);
    if (!categoryPattern) continue;

    const categoryTerms = categoryPattern.split('|');
    const categoryConditions = categoryTerms.map(term =>
      `product_family.ilike.%${term}%,product_name.ilike.%${term}%`
    ).join(',');

    try {
      // 🎨 PHASE 1: Try to find items matching BOTH category AND color
      let matchedItems: any[] = [];
      
      for (const colorName of colorNames) {
        if (matchedItems.length >= 5) break; // We have enough items
        
        const { data: colorMatchedItems, error: colorError } = await supabase
          .from('zara_cloth')
          .select('id, product_name, price, colour, image, product_family, product_subfamily, url')
          .or(categoryConditions)
          .ilike('colour', `%${colorName}%`)
          .not('product_family', 'ilike', excludePattern)
          .limit(5);

        if (!colorError && colorMatchedItems && colorMatchedItems.length > 0) {
          logger.info(`✅ [findMatchingClothingItems] Found ${colorMatchedItems.length} ${type} items matching color "${colorName}"`, {
            context: 'findMatchingClothingItems',
            data: { colorName, count: colorMatchedItems.length }
          });
          
          // Add unique items only
          for (const item of colorMatchedItems) {
            if (!matchedItems.find(m => m.id === item.id)) {
              matchedItems.push(item);
            }
          }
        }
      }

      // 🎨 PHASE 2: If no color matches, fall back to category-only (but log warning)
      if (matchedItems.length === 0) {
        logger.warn(`⚠️ [findMatchingClothingItems] No color match for ${type} (${hexColor}), falling back to category-only`, {
          context: 'findMatchingClothingItems',
          data: { type, hexColor, colorNames }
        });
        
        const { data: fallbackItems, error: fallbackError } = await supabase
          .from('zara_cloth')
          .select('id, product_name, price, colour, image, product_family, product_subfamily, url')
          .or(categoryConditions)
          .not('product_family', 'ilike', excludePattern)
          .limit(10);

        if (!fallbackError && fallbackItems) {
          matchedItems = fallbackItems;
        }
      }

      if (matchedItems.length > 0) {
        logger.info(`✅ [findMatchingClothingItems] Total ${matchedItems.length} ${type} items found`, {
          context: 'findMatchingClothingItems',
          data: {
            type,
            requestedColor: hexColor,
            foundColors: matchedItems.slice(0, 3).map(i => i.colour)
          }
        });

        // Validate and transform items
        result[type] = matchedItems
          .filter(item => {
            const productName = (item.product_name || '').toUpperCase();
            const productFamily = (item.product_family || '').toUpperCase();
            
            const isDress = productName.includes('VESTIDO') || 
                           productName.includes('DRESS') ||
                           productFamily.includes('VESTIDO') ||
                           productFamily.includes('DRESS');
            
            if (type === 'top') {
              if (isDress) return false;
              if (productName.includes('PANTALON') || productName.includes('FALDA') || 
                  productFamily.includes('PANTALON') || productFamily.includes('FALDA')) {
                return false;
              }
            } else if (type === 'bottom') {
              if (isDress) return false;
              if (productName.includes('CAMISETA') || productName.includes('BLUSA') || 
                  productFamily.includes('CAMISETA') || productFamily.includes('BLUSA')) {
                return false;
              }
            } else if (type === 'shoes') {
              if (!productName.includes('ZAPATO') && !productName.includes('BOTA') && 
                  !productName.includes('SHOE') && !productName.includes('SANDAL') &&
                  !productFamily.includes('ZAPATO') && !productFamily.includes('BOTA')) {
                return false;
              }
            }
            
            return true;
          })
          .map(item => {
            const imageUrl = extractImageUrl(item.image, type);
            
            return {
              id: item.id,
              name: item.product_name,
              type,
              price: `₪${item.price}`,
              image: imageUrl,
              color: item.colour,
              url: item.url,
              matchedHex: hexColor // 🎨 Track which HEX color this was matched for
            };
          });
      }
    } catch (error) {
      logger.error(`❌ [findMatchingClothingItems] Error searching ${type}`, {
        context: 'findMatchingClothingItems',
        data: error
      });
    }
  }

  // Log final summary
  logger.info('🎨 [findMatchingClothingItems] SEARCH COMPLETE', {
    context: 'findMatchingClothingItems',
    data: {
      requestedColors: colors,
      foundItems: {
        top: result.top.length,
        bottom: result.bottom.length,
        shoes: result.shoes.length
      },
      colorMatches: {
        top: result.top.slice(0, 2).map(i => ({ name: i.name, color: i.color })),
        bottom: result.bottom.slice(0, 2).map(i => ({ name: i.name, color: i.color })),
        shoes: result.shoes.slice(0, 2).map(i => ({ name: i.name, color: i.color }))
      }
    }
  });

  return result;
}
