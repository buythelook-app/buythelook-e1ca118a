
import { supabase } from "@/lib/supabaseClient";
import { Agent, AgentResult } from "./index";
import { extractImageUrl } from "../services/outfitGenerationService";
import logger from "@/lib/logger";

export class StylingAgentClass implements Agent {
  name = "styling-agent";

  async run(userId: string): Promise<AgentResult> {
    try {
      console.log(`👗 [StylingAgent] מתחיל יצירת סטיילינג עבור: ${userId}`);
      
      // חילוץ העדפות מה-localStorage
      const styleAnalysis = localStorage.getItem('styleAnalysis');
      const currentMood = localStorage.getItem('current-mood');
      
      if (!styleAnalysis) {
        return {
          success: false,
          error: "לא נמצא ניתוח סטייל עבור המשתמש"
        };
      }

      const parsedStyleAnalysis = JSON.parse(styleAnalysis);
      const styleProfile = parsedStyleAnalysis?.analysis?.styleProfile?.toLowerCase();
      const bodyShape = parsedStyleAnalysis?.analysis?.bodyShape;
      const colorPreferences = parsedStyleAnalysis?.analysis?.colorPreferences || [];

      console.log(`📊 [StylingAgent] פרופיל סטייל: ${styleProfile}, מבנה גוף: ${bodyShape}`);

      // קבלת פריטים מהמאגר
      const { data: allItems, error } = await supabase
        .from('zara_cloth')
        .select('*')
        .limit(100);

      if (error || !allItems) {
        return {
          success: false,
          error: "שגיאה בטעינת פריטים מהמאגר"
        };
      }

      // סינון פריטים על פי העדפות
      const filteredItems = allItems.filter(item => {
        const itemColor = item.colour?.toLowerCase() || '';
        
        // התאמה לצבעים מועדפים
        if (colorPreferences.length > 0) {
          const colorMatch = colorPreferences.some((pref: string) => 
            itemColor.includes(pref.toLowerCase())
          );
          if (!colorMatch) return false;
        }

        return true;
      });

      // חלוקת פריטים לקטגוריות - בדיוק 3 קטגוריות
      const tops = filteredItems.filter(item => {
        const name = item.product_name?.toLowerCase() || '';
        return name.includes('חולצ') || name.includes('טופ') || name.includes('בלוז');
      }).slice(0, 3);

      const bottoms = filteredItems.filter(item => {
        const name = item.product_name?.toLowerCase() || '';
        return name.includes('מכנס') || name.includes('חצאית') || name.includes('ג\'ינס');
      }).slice(0, 3);

      const shoes = filteredItems.filter(item => {
        const name = item.product_name?.toLowerCase() || '';
        return name.includes('נעל') || name.includes('סנדל') || name.includes('מגף');
      }).slice(0, 3);

      if (tops.length === 0 || bottoms.length === 0 || shoes.length === 0) {
        return {
          success: false,
          error: "לא נמצאו מספיק פריטים מתאימים ליצירת 3 פריטים"
        };
      }

      // יצירת לוק עם בדיוק 3 פריטים
      const outfitData = {
        looks: [{
          id: `look-${Date.now()}`,
          items: [
            {
              id: tops[0].id,
              name: tops[0].product_name,
              type: 'top',
              price: `₪${tops[0].price}`,
              image: extractImageUrl(tops[0].image)
            },
            {
              id: bottoms[0].id,
              name: bottoms[0].product_name,
              type: 'bottom',
              price: `₪${bottoms[0].price}`,
              image: extractImageUrl(bottoms[0].image)
            },
            {
              id: shoes[0].id,
              name: shoes[0].product_name,
              type: 'shoes',
              price: `₪${shoes[0].price}`,
              image: extractImageUrl(shoes[0].image)
            }
          ],
          style: styleProfile,
          occasion: 'general',
          description: `מראה ${styleProfile} מותאם לפרופיל הסטייל שלך - 3 פריטים בלבד`
        }],
        reasoning: `נבחר על בסיס הפרופיל ${styleProfile} וההעדפות שלך עם בדיוק 3 פריטים`
      };

      // שמירת התוצאה
      await this.saveResult(userId, outfitData, 85);

      console.log(`✅ [StylingAgent] הושלם בהצלחה עבור ${userId} עם 3 פריטים`);

      return {
        success: true,
        data: outfitData,
        recommendations: [
          'התאם אביזרים מתאימים כדי להשלים את המראה',
          'שקול להוסיף שכבות נוספות בהתאם למזג האוויר',
          'וודא שהצבעים מתאימים זה לזה'
        ]
      };

    } catch (error) {
      console.error(`❌ [StylingAgent] שגיאה:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "שגיאה לא ידועה"
      };
    }
  }

  private async saveResult(userId: string, data: any, score: number): Promise<void> {
    try {
      await supabase
        .from('agent_runs')
        .insert({
          user_id: userId,
          agent_name: this.name,
          result: data as any,
          score,
          status: 'success'
        });
    } catch (error) {
      console.error(`שגיאה בשמירת תוצאה עבור ${this.name}:`, error);
    }
  }
}

export const stylingAgent = new StylingAgentClass();
