
import { supabase } from "@/lib/supabaseClient"; // שימוש בלקוח הסופהבייס המרכזי
import logger from "@/lib/logger";
import { OutfitResponse } from "@/types/outfitTypes";

// Define the types for request parameters
export type BodyStructure = 'X' | 'V' | 'H' | 'O' | 'A';
export type StylePreference = 'classic' | 'romantic' | 'minimalist' | 'casual' | 'boohoo' | 'sporty';

// Interface for the outfit generation request
interface OutfitGenerationRequest {
  bodyStructure: BodyStructure;
  mood: string;
  style: StylePreference;
}

/**
 * Generate outfit suggestions using the Fashion Outfit Generator API
 * @param request The outfit generation request containing bodyStructure, mood, and style
 * @returns A promise containing the outfit suggestion response
 */
export const generateOutfit = async (
  request: OutfitGenerationRequest
): Promise<OutfitResponse> => {
  try {
    logger.info("Generating outfit recommendations", {
      context: "outfitGenerationService",
      data: request
    });

    // Call the Supabase Edge Function to generate outfit
    const response = await supabase.functions.invoke('generate-outfit', {
      body: request
    });

    if (response.error) {
      logger.error("Error from outfit generator API", {
        context: "outfitGenerationService",
        data: response.error
      });
      
      return {
        success: false,
        error: response.error.message || "Failed to generate outfit"
      };
    }

    // Store the generated outfit data for later use
    if (response.data && response.data.success) {
      localStorage.setItem('last-outfit-data', JSON.stringify(response.data.data[0] || {}));
      
      // Track color palette for easier access
      const colorData = response.data.data[0];
      if (colorData) {
        const colors = {
          top: colorData.top,
          bottom: colorData.bottom,
          shoes: colorData.shoes,
          coat: colorData.coat
        };
        localStorage.setItem('outfit-colors', JSON.stringify(colors));
      }
    }

    logger.info("Outfit generation completed", {
      context: "outfitGenerationService",
      data: { success: response.data?.success }
    });

    return response.data as OutfitResponse;
  } catch (error) {
    logger.error("Exception generating outfit", {
      context: "outfitGenerationService",
      data: error
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

/**
 * Get style recommendations from the last generated outfit
 * @returns An array of recommendation strings
 */
export const getStyleRecommendations = (): string[] => {
  try {
    const outfitData = localStorage.getItem('last-outfit-data');
    if (!outfitData) return [];
    
    const parsedData = JSON.parse(outfitData);
    return parsedData.recommendations || [];
  } catch (error) {
    logger.error("Error retrieving style recommendations", {
      context: "outfitGenerationService",
      data: error
    });
    return [];
  }
};

/**
 * Get the color palette from the last generated outfit
 * @returns An object containing color hex codes
 */
export const getOutfitColors = (): Record<string, string> => {
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
};

/**
 * Convert a hex color to a human-readable color name
 * @param hex The hex color code
 * @returns A human-readable color name
 */
export const getColorName = (hex: string): string => {
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
};

// פונקציה חדשה למציאת פריטי לבוש שמתאימים לצבעים המומלצים על ידי האייג'נטים
export const findMatchingClothingItems = async (colors: Record<string, string>): Promise<Record<string, any[]>> => {
  try {
    logger.info("Finding matching clothing items for colors", {
      context: "outfitGenerationService",
      data: colors
    });
    
    const result: Record<string, any[]> = {};
    
    // עבור כל סוג פריט, מחפשים פריטים מתאימים לפי צבע
    for (const [type, hexColor] of Object.entries(colors)) {
      if (!hexColor) continue;
      
      // המרת צבע ההקס לשם צבע לחיפוש בדאטאבייס
      const colorName = getColorName(hexColor);
      
      // מיפוי סוגי פריטים לקטגוריות בדאטאבייס
      let categoryPattern = '';
      if (type === 'top') {
        categoryPattern = 'חולצ|טופ|עליון';
      } else if (type === 'bottom') {
        categoryPattern = 'מכנס|חצאית|תחתון';
      } else if (type === 'shoes') {
        categoryPattern = 'נעל|סנדל';
      } else if (type === 'coat') {
        categoryPattern = 'ז\'קט|מעיל|עליון';
      }
      
      if (!categoryPattern) continue;
      
      // חיפוש פריטים בצבע דומה ובקטגוריה המתאימה
      const { data: items, error } = await supabase
        .from('zara_cloth')
        .select('*')
        .or(`product_name.ilike.%${categoryPattern}%,description.ilike.%${categoryPattern}%,product_family.ilike.%${categoryPattern}%`)
        .or(`colour.ilike.%${colorName}%,description.ilike.%${colorName}%`)
        .limit(5);
      
      if (error) {
        logger.error(`Error finding ${type} items:`, {
          context: "outfitGenerationService",
          data: error
        });
        continue;
      }
      
      // מיפוי התוצאות לפורמט המוחזר
      result[type] = items.map(item => ({
        id: item.id,
        name: item.product_name,
        type,
        price: `₪${item.price}`,
        image: item.image || '/placeholder.svg',
        color: item.colour
      }));
      
      logger.info(`Found ${result[type].length} ${type} items matching ${colorName}`, {
        context: "outfitGenerationService"
      });
    }
    
    return result;
  } catch (error) {
    logger.error("Error finding matching clothing items", {
      context: "outfitGenerationService",
      data: error
    });
    return {};
  }
};
