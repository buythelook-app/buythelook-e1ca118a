import { supabase } from "@/lib/supabaseClient";
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
 * Extract shoe image without model (usually second-to-last image)
 */
function getShoeImageWithoutModel(imageData: any): string {
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
    
    // For shoes, prefer second-to-last image (usually without model)
    if (images.length >= 2) {
      return images[images.length - 2];
    }
    
    return images[0] || '/placeholder.svg';
  } catch (error) {
    console.error('Error extracting shoe image:', error);
    return '/placeholder.svg';
  }
}

/**
 * Extract the first image URL from the image JSON field
 * This function handles different JSON structures to find the first valid image URL
 * @param imageJson The image JSON data from the database
 * @param itemType Optional item type for special handling (e.g., 'shoes')
 * @returns The first image URL or a placeholder
 */
export function extractImageUrl(imageJson: any, itemType?: string): string {
  // For shoes, use special logic to get image without model
  if (itemType === 'shoes' || itemType === 'נעליים') {
    return getShoeImageWithoutModel(imageJson);
  }
  
  try {
    // Case 1: If imageJson is a string (direct URL)
    if (typeof imageJson === 'string') {
      return imageJson;
    }
    
    // Case 2: If imageJson is null or undefined
    if (!imageJson) {
      return '/placeholder.svg';
    }
    
    // Case 3: If imageJson is an array, take the first element
    if (Array.isArray(imageJson)) {
      if (imageJson.length > 0) {
        // If first element is a string (URL), return it
        if (typeof imageJson[0] === 'string') {
          return imageJson[0];
        }
        // If first element is an object with a url property
        if (typeof imageJson[0] === 'object' && imageJson[0] && imageJson[0].url) {
          return imageJson[0].url;
        }
      }
      return '/placeholder.svg';
    }
    
    // Case 4: If imageJson is an object with urls array
    if (typeof imageJson === 'object' && imageJson.urls && Array.isArray(imageJson.urls)) {
      return imageJson.urls[0] || '/placeholder.svg';
    }
    
    // Case 5: If imageJson is an object with url property
    if (typeof imageJson === 'object' && imageJson.url) {
      return imageJson.url;
    }

    // Case 6: If imageJson is an object with images array
    if (typeof imageJson === 'object' && imageJson.images && Array.isArray(imageJson.images)) {
      return imageJson.images[0] || '/placeholder.svg';
    }
    
    // Case 7: Search for any string property that looks like a URL
    if (typeof imageJson === 'object') {
      for (const key of Object.keys(imageJson)) {
        const value = imageJson[key];
        if (typeof value === 'string' && 
            (value.startsWith('http') || value.startsWith('/') || 
             value.includes('image') || value.includes('.jpg') || 
             value.includes('.png') || value.includes('.webp'))) {
          return value;
        }
        
        // Check for nested arrays of strings
        if (Array.isArray(value) && value.length > 0) {
          if (typeof value[0] === 'string') {
            return value[0];
          }
        }
      }
    }
    
    // Log the structure for debugging
    logger.debug("Unable to extract image URL, JSON structure:", {
      context: "extractImageUrl",
      data: JSON.stringify(imageJson).substring(0, 200) + '...'
    });
    
    return '/placeholder.svg';
  } catch (error) {
    logger.error("Error extracting image URL", {
      context: "extractImageUrl",
      data: error
    });
    return '/placeholder.svg';
  }
}

/**
 * Find clothing items matching the recommended colors from the agent
 * @param colors Record of item types to hex colors
 * @returns A record of item types to matching clothing items
 */
export async function findMatchingClothingItems(colors: Record<string, string>): Promise<Record<string, any[]>> {
  try {
    logger.info("Finding matching clothing items for colors", {
      context: "outfitGenerationService",
      data: colors
    });
    
    const result: Record<string, any[]> = {};
    
    // For each item type (top, bottom, shoes), find matching items by color
    for (const [type, hexColor] of Object.entries(colors)) {
      if (!hexColor) continue;
      
      // Convert hex color to color name for database search
      const colorName = getColorName(hexColor);
      
      // Map item types to database categories (English/Spanish as data is in those languages)
      let categoryPattern = '';
      if (type === 'top') {
        categoryPattern = 'CAMISA|BLOUSE|TOP|SHIRT|CAMISETA';
      } else if (type === 'bottom') {
        categoryPattern = 'PANTALON|PANTS|JEAN|FALDA|SKIRT|BERMUDA';
      } else if (type === 'shoes') {
        categoryPattern = 'ZAPATO|SHOE|SANDAL|BOOT|BOTA';
      } else if (type === 'coat') {
        categoryPattern = 'CHAQUETA|JACKET|COAT|ABRIGO|CHALECO|BLAZER';
      }
      
      if (!categoryPattern) continue;
      
      // Search by product_family which contains category in English/Spanish
      const { data: items, error } = await supabase
        .from('zara_cloth')
        .select('id, product_name, price, colour, image, product_family, product_subfamily')
        .or(`product_family.ilike.%${categoryPattern}%,product_name.ilike.%${categoryPattern}%`)
        .not('product_family', 'ilike', '%maquillaje%')
        .not('product_family', 'ilike', '%perfume%')
        .not('product_subfamily', 'ilike', '%cosm%')
        .limit(10);
      
      if (error) {
        logger.error(`Error finding ${type} items:`, {
          context: "outfitGenerationService",
          data: error
        });
        continue;
      }
      
      // Log information about the first item for debugging
      if (items.length > 0) {
        logger.info(`First ${type} item data:`, {
          context: "findMatchingClothingItems",
          data: {
            id: items[0].id,
            productName: items[0].product_name,
            imageType: typeof items[0].image,
            color: items[0].colour
          }
        });
      }
      
      // Map the results to the return format, extracting image URLs
      result[type] = items.map(item => {
        const imageUrl = extractImageUrl(item.image, type); // Pass type for shoe logic
        
        logger.info(`Extracted image URL for ${item.product_name}:`, {
          context: "findMatchingClothingItems",
          data: {
            id: item.id,
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
}
