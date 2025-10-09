
import { personalizationAgent, stylingAgent, validatorAgent, recommendationAgent, Agent } from "./index";
import { supervisorAgent } from "./supervisorAgent";
import { ProfileFetcherTool } from "../tools/profileFetcherTool";
import { CompatibilityCheckerTool } from "../tools/compatibilityCheckerTool";
import { GenerateRecommendationsTool } from "../tools/generateRecommendationsTool";
import { OutfitResponse } from "../types/outfitTypes";

interface GenerationContext {
  userId: string;
  forceRefresh?: boolean;
  randomSeed?: number;
  timestamp?: number;
  selectedMode?: string;
  excludeCombinations?: string[];
  excludeItems?: string[];
  preferredItems?: string[];
  attempt?: number;
  learningInsights?: any; // 🧠 תובנות למידה מפידבק משתמשים
  workAppropriate?: boolean;
  requiredModesty?: boolean;
  forbiddenItems?: string[];
}

/**
 * The AgentCrew orchestrates running all agents in sequence to generate a complete outfit recommendation
 */
export class AgentCrew {
  private agents: Agent[];

  constructor() {
    this.agents = [
      personalizationAgent,
      stylingAgent,
      validatorAgent,
      recommendationAgent,
      supervisorAgent  // הסטייליסטית המפקחת
    ];
  }

