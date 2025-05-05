
import { personalizationAgent, stylingAgent, validatorAgent, recommendationAgent, Agent } from "./index";
import { ProfileFetcherTool } from "../tools/profileFetcherTool";
import { GenerateOutfitTool } from "../tools/generateOutfitTool";
import { CompatibilityCheckerTool } from "../tools/compatibilityCheckerTool";
import { GenerateRecommendationsTool } from "../tools/generateRecommendationsTool";
import { OutfitResponse } from "../types/outfitTypes";
import logger from "../lib/logger";

/**
 * Tool for validating the agent pipeline
 * Runs automated validation cycles to ensure consistency and quality of agent outputs
 */
export const RunValidationCycleTool = {
  name: "RunValidationCycleTool",
  description: "Runs a validation cycle across all agents to test accuracy and consistency",
  execute: async (testCases: TestCase[] = DEFAULT_TEST_CASES) => {
    logger.info("Starting validation cycle", { context: "TrainerAgent", data: { testCaseCount: testCases.length } });
    
    try {
      const results: ValidationResult[] = [];
      
      for (const testCase of testCases) {
        logger.debug(`Processing test case: ${testCase.name}`, { context: "ValidationCycle" });
        
        // Step 1: Test personalization agent
        const profileResult = await ProfileFetcherTool.execute(testCase.userId);
        if (!profileResult.success) {
          results.push({
            testCase: testCase.name,
            success: false,
            stage: "personalization",
            error: profileResult.error || "Failed to fetch user profile"
          });
          continue;
        }
        
        // Step 2: Verify profile contains required fields
        const profile = profileResult.data;
        if (!profile.style || !profile.bodyType) {
          results.push({
            testCase: testCase.name,
            success: false,
            stage: "personalization",
            error: "Profile is missing required fields (style or bodyType)"
          });
          continue;
        }
        
        // Step 3: Test styling agent
        const outfitParams = {
          bodyStructure: profile.bodyType,
          mood: profile.mood,
          style: profile.style
        };
        const outfitResult = await GenerateOutfitTool.execute(outfitParams);
        if (!outfitResult.success) {
          results.push({
            testCase: testCase.name,
            success: false,
            stage: "styling",
            error: outfitResult.error || "Failed to generate outfit"
          });
          continue;
        }
        
        // Step 4: Verify outfit contains required items
        const generatedOutfit = outfitResult.data[0]; // Take the first suggestion
        if (!generatedOutfit.top || !generatedOutfit.bottom || !generatedOutfit.shoes) {
          results.push({
            testCase: testCase.name,
            success: false,
            stage: "styling",
            error: "Generated outfit is missing required items (top, bottom, or shoes)"
          });
          continue;
        }
        
        // Step 5: Test validator agent
        const compatibilityResult = await CompatibilityCheckerTool.execute(generatedOutfit);
        if (!compatibilityResult.success || !compatibilityResult.data.isCompatible) {
          results.push({
            testCase: testCase.name,
            success: false,
            stage: "validator",
            error: compatibilityResult.error || "Generated outfit is not compatible"
          });
          continue;
        }
        
        // Step 6: Test recommendation agent
        const recommendationsResult = await GenerateRecommendationsTool.execute(generatedOutfit);
        if (!recommendationsResult.success) {
          results.push({
            testCase: testCase.name,
            success: false,
            stage: "recommendation",
            error: recommendationsResult.error || "Failed to generate recommendations"
          });
          continue;
        }
        
        // Step 7: Verify at least one styling tip was provided
        const recommendations = recommendationsResult.data.recommendations;
        if (!recommendations || recommendations.length === 0) {
          results.push({
            testCase: testCase.name,
            success: false,
            stage: "recommendation",
            error: "No styling tips were provided"
          });
          continue;
        }
        
        // If all steps passed, mark test case as successful
        results.push({
          testCase: testCase.name,
          success: true,
          stage: "complete",
          data: {
            outfit: generatedOutfit,
            recommendations: recommendations,
            occasion: recommendationsResult.data.occasion
          }
        });
      }
      
      // Calculate success rate
      const successCount = results.filter(r => r.success).length;
      const successRate = testCases.length > 0 ? (successCount / testCases.length) * 100 : 0;
      
      logger.info(`Validation cycle completed with ${successRate.toFixed(2)}% success rate`, { 
        context: "TrainerAgent", 
        data: { successCount, totalCases: testCases.length } 
      });
      
      return {
        success: true,
        data: {
          results,
          summary: {
            totalTests: testCases.length,
            successfulTests: successCount,
            successRate: successRate,
            message: successCount === testCases.length ? 
              "✅ All agents passed the validation test successfully." : 
              `❌ ${testCases.length - successCount} test cases failed validation.`,
            timestamp: new Date().toISOString()
          }
        }
      };
    } catch (error) {
      logger.error("Error in validation cycle:", { context: "TrainerAgent", data: error });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error in validation cycle"
      };
    }
  }
};

// Default test cases to run if none are provided
const DEFAULT_TEST_CASES: TestCase[] = [
  {
    name: "Classic style with hourglass body type",
    userId: "test-user-1",
    expectedStyle: "classic",
    expectedBodyType: "Hourglass",
    expectedMood: "elegant"
  },
  {
    name: "Minimalist style with athletic body type",
    userId: "test-user-2",
    expectedStyle: "minimalist",
    expectedBodyType: "V",
    expectedMood: "casual"
  },
  {
    name: "Romantic style with pear body type",
    userId: "test-user-3",
    expectedStyle: "romantic",
    expectedBodyType: "A",
    expectedMood: "romantic"
  }
];

// Types
interface TestCase {
  name: string;
  userId: string;
  expectedStyle: string;
  expectedBodyType: string;
  expectedMood: string;
}

interface ValidationResult {
  testCase: string;
  success: boolean;
  stage: "personalization" | "styling" | "validator" | "recommendation" | "complete";
  error?: string;
  data?: any;
}

/**
 * Trainer Agent
 * Runs automated validation of all agents and their outputs periodically
 */
export const trainerAgent: Agent = {
  role: "Trainer Agent",
  goal: "Run automated validation of all agents and their outputs periodically",
  backstory: "Responsible for testing the accuracy and consistency of agent logic",
  tools: [RunValidationCycleTool]
};

// Export a function to run the validation cycle directly
export const runValidationCycle = async (testCases?: TestCase[]) => {
  return await RunValidationCycleTool.execute(testCases);
};
