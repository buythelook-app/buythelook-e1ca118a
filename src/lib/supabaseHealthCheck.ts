
import { supabase } from "@/integrations/supabase/client";
import logger from "./logger";

/**
 * Utility to check Supabase health and accessibility
 * Provides methods to verify connection and table access
 */
export const supabaseHealth = {
  /**
   * Check if a specific table exists and is accessible
   */
  checkTableAccess: async (tableName: string): Promise<boolean> => {
    try {
      logger.debug(`Checking access to ${tableName} table`, { context: "supabaseHealth" });
      
      // We need to use type assertion since we're using a dynamic table name
      const { error } = await supabase
        .from(tableName as any)
        .select('*', { count: 'exact', head: true });
        
      if (error) {
        logger.error(`Cannot access ${tableName} table:`, { 
          context: "supabaseHealth", 
          data: error 
        });
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error(`Error checking ${tableName} table:`, { 
        context: "supabaseHealth", 
        data: error 
      });
      return false;
    }
  },
  
  /**
   * Log Supabase client information for debugging
   */
  logClientInfo: () => {
    logger.debug("Supabase client information:", {
      context: "supabaseHealth",
      data: {
        // Use hardcoded URL instead of protected property
        url: "https://mwsblnposuyhrgzrtoyo.supabase.co",
        authEnabled: !!supabase.auth,
        fromEnabled: !!supabase.from
      }
    });
  },
  
  /**
   * Check data retrieval from a table
   */
  checkDataRetrieval: async (tableName: string, limit = 1): Promise<{ success: boolean, count?: number, error?: any }> => {
    try {
      // Use type assertion for the dynamic table name
      const { data, error, count } = await supabase
        .from(tableName as any)
        .select('*', { count: 'exact' })
        .limit(limit);
        
      if (error) {
        return { success: false, error };
      }
      
      return { 
        success: true, 
        count: count ?? data?.length ?? 0
      };
    } catch (error) {
      return { 
        success: false, 
        error 
      };
    }
  }
};
