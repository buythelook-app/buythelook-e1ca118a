
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0'
import { isValidImagePattern } from './imageValidator.ts'

/**
 * Database service for fetching and filtering clothing items
 */
export class DatabaseService {
  private supabase;

  constructor() {
    // Initialize Supabase client with correct credentials
    this.supabase = createClient(
      'https://aqkeprwxxsryropnhfvm.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2Vwcnd4eHNyeXJvcG5oZnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MzE4MjksImV4cCI6MjA1MzQwNzgyOX0.1nstrLtlahU3kGAu-UrzgOVw6XwyKU6n5H5q4Taqtus'
    );
  }

  /**
   * Check if zara_cloth table exists and get count
   */
  async checkTableExists(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      console.log("🔍 [DEBUG] Checking if zara_cloth table exists...");
      const { count: tableCount, error: tableCheckError } = await this.supabase
        .from('zara_cloth')
        .select('*', { count: 'exact', head: true });
      
      if (tableCheckError) {
        console.error("❌ [DEBUG] zara_cloth table check failed:", tableCheckError);
        return { success: false, error: tableCheckError.message };
      }
      
      console.log("✅ [DEBUG] zara_cloth table exists with", tableCount, "items");
      
      if (!tableCount || tableCount === 0) {
        console.error("❌ [DEBUG] zara_cloth table is empty");
        return { success: false, error: "zara_cloth table is empty" };
      }

      return { success: true, count: tableCount };
    } catch (error) {
      console.error("❌ [DEBUG] Error checking table:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch and filter valid clothing items with _6_x_1.jpg pattern only
   */
  async getValidItems(): Promise<{ success: boolean; items?: any[]; error?: string }> {
    try {
      console.log("🔍 [DEBUG] Fetching items from zara_cloth...");
      
      const { data: allItems, error: allItemsError } = await this.supabase
        .from('zara_cloth')
        .select('*')
        .limit(200); // Increased limit to have more items to filter from
      
      if (allItemsError) {
        console.error("❌ [DEBUG] Failed to fetch items:", allItemsError);
        return { success: false, error: allItemsError.message };
      }
      
      if (!allItems?.length) {
        console.error("❌ [DEBUG] No items found in database");
        return { success: false, error: "No items found in database" };
      }
      
      console.log(`✅ [DEBUG] Found ${allItems.length} total items`);
      
      // Filter items to only include those with _6_x_1.jpg pattern
      console.log('🔍 [DEBUG] Starting _6_x_1.jpg pattern filtering...');
      const validItems = allItems.filter((item, index) => {
        console.log(`🔍 [DEBUG] Checking item ${index + 1}/${allItems.length} (ID: ${item.id})`);
        const isValid = isValidImagePattern(item.image);
        if (!isValid) {
          console.log(`❌ [DEBUG] FILTERED OUT item ${item.id} - no _6_x_1.jpg pattern`);
        } else {
          console.log(`✅ [DEBUG] KEEPING item ${item.id} - has _6_x_1.jpg pattern`);
        }
        return isValid;
      });

      console.log(`✅ [DEBUG] Valid items after _6_x_1.jpg filtering: ${validItems.length} out of ${allItems.length}`);

      if (validItems.length === 0) {
        console.error('❌ [DEBUG] No items with _6_x_1.jpg pattern found');
        return { success: false, error: 'No items with _6_x_1.jpg main product images found in database' };
      }

      return { success: true, items: validItems };
    } catch (error) {
      console.error("❌ [DEBUG] Error fetching items:", error);
      return { success: false, error: error.message };
    }
  }
}
