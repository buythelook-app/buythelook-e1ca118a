
import { supabase } from '../integrations/supabase/client'; // שימוש בלקוח הסופהבייס המרכזי
import logger from "../lib/logger";

/**
 * Tool for fetching user profile data and product information
 * Retrieves style preferences, body measurements, and product data
 */
export const ProfileFetcherTool = {
  name: "ProfileFetcherTool",
  description: "Fetches user profile details and product data from the database",
  
  execute: async (userId: string) => {
    logger.info(`Fetching profile for user: ${userId}`, { context: "ProfileFetcherTool" });
    
    try {
      // Get stored data from localStorage if available (keeping existing functionality)
      const styleAnalysis = localStorage.getItem('styleAnalysis') ? 
        JSON.parse(localStorage.getItem('styleAnalysis')!) : null;
      
      const currentMood = localStorage.getItem('current-mood');
      
      // Fetch product data from Supabase
      const { data: productData, error: productError } = await supabase
        .from('zara_cloth')
        .select('product_name, price, colour, description, size, materials, availability');

      if (productError) {
        logger.error('Error fetching product data:', { context: "ProfileFetcherTool", data: productError });
        return {
          success: false,
          error: `Failed to fetch product data: ${productError.message}`
        };
      }

      return {
        success: true,
        data: {
          userId: userId,
          style: styleAnalysis?.analysis?.styleProfile || "Classic",
          bodyType: styleAnalysis?.analysis?.bodyShape || "Hourglass",
          mood: currentMood || "Romantic",
          products: productData || []
        }
      };
    } catch (error) {
      logger.error('Error in ProfileFetcherTool:', { context: "ProfileFetcherTool", data: error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user profile and products'
      };
    }
  },
  
  // Add run method as an alias to execute for compatibility with both interfaces
  run: async (input: { userId: string }) => {
    logger.info("Running profile fetcher via run() method", { context: "ProfileFetcherTool" });
    const result = await ProfileFetcherTool.execute(input.userId);
    return result.success ? result.data.products : [];
  }
};
