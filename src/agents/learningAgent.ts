
import { supabase } from "@/integrations/supabase/client";
import { DashboardItem } from "@/types/lookTypes";
import logger from "@/lib/logger";

export interface LearningData {
  userId: string;
  successfulCombinations: Array<{
    occasion: string;
    items: DashboardItem[];
    userLiked: boolean;
    timestamp: string;
  }>;
  userPreferences: {
    styleProfile: string;
    bodyShape: string;
    mood: string;
    colorPreferences: string[];
  };
  contextData: {
    generationMethod: 'home-page' | 'agent-generated';
    userEngagement: number;
    sessionData: any;
  };
}

/**
 * Learning Agent - חולץ נתונים מעמוד הבית ומעביר לאייגנטים ללמידה
 */
export class LearningAgent {
  
  /**
   * חולץ נתונים מהעמוד הראשי ומהעדפות המשתמש
   */
  async extractHomepageLearningData(userId: string): Promise<LearningData | null> {
    try {
      console.log(`🧠 [LearningAgent] מחלץ נתונים ללמידה עבור משתמש: ${userId}`);
      
      // חילוץ העדפות מה-localStorage
      const styleAnalysis = localStorage.getItem('styleAnalysis');
      const currentMood = localStorage.getItem('current-mood');
      const outfitFeedback = localStorage.getItem('outfit-feedback');
      
      if (!styleAnalysis) {
        console.log(`❌ [LearningAgent] לא נמצא ניתוח סטייל עבור המשתמש`);
        return null;
      }
      
      const parsedStyleAnalysis = JSON.parse(styleAnalysis);
      const parsedFeedback = outfitFeedback ? JSON.parse(outfitFeedback) : [];
      
      // חילוץ קומבינציות מוצלחות מהפידבק
      const successfulCombinations = parsedFeedback
        .filter((feedback: any) => feedback.isLiked)
        .map((feedback: any) => ({
          occasion: 'general', // ניתן לשפר בעתיד
          items: [
            { id: feedback.topId, type: 'top' },
            { id: feedback.bottomId, type: 'bottom' },
            { id: feedback.shoesId, type: 'shoes' }
          ],
          userLiked: true,
          timestamp: feedback.timestamp
        }));
      
      // בניית נתוני למידה
      const learningData: LearningData = {
        userId,
        successfulCombinations,
        userPreferences: {
          styleProfile: parsedStyleAnalysis.analysis?.styleProfile || 'classic',
          bodyShape: parsedStyleAnalysis.analysis?.bodyShape || 'H',
          mood: currentMood || 'neutral',
          colorPreferences: parsedStyleAnalysis.analysis?.colorPreferences || []
        },
        contextData: {
          generationMethod: 'home-page',
          userEngagement: successfulCombinations.length,
          sessionData: {
            timestamp: new Date().toISOString(),
            feedbackCount: parsedFeedback.length
          }
        }
      };
      
      console.log(`✅ [LearningAgent] נתוני למידה חולצו בהצלחה:`, {
        successfulCombinations: learningData.successfulCombinations.length,
        styleProfile: learningData.userPreferences.styleProfile,
        engagement: learningData.contextData.userEngagement
      });
      
      return learningData;
      
    } catch (error) {
      console.error(`❌ [LearningAgent] שגיאה בחילוץ נתוני למידה:`, error);
      return null;
    }
  }
  
  /**
   * שומר נתוני למידה במסד הנתונים לשימוש האייגנטים
   */
  async saveLearningData(learningData: LearningData): Promise<boolean> {
    try {
      console.log(`💾 [LearningAgent] שומר נתוני למידה למסד הנתונים`);
      
      // שמירה בטבלת agent_runs עם סוג מיוחד - cast to Json
      const { error } = await supabase
        .from('agent_runs')
        .insert({
          user_id: learningData.userId,
          agent_name: 'learning-agent',
          result: learningData as any, // Cast to Json type
          score: learningData.contextData.userEngagement * 10, // ציון מבוסס על מעורבות
          status: 'learning_data'
        });
      
      if (error) {
        console.error(`❌ [LearningAgent] שגיאה בשמירת נתוני למידה:`, error);
        return false;
      }
      
      console.log(`✅ [LearningAgent] נתוני למידה נשמרו בהצלחה`);
      return true;
      
    } catch (error) {
      console.error(`❌ [LearningAgent] שגיאה בשמירת נתוני למידה:`, error);
      return false;
    }
  }
  
  /**
   * מחזיר נתוני למידה לאייגנטים
   */
  async getLearningDataForAgents(userId: string): Promise<LearningData[]> {
    try {
      console.log(`📖 [LearningAgent] מחזיר נתוני למידה לאייגנטים עבור: ${userId}`);
      
      const { data, error } = await supabase
        .from('agent_runs')
        .select('result, timestamp')
        .eq('user_id', userId)
        .eq('agent_name', 'learning-agent')
        .eq('status', 'learning_data')
        .order('timestamp', { ascending: false })
        .limit(10); // 10 רשומות אחרונות
      
      if (error) {
        console.error(`❌ [LearningAgent] שגיאה בטעינת נתוני למידה:`, error);
        return [];
      }
      
      const learningDataArray = data?.map(row => row.result as unknown as LearningData) || [];
      
      console.log(`✅ [LearningAgent] נטענו ${learningDataArray.length} רשומות למידה`);
      return learningDataArray;
      
    } catch (error) {
      console.error(`❌ [LearningAgent] שגיאה בטעינת נתוני למידה:`, error);
      return [];
    }
  }
}

export const learningAgent = new LearningAgent();
