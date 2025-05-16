
import { supabase } from "@/integrations/supabase/client";
import logger from "./logger";

/**
 * Tests the Supabase connection and logs the results
 * Used for debugging connection issues
 */
export const testSupabaseConnection = async () => {
  logger.info("Testing Supabase connection...", { context: "supabaseTest" });
  
  try {
    // Log the Supabase client information
    logger.debug("Supabase client info:", {
      context: "supabaseTest", 
      data: {
        url: supabase.getUrl ? supabase.getUrl() : "URL method not available",
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
      
      // Check if the table exists by listing all tables
      const { data: tables, error: tablesError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
        
      if (tablesError) {
        logger.error("Failed to list tables:", {
          context: "supabaseTest",
          data: tablesError
        });
      } else {
        logger.info("Available tables in public schema:", {
          context: "supabaseTest",
          data: tables
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
