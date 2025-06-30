
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
        url: "https://aqkeprwxxsryropnhfvm.supabase.co",
        auth: !!supabase.auth,
        from: !!supabase.from
      }
    });
    
    // Try to access the shoes table to check if it exists and is accessible
    const { error: shoesTableError, count: shoesCount } = await supabase
      .from('shoes')
      .select('*', { count: 'exact', head: true });
      
    if (shoesTableError) {
      logger.error("Failed to access shoes table:", {
        context: "supabaseTest",
        data: shoesTableError
      });
      
      return {
        success: false,
        error: shoesTableError.message,
        table: 'shoes'
      };
    }
    
    // Try to access the zara_cloth table to check if it exists and is accessible
    const { error: zaraTableError, count: zaraCount } = await supabase
      .from('zara_cloth')
      .select('*', { count: 'exact', head: true });
      
    if (zaraTableError) {
      logger.error("Failed to access zara_cloth table:", {
        context: "supabaseTest",
        data: zaraTableError
      });
      
      return {
        success: false,
        error: zaraTableError.message,
        table: 'zara_cloth'
      };
    }
    
    logger.info("Successfully connected to Supabase and both tables:", {
      context: "supabaseTest",
      data: { 
        shoesCount,
        zaraCount,
        totalItems: (shoesCount || 0) + (zaraCount || 0)
      }
    });
    
    return {
      success: true,
      shoesCount,
      zaraCount
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
