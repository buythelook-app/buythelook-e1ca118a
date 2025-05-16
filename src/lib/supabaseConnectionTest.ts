
import { supabase } from "@/lib/supabaseClient";
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
