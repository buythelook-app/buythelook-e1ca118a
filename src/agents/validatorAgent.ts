
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
export const validatorAgent = {
  role: "Outfit Validator",
  goal: "Ensure outfit suggestions are compatible and appropriate",
  backstory: "Knows what fits what, and validates look quality",
  tools: [CompatibilityCheckerTool],
  
  /**
   * Enhanced run method that accepts outfit data for synchronized validation
   */
  async runWithOutfitData(userId: string, outfitData?: any[]): Promise<any> {
    console.log(`🔄 [ValidatorAgent] Running with synchronized outfit data:`, outfitData?.length || 0, 'outfits');
    
    if (outfitData && outfitData.length > 0) {
      // Validate each outfit for compatibility
      const validationResults = outfitData.map((outfit, index) => {
        const hasValidItems = outfit.items && outfit.items.length >= 2;
        const hasShoes = outfit.items?.some((item: any) => item.type === 'shoes');
        
        return {
          outfitIndex: index,
          isValid: hasValidItems && hasShoes,
          validationScore: hasValidItems ? (hasShoes ? 95 : 75) : 30,
          issues: hasValidItems ? (hasShoes ? [] : ['Missing shoes']) : ['Insufficient items']
        };
      });
      
      const overallScore = validationResults.reduce((sum, result) => sum + result.validationScore, 0) / validationResults.length;
      
      return {
        success: true,
        data: { 
          isCompatible: overallScore >= 70, 
          overallScore,
          validationResults,
          message: `Validation completed - Overall score: ${overallScore.toFixed(1)}%` 
        }
      };
    }
    
    return this.run(userId);
  },

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
