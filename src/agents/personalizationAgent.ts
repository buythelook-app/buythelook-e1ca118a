import { supabase } from "@/lib/supabaseClient";
import { Agent, AgentResult } from "./index";
import { createStyleOutfit, getStyleRecommendations } from "../services/styleOutfitService";
import { styleRecommendations } from "@/components/quiz/constants/styleRecommendations";
import { useExternalCatalog } from "@/hooks/useExternalCatalog";
import { fetchDashboardItems } from "@/services/lookService";
import logger from "@/lib/logger";

// Body shape recommendations mapping
const BODY_SHAPE_RECOMMENDATIONS = {
  hourglass: {
    tops: ['חולצה', 'טופ', 'בלוזה'],
    bottoms: ['מכנסיים צרים', 'חצאית עיפרון', 'ג\'ינס צמוד'],
    styles: ['מותאם לגוף', 'מדגיש מותן'],
    avoid: ['חולצות רחבות', 'שמלות ישרות']
  },
  pear: {
    tops: ['חולצות עם פרטים בחלק העליון', 'בלוזות עם שרוולים'],
    bottoms: ['מכנסיים ישרים', 'חצאיות A', 'ג\'ינס ישר'],
    styles: ['מדגיש כתפיים', 'מוסיף נפח לחלק העליון'],
    avoid: ['חצאיות צמודות', 'מכנסיים צרים']
  },
  rectangle: {
    tops: ['חולצות עם קווים אופקיים', 'בלוזות עם פרטים'],
    bottoms: ['מכנסיים עם פרטים', 'חצאיות עם נפח'],
    styles: ['יוצר קווי גוף', 'מוסיף עומק ומימד'],
    avoid: ['בגדים ישרים מדי', 'חולצות פשוטות']
  },
  triangle: {
    tops: ['חולצות רחבות', 'בלוזות עם נפח בכתפיים'],
    bottoms: ['מכנסיים צרים', 'חצאיות ישרות'],
    styles: ['מאזן כתפיים רחבות', 'מדגיש חלק תחתון'],
    avoid: ['חולצות צמודות', 'פרטים בכתפיים']
  },
  oval: {
    tops: ['חולצות V', 'בלוזות עם קו מחשוף', 'טונקיות'],
    bottoms: ['מכנסיים ישרים', 'חצאיות A'],
    styles: ['מאריך צוואר', 'יוצר קו ישר'],
    avoid: ['חולצות צמודות בבטן', 'חגורות רחבות']
  }
};

export class PersonalizationAgent implements Agent {
  role = "Personal Stylist Agent";
  goal = "Create personalized outfit recommendations based on user preferences and body shape";
  backstory = "An experienced personal stylist with deep knowledge of fashion trends and body types";
  tools: any[] = [];

