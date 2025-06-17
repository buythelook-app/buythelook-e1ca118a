
import { supabase } from "@/lib/supabaseClient";
import { Agent, AgentResult } from "./index";
import logger from "@/lib/logger";

export class RecommendationAgentClass implements Agent {
  name = "recommendation-agent";

  async run(userId: string): Promise<AgentResult> {
    try {
      console.log(`💡 [RecommendationAgent] מתחיל יצירת המלצות עבור: ${userId}`);
      
      // קבלת המלצות בסיסיות על סמך העדפות המשתמש
      const recommendations = [
        "השתמש באביזרים מתאימים כדי להשלים את המראה",
        "ודא שהצבעים מתאימים זה לזה ויוצרים הרמוניה",
        "התאם את הבחירה לאירוע המתוכנן",
        "שקול את מזג האוויר בבחירת השכבות"
      ];

      const recommendationData = {
        tips: recommendations,
        styleAdvice: "המראה שנבחר מתאים לסגנון שלך",
        occasion: "general"
      };

      console.log(`✅ [RecommendationAgent] המלצות נוצרו בהצלחה עבור ${userId}`);

      return {
        success: true,
        data: recommendationData,
        recommendations
      };

    } catch (error) {
      console.error(`❌ [RecommendationAgent] שגיאה:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "שגיאה לא ידועה"
      };
    }
  }
}

export const recommendationAgent = new RecommendationAgentClass();
