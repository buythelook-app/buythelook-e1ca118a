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
        
        // Initialize user score and comments
        const userScore: UserScore = {
          userId: testCase.userId,
          score: 0,
          comments: [],
          editable: true
        };
        
        // Step 1: Test personalization agent (25 points)
        const profileResult = await ProfileFetcherTool.execute(testCase.userId);
        if (!profileResult.success) {
          results.push({
            testCase: testCase.name,
            success: false,
            stage: "personalization",
            error: profileResult.error || "Failed to fetch user profile",
            userScore
          });
          userScore.comments.push("Failed to fetch user profile");
          continue;
        }
        
        // Verify profile contains required fields
        const profile = profileResult.data;
        let personalizationScore = 25; // Start with full points
        
        if (!profile.style) {
          personalizationScore -= 12.5; // Deduct half the points
          userScore.comments.push("Missing style information");
        }
        
        if (!profile.bodyType) {
          personalizationScore -= 12.5; // Deduct half the points
          userScore.comments.push("Missing body type information");
        }
        
        userScore.score += personalizationScore;
        
        // Step 2: Test styling agent (25 points)
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
            error: outfitResult.error || "Failed to generate outfit",
            userScore
          });
          userScore.comments.push("Failed to generate outfit");
          continue;
        }
        
        // Verify outfit contains required items (25 points)
        const generatedOutfit = outfitResult.data[0]; // Take the first suggestion
        let stylingScore = 25; // Start with full points
        
        if (!generatedOutfit.top) {
          stylingScore -= 8.33; // Deduct one-third of the points
          userScore.comments.push("Missing top item in outfit");
        }
        
        if (!generatedOutfit.bottom) {
          stylingScore -= 8.33; // Deduct one-third of the points
          userScore.comments.push("Missing bottom item in outfit");
        }
        
        if (!generatedOutfit.shoes) {
          stylingScore -= 8.33; // Deduct one-third of the points
          userScore.comments.push("Missing shoes in outfit");
        }
        
        userScore.score += stylingScore;
        
        // Step 3: Test validator agent (25 points)
        const compatibilityResult = await CompatibilityCheckerTool.execute(generatedOutfit);
        if (!compatibilityResult.success) {
          results.push({
            testCase: testCase.name,
            success: false,
            stage: "validator",
            error: compatibilityResult.error || "Failed to check outfit compatibility",
            userScore
          });
          userScore.comments.push("Failed to validate outfit compatibility");
          continue;
        }
        
        // Award points for validation
        if (compatibilityResult.data.isCompatible) {
          userScore.score += 25; // Full points for compatible outfit
        } else {
          userScore.comments.push("Outfit is not compatible");
        }
        
        // Step 4: Test recommendation agent (25 points)
        const recommendationsResult = await GenerateRecommendationsTool.execute(generatedOutfit);
        if (!recommendationsResult.success) {
          results.push({
            testCase: testCase.name,
            success: false,
            stage: "recommendation",
            error: recommendationsResult.error || "Failed to generate recommendations",
            userScore
          });
          userScore.comments.push("Failed to generate styling recommendations");
          continue;
        }
        
        // Verify at least one styling tip was provided
        const recommendations = recommendationsResult.data.recommendations;
        if (recommendations && recommendations.length > 0) {
          userScore.score += 25; // Full points for having at least one recommendation
        } else {
          userScore.comments.push("No styling tips were provided");
        }
        
        // Round score to nearest integer
        userScore.score = Math.round(userScore.score);
        
        // If all steps passed, mark test case as successful
        results.push({
          testCase: testCase.name,
          success: userScore.score === 100,
          stage: "complete",
          data: {
            outfit: generatedOutfit,
            recommendations: recommendations,
            occasion: recommendationsResult.data.occasion
          },
          userScore
        });
      }
      
      // Calculate success rate
      const successCount = results.filter(r => r.success).length;
      const successRate = testCases.length > 0 ? (successCount / testCases.length) * 100 : 0;
      
      logger.info(`Validation cycle completed with ${successRate.toFixed(2)}% success rate`, { 
        context: "TrainerAgent", 
        data: { successCount, totalCases: testCases.length } 
      });
      
      // Get all user scores from results
      const userScores = results.map(r => r.userScore).filter(Boolean);
      
      return {
        success: true,
        data: {
          results,
          userScores,
          summary: {
            totalTests: testCases.length,
            successfulTests: successCount,
            successRate: successRate,
            message: successCount === testCases.length ? 
              "✅ All users passed validation successfully." : 
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
  },
  
  // Add run() method as an alias to execute for compatibility
  run: async (testCases: TestCase[] = DEFAULT_TEST_CASES) => {
    logger.info("Running validation cycle via run() method", { context: "TrainerAgent" });
    return await RunValidationCycleTool.execute(testCases);
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

interface UserScore {
  userId: string;
  score: number;
  comments: string[];
  editable: boolean;
}

interface ValidationResult {
  testCase: string;
  success: boolean;
  stage: "personalization" | "styling" | "validator" | "recommendation" | "complete";
  error?: string;
  data?: any;
  userScore?: UserScore;
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
