
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
   * Also fetches shoes from the separate "shoes" table
   */
  async getValidItems(): Promise<{ success: boolean; items?: any[]; error?: string }> {
    try {
      console.log("🔍 [DEBUG] Fetching items from zara_cloth AND shoes tables...");
      
      // Fetch clothing from zara_cloth
      const { data: allClothingItems, error: clothingError } = await this.supabase
        .from('zara_cloth')
        .select('*')
        .limit(150); // Limit clothing to leave room for shoes
      
      if (clothingError) {
        console.error("❌ [DEBUG] Failed to fetch clothing:", clothingError);
        return { success: false, error: clothingError.message };
      }
      
      // Fetch shoes from shoes table
      const { data: allShoes, error: shoesError } = await this.supabase
        .from('shoes')
        .select('*')
        .eq('availability', 'in stock')
        .limit(50); // Get 50 shoes
      
      if (shoesError) {
        console.error("❌ [DEBUG] Failed to fetch shoes:", shoesError);
        return { success: false, error: shoesError.message };
      }
      
      if (!allClothingItems?.length && !allShoes?.length) {
        console.error("❌ [DEBUG] No items found in database");
        return { success: false, error: "No items found in database" };
      }
      
      console.log(`✅ [DEBUG] Found ${allClothingItems?.length || 0} clothing items and ${allShoes?.length || 0} shoes`);
      
      // Filter clothing items to only include those with _6_x_1.jpg pattern
      console.log('🔍 [DEBUG] Starting _6_x_1.jpg pattern filtering for clothing...');
      const validClothing = (allClothingItems || []).filter((item, index) => {
        console.log(`🔍 [DEBUG] Checking clothing ${index + 1}/${allClothingItems?.length || 0} (ID: ${item.id})`);
        const isValid = isValidImagePattern(item.image);
        if (!isValid) {
          console.log(`❌ [DEBUG] FILTERED OUT clothing ${item.id} - no _6_x_1.jpg pattern`);
        } else {
          console.log(`✅ [DEBUG] KEEPING clothing ${item.id} - has _6_x_1.jpg pattern`);
        }
        return isValid;
      });

      // Transform shoes to match clothing item structure
      const transformedShoes = (allShoes || []).map(shoe => ({
        ...shoe,
        id: shoe.name || `shoe-${Math.random()}`, // Use name as ID
        product_name: shoe.name,
        product_family: 'SHOES',
        product_subfamily: 'SHOES',
        image: shoe.url ? [shoe.url] : (shoe.image || []), // Use URL as image
        price: shoe.price || 0,
        colour: shoe.color || shoe.colour || 'unknown',
        availability: true
      }));

      console.log(`✅ [DEBUG] Transformed ${transformedShoes.length} shoes to clothing format`);

      // Combine clothing and shoes
      const allValidItems = [...validClothing, ...transformedShoes];

      console.log(`✅ [DEBUG] Total valid items: ${allValidItems.length} (${validClothing.length} clothing + ${transformedShoes.length} shoes)`);

      if (allValidItems.length === 0) {
        console.error('❌ [DEBUG] No valid items found after filtering');
        return { success: false, error: 'No valid items found in database' };
      }

      return { success: true, items: allValidItems };
    } catch (error) {
      console.error("❌ [DEBUG] Error fetching items:", error);
      return { success: false, error: error.message };
    }
  }
}
