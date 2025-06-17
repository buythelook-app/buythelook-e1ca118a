
import { personalizationAgent, stylingAgent, validatorAgent, recommendationAgent, Agent } from "./index";
import { learningAgent, LearningData } from "./learningAgent";
import { OutfitResponse } from "../types/outfitTypes";
import logger from "@/lib/logger";

interface EnhancedGenerationContext {
  userId: string;
  forceRefresh?: boolean;
  randomSeed?: number;
  timestamp?: number;
  excludeCombinations?: string[];
  excludeItems?: string[];
  preferredItems?: string[];
  attempt?: number;
  learningEnabled?: boolean;
}

/**
 * Enhanced AgentCrew - כולל מנגנון למידה מעמוד הבית
 */
export class EnhancedAgentCrew {
  private agents: Agent[];

  constructor() {
    this.agents = [
      personalizationAgent,
      stylingAgent,
      validatorAgent,
      recommendationAgent
    ];
  }

  /**
   * מריץ את כל האייגנטים עם שילוב נתוני למידה מעמוד הבית
   */
  async runWithLearning(context: EnhancedGenerationContext | string): Promise<OutfitResponse> {
    // טיפול בפורמט ישן וחדש
    const userId = typeof context === 'string' ? context : context.userId;
    const generationContext = typeof context === 'string' ? { userId: context, learningEnabled: true } : { ...context, learningEnabled: true };
    
    console.log(`🚀 [EnhancedAgentCrew] מתחיל זרימת עבודה מתקדמת עם למידה עבור משתמש: ${userId}`);
    console.log(`🧠 [EnhancedAgentCrew] הקשר ליצירה:`, generationContext);
    
    try {
      // שלב 0: חילוץ ושמירת נתוני למידה מעמוד הבית
      if (generationContext.learningEnabled) {
        console.log('🧠 [EnhancedAgentCrew] שלב 0: חילוץ נתוני למידה מעמוד הבית...');
        
        const learningData = await learningAgent.extractHomepageLearningData(userId);
        if (learningData) {
          await learningAgent.saveLearningData(learningData);
          console.log('✅ [EnhancedAgentCrew] נתוני למידה נשמרו בהצלחה');
        }
      }
      
      // שלב 1: הרצת agent personalization עם נתוני למידה
      console.log('🧠 [EnhancedAgentCrew] שלב 1: מריץ PersonalizationAgent עם נתוני למידה...');
      
      // טעינת נתוני למידה קיימים
      const existingLearningData = await learningAgent.getLearningDataForAgents(userId);
      
      const personalizationResult = await personalizationAgent.run(userId);
      
      if (!personalizationResult.success) {
        return { 
          success: false, 
          error: `Personalization failed: ${personalizationResult.error}` 
        };
      }
      
      // שילוב נתוני למידה בהקשר
      const enhancedPersonalizationData = {
        ...personalizationResult.data,
        learningInsights: this.extractLearningInsights(existingLearningData)
      };
      
      console.log('✅ [EnhancedAgentCrew] PersonalizationAgent הושלם עם נתוני למידה');
      
      // שלב 2: הרצת styling agent עם תובנות למידה
      console.log('👗 [EnhancedAgentCrew] שלב 2: מריץ StylingAgent עם תובנות למידה...');
      const stylingResult = await stylingAgent.run(userId);
      
      if (!stylingResult.success || !stylingResult.data?.looks?.length) {
        return { 
          success: false, 
          error: `Styling failed: ${stylingResult.error || 'No outfits generated'}` 
        };
      }
      
      // שיפור תוצאות הסטיילינג על בסיס נתוני למידה
      const enhancedLooks = this.enhanceLooksWithLearning(stylingResult.data.looks, existingLearningData);
      
      console.log(`✅ [EnhancedAgentCrew] StylingAgent יצר ${enhancedLooks.length} לוקים משופרים`);
      
      // שלב 3 & 4: Validator ו-Recommendation (ללא שינוי)
      const validatorResult = await validatorAgent.run(userId);
      const recommendationResult = await recommendationAgent.run(userId);
      
      // יצירת התוצאה הסופית עם נתוני למידה
      const finalData = {
        looks: enhancedLooks,
        reasoning: stylingResult.data.reasoning,
        recommendations: recommendationResult?.recommendations || [
          'תוכל להוסיף אביזרים מתאימים כדי להשלים את המראה',
          'שקול להתאים את הבחירה לאירוע הספציפי'
        ],
        validation: validatorResult?.data || null,
        timestamp: new Date().toISOString(),
        agentFlow: 'enhanced-learning',
        generationContext: generationContext,
        learningData: {
          applied: existingLearningData.length > 0,
          insights: existingLearningData.length,
          homepageIntegration: true
        }
      };
      
      console.log(`🎉 [EnhancedAgentCrew] זרימת עבודה מתקדמת הושלמה בהצלחה!`);
      console.log(`📊 [EnhancedAgentCrew] תוצאות סופיות: ${finalData.looks.length} לוקים עם המלצות משופרות`);
      
      return { 
        success: true, 
        data: finalData 
      };
      
    } catch (error) {
      console.error("❌ [EnhancedAgentCrew] שגיאה בזרימת עבודה מתקדמת:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "שגיאה לא ידועה בזרימת עבודה מתקדמת" 
      };
    }
  }
  
  /**
   * מחלץ תובנות מנתוני למידה
   */
  private extractLearningInsights(learningData: LearningData[]): any {
    if (learningData.length === 0) {
      return { hasLearningData: false };
    }
    
    // ניתוח תובנות מהנתונים
    const allCombinations = learningData.flatMap(data => data.successfulCombinations);
    const mostLikedOccasions = this.findMostLikedOccasions(allCombinations);
    const preferredItemTypes = this.findPreferredItemTypes(allCombinations);
    
    return {
      hasLearningData: true,
      totalFeedback: allCombinations.length,
      mostLikedOccasions,
      preferredItemTypes,
      recentPreferences: learningData[0]?.userPreferences
    };
  }
  
  /**
   * משפר לוקים על בסיס נתוני למידה
   */
  private enhanceLooksWithLearning(looks: any[], learningData: LearningData[]): any[] {
    if (learningData.length === 0) {
      return looks;
    }
    
    // כאן ניתן להוסיף לוגיקה מתקדמת לשיפור הלוקים
    // לדוגמה: העדפת קומבינציות שהמשתמש אהב בעבר
    
    return looks.map(look => ({
      ...look,
      enhanced: true,
      learningApplied: true
    }));
  }
  
  /**
   * מוצא אירועים שהמשתמש הכי אוהב
   */
  private findMostLikedOccasions(combinations: any[]): string[] {
    const occasionCounts = combinations.reduce((acc, combo) => {
      acc[combo.occasion] = (acc[combo.occasion] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(occasionCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([occasion]) => occasion);
  }
  
  /**
   * מוצא סוגי פריטים מועדפים
   */
  private findPreferredItemTypes(combinations: any[]): any {
    const itemTypeCounts = { top: {}, bottom: {}, shoes: {} };
    
    combinations.forEach(combo => {
      combo.items.forEach((item: any) => {
        if (itemTypeCounts[item.type as keyof typeof itemTypeCounts]) {
          const typeCount = itemTypeCounts[item.type as keyof typeof itemTypeCounts];
          typeCount[item.id] = (typeCount[item.id] || 0) + 1;
        }
      });
    });
    
    return itemTypeCounts;
  }
}

export const enhancedAgentCrew = new EnhancedAgentCrew();
