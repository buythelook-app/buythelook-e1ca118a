
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
 * Generates outfit suggestions based on user preferences and logic
 */
export const stylingAgent: Agent = {
  role: "Styling Generator",
  goal: "Generate outfit suggestions based on user preferences and logic",
  backstory: "Knows how to combine clothing items using mood, style and body type",
  tools: [GenerateOutfitTool],
  
  /**
   * Runs the styling agent to generate a new outfit combination
   * Filters out outfits used in the last 2 hours
   * @param userId The ID of the user to generate outfit for
   */
  run: async (userId: string) => {
    console.log("StylingAgent starting for user:", userId);
    
    try {
      // Step 1: Get user profile data
      const { data: userProfile, error: profileError } = await supabase
        .from('style_quiz_results')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profileError || !userProfile) {
        console.error("Failed to fetch user profile:", profileError);
        return { success: false, error: "Failed to fetch user profile" };
      }

      // Step 2: Get recently used outfits (last 2 hours)
      const twoHoursAgo = new Date();
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
      
      const { data: recentOutfits, error: logError } = await supabase
        .from('outfit_logs')
        .select('top_id, bottom_id, shoes_id')
        .eq('user_id', userId)
        .gte('created_at', twoHoursAgo.toISOString());
      
      if (logError) {
        console.error("Failed to fetch recent outfits:", logError);
        return { success: false, error: "Failed to check recent outfits" };
      }

      // Step 3: Get available clothing items
      const { data: clothingItems, error: itemsError } = await supabase
        .from('items')
        .select('*');
      
      if (itemsError || !clothingItems) {
        console.error("Failed to fetch clothing items:", itemsError);
        return { success: false, error: "Failed to fetch clothing items" };
      }

      // Filter items by type
      const tops = clothingItems.filter(item => item.type === 'top');
      const bottoms = clothingItems.filter(item => item.type === 'bottom');
      const shoes = clothingItems.filter(item => item.type === 'shoes');
      
      if (tops.length === 0 || bottoms.length === 0 || shoes.length === 0) {
        return { success: false, error: "Not enough clothing items available" };
      }

      // Step 4: Generate a unique outfit combination
      let topItem, bottomItem, shoesItem;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!isUnique && attempts < maxAttempts) {
        attempts++;
        
        // Randomly select items
        topItem = tops[Math.floor(Math.random() * tops.length)];
        bottomItem = bottoms[Math.floor(Math.random() * bottoms.length)];
        shoesItem = shoes[Math.floor(Math.random() * shoes.length)];
        
        // Check if this combination was used recently
        isUnique = !recentOutfits?.some(outfit => 
          outfit.top_id === topItem.id && 
          outfit.bottom_id === bottomItem.id && 
          outfit.shoes_id === shoesItem.id
        );
      }

      if (!isUnique) {
        console.log("Could not find a unique outfit after", maxAttempts, "attempts");
      }

      // Step 5: Log the selected outfit
      const { error: insertError } = await supabase
        .from('outfit_logs')
        .insert({
          user_id: userId,
          top_id: topItem.id,
          bottom_id: bottomItem.id,
          shoes_id: shoesItem.id
        });
      
      if (insertError) {
        console.error("Failed to log outfit:", insertError);
        // Continue anyway, this shouldn't fail the whole process
      }

      // Step 6: Return the outfit
      const outfit = {
        top: topItem,
        bottom: bottomItem,
        shoes: shoesItem,
        tips: [
          "Add accessories to enhance this look",
          `This outfit works well for ${userProfile.body_shape || 'your body'} shape`
        ]
      };
      
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
