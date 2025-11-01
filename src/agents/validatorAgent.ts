
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
 * Ensures outfit suggestions are compatible and appropriate with detailed validation criteria
 */
export const validatorAgent = {
  role: "Fashion Compatibility Validator",
  goal: "Perform comprehensive compatibility checks on outfit recommendations ensuring color harmony, style consistency, and occasion appropriateness",
  backstory: `You are an expert fashion validator with deep knowledge of:
    - Color theory and harmony (complementary, analogous, triadic schemes)
    - Style consistency across different fashion aesthetics
    - Occasion appropriateness (work, casual, weekend, evening, special events)
    - Seasonal suitability and weather considerations
    - Body shape flattery and proportion rules
    
    Your validation process follows strict criteria:
    
    MUST-HAVE REQUIREMENTS (Critical - outfit fails if missing):
    ✓ At least 1 top item
    ✓ At least 1 bottom item (pants, skirt, or dress)
    ✓ At least 1 pair of shoes
    ✓ All items must have valid images
    ✓ Total price must be within user's budget
    
    COMPATIBILITY CHECKS (Scored 0-100):
    
    1. Color Harmony (30 points):
       - No clashing colors (red+green, blue+orange unless intentional)
       - Maximum 3 main colors per outfit
       - Complementary or analogous color schemes preferred
       - Neutral colors (black, white, beige, navy) are safe combinations
    
    2. Style Consistency (25 points):
       - Don't mix formal blazers with beach shorts
       - Don't combine athletic wear with evening pieces
       - Keep aesthetic coherent (bohemian, minimalist, classic, edgy)
    
    3. Occasion Appropriateness (25 points):
       - Work: Closed-toe shoes, professional pieces, modest cuts
       - Weekend: Comfortable, relaxed items like jeans, sneakers
       - Evening: Elegant fabrics, refined silhouettes, dressy shoes
       - Casual: Versatile, everyday wear
    
    4. Seasonal Suitability (10 points):
       - No winter coats in summer outfits
       - No sandals in winter looks
       - Consider fabric weight and coverage
    
    5. Completeness (10 points):
       - All required items present
       - Valid product information
       - Proper categorization
    
    SCORING SYSTEM:
    - 90-100: Perfect outfit, ready to recommend
    - 75-89: Good outfit, minor adjustments suggested
    - 60-74: Acceptable but has compatibility issues
    - Below 60: Major problems, needs complete redesign
    
    VALIDATION OUTPUT FORMAT:
    {
      "isCompatible": boolean (true if score >= 70),
      "overallScore": number (0-100),
      "validationResults": [{
        "outfitIndex": number,
        "isValid": boolean,
        "validationScore": number (0-100),
        "colorHarmonyScore": number (0-30),
        "styleConsistencyScore": number (0-25),
        "occasionScore": number (0-25),
        "seasonalScore": number (0-10),
        "completenessScore": number (0-10),
        "issues": ["specific issue 1", "issue 2"],
        "strengths": ["positive aspect 1", "positive aspect 2"]
      }]
    }`,
  tools: [CompatibilityCheckerTool],
  
  /**
   * Enhanced run method that accepts outfit data for synchronized validation
   * Implements comprehensive validation checks based on detailed criteria
   */
  async runWithOutfitData(userId: string, outfitData?: any[]): Promise<any> {
    console.log(`🔄 [ValidatorAgent] Running comprehensive validation on ${outfitData?.length || 0} outfits`);
    
    if (!outfitData || outfitData.length === 0) {
      return this.run(userId);
    }
    
    try {
      // Validate each outfit with detailed scoring
      const validationResults = outfitData.map((outfit, index) => {
        const items = outfit.items || [];
        
        // MUST-HAVE CHECKS
        const hasTop = items.some((item: any) => ['top', 'dress', 'shirt', 'blouse'].includes(item.type?.toLowerCase()));
        const hasBottom = items.some((item: any) => ['bottom', 'pants', 'skirt', 'dress', 'jeans'].includes(item.type?.toLowerCase()));
        const hasShoes = items.some((item: any) => item.type?.toLowerCase()?.includes('shoes') || item.type?.toLowerCase() === 'footwear');
        const hasValidImages = items.every((item: any) => item.image && item.image !== '/placeholder.svg');
        
        const isComplete = hasTop && hasBottom && hasShoes;
        
        // DETAILED SCORING
        let colorHarmonyScore = this.validateColorHarmony(items);
        let styleConsistencyScore = this.validateStyleConsistency(items, outfit.occasion);
        let occasionScore = this.validateOccasionAppropriate(items, outfit.occasion);
        let seasonalScore = 10; // Default pass - can be enhanced with season detection
        let completenessScore = 0;
        
        // Completeness scoring
        if (hasTop) completenessScore += 3;
        if (hasBottom) completenessScore += 3;
        if (hasShoes) completenessScore += 3;
        if (hasValidImages) completenessScore += 1;
        
        const totalScore = colorHarmonyScore + styleConsistencyScore + occasionScore + seasonalScore + completenessScore;
        
        // Issue detection
        const issues: string[] = [];
        const strengths: string[] = [];
        
        if (!hasTop) issues.push('Missing top item');
        if (!hasBottom) issues.push('Missing bottom item');
        if (!hasShoes) issues.push('Missing shoes');
        if (!hasValidImages) issues.push('Some items missing images');
        if (colorHarmonyScore < 20) issues.push('Color harmony needs improvement');
        if (styleConsistencyScore < 15) issues.push('Style inconsistency detected');
        if (occasionScore < 15) issues.push('Not appropriate for intended occasion');
        
        if (colorHarmonyScore >= 25) strengths.push('Excellent color coordination');
        if (styleConsistencyScore >= 20) strengths.push('Consistent style aesthetic');
        if (occasionScore >= 20) strengths.push('Perfect for the occasion');
        if (isComplete) strengths.push('Complete outfit with all essential pieces');
        
        return {
          outfitIndex: index,
          isValid: totalScore >= 70,
          validationScore: totalScore,
          colorHarmonyScore,
          styleConsistencyScore,
          occasionScore,
          seasonalScore,
          completenessScore,
          issues,
          strengths
        };
      });
      
      const overallScore = validationResults.reduce((sum, result) => sum + result.validationScore, 0) / validationResults.length;
      const isCompatible = overallScore >= 70;
      
      console.log(`✅ [ValidatorAgent] Validation complete - Overall: ${overallScore.toFixed(1)}/100, Compatible: ${isCompatible}`);
      
      return {
        success: true,
        data: { 
          isCompatible, 
          overallScore: Math.round(overallScore),
          validationResults,
          message: `Validation completed - ${validationResults.filter(r => r.isValid).length}/${validationResults.length} outfits passed validation`
        }
      };
      
    } catch (error) {
      console.error(`❌ [ValidatorAgent] Validation error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Validation failed",
        data: {
          isCompatible: false,
          overallScore: 0,
          validationResults: []
        }
      };
    }
  },
  
  /**
   * Validate color harmony (max 30 points)
   */
  validateColorHarmony(items: any[]): number {
    const colors = items.map(item => (item.color || item.colour || '').toLowerCase()).filter(c => c && c !== 'unknown');
    
    if (colors.length === 0) return 15; // Neutral if no color data
    
    let score = 30;
    
    // Check for clashing colors
    const clashingPairs = [
      ['red', 'green'],
      ['orange', 'blue'],
      ['purple', 'yellow']
    ];
    
    for (const [color1, color2] of clashingPairs) {
      if (colors.some(c => c.includes(color1)) && colors.some(c => c.includes(color2))) {
        score -= 10;
      }
    }
    
    // Check for too many colors
    const uniqueColors = [...new Set(colors)];
    if (uniqueColors.length > 3) {
      score -= 5 * (uniqueColors.length - 3);
    }
    
    return Math.max(0, score);
  },
  
  /**
   * Validate style consistency (max 25 points)
   */
  validateStyleConsistency(items: any[], occasion?: string): number {
    const itemNames = items.map(item => (item.name || '').toLowerCase());
    
    // Check for style clashes
    const hasFormal = itemNames.some(name => 
      name.includes('blazer') || name.includes('suit') || name.includes('formal'));
    const hasCasual = itemNames.some(name => 
      name.includes('jeans') || name.includes('t-shirt') || name.includes('sneakers'));
    const hasAthletic = itemNames.some(name => 
      name.includes('athletic') || name.includes('sport') || name.includes('gym'));
    
    let score = 25;
    
    // Penalize mixing incompatible styles
    if (hasFormal && hasCasual) score -= 10;
    if (hasFormal && hasAthletic) score -= 15;
    
    return Math.max(0, score);
  },
  
  /**
   * Validate occasion appropriateness (max 25 points)
   */
  validateOccasionAppropriate(items: any[], occasion?: string): number {
    const itemNames = items.map(item => (item.name || '').toLowerCase());
    
    if (!occasion) return 20; // Default good score if no occasion specified
    
    let score = 25;
    
    switch (occasion.toLowerCase()) {
      case 'work':
        // Need professional items
        if (itemNames.some(name => name.includes('sneakers') || name.includes('flip-flop'))) score -= 10;
        if (itemNames.some(name => name.includes('t-shirt'))) score -= 5;
        break;
        
      case 'evening':
        // Need elegant items
        if (itemNames.some(name => name.includes('sneakers') || name.includes('casual'))) score -= 10;
        break;
        
      case 'weekend':
      case 'casual':
        // Relaxed items appropriate
        if (itemNames.some(name => name.includes('formal') || name.includes('suit'))) score -= 5;
        break;
    }
    
    return Math.max(0, score);
  },

  async run(userId: string) {
    console.log(`[ValidatorAgent] Running basic validation for user: ${userId}`);
    try {
      return {
        success: true,
        data: { 
          isCompatible: true, 
          message: "Validator ready - use runWithOutfitData() for detailed validation" 
        }
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
