
import { personalizationAgent, stylingAgent, validatorAgent, recommendationAgent, Agent } from "./index";
import { ProfileFetcherTool } from "../tools/profileFetcherTool";
import { CompatibilityCheckerTool } from "../tools/compatibilityCheckerTool";
import { GenerateRecommendationsTool } from "../tools/generateRecommendationsTool";
import { OutfitResponse } from "../types/outfitTypes";

interface GenerationContext {
  userId: string;
  forceRefresh?: boolean;
  randomSeed?: number;
  timestamp?: number;
  excludeCombinations?: string[];
  excludeItems?: string[];
  preferredItems?: string[];
  attempt?: number;
}

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
   * Runs all agents in coordinated sequence to generate a complete outfit recommendation
   * @param context The generation context containing userId and other parameters
   * @returns A complete outfit recommendation with styling tips
   */
  async run(context: GenerationContext | string): Promise<OutfitResponse> {
    // Handle both old string format and new context object format for backward compatibility
    const userId = typeof context === 'string' ? context : context.userId;
    const generationContext = typeof context === 'string' ? { userId: context } : context;
    
    console.log(`🚀 [AgentCrew] Starting COORDINATED agent workflow for user: ${userId}`);
    console.log(`🎲 [AgentCrew] Generation context:`, generationContext);
    
    try {
      // Step 1: Run personalization agent to gather user profile and preferences
      console.log('🧠 [AgentCrew] Step 1: Running PersonalizationAgent...');
      const personalizationResult = await personalizationAgent.run(userId);
      
      if (!personalizationResult.success) {
        return { 
          success: false, 
          error: `Personalization failed: ${personalizationResult.error}` 
        };
      }
      
      console.log('✅ [AgentCrew] PersonalizationAgent completed successfully');
      
      // Step 2: Run styling agent with user profile data
      console.log('👗 [AgentCrew] Step 2: Running StylingAgent...');
      const stylingResult = await stylingAgent.run(userId);
      
      if (!stylingResult.success || !stylingResult.data?.looks?.length) {
        return { 
          success: false, 
          error: `Styling failed: ${stylingResult.error || 'No outfits generated'}` 
        };
      }
      
      console.log(`✅ [AgentCrew] StylingAgent created ${stylingResult.data.looks.length} outfits`);
      
      // Step 3: Run validator agent to check outfit compatibility
      console.log('🔍 [AgentCrew] Step 3: Running ValidatorAgent...');
      const validatorResult = await validatorAgent.run(userId);
      
      if (!validatorResult.success) {
        console.warn(`⚠️ [AgentCrew] Validator warning: ${validatorResult.error}`);
        // Continue anyway, validator is not critical
      } else {
        console.log('✅ [AgentCrew] ValidatorAgent completed successfully');
      }
      
      // Step 4: Run recommendation agent to add styling tips
      console.log('💡 [AgentCrew] Step 4: Running RecommendationAgent...');
      const recommendationResult = await recommendationAgent.run(userId);
      
      // Combine all results with proper structure
      const finalData = {
        looks: stylingResult.data.looks,
        reasoning: stylingResult.data.reasoning,
        recommendations: recommendationResult?.recommendations || [
          'תוכל להוסיף אביזרים מתאימים כדי להשלים את המראה',
          'שקול להתאים את הבחירה לאירוע הספציפי'
        ],
        validation: validatorResult?.data || null,
        timestamp: new Date().toISOString(),
        agentFlow: 'coordinated',
        generationContext: generationContext
      };
      
      console.log(`🎉 [AgentCrew] COORDINATED workflow completed successfully!`);
      console.log(`📊 [AgentCrew] Final results: ${finalData.looks.length} outfits with recommendations`);
      
      return { 
        success: true, 
        data: finalData 
      };
      
    } catch (error) {
      console.error("❌ [AgentCrew] Error in coordinated workflow:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error in coordinated agent workflow" 
      };
    }
  }
}

/**
 * Singleton instance for easy access to the coordinated AgentCrew
 */
export const agentCrew = new AgentCrew();
