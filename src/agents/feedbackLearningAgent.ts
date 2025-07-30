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
      
      // שליפת כל נתוני הפידבק למשתמש
      const { data: outfitFeedback, error: outfitError } = await supabase
        .from('outfit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (outfitError) {
        console.error('❌ שגיאה בשליפת פידבק תלבושות:', outfitError);
        return null;
      }
      
      // שליפת נתוני למידה קיימים
      const learningData = await learningAgent.getLearningDataForAgents(userId);
      
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
   * מיישם תובנות למידה בחזרה לאייגנטים
   */
  async applyLearningToAgents(userId: string, insights: LearningInsights): Promise<boolean> {
    try {
      console.log(`⚡ [FeedbackLearning] מיישם למידה לאייגנטים עבור: ${userId}`);
      
      // שמירת הגדרות מותאמות אישית ב-localStorage
      localStorage.setItem(`personalized-weights-${userId}`, JSON.stringify(insights.personalizedWeights));
      localStorage.setItem(`color-affinity-${userId}`, JSON.stringify(insights.colorAffinityScore));
      localStorage.setItem(`item-compatibility-${userId}`, JSON.stringify(insights.itemCompatibilityMatrix));
      
      // עדכון הגדרות אייגנטים
      const agentConfig = {
        userId,
        learningApplied: true,
        personalizedInsights: insights,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(`agent-learning-config-${userId}`, JSON.stringify(agentConfig));
      
      console.log(`✅ [FeedbackLearning] למידה יושמה בהצלחה לאייגנטים`);
      return true;
      
    } catch (error) {
      console.error('❌ [FeedbackLearning] שגיאה ביישום למידה לאייגנטים:', error);
      return false;
    }
  }
  
  // Helper methods
  private extractColorPreferences(feedback: any[]): string[] {
    // לוגיקה לחילוץ העדפות צבע מפידבק חיובי
    const likedItems = feedback.filter(f => f.user_liked === true);
    // יש להרחיב ולהתבסס על נתוני צבע פריטים
    return ['#2C3E50', '#E74C3C', '#3498DB']; // placeholder
  }
  
  private extractDislikedItems(feedback: any[]): string[] {
    return feedback
      .filter(f => f.user_liked === false)
      .map(f => [f.top_id, f.bottom_id, f.shoes_id])
      .flat();
  }
  
  private extractLikedCombinations(feedback: any[]): string[] {
    return feedback
      .filter(f => f.user_liked === true)
      .map(f => `${f.top_id}-${f.bottom_id}-${f.shoes_id}`);
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
      if (!matrix[top]) matrix[top] = [];
      matrix[top].push(bottom, shoes);
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