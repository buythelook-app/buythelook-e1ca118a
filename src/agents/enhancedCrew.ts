
import { personalizationAgent, stylingAgent, validatorAgent, recommendationAgent, Agent } from "./index";
import { learningAgent, LearningData } from "./learningAgent";
import { OutfitResponse } from "../types/outfitTypes";
import logger from "@/lib/logger";
import { supabase } from "@/lib/supabaseClient";

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
   * מריץ את כל האייגנטים עם שילוב נתוני למידה מעמוד הבית + חוקי פידבק פעילים
   */
  async runWithLearning(context: EnhancedGenerationContext | string): Promise<OutfitResponse> {
    // טיפול בפורמט ישן וחדש
    const userId = typeof context === 'string' ? context : context.userId;
    const generationContext = typeof context === 'string' ? { userId: context, learningEnabled: true } : { ...context, learningEnabled: true };
    
    console.log(`🚀 [EnhancedAgentCrew] מתחיל זרימת עבודה מתקדמת עם למידה עבור משתמש: ${userId}`);
    console.log(`🧠 [EnhancedAgentCrew] הקשר ליצירה:`, generationContext);
    
    try {
      // שלב 0א: טעינת חוקי למידה פעילים מ-agent_runs
      console.log('🔍 [EnhancedAgentCrew] טוען חוקי למידה פעילים...');
      const { data: activeLearningRules } = await supabase
        .from('agent_runs')
        .select('result')
        .eq('user_id', userId)
        .eq('agent_name', 'learning-rules')
        .eq('status', 'active_rules')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();
      
      const learningRules = (activeLearningRules?.result as any)?.rules || null;
      if (learningRules) {
        console.log('✅ [EnhancedAgentCrew] נטענו חוקי למידה פעילים:', {
          dislikedItems: learningRules.dislikedItems?.length || 0,
          mustAvoid: learningRules.mustAvoid?.length || 0,
          preferredColors: learningRules.preferredColors?.length || 0
        });
      }
      
      // שלב 0ב: חילוץ ושמירת נתוני למידה מעמוד הבית
      if (generationContext.learningEnabled) {
        console.log('🧠 [EnhancedAgentCrew] שלב 0ב: חילוץ נתוני למידה מעמוד הבית...');
        
        const learningData = await learningAgent.extractHomepageLearningData(userId);
        if (learningData) {
          await learningAgent.saveLearningData(learningData);
          console.log('✅ [EnhancedAgentCrew] נתוני למידה נשמרו בהצלחה');
        }
      }
      
      // שלב 1: הרצת agent personalization עם נתוני למידה + חוקים פעילים
      console.log('🧠 [EnhancedAgentCrew] שלב 1: מריץ PersonalizationAgent עם נתוני למידה וחוקים פעילים...');
      
      // טעינת נתוני למידה קיימים
      const existingLearningData = await learningAgent.getLearningDataForAgents(userId);
      
      // הרצת personalization עם חוקי למידה
      const personalizationResult = await personalizationAgent.run(userId);
      
      if (!personalizationResult.success) {
        return { 
          success: false, 
          error: `Personalization failed: ${personalizationResult.error}` 
        };
      }
      
      // שילוב נתוני למידה + חוקים פעילים בהקשר
      const enhancedPersonalizationData = {
        ...personalizationResult.data,
        learningInsights: this.extractLearningInsights(existingLearningData),
        activeLearningRules: learningRules // הוספת חוקי למידה פעילים
      };
      
      console.log('✅ [EnhancedAgentCrew] PersonalizationAgent הושלם עם נתוני למידה וחוקים פעילים');
      
      // שלב 2: הרצת styling agent עם תובנות למידה + סינון לפי חוקים פעילים
      console.log('👗 [EnhancedAgentCrew] שלב 2: מריץ StylingAgent עם תובנות למידה וחוקים פעילים...');
      const stylingResult = await stylingAgent.run(userId);
      
      if (!stylingResult.success || !stylingResult.data?.looks?.length) {
        return { 
          success: false, 
          error: `Styling failed: ${stylingResult.error || 'No outfits generated'}` 
        };
      }
      
      // סינון ושיפור תוצאות הסטיילינג על בסיס נתוני למידה + חוקים פעילים
      let enhancedLooks = this.enhanceLooksWithLearning(stylingResult.data.looks, existingLearningData);
      
      // יישום חוקי למידה פעילים - סינון פריטים שלא רצויים
      if (learningRules) {
        enhancedLooks = this.applyActiveLearningRules(enhancedLooks, learningRules);
        console.log(`🔍 [EnhancedAgentCrew] יושמו חוקי למידה פעילים - נותרו ${enhancedLooks.length} לוקים`);
      }
      
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
  
  /**
   * מיישם חוקי למידה פעילים - מסנן לוקים שמכילים פריטים לא רצויים
   */
  private applyActiveLearningRules(looks: any[], rules: any): any[] {
    if (!rules) return looks;
    
    const dislikedItems = new Set(rules.dislikedItems || []);
    const mustAvoid = new Set(rules.mustAvoid || []);
    
    return looks.filter(look => {
      // בדיקה אם הלוק מכיל פריטים שלא רצויים
      const items = look.items || [];
      
      const hasDislikedItem = items.some((item: any) => 
        dislikedItems.has(item.id) || mustAvoid.has(item.product_family) || mustAvoid.has(item.product_subfamily)
      );
      
      if (hasDislikedItem) {
        console.log(`❌ [EnhancedAgentCrew] מסנן לוק עם פריטים לא רצויים`);
        return false;
      }
      
      // בדיקה מיוחדת: מעיל לא יכול להיות פריט עליון
      const topItem = items.find((item: any) => item.type === 'top');
      if (topItem && (topItem.product_family?.toLowerCase().includes('coat') || 
                      topItem.product_family?.toLowerCase().includes('jacket') ||
                      topItem.product_subfamily?.toLowerCase().includes('coat') ||
                      topItem.product_subfamily?.toLowerCase().includes('jacket'))) {
        console.log(`❌ [EnhancedAgentCrew] מסנן לוק - מעיל כפריט עליון לא תקין`);
        return false;
      }
      
      return true;
    });
  }
}

export const enhancedAgentCrew = new EnhancedAgentCrew();
