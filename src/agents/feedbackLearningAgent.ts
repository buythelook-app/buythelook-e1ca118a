import { supabase } from "@/lib/supabaseClient";
import { learningAgent, LearningData } from "./learningAgent";
import logger from "@/lib/logger";

interface FeedbackPattern {
  userId: string;
  preferredColors: string[];
  dislikedItems: string[];
  likedCombinations: string[];
  occasionPreferences: Record<string, number>;
  styleEvolution: {
    timestamp: string;
    styleProfile: string;
    confidence: number;
  }[];
}

interface LearningInsights {
  personalizedWeights: Record<string, number>;
  colorAffinityScore: Record<string, number>;
  itemCompatibilityMatrix: Record<string, string[]>;
  occasionSuitability: Record<string, number>;
}

/**
 * Feedback Learning Agent - מיישם למידה אקטיבית מפידבק משתמשים
 */
export class FeedbackLearningAgent {
  
  /**
   * מנתח פידבק משתמש ומפיק תובנות למידה
   */
  async analyzeFeedbackPatterns(userId: string): Promise<FeedbackPattern | null> {
    try {
      console.log(`🔍 [FeedbackLearning] מנתח דפוסי פידבק עבור: ${userId}`);
      
      // שליפת כל נתוני הפידבק למשתמש מ-agent_runs (שם נשמר הפידבק)
      const { data: agentFeedback, error: agentError } = await supabase
        .from('agent_runs')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'feedback')
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (agentError) {
        console.error('❌ שגיאה בשליפת פידבק אייגנטים:', agentError);
      }
      
      // שליפת כל נתוני הפידבק למשתמש מ-outfit_logs
      const { data: outfitFeedback, error: outfitError } = await supabase
        .from('outfit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (outfitError) {
        console.error('❌ שגיאה בשליפת פידבק תלבושות:', outfitError);
      }
      
      // שליפת נתוני למידה קיימים
      const learningData = await learningAgent.getLearningDataForAgents(userId);
      
      console.log(`📊 [FeedbackLearning] נמצאו ${agentFeedback?.length || 0} פידבקים חדשים`);
      
      // ניתוח דפוסים
      const preferredColors = this.extractColorPreferences(outfitFeedback || []);
      const dislikedItems = this.extractDislikedItems(outfitFeedback || []);
      const likedCombinations = this.extractLikedCombinations(outfitFeedback || []);
      const occasionPreferences = this.analyzeOccasionPreferences(learningData);
      const styleEvolution = this.trackStyleEvolution(learningData);
      
      const pattern: FeedbackPattern = {
        userId,
        preferredColors,
        dislikedItems,
        likedCombinations,
        occasionPreferences,
        styleEvolution
      };
      
      console.log(`✅ [FeedbackLearning] דפוסי פידבק נותחו:`, {
        colorsFound: preferredColors.length,
        dislikedItems: dislikedItems.length,
        likedCombos: likedCombinations.length
      });
      
      return pattern;
      
    } catch (error) {
      console.error('❌ [FeedbackLearning] שגיאה בניתוח דפוסי פידבק:', error);
      return null;
    }
  }
  
  /**
   * יוצר תובנות למידה בהתאם לדפוסי הפידבק
   */
  async generateLearningInsights(pattern: FeedbackPattern): Promise<LearningInsights> {
    try {
      console.log(`🧠 [FeedbackLearning] יוצר תובנות למידה עבור: ${pattern.userId}`);
      
      // חישוב משקלים מותאמים אישית
      const personalizedWeights = this.calculatePersonalizedWeights(pattern);
      
      // ניקוד זיקה לצבעים
      const colorAffinityScore = this.calculateColorAffinity(pattern.preferredColors);
      
      // מטריצת תאימות פריטים
      const itemCompatibilityMatrix = this.buildCompatibilityMatrix(pattern.likedCombinations);
      
      // התאמה לאירועים
      const occasionSuitability = pattern.occasionPreferences;
      
      const insights: LearningInsights = {
        personalizedWeights,
        colorAffinityScore,
        itemCompatibilityMatrix,
        occasionSuitability
      };
      
      // שמירת התובנות במסד הנתונים
      await this.saveLearningInsights(pattern.userId, insights);
      
      console.log(`✅ [FeedbackLearning] תובנות למידה נוצרו ונשמרו`);
      return insights;
      
    } catch (error) {
      console.error('❌ [FeedbackLearning] שגיאה ביצירת תובנות למידה:', error);
      return {
        personalizedWeights: {},
        colorAffinityScore: {},
        itemCompatibilityMatrix: {},
        occasionSuitability: {}
      };
    }
  }
  
  /**
   * מיישם תובנות למידה בחזרה לאייגנטים - בצורה מיידית וקבועה
   */
  async applyLearningToAgents(userId: string, insights: LearningInsights): Promise<boolean> {
    try {
      console.log(`⚡ [FeedbackLearning] מיישם למידה לאייגנטים עבור: ${userId}`);
      
      // שמירה ב-agent_runs כחוקי למידה פעילים
      const { error: rulesError } = await supabase
        .from('agent_runs')
        .insert({
          user_id: userId,
          agent_name: 'learning-rules',
          result: {
            type: 'active_learning_rules',
            insights,
            appliedAt: new Date().toISOString(),
            rules: {
              dislikedItems: insights.itemCompatibilityMatrix.dislikedItems || [],
              mustAvoid: insights.itemCompatibilityMatrix.mustAvoid || [],
              preferredColors: Object.keys(insights.colorAffinityScore).filter(c => insights.colorAffinityScore[c] > 0.7),
              occasionPreferences: insights.occasionSuitability
            }
          } as any,
          score: 100,
          status: 'active_rules'
        });
      
      if (rulesError) {
        console.error('❌ שגיאה בשמירת חוקי למידה:', rulesError);
      }
      
      // גם שמירה ב-localStorage לגישה מהירה
      localStorage.setItem(`personalized-weights-${userId}`, JSON.stringify(insights.personalizedWeights));
      localStorage.setItem(`color-affinity-${userId}`, JSON.stringify(insights.colorAffinityScore));
      localStorage.setItem(`item-compatibility-${userId}`, JSON.stringify(insights.itemCompatibilityMatrix));
      
      const agentConfig = {
        userId,
        learningApplied: true,
        personalizedInsights: insights,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(`agent-learning-config-${userId}`, JSON.stringify(agentConfig));
      
      console.log(`✅ [FeedbackLearning] למידה יושמה בהצלחה לאייגנטים (DB + localStorage)`);
      return true;
      
    } catch (error) {
      console.error('❌ [FeedbackLearning] שגיאה ביישום למידה לאייגנטים:', error);
      return false;
    }
  }
  
  // Helper methods
  private extractColorPreferences(feedback: any[]): string[] {
    const likedItems = feedback.filter(f => f.user_liked === true);
    const colors = new Set<string>();
    
    likedItems.forEach(f => {
      if (f.result?.top?.colour) colors.add(f.result.top.colour);
      if (f.result?.bottom?.colour) colors.add(f.result.bottom.colour);
    });
    
    return Array.from(colors);
  }
  
  private extractDislikedItems(feedback: any[]): string[] {
    const disliked = feedback.filter(f => f.result?.userFeedback?.isLiked === false);
    const items: string[] = [];
    
    disliked.forEach(f => {
      if (f.result?.top?.id) items.push(f.result.top.id);
      if (f.result?.bottom?.id) items.push(f.result.bottom.id);
      if (f.result?.shoes?.id) items.push(f.result.shoes.id);
      if (f.result?.coat?.id) items.push(f.result.coat.id);
    });
    
    return [...new Set(items)];
  }
  
  private extractLikedCombinations(feedback: any[]): string[] {
    return feedback
      .filter(f => f.result?.userFeedback?.isLiked === true)
      .map(f => {
        const top = f.result?.top?.id || '';
        const bottom = f.result?.bottom?.id || '';
        const shoes = f.result?.shoes?.id || '';
        return `${top}-${bottom}-${shoes}`;
      })
      .filter(combo => combo.split('-').every(id => id));
  }
  
  private analyzeOccasionPreferences(learningData: LearningData[]): Record<string, number> {
    const occasions: Record<string, number> = {};
    learningData.forEach(data => {
      data.successfulCombinations.forEach(combo => {
        occasions[combo.occasion] = (occasions[combo.occasion] || 0) + 1;
      });
    });
    return occasions;
  }
  
  private trackStyleEvolution(learningData: LearningData[]): any[] {
    return learningData.map(data => ({
      timestamp: data.contextData.sessionData.timestamp,
      styleProfile: data.userPreferences.styleProfile,
      confidence: data.contextData.userEngagement * 10
    }));
  }
  
  private calculatePersonalizedWeights(pattern: FeedbackPattern): Record<string, number> {
    // חישוב משקלים בהתאם להעדפות
    return {
      colorImportance: pattern.preferredColors.length > 3 ? 0.8 : 0.5,
      styleConsistency: pattern.styleEvolution.length > 2 ? 0.9 : 0.6,
      occasionFocus: Object.keys(pattern.occasionPreferences).length > 1 ? 0.7 : 0.4
    };
  }
  
  private calculateColorAffinity(preferredColors: string[]): Record<string, number> {
    const affinity: Record<string, number> = {};
    preferredColors.forEach((color, index) => {
      affinity[color] = (preferredColors.length - index) / preferredColors.length;
    });
    return affinity;
  }
  
  private buildCompatibilityMatrix(likedCombinations: string[]): Record<string, string[]> {
    const matrix: Record<string, string[]> = {};
    likedCombinations.forEach(combo => {
      const [top, bottom, shoes] = combo.split('-');
      if (top && bottom && shoes) {
        if (!matrix[top]) matrix[top] = [];
        matrix[top].push(bottom, shoes);
      }
    });
    return matrix;
  }
  
  private async saveLearningInsights(userId: string, insights: LearningInsights): Promise<void> {
    const { error } = await supabase
      .from('agent_runs')
      .insert({
        user_id: userId,
        agent_name: 'feedback-learning-agent',
        result: insights as any,
        score: Object.keys(insights.personalizedWeights).length * 10,
        status: 'learning_insights'
      });
    
    if (error) {
      console.error('❌ שגיאה בשמירת תובנות למידה:', error);
    }
  }
}

export const feedbackLearningAgent = new FeedbackLearningAgent();