  async run(userId: string): Promise<AgentResult> {
    try {
      console.log(`🎯 [PersonalizationAgent] מתחיל ניתוח התאמה אישית עבור: ${userId}`);
      
      // טעינת נתוני השאלון מבסיס הנתונים
      const { data: quizData, error } = await (supabase as any)
        .from('style_quiz_results')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('שגיאה בטעינת נתוני השאלון:', error);
      }

      let styleProfile, bodyShape, colorPreferences, moodPreferences;

      if (quizData) {
        // שימוש בנתוני השאלון מבסיס הנתונים
        console.log('🎯 [PersonalizationAgent] נמצאו נתוני שאלון במאגר:', quizData);
        
        styleProfile = quizData.style_preferences && quizData.style_preferences.length > 0 
          ? quizData.style_preferences[quizData.style_preferences.length - 1].toLowerCase() 
          : 'casual';
        bodyShape = quizData.body_shape?.toLowerCase() || 'rectangle';
        colorPreferences = quizData.color_preferences || [];
        
        // שמירה על הסגנון המקורי מהשאלון ללא שינוי
        moodPreferences = 'general'; // מצב רוח ניטרלי שלא ישפיע על הסגנון
        
      } else {
        // אם אין נתוני שאלון במאגר, מחפש ב-localStorage
        console.log('🎯 [PersonalizationAgent] לא נמצאו נתוני שאלון במאגר, מחפש ב-localStorage');
        
        const styleAnalysis = localStorage.getItem('styleAnalysis');
        const currentMood = localStorage.getItem('current-mood');
        
        if (!styleAnalysis) {
          return {
            success: false,
            error: "נא להשלים את שאלון הסגנון כדי לקבל המלצות מותאמות אישית"
          };
        }

        const parsedStyleAnalysis = JSON.parse(styleAnalysis);
        styleProfile = parsedStyleAnalysis?.analysis?.styleProfile?.toLowerCase() || 'casual';
        bodyShape = parsedStyleAnalysis?.analysis?.bodyShape?.toLowerCase() || 'rectangle';
        colorPreferences = parsedStyleAnalysis?.analysis?.colorPreferences || [];
        moodPreferences = currentMood || 'general';
      }

      console.log(`📊 [PersonalizationAgent] פרופיל סטייל: ${styleProfile}, מבנה גוף: ${bodyShape}, מצב רוח: ${moodPreferences}`);

      // **NEW: שימוש באותו מקור נתונים כמו העמוד הראשי**
      console.log('🌐 [PersonalizationAgent] מביא נתונים מאותו מקור כמו העמוד הראשי (RapidAPI + Database)');
      const outfitData = await this.fetchDataLikeHomepage(styleProfile, bodyShape, colorPreferences, moodPreferences);

      if (!outfitData) {
        return {
          success: false,
          error: "לא הצלחנו ליצור תלבושת מותאמת אישית"
        };
      }

      const recommendations = this.getBodyShapeRecommendations(bodyShape, styleProfile);

      // שמירת התוצאה
      await this.saveResult(userId, outfitData, 90);

      console.log(`✅ [PersonalizationAgent] הושלם בהצלחה עבור ${userId} עם התחשבות במבנה גוף ${bodyShape}`);

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

  /**
   * מביא נתונים מאותו מקור כמו העמוד הראשי - RapidAPI + Database fallback
   */
  private async fetchDataLikeHomepage(styleProfile: string, bodyShape: string, colorPreferences: string[], moodPreferences: string): Promise<any> {
    try {
      console.log('🌐 [PersonalizationAgent] מחקה את לוגיקת העמוד הראשי - RapidAPI קודם');
      
      // שימוש באותה לוגיקה כמו usePersonalizedLooks
      const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
      
      // קודם נסה לקבל נתונים מ-RapidAPI (כמו בעמוד הראשי)
      const rapidApiData = await this.fetchFromRapidAPI(styleProfile, occasions);
      
      if (rapidApiData && rapidApiData.length > 0) {
        console.log(`✅ [PersonalizationAgent] SUCCESS - קיבל ${rapidApiData.length} פריטים מ-RapidAPI`);
        return this.convertRapidApiDataToOutfit(rapidApiData, styleProfile, bodyShape);
      }
      
      // אם RapidAPI נכשל, עבור ל-Database fallback (כמו בעמוד הראשי)
      console.log('⚠️ [PersonalizationAgent] RapidAPI failed, מעבר ל-Database fallback');
      const databaseData = await fetchDashboardItems();
      
      if (databaseData && Object.keys(databaseData).length > 0) {
        console.log(`✅ [PersonalizationAgent] SUCCESS - קיבל נתונים מ-Database fallback`);
        return this.convertDatabaseDataToOutfit(databaseData, styleProfile, bodyShape);
      }
      
      console.error('❌ [PersonalizationAgent] כל המקורות נכשלו');
      return null;
      
    } catch (error) {
      console.error('❌ [PersonalizationAgent] שגיאה בקבלת נתונים:', error);
      return null;
    }
  }

  /**
   * מביא נתונים מ-RapidAPI בדיוק כמו בעמוד הראשי
   */
  private async fetchFromRapidAPI(styleProfile: string, occasions: string[]): Promise<any[]> {
    try {
      // שימוש ב-useExternalCatalog hook logic (לא יכול להשתמש ב-hook בתוך class)
      const response = await fetch('https://aqkeprwxxsryropnhfvm.supabase.co/functions/v1/serp-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2Vwcnd4eHNyeXJvcG5oZnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MzE4MjksImV4cCI6MjA1MzQwNzgyOX0.1nstrLtlahU3kGAu-UrzgOVw6XwyKU6n5H5q4Taqtus`
        },
        body: JSON.stringify({
          query: `women ${styleProfile}`,
          gender: 'women',
          category: 'tops',
          limit: 6
        })
      });
      
      const result = await response.json();
      return result.success ? result.items : [];
      
    } catch (error) {
      console.error('❌ [PersonalizationAgent] RapidAPI error:', error);
      return [];
    }
  }

  /**
   * ממיר נתוני RapidAPI לפורמט outfit
   */
  private convertRapidApiDataToOutfit(rapidApiData: any[], styleProfile: string, bodyShape: string): any {
    const items = rapidApiData.slice(0, 3).map((item, index) => ({
      id: `rapidapi-${item.id}`,
      name: item.title,
      type: index === 0 ? 'top' : index === 1 ? 'bottom' : 'shoes',
      price: item.estimatedPrice?.replace(/[^0-9.]/g, '') || '29.99',
      image: item.imageUrl || item.thumbnailUrl || '/placeholder.svg'
    }));

    return {
      looks: [{
        id: `rapidapi-look-${Date.now()}`,
        items: items,
        style: styleProfile,
        occasion: 'general',
        description: `מראה ${styleProfile} מותאם למבנה גוף ${bodyShape} מקטלוג חיצוני`,
        enhanced: true
      }],
      reasoning: `נתונים חיים מקטלוג חיצוני (RapidAPI) מותאמים לסגנון ${styleProfile}`
    };
  }

  /**
   * ממיר נתוני Database לפורמט outfit
   */
  private convertDatabaseDataToOutfit(databaseData: any, styleProfile: string, bodyShape: string): any {
    // בחר מהנתונים הזמינים לפי הסגנון
    const occasionKey = styleProfile === 'work' ? 'Work' : 
                       styleProfile === 'evening' ? 'Evening' :
                       styleProfile === 'casual' ? 'Casual' : 'Weekend';
    
    const items = databaseData[occasionKey] || databaseData['Casual'] || [];
    
    if (items.length === 0) {
      return null;
    }

    const selectedItems = items.slice(0, 3).map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      price: `₪${item.price}`,
      image: item.image || '/placeholder.svg'
    }));

    return {
      looks: [{
        id: `database-look-${Date.now()}`,
        items: selectedItems,
        style: styleProfile,
        occasion: 'general',
        description: `מראה ${styleProfile} מותאם למבנה גוף ${bodyShape} ממאגר המוצרים`,
        enhanced: true
      }],
      reasoning: `נתונים ממאגר המוצרים (Database fallback) מותאמים לסגנון ${styleProfile}`
    };
  }

  private filterItemsByBodyShape(items: any[], bodyShape: string, colorPreferences: string[]): any[] {
    // קבל את הסגנון המשתמש מה-localStorage
    const styleData = localStorage.getItem('styleAnalysis');
    let userStyle = 'classic';
    if (styleData) {
      const parsed = JSON.parse(styleData);
      userStyle = parsed?.analysis?.styleProfile || 'classic';
    }

    console.log(`🎯 [PersonalizationAgent] מסנן פריטים לפי סגנון: ${userStyle}`);
    
    // קבל את הפריטים המתאימים לסגנון מההגדרות
    const styleRecs = this.getStyleRecommendations(userStyle);
    
    const shapeRecommendations = BODY_SHAPE_RECOMMENDATIONS[bodyShape as keyof typeof BODY_SHAPE_RECOMMENDATIONS];
    
    return items.filter(item => {
      const itemName = item.product_name?.toLowerCase() || '';
      const itemColor = item.colour?.toLowerCase() || '';
      
      // בדיקת התאמה לסגנון ספציפי
      const matchesStyleType = this.matchesStyleType(item, styleRecs);
      const matchesStyleColor = this.matchesStyleColor(itemColor, itemName, styleRecs);
      
      // בדיקת צבע כללית
      const colorMatch = colorPreferences.length === 0 || 
        colorPreferences.some((pref: string) => itemColor.includes(pref.toLowerCase())) ||
        matchesStyleColor;

      // אם אין המלצות למבנה גוף ספציפי
      if (!shapeRecommendations) {
        return (matchesStyleType || matchesStyleColor) && 
               (this.isTop(item) || this.isBottom(item) || this.isShoes(item) || this.isDressOrTunic(item));
      }

      // בדיקת התאמה למבנה גוף
      const isRecommendedTop = this.isTop(item) && 
        (shapeRecommendations.tops.some(recTop => itemName.includes(recTop.toLowerCase())) || matchesStyleType);
      
      const isRecommendedBottom = this.isBottom(item) && 
        (shapeRecommendations.bottoms.some(recBottom => itemName.includes(recBottom.toLowerCase())) || matchesStyleType);

      const isShoes = this.isShoes(item);
      const isDressOrTunic = this.isDressOrTunic(item);

      // בדיקת פריטים שצריך להימנע מהם
      const shouldAvoid = shapeRecommendations.avoid.some(avoidItem => 
        itemName.includes(avoidItem.toLowerCase()));

      return colorMatch && !shouldAvoid && (isRecommendedTop || isRecommendedBottom || isShoes || isDressOrTunic);
    });
  }

  // פונקציה חדשה שמקבלת את ההמלצות לסגנון ספציפי
  private getStyleRecommendations(styleProfile: string): any {
    // מיפוי שמות הסגנונות
    const styleMapping: { [key: string]: string } = {
      'minimalist': 'Minimalist',
      'classic': 'Classic', 
      'modern': 'Modern',
      'classy': 'Classy',
      'casual': 'Casual',
      'boohoo': 'Boo Hoo',
      'nordic': 'Nordic'
    };
    
    const mappedStyle = styleMapping[styleProfile] || 'Classic';
    return styleRecommendations[mappedStyle] || styleRecommendations.Classic;
  }

  // בדיקה אם הפריט מתאים לסוג הפריט הנדרש בסגנון
  private matchesStyleType(item: any, styleRecs: any): boolean {
    const itemName = item.product_name?.toLowerCase() || '';
    
    // בדיקה לפי סוג הפריט (חולצה, מכנסיים, נעליים וכו')
    if (this.isTop(item)) {
      const topType = styleRecs.top?.type?.toLowerCase() || '';
      return itemName.includes(topType) || 
             topType.includes('t-shirt') && itemName.includes('טי') ||
             topType.includes('blouse') && itemName.includes('בלוזה') ||
             topType.includes('sweater') && itemName.includes('סוודר');
    }
    
    if (this.isBottom(item)) {
      const bottomType = styleRecs.bottom?.type?.toLowerCase() || '';
      return itemName.includes(bottomType) ||
             bottomType.includes('trousers') && itemName.includes('מכנסי') ||
             bottomType.includes('jeans') && itemName.includes('ג\'ינס') ||
             bottomType.includes('skirt') && itemName.includes('חצאית');
    }
    
    if (this.isShoes(item)) {
      const shoeType = styleRecs.shoes?.type?.toLowerCase() || '';
      return itemName.includes(shoeType) ||
             shoeType.includes('loafers') && itemName.includes('נעלי') ||
             shoeType.includes('heels') && itemName.includes('עקב') ||
             shoeType.includes('boots') && itemName.includes('מגף');
    }
    
    return false;
  }

  // בדיקה אם הצבע מתאים לסגנון
  private matchesStyleColor(itemColor: string, itemName: string, styleRecs: any): boolean {
    const topColor = styleRecs.top?.color?.toLowerCase() || '';
    const bottomColor = styleRecs.bottom?.color?.toLowerCase() || '';
    const shoeColor = styleRecs.shoes?.color?.toLowerCase() || '';
    
    const styleColors = [topColor, bottomColor, shoeColor].filter(Boolean);
    
    return styleColors.some(styleColor => 
      itemColor.includes(styleColor) || 
      itemName.includes(styleColor) ||
      this.isColorSimilar(itemColor, styleColor)
    );
  }

  // בדיקת דמיון בצבעים
  private isColorSimilar(itemColor: string, styleColor: string): boolean {
    const colorMap: { [key: string]: string[] } = {
      'beige': ['בז\'', 'קרם', 'cream', 'tan'],
      'white': ['לבן', 'שמנת', 'ivory'],
      'black': ['שחור', 'dark'],
      'navy': ['כחול כהה', 'כחול', 'blue'],
      'gray': ['אפור', 'grey']
    };
    
    const similarColors = colorMap[styleColor] || [];
    return similarColors.some(similar => itemColor.includes(similar));
  }

  private getBodyShapeRecommendations(bodyShape: string, style: string): string[] {
    const shapeRecommendations = BODY_SHAPE_RECOMMENDATIONS[bodyShape as keyof typeof BODY_SHAPE_RECOMMENDATIONS];
    
    if (!shapeRecommendations) {
      return [
        'התאם אביזרים מתאימים כדי להשלים את המראה',
        'שקול להוסיף שכבות נוספות בהתאם למזג האוויר',
        'וודא שהצבעים מתאימים זה לזה'
      ];
    }

    return [
      `עבור מבנה גוף ${bodyShape}: ${shapeRecommendations.styles.join(', ')}`,
      `מומלץ לבחור: ${shapeRecommendations.tops.slice(0, 2).join(', ')}`,
      `הימנע מ: ${shapeRecommendations.avoid.slice(0, 2).join(', ')}`,
      'התאם אביזרים שמדגישים את החזקות הטבעיות שלך'
    ];
  }

  private isTop(item: any): boolean {
    const name = (item.product_name || '').toLowerCase();
    const subfamily = (item.product_subfamily || '').toLowerCase();
    
    return name.includes('חולצ') || name.includes('טופ') || name.includes('בלוז') ||
           subfamily.includes('top') || subfamily.includes('shirt') || subfamily.includes('blouse');
  }

  private isBottom(item: any): boolean {
    const name = (item.product_name || '').toLowerCase();
    const subfamily = (item.product_subfamily || '').toLowerCase();
    
    return name.includes('מכנס') || name.includes('חצאית') || name.includes('ג\'ינס') ||
           subfamily.includes('trouser') || subfamily.includes('skirt') || subfamily.includes('jean');
  }

  private isShoes(item: any): boolean {
    const name = (item.product_name || '').toLowerCase();
    const subfamily = (item.product_subfamily || '').toLowerCase();
    
    return name.includes('נעל') || name.includes('סנדל') || name.includes('נעלי') ||
           subfamily.includes('shoe') || subfamily.includes('sandal') || subfamily.includes('boot');
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

  private isMinimalistColor(itemColor: string, itemName: string): boolean {
    // צבעים מינימליסטיים
    const minimalistColors = [
      'שחור', 'לבן', 'אפור', 'קרם', 'בז\'', 'navy', 'חום בהיר',
      'black', 'white', 'grey', 'gray', 'cream', 'beige', 'navy blue',
      'taupe', 'khaki', 'stone', 'ivory', 'charcoal'
    ];
    
    // בדיקה אם הצבע או השם מכילים מילות מפתח מינימליסטיות
    const colorLower = itemColor.toLowerCase();
    const nameLower = itemName.toLowerCase();
    
    return minimalistColors.some(color => 
      colorLower.includes(color.toLowerCase()) || 
      nameLower.includes(color.toLowerCase())
    );
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
