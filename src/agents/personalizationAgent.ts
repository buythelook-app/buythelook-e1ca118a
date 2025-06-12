
import { ProfileFetcherTool } from "../tools/profileFetcherTool";

// Interface defined but not exported to avoid conflicts
interface Agent {
  role: string;
  goal: string;
  backstory: string;
  tools: any[];
  run: (userId: string) => Promise<any>;
}

/**
 * Personalization Agent
 * Collects and understands user-specific parameters like style, body type, mood and preferences
 * Also fetches relevant product data from the zara_cloth table
 */
export const personalizationAgent: Agent = {
  role: "Personalization Agent",
  goal: "Collect and understand user-specific parameters and relevant product data",
  backstory: "Knows the user profile from the database and fetches product data for recommendations",
  tools: [ProfileFetcherTool],
  
  async run(userId: string) {
    console.log(`[PersonalizationAgent] Running for user: ${userId}`);
    try {
      const result = await ProfileFetcherTool.execute(userId);
      console.log(`[PersonalizationAgent] Profile fetch result:`, result);
      return result;
    } catch (error) {
      console.error(`[PersonalizationAgent] Error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error in personalization"
      };
    }
  }
};
