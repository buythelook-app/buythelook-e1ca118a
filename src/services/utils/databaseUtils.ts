
import { resetItemsCache } from "../fetchers/itemsFetcher";
import { supabase } from "@/lib/supabase";

/**
 * Utility to explicitly enable database operations
 * Use this only when you explicitly want to query the database
 */
export const enableDatabaseChecks = () => {
  // Reset all cache and flags to force a new check
  resetItemsCache();
  return true;
};

/**
 * Force a database check and return results
 * This is an explicit opt-in to database operations
 */
export const forceDatabaseCheck = async () => {
  try {
    enableDatabaseChecks();
    
    const { count, error } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      throw error;
    }
    
    return {
      hasItems: (count !== null && count > 0),
      count: count || 0
    };
  } catch (error) {
    console.error('Error in forced database check:', error);
    return {
      hasItems: false,
      count: 0,
      error
    };
  }
};
