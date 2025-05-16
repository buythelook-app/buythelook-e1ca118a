
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
      
      const { error } = await supabase
        .from(tableName)
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
        // Use optional chaining to safely access potentially undefined properties
        url: supabase.storageUrl ?? "URL not available",
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
      const { data, error, count } = await supabase
        .from(tableName)
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
