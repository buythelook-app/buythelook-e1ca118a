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
 * Extract the first image URL from the image JSON field
 * @param imageJson The image JSON object from the database
 * @returns The first image URL or a placeholder
 */
export const extractImageUrl = (imageJson: any): string => {
  try {
    // Log the structure for debugging
    const structureInfo = inspectImageStructure(imageJson);
    logger.info("Image structure analysis:", {
      context: "extractImageUrl",
      data: structureInfo
    });
    
    // Check if imageJson is a string (could be a direct URL)
    if (typeof imageJson === 'string') {
      return imageJson;
    }
    
    // If it's an array, take the first element
    if (Array.isArray(imageJson)) {
      return imageJson[0] || '/placeholder.svg';
    }
    
    // If it has a urls property that is an array
    if (imageJson && typeof imageJson === 'object') {
      if (imageJson.urls && Array.isArray(imageJson.urls)) {
        return imageJson.urls[0] || '/placeholder.svg';
      }
      
      // Check if it has a 'paths' property which is common in some image storage systems
      if (imageJson.paths && Array.isArray(imageJson.paths)) {
        return imageJson.paths[0] || '/placeholder.svg';
      }
      
      // Check if it has a url property
      if (imageJson.url) {
        return imageJson.url;
      }
      
      // Check specifically for image property in case the structure is nested
      if (imageJson.image) {
        if (typeof imageJson.image === 'string') {
          return imageJson.image;
        }
        if (Array.isArray(imageJson.image)) {
          return imageJson.image[0] || '/placeholder.svg';
        }
      }
      
      // If it's a complex object, try to find any property that might be a URL
      for (const key of Object.keys(imageJson)) {
        const value = imageJson[key];
        if (typeof value === 'string' && 
            (value.startsWith('http') || value.startsWith('/'))) {
          return value;
        }
        
        // Check if the value is an array of strings
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
          return value[0];
        }
      }
    }
    
    // If nothing works, return placeholder and log the structure
    logger.warn("Could not extract image URL from data", {
      context: "extractImageUrl",
      data: imageJson ? JSON.stringify(imageJson).substring(0, 200) + '...' : 'null'
    });
    
    return '/placeholder.svg';
  } catch (error) {
    logger.error("Error extracting image URL", {
      context: "extractImageUrl",
      data: error
    });
    return '/placeholder.svg';
  }
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
      
      // Log the first item's image data for debugging
      if (items.length > 0) {
        logger.info(`First ${type} item image data:`, {
          context: "findMatchingClothingItems",
          data: {
            id: items[0].id,
            productName: items[0].product_name,
            imageType: typeof items[0].image,
            imagePreview: JSON.stringify(items[0].image).substring(0, 200) + '...'
          }
        });
      }
      
      // מיפוי התוצאות לפורמט המוחזר
      result[type] = items.map(item => {
        const imageUrl = extractImageUrl(item.image);
        
        // Log the extracted URL for debugging
        logger.info(`Extracted image URL for ${item.product_name}:`, {
          context: "findMatchingClothingItems",
          data: {
            id: item.id,
            originalImage: typeof item.image,
            extractedUrl: imageUrl
          }
        });
        
        return {
          id: item.id,
          name: item.product_name,
          type,
          price: `₪${item.price}`,
          image: imageUrl,
          color: item.colour
        };
      });
      
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
