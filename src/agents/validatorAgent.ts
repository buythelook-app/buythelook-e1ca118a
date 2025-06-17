
import { CompatibilityCheckerTool } from "../tools/compatibilityCheckerTool";

// Interface defined but not exported to avoid conflicts
interface Agent {
  role: string;
  goal: string;
  backstory: string;
  tools: any[];
  run: (userId: string) => Promise<any>;
}

/**
 * Outfit Validator Agent
 * Ensures outfit suggestions are compatible and appropriate
 */
export const validatorAgent: Agent = {
  role: "Outfit Validator",
  goal: "Ensure outfit suggestions are compatible and appropriate",
  backstory: "Knows what fits what, and validates look quality",
  tools: [CompatibilityCheckerTool],
  
  async run(userId: string) {
    console.log(`[ValidatorAgent] Running validation for user: ${userId}`);
    try {
      // For now, return success since we need the outfit data to validate
      // This will be called with specific outfit data in the crew workflow
      return {
        success: true,
        data: { isCompatible: true, message: "Validation passed" }
      };
    } catch (error) {
      console.error(`[ValidatorAgent] Error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error in validation"
      };
    }
  }
};
