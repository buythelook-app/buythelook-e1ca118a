
// src/simulation/runFullRecommendation.ts
import { 
  personalizationAgent,
  stylingAgent,
  validatorAgent,
  recommendationAgent
} from "@/agents";
import { OutfitResponse } from "../types/outfitTypes";
import logger from "../lib/logger";

/**
 * Runs a complete outfit recommendation simulation by executing all agents in sequence
 * 
 * @param userId The ID of the user to generate recommendations for
 * @returns A complete outfit recommendation response
 */
export async function runFullRecommendation(userId: string): Promise<OutfitResponse> {
  console.log("🧠 Running personalization...");
  const profile = await personalizationAgent.tools[0].run({ userId });
  
  if (!profile?.style || !profile?.bodyType) {
    return { success: false, error: "Missing profile data" };
  }

  console.log("👕 Generating outfit...");
  const outfit = await stylingAgent.tools[0].run(profile);
  
  if (!outfit?.top || !outfit?.bottom || !outfit?.shoes) {
    return { success: false, error: "Incomplete outfit" };
  }

  console.log("✅ Checking compatibility...");
  const validation = await validatorAgent.tools[0].run(outfit);
  
  if (!validation?.valid) {
    return { success: false, error: "Outfit not compatible" };
  }

  console.log("💡 Adding recommendations...");
  const final = await recommendationAgent.tools[0].run({ outfit });

  return {
    success: true,
    data: {
      ...final,
      // Include any additional data needed for the response
    }
  };
}

/**
 * Example usage:
 * 
 * import { runFullRecommendation } from './simulation/runFullRecommendation';
 * 
 * async function testRecommendation() {
 *   const result = await runFullRecommendation('user-123');
 *   console.log(JSON.stringify(result, null, 2));
 * }
 * 
 * testRecommendation().catch(console.error);
 */
