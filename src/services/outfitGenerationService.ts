
import { supabase } from "@/lib/supabaseClient";
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
 * @param bodyStructure The user's body structure type
 * @param mood The desired mood for the outfit
 * @param style The preferred clothing style
 * @returns A promise containing the outfit suggestion response
 */
export const generateOutfit = async (
  bodyStructure: BodyStructure,
  mood: string,
  style: StylePreference
): Promise<OutfitResponse> => {
  try {
    logger.info("Generating outfit recommendations", {
      context: "outfitGenerationService",
      data: { bodyStructure, mood, style }
    });

    // Call the Supabase Edge Function to generate outfit
    const response = await supabase.functions.invoke('generate-outfit', {
      body: { bodyStructure, mood, style }
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
    '#000000': 'Black',
    '#FFFFFF': 'White',
    '#FF0000': 'Red',
    '#00FF00': 'Green',
    '#0000FF': 'Blue',
    '#FFFF00': 'Yellow',
    '#FF00FF': 'Magenta',
    '#00FFFF': 'Cyan',
    '#C0C0C0': 'Silver',
    '#808080': 'Gray',
    '#800000': 'Maroon',
    '#808000': 'Olive',
    '#008000': 'Green',
    '#800080': 'Purple',
    '#008080': 'Teal',
    '#000080': 'Navy',
    '#FFA500': 'Orange',
    '#A52A2A': 'Brown',
    '#FFC0CB': 'Pink',
    '#F5F5DC': 'Beige'
  };

  // Normalize hex to uppercase
  const normalizedHex = hex.toUpperCase();
  
  // Return the mapped color name or the hex code if not found
  return colorMap[normalizedHex] || hex;
};
