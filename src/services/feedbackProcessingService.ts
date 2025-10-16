import { supabase } from "@/integrations/supabase/client";
import { feedbackLearningAgent } from "@/agents/feedbackLearningAgent";

/**
 * שירות עיבוד פידבק ולמידה אוטומטית
 */
export class FeedbackProcessingService {
  
  /**
   * מעבד פידבק חדש ומפעיל תהליך למידה
   */
  async processFeedback(userId: string | null): Promise<void> {
    try {
      console.log('🔄 [FeedbackProcessing] מתחיל עיבוד פידבק ללמידה');
      
      // אם אין משתמש, לא נלמד
      if (!userId) {
        console.log('ℹ️ [FeedbackProcessing] אין משתמש מחובר, דילוג על למידה');
        return;
      }
      
      // שלב 1: ניתוח דפוסי פידבק
      console.log('📊 [FeedbackProcessing] שלב 1: ניתוח דפוסים');
      const pattern = await feedbackLearningAgent.analyzeFeedbackPatterns(userId);
      
      if (!pattern) {
        console.log('⚠️ [FeedbackProcessing] לא נמצאו דפוסים מספיקים ללמידה');
        return;
      }
      
      // שלב 2: יצירת תובנות למידה
      console.log('🧠 [FeedbackProcessing] שלב 2: יצירת תובנות');
      const insights = await feedbackLearningAgent.generateLearningInsights(pattern);
      
      // שלב 3: יישום למידה לאייגנטים
      console.log('⚡ [FeedbackProcessing] שלב 3: יישום למידה');
      const applied = await feedbackLearningAgent.applyLearningToAgents(userId, insights);
      
      if (applied) {
        console.log('✅ [FeedbackProcessing] למידה הושלמה בהצלחה!');
        
        // שמירת סטטוס למידה אחרון
        await this.saveProcessingStatus(userId, 'success', insights);
      } else {
        console.log('❌ [FeedbackProcessing] למידה נכשלה');
        await this.saveProcessingStatus(userId, 'failed', null);
      }
      
    } catch (error) {
      console.error('❌ [FeedbackProcessing] שגיאה בעיבוד פידבק:', error);
      if (userId) {
        await this.saveProcessingStatus(userId, 'error', null);
      }
    }
  }
  
  /**
   * בודק אם יש פידבק חדש שטרם עובד
   */
  async checkForNewFeedback(userId: string): Promise<boolean> {
    try {
      // שליפת הפידבק האחרון שעובד
      const { data: lastProcessed } = await supabase
        .from('agent_runs')
        .select('timestamp')
        .eq('user_id', userId)
        .eq('agent_name', 'feedback-learning-agent')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();
      
      const lastProcessedTime = lastProcessed?.timestamp 
        ? new Date(lastProcessed.timestamp).getTime() 
        : 0;
      
      // שליפת פידבק חדש מ-agent_runs
      const { data: newFeedback } = await supabase
        .from('agent_runs')
        .select('timestamp')
        .eq('user_id', userId)
        .eq('status', 'feedback')
        .gt('timestamp', new Date(lastProcessedTime).toISOString())
        .limit(1);
      
      return (newFeedback && newFeedback.length > 0) || false;
      
    } catch (error) {
      console.error('❌ [FeedbackProcessing] שגיאה בבדיקת פידבק חדש:', error);
      return false;
    }
  }
  
  /**
   * שומר סטטוס של תהליך העיבוד
   */
  private async saveProcessingStatus(
    userId: string, 
    status: 'success' | 'failed' | 'error',
    insights: any
  ): Promise<void> {
    await supabase
      .from('agent_runs')
      .insert({
        user_id: userId,
        agent_name: 'feedback-processing-service',
        result: {
          status,
          insights,
          processedAt: new Date().toISOString()
        } as any,
        score: status === 'success' ? 100 : 0,
        status: `feedback_processing_${status}`
      });
  }
  
  /**
   * מריץ עיבוד פידבק לכל המשתמשים שיש להם פידבק חדש
   */
  async processAllPendingFeedback(): Promise<void> {
    try {
      console.log('🔄 [FeedbackProcessing] מעבד פידבק לכל המשתמשים');
      
      // שליפת רשימת משתמשים עם פידבק מ-agent_runs
      const { data: users } = await supabase
        .from('agent_runs')
        .select('user_id')
        .eq('status', 'feedback')
        .not('user_id', 'is', null);
      
      if (!users || users.length === 0) {
        console.log('ℹ️ [FeedbackProcessing] אין פידבק חדש לעיבוד');
        return;
      }
      
      // עיבוד ייחודי של כל משתמש
      const uniqueUserIds = [...new Set(users.map(u => u.user_id).filter((id): id is string => id !== null))];
      
      for (const userId of uniqueUserIds) {
        const hasNew = await this.checkForNewFeedback(userId);
        if (hasNew) {
          await this.processFeedback(userId);
        }
      }
      
      console.log(`✅ [FeedbackProcessing] עיבוד הושלם עבור ${uniqueUserIds.length} משתמשים`);
      
    } catch (error) {
      console.error('❌ [FeedbackProcessing] שגיאה בעיבוד כללי:', error);
    }
  }
}

export const feedbackProcessingService = new FeedbackProcessingService();
