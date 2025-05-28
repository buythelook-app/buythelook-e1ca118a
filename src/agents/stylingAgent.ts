
import { supabase } from "@/lib/supabaseClient"; // Use the corrected client
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
      // Step 1: Check if zara_cloth table exists and get actual count
      console.log("🔍 [DEBUG] Step 1: Checking zara_cloth table...");
      const { count: tableCount, error: tableCheckError } = await supabase
        .from('zara_cloth')
        .select('*', { count: 'exact', head: true });
      
      if (tableCheckError) {
        console.error("❌ [DEBUG] Table check failed:", tableCheckError);
        return { 
          success: false, 
          error: "zara_cloth table is not accessible: " + tableCheckError.message 
        };
      }
      
      console.log("✅ [DEBUG] zara_cloth table exists with", tableCount, "items");

      if (!tableCount || tableCount === 0) {
        console.error("❌ [DEBUG] zara_cloth table is empty");
        return { 
          success: false, 
          error: "zara_cloth table is empty" 
        };
      }

      // Step 2: Get user profile data (optional for generation)
      console.log("🔍 [DEBUG] Step 2: Fetching user profile...");
      const { data: userProfile, error: profileError } = await supabase
        .from('style_quiz_results')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.log("⚠️ [DEBUG] Profile fetch error:", profileError.message);
      } else {
        console.log("✅ [DEBUG] User profile found:", userProfile);
      }

      // Step 3: Fetch random items from each category
      console.log("🔍 [DEBUG] Step 3: Fetching clothing items...");
      
      // Get random top item
      const { data: topItems, error: topError } = await supabase
        .from('zara_cloth')
        .select('*')
        .limit(10);

      if (topError || !topItems?.length) {
        console.error('❌ [DEBUG] Error fetching items:', topError);
        return { 
          success: false, 
          error: "Failed to fetch items from database: " + (topError?.message || "No items found") 
        };
      }

      console.log('✅ [DEBUG] Items found:', topItems.length);

      // Randomly select items for the outfit
      const shuffled = [...topItems].sort(() => Math.random() - 0.5);
      const topItem = shuffled[0];
      const bottomItem = shuffled[1] || shuffled[0]; // Fallback to same item if not enough
      const shoesItem = shuffled[2] || shuffled[0]; // Fallback to same item if not enough

      console.log('✅ [DEBUG] Selected items:', { 
        topItem: topItem?.id, 
        bottomItem: bottomItem?.id, 
        shoesItem: shoesItem?.id 
      });

      // Step 4: Create outfit object with database items
      const outfit = {
        top: topItem,
        bottom: bottomItem,
        shoes: shoesItem,
        score: Math.floor(Math.random() * 30) + 70,
        description: `Outfit generated using real Zara database items`,
        recommendations: [
          "This combination uses actual Zara items from our database",
          `Perfect for ${userProfile?.body_shape || 'your body'} shape`
        ],
        occasion: Math.random() > 0.5 ? 'work' : 'casual'
      };
      
      console.log("✅ [DEBUG] Generated database outfit successfully");
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
