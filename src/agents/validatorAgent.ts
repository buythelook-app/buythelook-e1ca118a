
import { CompatibilityCheckerTool } from "../tools/compatibilityCheckerTool";

// Interface defined but not exported to avoid conflicts
interface Agent {
  role: string;
  goal: string;
  backstory: string;
  tools: any[];
}

/**
 * Outfit Validator Agent
 * Ensures outfit suggestions are compatible and appropriate
 */
export const validatorAgent: Agent = {
  role: "Outfit Validator",
  goal: "Ensure outfit suggestions are compatible and appropriate",
  backstory: "Knows what fits what, and validates look quality",
  tools: [CompatibilityCheckerTool]
};
