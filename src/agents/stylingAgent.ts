
import { GenerateOutfitTool } from "../tools/generateOutfitTool";

// Interface defined but not exported to avoid conflicts
interface Agent {
  role: string;
  goal: string;
  backstory: string;
  tools: any[];
}

/**
 * Styling Generator Agent
 * Generates outfit suggestions based on user preferences and logic
 */
export const stylingAgent: Agent = {
  role: "Styling Generator",
  goal: "Generate outfit suggestions based on user preferences and logic",
  backstory: "Knows how to combine clothing items using mood, style and body type",
  tools: [GenerateOutfitTool]
};
