
import { supabase } from "@/integrations/supabase/client";
import logger from "./logger";

/**
 * Tests the Supabase connection and logs the results
 * Used for debugging connection issues
 */
export const testSupabaseConnection = async () => {
  logger.info("Testing Supabase connection...", { context: "supabaseTest" });
  
  try {
    // Log the Supabase client information without accessing protected properties
    logger.debug("Supabase client info:", {
      context: "supabaseTest", 
      data: {
        url: "https://mwsblnposuyhrgzrtoyo.supabase.co",
        auth: !!supabase.auth,
        from: !!supabase.from
      }
    });
    
    // Try to access the zara_cloth table to check if it exists
    const { error: tableError, count } = await supabase
      .from('zara_cloth')
      .select('*', { count: 'exact', head: true });
      
    if (tableError) {
      logger.error("Failed to access zara_cloth table:", {
        context: "supabaseTest",
        data: tableError
      });
      
      // Instead of trying to list tables (which doesn't work with typed client),
      // just log the error and check if other tables are accessible
      try {
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true });
          
        if (itemsError) {
          logger.error("Failed to access items table as well:", {
            context: "supabaseTest",
            data: itemsError
          });
        } else {
          logger.info("Successfully connected to items table:", {
            context: "supabaseTest",
            data: { count: itemsData?.length ?? 0 }
          });
        }
      } catch (innerError) {
        logger.error("Error checking alternative tables:", {
          context: "supabaseTest",
          data: innerError
        });
      }
      
      return {
        success: false,
        error: tableError.message
      };
    }
    
    logger.info("Successfully connected to Supabase and zara_cloth table:", {
      context: "supabaseTest",
      data: { rowCount: count }
    });
    
    return {
      success: true,
      tableCount: count
    };
    
  } catch (error) {
    logger.error("Error testing Supabase connection:", {
      context: "supabaseTest",
      data: error
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
