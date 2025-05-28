
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
    console.log("StylingAgent starting for user:", userId);
    
    try {
      // Step 1: Get user profile data (optional for generation)
      const { data: userProfile } = await supabase
        .from('style_quiz_results')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Step 2: Fetch items from zara_cloth table with proper filtering
      const { data: topItems, error: topError } = await supabase
        .from('zara_cloth')
        .select('*')
        .ilike('product_name', '%shirt%')
        .limit(10);

      if (topError) {
        console.error('Error fetching tops:', topError);
      }

      const { data: bottomItems, error: bottomError } = await supabase
        .from('zara_cloth')
        .select('*')
        .or('product_name.ilike.%pant%,product_name.ilike.%trouser%,product_name.ilike.%jean%')
        .limit(10);

      if (bottomError) {
        console.error('Error fetching bottoms:', bottomError);
      }

      const { data: shoesItems, error: shoesError } = await supabase
        .from('zara_cloth')
        .select('*')
        .ilike('product_name', '%shoe%')
        .limit(10);

      if (shoesError) {
        console.error('Error fetching shoes:', shoesError);
      }

      // Step 3: Select random items from available data
      const topItem = topItems && topItems.length > 0 ? topItems[Math.floor(Math.random() * topItems.length)] : null;
      const bottomItem = bottomItems && bottomItems.length > 0 ? bottomItems[Math.floor(Math.random() * bottomItems.length)] : null;
      const shoesItem = shoesItems && shoesItems.length > 0 ? shoesItems[Math.floor(Math.random() * shoesItems.length)] : null;

      console.log('Selected items:', { topItem: topItem?.id, bottomItem: bottomItem?.id, shoesItem: shoesItem?.id });

      // Step 4: Create outfit object with database items
      const outfit = {
        top: topItem,
        bottom: bottomItem,
        shoes: shoesItem,
        score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
        description: `Outfit generated using items from Zara database`,
        recommendations: [
          "This combination uses real Zara items from our database",
          `Perfect for ${userProfile?.body_shape || 'your body'} shape`
        ],
        occasion: Math.random() > 0.5 ? 'work' : 'casual'
      };
      
      console.log("Generated database outfit:", outfit);
      return { success: true, data: outfit };
    } catch (error) {
      console.error("Error in styling agent:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error in styling agent" 
      };
    }
  }
};
