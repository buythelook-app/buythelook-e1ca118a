import { supabase } from "@/lib/supabaseClient";
import { Agent, AgentResult } from "./index";
import { createCasualOutfit, getCasualStyleRecommendations } from "../services/casualOutfitService";
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

      let outfitData;
      let recommendations;

      // בדיקה אם המשתמש בחר סגנון קזואל ספציפית (לא מינימליסטי)
      if (styleProfile === 'casual' && (moodPreferences === 'casual' || moodPreferences === 'relaxed')) {
        console.log(`👕 [PersonalizationAgent] יוצר תלבושת קזואלית מותאמת למבנה גוף ${bodyShape}`);
        
        // שימוש בשירות הקזואל החדש עם התחשבות במבנה גוף
        const casualOutfit = await this.createBodyShapeAwareCasualOutfit(bodyShape);
        
        if (!casualOutfit.top || !casualOutfit.bottom || !casualOutfit.shoes) {
          return {
            success: false,
            error: "לא הצלחנו למצוא מספיק פריטים קזואליים מתאימים למבנה הגוף"
          };
        }

        outfitData = {
          looks: [{
            id: `casual-look-${Date.now()}`,
            items: [casualOutfit.top, casualOutfit.bottom, casualOutfit.shoes],
            style: 'casual',
            occasion: 'casual',
            description: `מראה קזואל מותאם למבנה גוף ${bodyShape} - ${casualOutfit.top.name}, ${casualOutfit.bottom.name} ו${casualOutfit.shoes.name}`,
            enhanced: true
          }],
          reasoning: `תלבושת קזואלית שנבחרה במיוחד עם בגדים מתאימים למבנה גוף ${bodyShape}`
        };

        recommendations = this.getBodyShapeRecommendations(bodyShape, 'casual');

      } else {
        // לוגיקה מיוחדת לסגנון מינימליסטי וסגנונות אחרים
        console.log(`🎨 [PersonalizationAgent] מתחיל חיפוש פריטים עבור סגנון: ${styleProfile}`);
        
        // קבלת פריטים מהמאגר עם התחשבות בסגנון הנבחר
        let query = supabase.from('zara_cloth').select('*');
        
        // סינון מיוחד לסגנון מינימליסטי
        if (styleProfile === 'minimalist') {
          console.log('🎯 [PersonalizationAgent] מחפש פריטים מינימליסטיים');
          query = query.or('colour.ilike.%שחור%,colour.ilike.%לבן%,colour.ilike.%אפור%,colour.ilike.%navy%,colour.ilike.%beige%,colour.ilike.%black%,colour.ilike.%white%,colour.ilike.%grey%,colour.ilike.%cream%');
        }
        
        const { data: allItems, error } = await query.limit(150); // הגדלת המגבלה לבחירה טובה יותר

        if (error || !allItems) {
          return {
            success: false,
            error: "שגיאה בטעינת פריטים מהמאגר"
          };
        }

        // סינון פריטים לפי מבנה גוף וצבעים מועדפים
        const filteredItems = this.filterItemsByBodyShape(allItems, bodyShape, colorPreferences);

        // זיהוי שמלות וטוניקות (פריטים שלא צריכים חלק תחתון)
        const dressesAndTunics = filteredItems.filter(item => 
          this.isDressOrTunic(item)
        );

        // חלוקת פריטים לקטגוריות (ללא שמלות וטוניקות)
        const tops = filteredItems.filter(item => 
          !this.isDressOrTunic(item) && this.isTop(item)
        ).slice(0, 5);

        const bottoms = filteredItems.filter(item => 
          this.isBottom(item)
        ).slice(0, 5);

        const shoes = filteredItems.filter(item => 
          this.isShoes(item)
        ).slice(0, 5);

        // אם יש שמלה או טוניקה מתאימה למבנה הגוף
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
            description: `${this.isDress(dressOrTunic) ? 'שמלה' : 'טוניקה'} ${dressOrTunic.product_name} מותאמת למבנה גוף ${bodyShape} עם ${selectedShoes.product_name}`
          };

          outfitData = {
            looks: [dressLook],
            reasoning: `נבחר ${this.isDress(dressOrTunic) ? 'שמלה' : 'טוניקה'} על בסיס הפרופיל ${styleProfile} ומבנה גוף ${bodyShape}`
          };

        } else if (tops.length > 0 && bottoms.length > 0 && shoes.length > 0) {
          // לוק רגיל עם 3 פריטים מותאם למבנה גוף
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
            description: `מראה ${styleProfile} מותאם למבנה גוף ${bodyShape} - מדגיש את החזקות שלך`
          };

          outfitData = {
            looks: [firstLook],
            reasoning: `נבחר על בסיס הפרופיל ${styleProfile} ומבנה גוף ${bodyShape} לייעוץ מקצועי`
          };
        } else {
          // אם אין מספיק פריטים מסוננים, חזור לבחירה בסיסית כדי לכלול נעליים
          console.log('🔄 [PersonalizationAgent] לא נמצאו מספיק פריטים מסוננים, מנסה בחירה בסיסית');
          
          const allTops = allItems.filter(item => this.isTop(item)).slice(0, 3);
          const allBottoms = allItems.filter(item => this.isBottom(item)).slice(0, 3);
          const allShoes = allItems.filter(item => this.isShoes(item)).slice(0, 3);
          
          if (allTops.length > 0 && allBottoms.length > 0 && allShoes.length > 0) {
            const basicLook = {
              id: `basic-look-${Date.now()}`,
              items: [
                {
                  id: allTops[0].id,
                  name: allTops[0].product_name,
                  type: 'top',
                  price: `₪${allTops[0].price}`,
                  image: this.extractImageUrl(allTops[0].image)
                },
                {
                  id: allBottoms[0].id,
                  name: allBottoms[0].product_name,
                  type: 'bottom',
                  price: `₪${allBottoms[0].price}`,
                  image: this.extractImageUrl(allBottoms[0].image)
                },
                {
                  id: allShoes[0].id,
                  name: allShoes[0].product_name,
                  type: 'shoes',
                  price: `₪${allShoes[0].price}`,
                  image: this.extractImageUrl(allShoes[0].image)
                }
              ],
              style: styleProfile,
              occasion: 'general',
              description: `מראה ${styleProfile} בסיסי עם נעליים מתאימות`
            };

            outfitData = {
              looks: [basicLook],
              reasoning: `נבחר מראה בסיסי הכולל נעליים עבור ${styleProfile}`
            };
          } else {
            return {
              success: false,
              error: "לא נמצאו מספיק פריטים ליצירת תלבושת שלמה הכוללת נעליים"
            };
          }
        }

        recommendations = this.getBodyShapeRecommendations(bodyShape, styleProfile);
      }

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

  private async createBodyShapeAwareCasualOutfit(bodyShape: string): Promise<any> {
    try {
      const { data: casualItems, error } = await supabase
        .from('zara_cloth')
        .select('*')
        .or('product_name.ilike.%קזואל%,product_name.ilike.%ג\'ינס%,product_name.ilike.%טי שירט%')
        .limit(30);

      if (error || !casualItems) {
        return createCasualOutfit(); // fallback to original service
      }

      const filteredItems = this.filterItemsByBodyShape(casualItems, bodyShape, []);
      
      const casualTops = filteredItems.filter(item => this.isTop(item));
      const casualBottoms = filteredItems.filter(item => this.isBottom(item));
      const casualShoes = filteredItems.filter(item => this.isShoes(item));

      if (casualTops.length === 0 || casualBottoms.length === 0 || casualShoes.length === 0) {
        return createCasualOutfit(); // fallback
      }

      return {
        top: {
          id: casualTops[0].id,
          name: casualTops[0].product_name,
          type: 'top',
          price: `₪${casualTops[0].price}`,
          image: this.extractImageUrl(casualTops[0].image)
        },
        bottom: {
          id: casualBottoms[0].id,
          name: casualBottoms[0].product_name,
          type: 'bottom',
          price: `₪${casualBottoms[0].price}`,
          image: this.extractImageUrl(casualBottoms[0].image)
        },
        shoes: {
          id: casualShoes[0].id,
          name: casualShoes[0].product_name,
          type: 'shoes',
          price: `₪${casualShoes[0].price}`,
          image: this.extractImageUrl(casualShoes[0].image)
        }
      };
    } catch (error) {
      console.error('Error creating body shape aware casual outfit:', error);
      return createCasualOutfit(); // fallback
    }
  }

  private filterItemsByBodyShape(items: any[], bodyShape: string, colorPreferences: string[]): any[] {
    const shapeRecommendations = BODY_SHAPE_RECOMMENDATIONS[bodyShape as keyof typeof BODY_SHAPE_RECOMMENDATIONS];
    
    return items.filter(item => {
      const itemName = item.product_name?.toLowerCase() || '';
      const itemColor = item.colour?.toLowerCase() || '';
      
      // בדיקת התאמת צבע - קריטריונים נוספים לסינון מינימליסטי
      const isMinimalistColor = this.isMinimalistColor(itemColor, itemName);
      const colorMatch = colorPreferences.length === 0 || 
        colorPreferences.some((pref: string) => itemColor.includes(pref.toLowerCase())) ||
        isMinimalistColor;

      // אם אין המלצות למבנה גוף ספציפי
      if (!shapeRecommendations) {
        return colorMatch && (this.isTop(item) || this.isBottom(item) || this.isShoes(item) || this.isDressOrTunic(item));
      }

      // בדיקת התאמה למבנה גוף
      const isRecommendedTop = this.isTop(item) && 
        shapeRecommendations.tops.some(recTop => itemName.includes(recTop.toLowerCase()));
      
      const isRecommendedBottom = this.isBottom(item) && 
        shapeRecommendations.bottoms.some(recBottom => itemName.includes(recBottom.toLowerCase()));

      const isShoes = this.isShoes(item);
      const isDressOrTunic = this.isDressOrTunic(item);

      // בדיקת פריטים שצריך להימנע מהם
      const shouldAvoid = shapeRecommendations.avoid.some(avoidItem => 
        itemName.includes(avoidItem.toLowerCase()));

      return colorMatch && !shouldAvoid && (isRecommendedTop || isRecommendedBottom || isShoes || isDressOrTunic);
    });
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
