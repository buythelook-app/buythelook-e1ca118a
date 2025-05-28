
import { supabase } from "@/integrations/supabase/client";
import { GenerateOutfitTool } from "../tools/generateOutfitTool";

// Interface defined but not exported to avoid conflicts
interface Agent {
  role: string;
  goal: string;
  backstory: string;
  tools: any[];
  run?: (userId: string) => Promise<any>;
}

/**
 * Styling Generator Agent
 * Generates outfit suggestions using items from the zara_cloth database table
 */
export const stylingAgent: Agent = {
  role: "Styling Generator",
  goal: "Generate outfit suggestions using available database items",
  backstory: "Knows how to combine clothing items from the database",
  tools: [GenerateOutfitTool],
  
  /**
   * Runs the styling agent to generate a new outfit combination from database items
   * @param userId The ID of the user to generate outfit for
   */
  run: async (userId: string) => {
    console.log("🔍 [DEBUG] StylingAgent starting for user:", userId);
    
    try {
      // Step 1: Check if zara_cloth table exists
      console.log("🔍 [DEBUG] Step 1: Checking if zara_cloth table exists...");
      const { count: tableCount, error: tableCheckError } = await supabase
        .from('zara_cloth')
        .select('id', { count: 'exact', head: true });
      
      if (tableCheckError) {
        console.error("❌ [DEBUG] Table check failed:", tableCheckError);
        console.log("🔄 [DEBUG] Falling back to items table...");
        
        // Fallback to items table if zara_cloth doesn't exist
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('*')
          .limit(10);
        
        if (itemsError) {
          console.error("❌ [DEBUG] Items table also failed:", itemsError);
          return { 
            success: false, 
            error: "Both zara_cloth and items tables are unavailable" 
          };
        }
        
        console.log("✅ [DEBUG] Found items in fallback table:", itemsData?.length || 0);
        
        // Create outfit from items table
        const outfit = {
          top: itemsData?.[0] || null,
          bottom: itemsData?.[1] || null,
          shoes: itemsData?.[2] || null,
          score: Math.floor(Math.random() * 30) + 70,
          description: `Outfit generated using fallback items table`,
          recommendations: [
            "Using fallback data from items table",
            "Database connection to zara_cloth needs to be fixed"
          ],
          occasion: 'general'
        };
        
        console.log("✅ [DEBUG] Generated fallback outfit:", outfit);
        return { success: true, data: outfit };
      }
      
      console.log("✅ [DEBUG] Table exists with", tableCount, "items");

      // Step 2: Get user profile data (optional for generation)
      console.log("🔍 [DEBUG] Step 2: Fetching user profile...");
      const { data: userProfile, error: profileError } = await supabase
        .from('style_quiz_results')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.log("⚠️ [DEBUG] No user profile found, using defaults:", profileError.message);
      } else {
        console.log("✅ [DEBUG] User profile found:", userProfile);
      }

      // Step 3: Fetch items from zara_cloth table with proper filtering
      console.log("🔍 [DEBUG] Step 3: Fetching clothing items...");
      
      console.log("🔍 [DEBUG] Step 3a: Fetching tops...");
      const { data: topItems, error: topError } = await supabase
        .from('zara_cloth')
        .select('*')
        .ilike('product_name', '%shirt%')
        .limit(10);

      if (topError) {
        console.error('❌ [DEBUG] Error fetching tops:', topError);
      } else {
        console.log('✅ [DEBUG] Tops found:', topItems?.length || 0);
      }

      console.log("🔍 [DEBUG] Step 3b: Fetching bottoms...");
      const { data: bottomItems, error: bottomError } = await supabase
        .from('zara_cloth')
        .select('*')
        .or('product_name.ilike.%pant%,product_name.ilike.%trouser%,product_name.ilike.%jean%')
        .limit(10);

      if (bottomError) {
        console.error('❌ [DEBUG] Error fetching bottoms:', bottomError);
      } else {
        console.log('✅ [DEBUG] Bottoms found:', bottomItems?.length || 0);
      }

      console.log("🔍 [DEBUG] Step 3c: Fetching shoes...");
      const { data: shoesItems, error: shoesError } = await supabase
        .from('zara_cloth')
        .select('*')
        .ilike('product_name', '%shoe%')
        .limit(10);

      if (shoesError) {
        console.error('❌ [DEBUG] Error fetching shoes:', shoesError);
      } else {
        console.log('✅ [DEBUG] Shoes found:', shoesItems?.length || 0);
      }

      // Step 4: Select random items from available data
      console.log("🔍 [DEBUG] Step 4: Selecting random items...");
      const topItem = topItems && topItems.length > 0 ? topItems[Math.floor(Math.random() * topItems.length)] : null;
      const bottomItem = bottomItems && bottomItems.length > 0 ? bottomItems[Math.floor(Math.random() * bottomItems.length)] : null;
      const shoesItem = shoesItems && shoesItems.length > 0 ? shoesItems[Math.floor(Math.random() * shoesItems.length)] : null;

      console.log('✅ [DEBUG] Selected items:', { 
        topItem: topItem?.id, 
        bottomItem: bottomItem?.id, 
        shoesItem: shoesItem?.id 
      });

      // Step 5: Create outfit object with database items
      console.log("🔍 [DEBUG] Step 5: Creating outfit object...");
      const outfit = {
        top: topItem,
        bottom: bottomItem,
        shoes: shoesItem,
        score: Math.floor(Math.random() * 30) + 70,
        description: `Outfit generated using items from Zara database`,
        recommendations: [
          "This combination uses real Zara items from our database",
          `Perfect for ${userProfile?.body_shape || 'your body'} shape`
        ],
        occasion: Math.random() > 0.5 ? 'work' : 'casual'
      };
      
      console.log("✅ [DEBUG] Generated database outfit:", outfit);
      return { success: true, data: outfit };
    } catch (error) {
      console.error("❌ [DEBUG] Error in styling agent:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error in styling agent" 
      };
    }
  }
};
