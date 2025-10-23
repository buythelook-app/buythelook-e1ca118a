import { GenerateRecommendationsTool } from "../tools/generateRecommendationsTool";

// Interface defined but not exported to avoid conflicts
interface Agent {
  role: string;
  goal: string;
  backstory: string;
  tools: any[];
  run: (userId: string) => Promise<any>;
}

/**
 * Recommendation Enhancer Agent
 * Adds styling advice and contextual info to outfits
 */
export const recommendationAgent = {
  role: "Style Recommendation Enhancer",
  goal: "Add professional styling advice, contextual tips, and accessory recommendations to complete outfits",
  backstory: `You are a fashion consultant who specializes in the finishing touches that elevate outfits from good to great.
    
    Your expertise includes:
    - Accessory coordination (bags, jewelry, scarves, belts, watches)
    - Styling tips for different occasions and settings (work, evening, casual, formal)
    - How to adapt looks for weather, time of day, or specific venue requirements
    - Building a versatile, mix-and-match wardrobe that maximizes outfit possibilities
    - Seasonal styling adjustments (spring, summer, fall, winter transitions)
    - Proportion and balance in complete looks (visual weight distribution)
    - Layering techniques for depth and dimension
    - Color accent strategies to make outfits pop
    
    You provide practical, actionable advice that helps clients:
    - Get the most versatility from their wardrobe investments
    - Feel confident in their styling choices for any situation
    - Understand WHY certain combinations work aesthetically
    - Know how to accessorize appropriately for different occasions
    - Adapt outfits for changing weather or unexpected events
    - Mix and match pieces to create multiple looks
    
    Your recommendations are specific, relevant, and tailored to each client's style profile, occasion, and current mood.`,
  tools: [GenerateRecommendationsTool],
  
  /**
   * Enhanced run method that accepts full context from previous agents
   */
  async runWithContext(userId: string, context?: {
    personalization?: any;
    styling?: any;
    validation?: any;
  }): Promise<any> {
    console.log(`🔄 [RecommendationAgent] Running with synchronized context:`, {
      hasPersonalization: !!context?.personalization,
      hasStyling: !!context?.styling,
      hasValidation: !!context?.validation
    });
    
    if (context) {
      // Use full context to create enhanced recommendations
      const contextualRecommendations = this.generateEnhancedContextualRecommendations(context);
      
      return {
        success: true,
        recommendations: contextualRecommendations,
        context: 'enhanced'
      };
    }
    
    return this.run(userId);
  },

  async run(userId: string) {
    console.log(`[RecommendationAgent] Running enhanced recommendations for user: ${userId}`);
    try {
      // Get current mood and style context
      const styleData = localStorage.getItem('styleAnalysis');
      const currentMood = localStorage.getItem('current-mood') || 'elegant';
      const currentEvent = localStorage.getItem('current-event') || 'casual';
      
      // Generate contextual recommendations based on mood and event
      const recommendations = generateContextualRecommendations(currentMood, currentEvent, styleData);
      
      return {
        success: true,
        recommendations
      };
    } catch (error) {
      console.error(`[RecommendationAgent] Error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error in recommendations"
      };
    }
  },

  /**
   * Generate enhanced recommendations using full agent context
   */
  generateEnhancedContextualRecommendations(context: {
    personalization?: any;
    styling?: any;
    validation?: any;
  }): string[] {
    const recommendations: string[] = [];
    
    // Personalization-based recommendations
    if (context.personalization?.data?.looks?.length > 0) {
      const look = context.personalization.data.looks[0];
      if (look.style === 'casual') {
        recommendations.push('המראה הקזואל שלך מושלם לפעילויות יומיומיות');
      }
    }
    
    // Styling-based recommendations
    if (context.styling?.debugInfo?.outfit_logic) {
      const logic = context.styling.debugInfo.outfit_logic;
      recommendations.push(`האאוטפיט מותאם לאירוע ${logic.event_type}`);
    }
    
    // Validation-based recommendations
    if (context.validation?.overallScore) {
      const score = context.validation.overallScore;
      if (score >= 90) {
        recommendations.push('השילוב מושלם! כל הפריטים מתאימים זה לזה');
      } else if (score >= 70) {
        recommendations.push('השילוב טוב - שקול להוסיף אביזר אחד מתאים');
      }
    }
    
    // Add general coordinated recommendations
    recommendations.push(
      'כל הפריטים נבחרו בתיאום מושלם בין האייגנטים',
      'ההמלצות מבוססות על ניתוח מעמיק של הסגנון האישי שלך'
    );
    
    return recommendations.slice(0, 5); // Return top 5 recommendations
  }
};

function generateContextualRecommendations(mood: string, event: string, styleData: string | null): string[] {
  const baseRecommendations = [];
  
  // Mood-based recommendations
  const moodRecommendations: Record<string, string[]> = {
    elegant: [
      'הוסף תכשיטים עדינים כמו שרשרת פנינים או עגילי זהב',
      'תיק קלאסי או קלאץ יעניק גימור מושלם',
      'בחר צבעים נייטרליים או כהים למראה מעודן'
    ],
    energized: [
      'אביזרים צבעוניים יוסיפו אנרגיה למראה',
      'תיק ספורטיבי או תיק גב אופנתי יתאים מצוין',
      'בחר בהדפסים או צבעים חיים'
    ],
    romantic: [
      'תכשיטים עדינים עם פנינים או קריסטלים',
      'תיק רך בגוונים פסטל או ורדרדים',
      'הוסף צעיף משי או סיכת ראש עדינה'
    ],
    casual: [
      'תיק יומיומי נוח ופרקטי',
      'אביזרים פשוטים וקלילים',
      'נעלי סניקרס או נעליים שטוחות לנוחות'
    ]
  };
  
  // Event-based recommendations
  const eventRecommendations: Record<string, string[]> = {
    work: [
      'תיק עבודה מובנה בצבע נייטרלי',
      'שעון קלאסי יוסיף מקצועיות',
      'הימנע מתכשיטים גדולים או צעקניים'
    ],
    evening: [
      'תיק קטן או קלאץ אלגנטי',
      'תכשיטים נוצצים או אביזרי יוקרה',
      'נעלי עקב למראה חגיגי'
    ],
    casual: [
      'תיק כתף או תיק גב נוח',
      'אביזרים יומיומיים ופרקטיים',
      'שכבות בגדים למגוון ונוחות'
    ],
    weekend: [
      'תיק קטן או ארנק אופנתי',
      'אביזרים מינימליים',
      'נעליים נוחות לטיולים'
    ]
  };

  // Add mood-specific recommendations
  baseRecommendations.push(...(moodRecommendations[mood] || moodRecommendations.casual));
  
  // Add event-specific recommendations
  baseRecommendations.push(...(eventRecommendations[event] || eventRecommendations.casual));
  
  // Add general styling tips
  baseRecommendations.push(
    'בחר אביזר אחד מרכזי ובנה סביבו את המראה',
    'שמור על איזון בין הצבעים - לא יותר מ3 צבעים בלוק',
    'התאם את האביזרים לאירוע ולעונת השנה'
  );
  
  // Return 4-5 most relevant recommendations
  return baseRecommendations.slice(0, 5);
}