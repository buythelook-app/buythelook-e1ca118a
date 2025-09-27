import { supabase } from '../lib/supabaseClient';
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
      
      // Log Supabase client information for debugging - use hardcoded URL
      logger.debug('Using Supabase client with URL:', { 
        context: "ProfileFetcherTool", 
        data: {
          url: 'https://mwsblnposuyhrgzrtoyo.supabase.co'
        }
      });
      
      // Fetch product data from Supabase with additional logging
      logger.debug('About to query zara_cloth table', { context: "ProfileFetcherTool" });
      
      const { data: productData, error: productError } = await supabase
        .from('zara_cloth')
        .select('product_name, price, colour, description, size, materials, availability')
        .not('image', 'is', null)
        .neq('availability', false)
        // סינון מוצרי יופי וקוסמטיקה לחלוטין
        .not('product_family', 'ilike', '%maquillaje%')
        .not('product_family', 'ilike', '%cologne%')
        .not('product_family', 'ilike', '%perfume%')
        .not('product_family', 'ilike', '%borlas%')
        .not('product_family', 'ilike', '%esmalte%')
        .not('product_subfamily', 'ilike', '%cosm%')
        .not('product_subfamily', 'ilike', '%perfu%')
        // העדפה לפריטי בגדים אמיתיים
        .in('product_family', ['VESTIDO', 'CAMISA', 'PANTALON', 'FALDA', 'TOPS Y OTRAS P.', 'BERMUDA', 'BLASIER', 'CHALECO', 'CAMISETA', 'JERSEY', 'MONO', 'CAZADORA', 'ABRIGO'])
        .limit(50);

      if (productError) {
        logger.error('Error fetching product data:', { context: "ProfileFetcherTool", data: productError });
        
        // Try a simpler query to see if the table exists
        const { error: checkError, count } = await supabase
          .from('zara_cloth')
          .select('*', { count: 'exact', head: true });
          
        if (checkError) {
          logger.error('Table check failed:', { context: "ProfileFetcherTool", data: checkError });
        } else {
          logger.info('Table exists with count:', { context: "ProfileFetcherTool", data: count });
        }
        
        return {
          success: false,
          error: `Failed to fetch product data: ${productError.message}`
        };
      }

      logger.info('Successfully retrieved product data:', { 
        context: "ProfileFetcherTool", 
        data: { count: productData?.length || 0 }
      });

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