  /**
   * Runs all agents in coordinated sequence to generate a complete outfit recommendation
   * @param context The generation context containing userId and other parameters
   * @returns A complete outfit recommendation with styling tips
   */
  async run(context: GenerationContext | string): Promise<OutfitResponse> {
    // Handle both old string format and new context object format for backward compatibility
    const userId = typeof context === 'string' ? context : context.userId;
    const generationContext = typeof context === 'string' ? { userId: context } : context;
    
    console.log(`🚀 [AgentCrew] Starting SYNCHRONIZED agent workflow for user: ${userId}`);
    console.log(`🎲 [AgentCrew] Generation context:`, generationContext);
    
    try {
      // 🧠 Apply learning insights from user feedback
      let activeLearningRules = null;
      if (generationContext.learningInsights) {
        console.log('🎓 [AgentCrew] Applying learned insights from user feedback');
        activeLearningRules = {
          dislikedItems: Array.from(generationContext.excludeItems || []),
          mustAvoid: generationContext.learningInsights.itemCompatibilityMatrix?.mustAvoid || [],
          preferredColors: Object.keys(generationContext.learningInsights.colorAffinityScore || {})
            .filter((c: string) => (generationContext.learningInsights.colorAffinityScore as any)[c] > 0.7),
          occasionPreferences: generationContext.learningInsights.occasionSuitability || {}
        };
      }
      
      // Step 1: Run personalization agent to gather user profile and preferences
      console.log('🧠 [AgentCrew] Step 1: Running PersonalizationAgent...');
      const personalizationResult = await personalizationAgent.run(userId);
      
      if (!personalizationResult.success) {
        return { 
          success: false, 
          error: `Personalization failed: ${personalizationResult.error}` 
        };
      }
      
      console.log('✅ [AgentCrew] PersonalizationAgent completed successfully');
      console.log(`📊 [AgentCrew] Personalization data:`, {
        looksCount: personalizationResult.data?.looks?.length || 0,
        reasoning: personalizationResult.data?.reasoning?.substring(0, 100) + '...'
      });
      
      // Step 2: Run styling agent with personalization results (SYNCHRONIZED)
      console.log('👗 [AgentCrew] Step 2: Running StylingAgent with personalization data...');
      const stylingResult = await (stylingAgent as any).runWithPersonalizationData?.(userId, personalizationResult.data) || await stylingAgent.run(userId);
      
      if (!stylingResult.success || !stylingResult.data?.looks?.length) {
        return { 
          success: false, 
          error: `Styling failed: ${stylingResult.error || 'No outfits generated'}` 
        };
      }
      
      // 🧠 Apply learning rules to filter out disliked items
      let filteredLooks = stylingResult.data.looks;
      if (activeLearningRules) {
        const dislikedSet = new Set(activeLearningRules.dislikedItems);
        const mustAvoidSet = new Set(activeLearningRules.mustAvoid);
        
        filteredLooks = filteredLooks.filter((look: any) => {
          const items = look.items || [];
          const hasDislikedItem = items.some((item: any) => 
            dislikedSet.has(item.id) || 
            mustAvoidSet.has(item.product_family) || 
            mustAvoidSet.has(item.product_subfamily)
          );
          
          if (hasDislikedItem) {
            console.log(`❌ [AgentCrew] Filtered out look with disliked items based on learning`);
            return false;
          }
          return true;
        });
        
        console.log(`🎓 [AgentCrew] Learning rules applied: ${stylingResult.data.looks.length} → ${filteredLooks.length} looks`);
      }
      
      console.log(`✅ [AgentCrew] StylingAgent enhanced ${filteredLooks.length} outfits`);
      console.log(`📊 [AgentCrew] Styling data:`, {
        looksCount: filteredLooks.length,
        debugInfo: stylingResult.data.debugInfo ? 'Available' : 'None',
        learningApplied: !!activeLearningRules
      });
      
      // Step 3: Run validator agent with styling results (SYNCHRONIZED)
      console.log('🔍 [AgentCrew] Step 3: Running ValidatorAgent with outfit data...');
      const validatorResult = await (validatorAgent as any).runWithOutfitData?.(userId, filteredLooks) || await validatorAgent.run(userId);
      
      if (!validatorResult.success) {
        console.warn(`⚠️ [AgentCrew] Validator warning: ${validatorResult.error}`);
        // Continue anyway, validator is not critical
      } else {
        console.log('✅ [AgentCrew] ValidatorAgent validated outfits successfully');
      }
      
      // Step 4: Run recommendation agent with all previous results (SYNCHRONIZED)
      console.log('💡 [AgentCrew] Step 4: Running RecommendationAgent with full context...');
      const recommendationResult = await (recommendationAgent as any).runWithContext?.(userId, {
        personalization: personalizationResult.data,
        styling: stylingResult.data,
        validation: validatorResult?.data
      }) || await recommendationAgent.run(userId);
      
      // Step 5: NEW! הפעלת הסטייליסטית המפקחת לבדיקה ושיפור
      console.log('👩‍🏫 [AgentCrew] Step 5: Running SupervisorAgent for quality control...');
      const supervisorResult = await supervisorAgent.reviewAndTrain({
        personalization: personalizationResult.data,
        styling: { ...stylingResult.data, looks: filteredLooks }, // Use filtered looks
        validation: validatorResult?.data,
        recommendations: recommendationResult?.recommendations
      });

      console.log(`✅ [AgentCrew] SupervisorAgent completed: ${supervisorResult.feedback.length} הערות, ${supervisorResult.duplicatesRemoved} כפילויות הוסרו`);

      // Combine all results with supervisor improvements
      const finalData = {
        looks: supervisorResult.approvedLooks, // השתמש בלוקים המאושרים מהמפקחת
        reasoning: stylingResult.data.reasoning,
        recommendations: recommendationResult?.recommendations || [
          'תוכל להוסיף אביזרים מתאימים כדי להשלים את המראה',
          'שקול להתאים את הבחירה לאירוע הספציפי'
        ],
        validation: validatorResult?.data || null,
        supervisorFeedback: supervisorResult.feedback, // הערות הסטייליסטית
        qualityImprovements: supervisorResult.improvements, // שיפורים מוצעים
        duplicatesRemoved: supervisorResult.duplicatesRemoved,
        timestamp: new Date().toISOString(),
        agentFlow: 'supervised-coordinated', // עדכון סוג הזרימה
        generationContext: generationContext,
        learningApplied: !!activeLearningRules, // 🧠 Flag indicating learning was applied
        learningRules: activeLearningRules // 🧠 Include the learning rules used
      };
      
      console.log(`🎉 [AgentCrew] SUPERVISED COORDINATED workflow completed successfully!`);
      console.log(`📊 [AgentCrew] Final results: ${finalData.looks.length} אאוטפיטים מאושרים עם ${finalData.supervisorFeedback?.length || 0} הערות איכות`);
      console.log(`🚫 [AgentCrew] כפילויות שהוסרו: ${finalData.duplicatesRemoved}`);
      
      return { 
        success: true, 
        data: finalData 
      };
      
    } catch (error) {
      console.error("❌ [AgentCrew] Error in coordinated workflow:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error in coordinated agent workflow" 
      };
    }
  }
}

/**
 * Singleton instance for easy access to the coordinated AgentCrew
 */
export const agentCrew = new AgentCrew();
