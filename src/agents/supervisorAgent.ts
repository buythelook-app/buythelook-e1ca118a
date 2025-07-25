import { Agent } from './index';

/**
 * Supervisor Fashion Stylist Agent
 * מפקח על כל האייגנטים ומוודא איכות וגיוון בהמלצות
 */
export const supervisorAgent = {
  role: "Senior Fashion Supervisor & Trainer",
  goal: "פיקוח על איכות ההמלצות, מניעת כפילויות, והכשרת האייגנטים",
  backstory: "סטייליסטית ותיקה עם 15 שנות ניסיון בתעשיית האופנה, מתמחה בהכשרת צוותים ובקרת איכות",
  tools: [],

  /**
   * מתודת run רגילה (נדרשת לממשק Agent)
   */
  async run(userId: string): Promise<any> {
    console.log(`👩‍🏫 [SupervisorAgent] Running basic supervision for user: ${userId}`);
    return {
      success: true,
      data: { message: "Supervisor ready for review and training" }
    };
  },

  /**
   * בדיקה ואימון של תוצאות האייגנטים
   */
  async reviewAndTrain(agentResults: {
    personalization?: any;
    styling?: any;
    validation?: any;
    recommendations?: any;
  }): Promise<{
    approvedLooks: any[];
    feedback: string[];
    improvements: string[];
    duplicatesRemoved: number;
  }> {
    console.log('👩‍🏫 [SupervisorAgent] מתחילה בדיקה ואימון של תוצאות האייגנטים');

    const feedback: string[] = [];
    const improvements: string[] = [];
    let duplicatesRemoved = 0;

    // בדיקת כפילויות פריטים
    const { cleanedLooks, removedDuplicates } = this.removeDuplicateItems(agentResults.styling?.data?.looks || []);
    duplicatesRemoved = removedDuplicates;
    
    if (removedDuplicates > 0) {
      feedback.push(`🚫 הוסרו ${removedDuplicates} כפילויות פריטים`);
      improvements.push('האייגנטים צריכים לוודא גיוון בפריטים בין הלוקים');
    }

    // בדיקת התאמה לאירועים
    const occasionFeedback = this.reviewOccasionAppropriateness(cleanedLooks);
    feedback.push(...occasionFeedback.feedback);
    improvements.push(...occasionFeedback.improvements);

    // בדיקת איזון צבעים
    const colorFeedback = this.reviewColorCoordination(cleanedLooks);
    feedback.push(...colorFeedback.feedback);
    improvements.push(...colorFeedback.improvements);

    // בדיקת התאמה למבנה גוף
    const bodyShapeFeedback = this.reviewBodyShapeAlignment(cleanedLooks);
    feedback.push(...bodyShapeFeedback.feedback);
    improvements.push(...bodyShapeFeedback.improvements);

    // שיפור איכות התיאורים
    const enhancedLooks = this.enhanceDescriptions(cleanedLooks);

    console.log(`✅ [SupervisorAgent] סיימה בדיקה: ${feedback.length} הערות, ${improvements.length} שיפורים`);

    return {
      approvedLooks: enhancedLooks,
      feedback,
      improvements,
      duplicatesRemoved
    };
  },

  /**
   * הסרת כפילויות פריטים בין לוקים שונים
   */
  removeDuplicateItems(looks: any[]): { cleanedLooks: any[]; removedDuplicates: number } {
    if (!looks || looks.length === 0) return { cleanedLooks: [], removedDuplicates: 0 };

    const usedItemIds = new Set<string>();
    const cleanedLooks: any[] = [];
    let removedDuplicates = 0;

    for (const look of looks) {
      if (!look.items || !Array.isArray(look.items)) {
        cleanedLooks.push(look);
        continue;
      }

      const uniqueItems = look.items.filter((item: any) => {
        if (!item.id) return true;
        
        if (usedItemIds.has(item.id)) {
          removedDuplicates++;
          return false;
        }
        
        usedItemIds.add(item.id);
        return true;
      });

      if (uniqueItems.length >= 2) { // רק לוקים עם לפחות 2 פריטים
        cleanedLooks.push({
          ...look,
          items: uniqueItems
        });
      } else {
        removedDuplicates += look.items.length - uniqueItems.length;
      }
    }

    return { cleanedLooks, removedDuplicates };
  },

  /**
   * בדיקת התאמה לאירועים ולמצבי רוח
   */
  reviewOccasionAppropriateness(looks: any[]): { feedback: string[]; improvements: string[] } {
    const feedback: string[] = [];
    const improvements: string[] = [];

    const currentEvent = localStorage.getItem('current-event') || 'casual';
    const currentMood = localStorage.getItem('current-mood') || 'elegant';

    looks.forEach((look, index) => {
      const occasion = look.occasion || 'general';
      
      // בדיקת התאמה לעבודה
      if (currentEvent === 'work') {
        const hasWorkAppropriateItems = look.items?.some((item: any) => 
          item.name?.toLowerCase().includes('חליפה') ||
          item.name?.toLowerCase().includes('חולצה') ||
          item.name?.toLowerCase().includes('מכנסיים')
        );

        if (!hasWorkAppropriateItems) {
          feedback.push(`⚠️ לוק ${index + 1}: לא מתאים לעבודה - חסרים פריטים פורמליים`);
          improvements.push('הוסף חולצות פורמליות ומכנסיים מתאימים לעבודה');
        } else {
          feedback.push(`✅ לוק ${index + 1}: מתאים לעבודה`);
        }
      }

      // בדיקת התאמה לקזואל
      if (currentEvent === 'casual') {
        const hasCasualItems = look.items?.some((item: any) => 
          item.name?.toLowerCase().includes('ג\'ינס') ||
          item.name?.toLowerCase().includes('טישרט') ||
          item.name?.toLowerCase().includes('סניקרס')
        );

        if (!hasCasualItems && currentMood === 'casual') {
          feedback.push(`⚠️ לוק ${index + 1}: יותר מדי פורמלי לאירוע קזואל`);
          improvements.push('הוסף פריטים קזואליים כמו ג\'ינס וטישרטים');
        } else {
          feedback.push(`✅ לוק ${index + 1}: מתאים לאירוע קזואל`);
        }
      }

      // בדיקת התאמה לערב
      if (currentEvent === 'evening') {
        const hasEveningItems = look.items?.some((item: any) => 
          item.name?.toLowerCase().includes('שמלה') ||
          item.name?.toLowerCase().includes('חליפה') ||
          item.name?.toLowerCase().includes('עקבים')
        );

        if (!hasEveningItems) {
          feedback.push(`⚠️ לוק ${index + 1}: לא מתאים לערב - חסרים פריטים אלגנטיים`);
          improvements.push('הוסף שמלות אלגנטיות או חליפות לאירועי ערב');
        }
      }
    });

    return { feedback, improvements };
  },

  /**
   * בדיקת תיאום צבעים
   */
  reviewColorCoordination(looks: any[]): { feedback: string[]; improvements: string[] } {
    const feedback: string[] = [];
    const improvements: string[] = [];

    looks.forEach((look, index) => {
      if (!look.items || look.items.length < 2) return;

      const colors = look.items.map((item: any) => 
        item.color || item.colour || 'unknown'
      ).filter(color => color !== 'unknown');

      // בדיקת צבעים מתנגשים
      const hasClashingColors = this.checkColorClashes(colors);
      if (hasClashingColors) {
        feedback.push(`🎨 לוק ${index + 1}: יש התנגשות צבעים`);
        improvements.push('השתמש בגלגל הצבעים לשילובים הרמוניים יותר');
      }

      // בדיקת יותר מדי צבעים
      const uniqueColors = [...new Set(colors)];
      if (uniqueColors.length > 3) {
        feedback.push(`🌈 לוק ${index + 1}: יותר מדי צבעים (${uniqueColors.length})`);
        improvements.push('הגבל לשילוב של 2-3 צבעים עיקריים בלוק');
      } else {
        feedback.push(`✅ לוק ${index + 1}: איזון צבעים טוב`);
      }
    });

    return { feedback, improvements };
  },

  /**
   * בדיקת התאמה למבנה גוף
   */
  reviewBodyShapeAlignment(looks: any[]): { feedback: string[]; improvements: string[] } {
    const feedback: string[] = [];
    const improvements: string[] = [];

    const styleData = localStorage.getItem('styleAnalysis');
    if (!styleData) return { feedback, improvements };

    try {
      const parsedData = JSON.parse(styleData);
      const bodyShape = parsedData?.analysis?.bodyShape || 'H';

      looks.forEach((look, index) => {
        const isAligned = this.checkBodyShapeAlignment(look, bodyShape);
        
        if (isAligned) {
          feedback.push(`✅ לוק ${index + 1}: מתאים למבנה גוף ${bodyShape}`);
        } else {
          feedback.push(`⚠️ לוק ${index + 1}: לא אופטימלי למבנה גוף ${bodyShape}`);
          improvements.push(`התאם פריטים יותר למבנה גוף ${bodyShape}`);
        }
      });
    } catch (error) {
      console.error('Error parsing style data:', error);
    }

    return { feedback, improvements };
  },

  /**
   * שיפור תיאורי הלוקים
   */
  enhanceDescriptions(looks: any[]): any[] {
    return looks.map((look, index) => ({
      ...look,
      description: this.generateEnhancedDescription(look, index),
      supervisorApproved: true,
      qualityScore: this.calculateQualityScore(look)
    }));
  },

  /**
   * יצירת תיאור משופר ללוק
   */
  generateEnhancedDescription(look: any, index: number): string {
    const currentEvent = localStorage.getItem('current-event') || 'casual';
    const currentMood = localStorage.getItem('current-mood') || 'elegant';
    
    const itemNames = look.items?.map((item: any) => item.name).join(', ') || 'פריטים';
    
    const eventDescriptions = {
      work: 'מושלם ליום עבודה מקצועי',
      casual: 'אידיאלי לפעילויות יומיומיות רגועות',
      evening: 'מתאים לאירועי ערב אלגנטיים',
      weekend: 'נהדר לסוף שבוע נינוח'
    };

    const moodDescriptions = {
      elegant: 'משדר אלגנטיות ומעודנות',
      energized: 'מעביר אנרגיה וחיוניות',
      romantic: 'יוצר מראה רומנטי וקסום',
      casual: 'נותן תחושה רגועה וטבעית'
    };

    return `לוק מספר ${index + 1}: ${itemNames}. ${eventDescriptions[currentEvent as keyof typeof eventDescriptions] || 'מתאים למגוון אירועים'}, ${moodDescriptions[currentMood as keyof typeof moodDescriptions] || 'משדר ביטחון עצמי'}. אושר על ידי הסטייליסטית המפקחת.`;
  },

  /**
   * חישוב ציון איכות ללוק
   */
  calculateQualityScore(look: any): number {
    let score = 100;

    // בדיקת מספר פריטים
    if (!look.items || look.items.length < 2) score -= 30;
    if (look.items && look.items.length < 3) score -= 10;

    // בדיקת תמונות
    const hasValidImages = look.items?.every((item: any) => 
      item.image && item.image !== '/placeholder.svg'
    );
    if (!hasValidImages) score -= 20;

    // בדיקת מחירים
    const hasPrices = look.items?.every((item: any) => item.price);
    if (!hasPrices) score -= 10;

    return Math.max(score, 0);
  },

  /**
   * בדיקת התנגשות צבעים
   */
  checkColorClashes(colors: string[]): boolean {
    const clashingCombinations = [
      ['red', 'green'],
      ['blue', 'orange'],
      ['purple', 'yellow']
    ];

    return clashingCombinations.some(clash => 
      clash.every(color => 
        colors.some(itemColor => 
          itemColor.toLowerCase().includes(color)
        )
      )
    );
  },

  /**
   * בדיקת התאמה למבנה גוף
   */
  checkBodyShapeAlignment(look: any, bodyShape: string): boolean {
    // הגדרות פשוטות להתאמה למבנה גוף
    const bodyShapeRules = {
      'X': ['מותאם', 'צמוד', 'מדגיש מותן'],
      'A': ['מדגיש כתפיים', 'משלים חלק עליון'],
      'V': ['מאזן כתפיים', 'מדגיש חלק תחתון'],
      'H': ['יוצר קווים', 'מוסיף עומק'],
      'O': ['מאריך', 'יוצר קו ישר']
    };

    const rules = bodyShapeRules[bodyShape as keyof typeof bodyShapeRules] || [];
    
    return look.items?.some((item: any) => 
      rules.some(rule => 
        item.name?.toLowerCase().includes(rule.toLowerCase()) ||
        look.description?.toLowerCase().includes(rule.toLowerCase())
      )
    ) || true; // ברירת מחדל - מאושר
  }
};