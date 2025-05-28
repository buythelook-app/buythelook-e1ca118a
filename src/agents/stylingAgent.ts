
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

      // Step 2: Fetch items from zara_cloth table
      const { data: topItems } = await supabase
        .from('zara_cloth')
        .select('*')
        .or('product_name.ilike.%shirt%,product_name.ilike.%blouse%,product_name.ilike.%top%')
        .limit(5);

      const { data: bottomItems } = await supabase
        .from('zara_cloth')
        .select('*')
        .or('product_name.ilike.%pant%,product_name.ilike.%trouser%,product_name.ilike.%skirt%')
        .limit(5);

      const { data: shoesItems } = await supabase
        .from('zara_cloth')
        .select('*')
        .or('product_name.ilike.%shoe%,product_name.ilike.%boot%,product_name.ilike.%sneaker%')
        .limit(5);

      // Step 3: Select random items
      const topItem = topItems && topItems.length > 0 ? topItems[Math.floor(Math.random() * topItems.length)] : null;
      const bottomItem = bottomItems && bottomItems.length > 0 ? bottomItems[Math.floor(Math.random() * bottomItems.length)] : null;
      const shoesItem = shoesItems && shoesItems.length > 0 ? shoesItems[Math.floor(Math.random() * shoesItems.length)] : null;

      // Step 4: Create outfit object with database items
      const outfit = {
        top: topItem ? {
          id: topItem.id,
          name: topItem.product_name,
          image: topItem.image,
          type: 'top',
          price: topItem.price ? `$${topItem.price}` : '$49.99'
        } : null,
        bottom: bottomItem ? {
          id: bottomItem.id,
          name: bottomItem.product_name,
          image: bottomItem.image,
          type: 'bottom',
          price: bottomItem.price ? `$${bottomItem.price}` : '$59.99'
        } : null,
        shoes: shoesItem ? {
          id: shoesItem.id,
          name: shoesItem.product_name,
          image: shoesItem.image,
          type: 'shoes',
          price: shoesItem.price ? `$${shoesItem.price}` : '$89.99'
        } : null,
        tips: [
          "Add accessories to enhance this look",
          `This outfit works well for ${userProfile?.body_shape || 'your body'} shape`
        ]
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
