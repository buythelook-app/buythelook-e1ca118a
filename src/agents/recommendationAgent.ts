
import { GenerateRecommendationsTool } from "../tools/generateRecommendationsTool";

// Interface defined but not exported to avoid conflicts
interface Agent {
  role: string;
  goal: string;
  backstory: string;
  tools: any[];
  run: (userId: string) => Promise<any>;
}

/**
 * Recommendation Enhancer Agent
 * Adds styling advice and contextual info to outfits
 */
export const recommendationAgent: Agent = {
  role: "Recommendation Enhancer",
  goal: "Add styling advice and contextual info to outfits",
  backstory: "Adds value to the recommendation using knowledge of fashion and occasion",
  tools: [GenerateRecommendationsTool],
  
  async run(userId: string) {
    console.log(`[RecommendationAgent] Running for user: ${userId}`);
    try {
      // Return general styling recommendations
      return {
        success: true,
        recommendations: [
          'תוכל להוסיף אביזרים מתאימים כדי להשלים את המראה',
          'שקול להתאים את הבחירה לאירוע הספציפי',
          'חשוב על הצבעים ואיך הם משלימים זה את זה'
        ]
      };
    } catch (error) {
      console.error(`[RecommendationAgent] Error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error in recommendations"
      };
    }
  }
};
