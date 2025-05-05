
import { personalizationAgent, stylingAgent, validatorAgent, recommendationAgent, Agent } from "./index";
import { ProfileFetcherTool } from "../tools/profileFetcherTool";
import { GenerateOutfitTool } from "../tools/generateOutfitTool";
import { CompatibilityCheckerTool } from "../tools/compatibilityCheckerTool";
import { GenerateRecommendationsTool } from "../tools/generateRecommendationsTool";
import { OutfitResponse } from "../types/outfitTypes";

/**
 * The AgentCrew orchestrates running all agents in sequence to generate a complete outfit recommendation
 */
export class AgentCrew {
  private agents: Agent[];

  constructor() {
    this.agents = [
      personalizationAgent,
      stylingAgent,
      validatorAgent,
      recommendationAgent
    ];
  }

  /**
   * Runs all agents in sequence to generate a complete outfit recommendation
   * @param userId The ID of the user to generate recommendations for
   * @returns A complete outfit recommendation with styling tips
   */
  async run(userId: string): Promise<OutfitResponse> {
    console.log(`AgentCrew starting run for user: ${userId}`);
    try {
      // Step 1: Get user profile data using the personalization agent
      const profileResult = await ProfileFetcherTool.execute(userId);
      if (!profileResult.success) {
        return { success: false, error: profileResult.error || "Failed to fetch user profile" };
      }
      const userProfile = profileResult.data;
      
      // Step 2: Generate outfit using the styling agent
      const outfitParams = {
        bodyStructure: userProfile.bodyType,
        mood: userProfile.mood,
        style: userProfile.style
      };
      const outfitResult = await GenerateOutfitTool.execute(outfitParams);
      if (!outfitResult.success) {
        return { success: false, error: outfitResult.error || "Failed to generate outfit" };
      }
      const generatedOutfit = outfitResult.data[0]; // Take the first suggestion
      
      // Step 3: Validate the outfit compatibility using the validator agent
      const compatibilityResult = await CompatibilityCheckerTool.execute(generatedOutfit);
      if (!compatibilityResult.success || !compatibilityResult.data.isCompatible) {
        return { 
          success: false, 
          error: compatibilityResult.error || "Generated outfit is not compatible" 
        };
      }
      
      // Step 4: Generate recommendations and styling tips using the recommendation agent
      const recommendationsResult = await GenerateRecommendationsTool.execute(generatedOutfit);
      if (!recommendationsResult.success) {
        return { success: false, error: recommendationsResult.error || "Failed to generate recommendations" };
      }
      
      // Combine the outfit with recommendations
      const finalOutfit = {
        ...generatedOutfit,
        recommendations: recommendationsResult.data.recommendations,
        occasion: recommendationsResult.data.occasion
      };
      
      console.log(`AgentCrew completed run successfully for user: ${userId}`);
      return { success: true, data: finalOutfit };
    } catch (error) {
      console.error("Error in AgentCrew:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error in the agent crew" 
      };
    }
  }
}

/**
 * Singleton instance for easy access to the AgentCrew
 */
export const agentCrew = new AgentCrew();
