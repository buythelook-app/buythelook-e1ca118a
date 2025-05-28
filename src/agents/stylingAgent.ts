
import { supabase } from "@/integrations/supabase/client";
import { GenerateOutfitTool } from "../tools/generateOutfitTool";
import { LOCAL_IMAGE_MAPPING, getRandomLocalImage } from "../utils/localImageMapper";

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
 * Generates outfit suggestions using local images instead of database items
 */
export const stylingAgent: Agent = {
  role: "Styling Generator",
  goal: "Generate outfit suggestions using available local images",
  backstory: "Knows how to combine clothing items using local image assets",
  tools: [GenerateOutfitTool],
  
  /**
   * Runs the styling agent to generate a new outfit combination using local images
   * @param userId The ID of the user to generate outfit for
   */
  run: async (userId: string) => {
    console.log("StylingAgent starting for user:", userId);
    
    try {
      // Step 1: Get user profile data (optional for local generation)
      const { data: userProfile } = await supabase
        .from('style_quiz_results')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Step 2: Generate outfit using local images
      const topImages = LOCAL_IMAGE_MAPPING.top;
      const bottomImages = LOCAL_IMAGE_MAPPING.bottom;
      const shoesImages = LOCAL_IMAGE_MAPPING.shoes;
      
      if (topImages.length === 0 || bottomImages.length === 0 || shoesImages.length === 0) {
        return { success: false, error: "No local images available" };
      }

      // Step 3: Select random items from local images
      const topId = topImages[Math.floor(Math.random() * topImages.length)];
      const bottomId = bottomImages[Math.floor(Math.random() * bottomImages.length)];
      const shoesId = shoesImages[Math.floor(Math.random() * shoesImages.length)];

      // Step 4: Create outfit object with local image paths
      const outfit = {
        top: {
          id: topId,
          image: `/lovable-uploads/${topId}.png`,
          type: 'top'
        },
        bottom: {
          id: bottomId,
          image: `/lovable-uploads/${bottomId}.png`,
          type: 'bottom'
        },
        shoes: {
          id: shoesId,
          image: `/lovable-uploads/${shoesId}.png`,
          type: 'shoes'
        },
        tips: [
          "Add accessories to enhance this look",
          `This outfit works well for ${userProfile?.body_shape || 'your body'} shape`
        ]
      };
      
      console.log("Generated local outfit:", outfit);
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
