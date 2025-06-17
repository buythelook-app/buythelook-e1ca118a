
import { supabase } from "@/lib/supabaseClient";
import { Agent, AgentResult } from "./index";
import { createCasualOutfit, getCasualStyleRecommendations } from "../services/casualOutfitService";
import logger from "@/lib/logger";

export class PersonalizationAgent implements Agent {
  role = "Personal Stylist Agent";
  goal = "Create personalized outfit recommendations based on user preferences";
  backstory = "An experienced personal stylist with deep knowledge of fashion trends and body types";
  tools: any[] = [];

  async run(userId: string): Promise<AgentResult> {
    try {
      console.log(`🎯 [PersonalizationAgent] מתחיל ניתוח התאמה אישית עבור: ${userId}`);
      
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

      console.log(`📊 [PersonalizationAgent] פרופיל סטייל: ${styleProfile}, מבנה גוף: ${bodyShape}`);

      let outfitData;
      let recommendations;

      // לוגיקה מיוחדת לסגנון קזואל
      if (styleProfile === 'casual' || currentMood === 'casual') {
        console.log(`👕 [PersonalizationAgent] יוצר תלבושת קזואלית מותאמת`);
        
        // שימוש בשירות הקזואל החדש
        const casualOutfit = await createCasualOutfit();
        
        if (!casualOutfit.top || !casualOutfit.bottom || !casualOutfit.shoes) {
          return {
            success: false,
            error: "לא הצלחנו למצוא מספיק פריטים קזואליים"
          };
        }

        outfitData = {
          looks: [{
            id: `casual-look-${Date.now()}`,
            items: [casualOutfit.top, casualOutfit.bottom, casualOutfit.shoes],
            style: 'casual',
            occasion: 'casual',
            description: `מראה קזואל נוח ומעוצב - ${casualOutfit.top.name}, ${casualOutfit.bottom.name} ו${casualOutfit.shoes.name}`,
            enhanced: true
          }],
          reasoning: "תלבושת קזואלית שנבחרה במיוחד עם בגדים נוחים ומתאימים ליום-יום"
        };

        recommendations = getCasualStyleRecommendations();

      } else {
        // לוגיקה רגילה לסגנונות אחרים
        
        // קבלת פריטים מהמאגר
        const { data: allItems, error } = await supabase
          .from('zara_cloth')
          .select('*')
          .limit(50);

        if (error || !allItems) {
          return {
            success: false,
            error: "שגיאה בטעינת פריטים מהמאגר"
          };
        }

        // סינון ראשוני של פריטים
        const filteredItems = allItems.filter(item => {
          const itemName = item.product_name?.toLowerCase() || '';
          const itemColor = item.colour?.toLowerCase() || '';
          
          // התאמה לצבעים מועדפים
          const colorMatch = colorPreferences.length === 0 || 
            colorPreferences.some((pref: string) => itemColor.includes(pref.toLowerCase()));

          return colorMatch;
        });

        // זיהוי שמלות וטוניקות (פריטים שלא צריכים חלק תחתון)
        const dressesAndTunics = filteredItems.filter(item => 
          this.isDressOrTunic(item)
        );

        // חלוקת פריטים לקטגוריות (ללא שמלות וטוניקות)
        const tops = filteredItems.filter(item => 
          !this.isDressOrTunic(item) && (
            item.product_name?.toLowerCase().includes('חולצ') || 
            item.product_name?.toLowerCase().includes('טופ')
          )
        ).slice(0, 3);

        const bottoms = filteredItems.filter(item => 
          item.product_name?.toLowerCase().includes('מכנס') || 
          item.product_name?.toLowerCase().includes('חצאית')
        ).slice(0, 3);

        const shoes = filteredItems.filter(item => 
          item.product_name?.toLowerCase().includes('נעל')
        ).slice(0, 3);

        // אם יש שמלה או טוניקה, יצירת לוק עם 2 פריטים בלבד
        if (dressesAndTunics.length > 0 && shoes.length > 0) {
          const dressOrTunic = dressesAndTunics[0];
          const selectedShoes = shoes[0];

          const dressLook = {
            id: `dress-look-${Date.now()}`,
            items: [
              {
                id: dressOrTunic.id,
                name: dressOrTunic.product_name,
                type: 'dress',
                price: `₪${dressOrTunic.price}`,
                image: this.extractImageUrl(dressOrTunic.image)
              },
              {
                id: selectedShoes.id,
                name: selectedShoes.product_name,
                type: 'shoes',
                price: `₪${selectedShoes.price}`,
                image: this.extractImageUrl(selectedShoes.image)
              }
            ],
            style: styleProfile,
            occasion: 'general',
            description: `${this.isDress(dressOrTunic) ? 'שמלה' : 'טוניקה'} ${dressOrTunic.product_name} עם ${selectedShoes.product_name}`
          };

          outfitData = {
            looks: [dressLook],
            reasoning: `נבחר ${this.isDress(dressOrTunic) ? 'שמלה' : 'טוניקה'} על בסיס הפרופיל ${styleProfile} - אין צורך בחלק תחתון`
          };

        } else if (tops.length > 0 && bottoms.length > 0 && shoes.length > 0) {
          // לוק רגיל עם 3 פריטים
          const firstLook = {
            id: `look-${Date.now()}`,
            items: [
              {
                id: tops[0].id,
                name: tops[0].product_name,
                type: 'top',
                price: `₪${tops[0].price}`,
                image: this.extractImageUrl(tops[0].image)
              },
              {
                id: bottoms[0].id,
                name: bottoms[0].product_name,
                type: 'bottom',
                price: `₪${bottoms[0].price}`,
                image: this.extractImageUrl(bottoms[0].image)
              },
              {
                id: shoes[0].id,
                name: shoes[0].product_name,
                type: 'shoes',
                price: `₪${shoes[0].price}`,
                image: this.extractImageUrl(shoes[0].image)
              }
            ],
            style: styleProfile,
            occasion: 'general',
            description: `מראה ${styleProfile} מותאם לפרופיל הסטייל שלך`
          };

          outfitData = {
            looks: [firstLook],
            reasoning: `נבחר על בסיס הפרופיל ${styleProfile} וההעדפות שלך`
          };
        } else {
          return {
            success: false,
            error: "לא נמצאו מספיק פריטים מתאימים ליצירת תלבושת שלמה"
          };
        }

        recommendations = [
          'התאם אביזרים מתאימים כדי להשלים את המראה',
          'שקול להוסיף שכבות נוספות בהתאם למזג האוויר',
          'וודא שהצבעים מתאימים זה לזה'
        ];
      }

      // שמירת התוצאה
      await this.saveResult(userId, outfitData, 85);

      console.log(`✅ [PersonalizationAgent] הושלם בהצלחה עבור ${userId}`);

      return {
        success: true,
        data: outfitData,
        recommendations
      };

    } catch (error) {
      console.error(`❌ [PersonalizationAgent] שגיאה:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "שגיאה לא ידועה"
      };
    }
  }

  private isDressOrTunic(item: any): boolean {
    const name = (item.product_name || '').toLowerCase();
    const subfamily = (item.product_subfamily || '').toLowerCase();
    const family = (item.product_family || '').toLowerCase();
    
    const dressKeywords = ['שמלה', 'dress', 'gown'];
    const tunicKeywords = ['טוניקה', 'tunic'];
    
    const searchText = `${name} ${subfamily} ${family}`;
    
    return [...dressKeywords, ...tunicKeywords].some(keyword => 
      searchText.includes(keyword)
    );
  }

  private isDress(item: any): boolean {
    const name = (item.product_name || '').toLowerCase();
    const subfamily = (item.product_subfamily || '').toLowerCase();
    const family = (item.product_family || '').toLowerCase();
    
    const dressKeywords = ['שמלה', 'dress', 'gown'];
    const searchText = `${name} ${subfamily} ${family}`;
    
    return dressKeywords.some(keyword => searchText.includes(keyword));
  }

  private extractImageUrl(imageJson: any): string {
    if (typeof imageJson === 'string') {
      return imageJson;
    }
    
    if (!imageJson) {
      return '/placeholder.svg';
    }
    
    if (Array.isArray(imageJson)) {
      if (imageJson.length > 0) {
        if (typeof imageJson[0] === 'string') {
          return imageJson[0];
        }
        if (typeof imageJson[0] === 'object' && imageJson[0] && imageJson[0].url) {
          return imageJson[0].url;
        }
      }
      return '/placeholder.svg';
    }
    
    if (typeof imageJson === 'object' && imageJson.urls && Array.isArray(imageJson.urls)) {
      return imageJson.urls[0] || '/placeholder.svg';
    }
    
    if (typeof imageJson === 'object' && imageJson.url) {
      return imageJson.url;
    }

    if (typeof imageJson === 'object' && imageJson.images && Array.isArray(imageJson.images)) {
      return imageJson.images[0] || '/placeholder.svg';
    }
    
    if (typeof imageJson === 'object') {
      for (const key of Object.keys(imageJson)) {
        const value = imageJson[key];
        if (typeof value === 'string' && 
            (value.startsWith('http') || value.startsWith('/') || 
             value.includes('image') || value.includes('.jpg') || 
             value.includes('.png') || value.includes('.webp'))) {
          return value;
        }
        
        if (Array.isArray(value) && value.length > 0) {
          if (typeof value[0] === 'string') {
            return value[0];
          }
        }
      }
    }
    
    return '/placeholder.svg';
  }

  private async saveResult(userId: string, data: any, score: number): Promise<void> {
    try {
      await supabase
        .from('agent_runs')
        .insert({
          user_id: userId,
          agent_name: 'personalization-agent',
          result: data as any,
          score,
          status: 'success'
        });
    } catch (error) {
      console.error(`שגיאה בשמירת תוצאה עבור personalization-agent:`, error);
    }
  }
}

export const personalizationAgent = new PersonalizationAgent();
