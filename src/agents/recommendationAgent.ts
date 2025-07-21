
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
export const recommendationAgent: Agent = {
  role: "Recommendation Enhancer",
  goal: "Add styling advice and contextual info to outfits",
  backstory: "Adds value to the recommendation using knowledge of fashion and occasion",
  tools: [GenerateRecommendationsTool],
  
  async run(userId: string) {
    console.log(`[RecommendationAgent] Running enhanced recommendations for user: ${userId}`);
    try {
      // Get current mood and style context
      const styleData = localStorage.getItem('styleAnalysis');
      const currentMood = localStorage.getItem('current-mood') || 'elegant';
      const currentEvent = localStorage.getItem('current-event') || 'casual';
      
      // Generate contextual recommendations based on mood and event
      const recommendations = this.generateContextualRecommendations(currentMood, currentEvent, styleData);
      
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
  }

  private generateContextualRecommendations(mood: string, event: string, styleData: string | null): string[] {
    const baseRecommendations = [];
    
    // Mood-based recommendations
    const moodRecommendations: Record<string, string[]> = {
      elegant: [
        'הוסף תכשיטים עדינים כמו שרשרת פנינים או עגילי זהב',
        'תיק קלאסי או קלאץ' יעניק גימור מושלם',
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
        'תיק קטן או קלאץ' אלגנטי',
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
};
