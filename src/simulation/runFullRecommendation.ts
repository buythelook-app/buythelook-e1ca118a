
import { agentCrew } from "@/agents/crew";
import { OutfitResponse } from "../types/outfitTypes";
import logger from "../lib/logger";

/**
 * Runs a complete outfit recommendation using coordinated agent workflow
 * 
 * @param userId The ID of the user to generate recommendations for
 * @returns A complete outfit recommendation response
 */
export async function runFullRecommendation(userId: string): Promise<OutfitResponse> {
  logger.info("🚀 Starting COORDINATED full recommendation workflow", { 
    context: "runFullRecommendation",
    data: { userId }
  });
  
  try {
    // Use the coordinated agent crew instead of running agents individually
    const result = await agentCrew.run(userId);
    
    if (!result.success) {
      logger.error("❌ Coordinated agent workflow failed", {
        context: "runFullRecommendation",
        data: { userId, error: result.error }
      });
      
      return {
        success: false,
        error: result.error || "Failed to generate coordinated outfit recommendation"
      };
    }
    
    logger.info("✅ Coordinated workflow completed successfully", {
      context: "runFullRecommendation",
      data: { 
        userId,
        outfitCount: result.data?.looks?.length || 0,
        hasRecommendations: !!result.data?.recommendations?.length
      }
    });
    
    return result;
    
  } catch (error) {
    logger.error("❌ Error in full recommendation workflow", {
      context: "runFullRecommendation",
      data: { userId, error }
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in recommendation workflow"
    };
  }
}

/**
 * Example usage:
 * 
 * import { runFullRecommendation } from './simulation/runFullRecommendation';
 * 
 * async function testCoordinatedRecommendation() {
 *   const result = await runFullRecommendation('user-123');
 *   if (result.success) {
 *     console.log(`Generated ${result.data.looks.length} coordinated outfits`);
 *   }
 * }
 * 
 * testCoordinatedRecommendation().catch(console.error);
 */
