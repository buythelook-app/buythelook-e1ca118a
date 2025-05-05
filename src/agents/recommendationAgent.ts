
import { GenerateRecommendationsTool } from "../tools/generateRecommendationsTool";

export interface Agent {
  role: string;
  goal: string;
  backstory: string;
  tools: any[];
}

/**
 * Recommendation Enhancer Agent
 * Adds styling advice and contextual info to outfits
 */
export const recommendationAgent: Agent = {
  role: "Recommendation Enhancer",
  goal: "Add styling advice and contextual info to outfits",
  backstory: "Adds value to the recommendation using knowledge of fashion and occasion",
  tools: [GenerateRecommendationsTool]
};
