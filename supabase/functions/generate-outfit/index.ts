import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Types for our input parameters
type BodyStructure = 'X' | 'V' | 'H' | 'O' | 'A';
type StylePreference = 'classic' | 'romantic' | 'minimalist' | 'casual' | 'boohoo' | 'sporty';

interface OutfitRequest {
  bodyStructure: BodyStructure;
  mood: string;
  style: StylePreference;
}

interface OutfitSuggestion {
  top: string; // Hex color code
  bottom: string; // Hex color code
  shoes: string; // Hex color code
  coat?: string; // Optional hex color code
  description: string;
  recommendations: string[];
  occasion?: 'work' | 'casual' | 'weekend' | 'date night' | 'general';
}

interface OutfitResponse {
  success: boolean;
  data?: OutfitSuggestion[];
  error?: string;
}

// Helper function to generate color palettes based on style
function getColorPaletteForStyle(style: StylePreference): string[] {
  const colorPalettes = {
    classic: ['#2C3E50', '#34495E', '#7F8C8D', '#BDC3C7', '#ECF0F1'],
    romantic: ['#FF4081', '#F8BBD0', '#EC407A', '#C2185B', '#F48FB1'],
    minimalist: ['#212121', '#424242', '#616161', '#FAFAFA', '#FFFFFF'],
    casual: ['#607D8B', '#90A4AE', '#455A64', '#ECEFF1', '#CFD8DC'],
    boohoo: ['#F44336', '#FF5722', '#9C27B0', '#673AB7', '#3F51B5'],
    sporty: ['#00BCD4', '#009688', '#4CAF50', '#CDDC39', '#FFEB3B']
  };

  return colorPalettes[style] || colorPalettes.classic;
}

// Helper function to check if item is work-appropriate
function isWorkAppropriate(bodyStructure: BodyStructure, style: StylePreference, mood: string): boolean {
  // Work-appropriate styles should focus on professional, modest clothing
  const workAppropriateStyles: StylePreference[] = ['classic', 'minimalist'];
  
  // Check if the style is suitable for work
  if (!workAppropriateStyles.includes(style)) {
    return false;
  }
  
  // Check if mood indicates work context
  const workMoods = ['elegant', 'professional', 'formal', 'business', 'עבודה', 'פורמלי', 'אלגנטי'];
  const isWorkMood = workMoods.some(workMood => mood.toLowerCase().includes(workMood.toLowerCase()));
  
  return isWorkMood;
}

// Generate work-appropriate outfit recommendations with randomization
function generateWorkAppropriateOutfit(bodyStructure: BodyStructure, style: StylePreference, mood: string): OutfitSuggestion[] {
  const results: OutfitSuggestion[] = [];
  
  // Work-appropriate color palette - more conservative colors
  const workPalette = ['#2C3E50', '#34495E', '#7F8C8D', '#BDC3C7', '#ECF0F1', '#1A1A1A', '#FFFFFF'];
  
  // ✅ CRITICAL: Add timestamp-based seed for better randomization
  const seed = Date.now();
  const random = (index: number) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  };
  
  // Create 3 work-appropriate outfit suggestions with TRUE randomization
  for (let i = 0; i < 3; i++) {
    // ✅ Use timestamp-based randomization instead of Math.random()
    const shuffledPalette = [...workPalette]
      .map((color, idx) => ({ color, sort: random(i * 10 + idx) }))
      .sort((a, b) => a.sort - b.sort)
      .map(x => x.color);
    
    let outfit: OutfitSuggestion = {
      top: shuffledPalette[0],
      bottom: shuffledPalette[1],
      shoes: shuffledPalette[2],
      description: "",
      recommendations: [],
      occasion: 'work'
    };
    
    // Add blazer/jacket for professional look with randomization
    if (random(i * 5) < 0.7) {
      outfit.coat = shuffledPalette[3];
    }
    
    // Customize based on body structure for work wear
    switch(bodyStructure) {
      case 'X': // Hourglass
        outfit.description = `לוק עסקי מחמיא לגזרת שעון החול - ${getColorName(outfit.top)} עליון צנוע עם ${getColorName(outfit.bottom)} תחתון פורמלי`;
        outfit.recommendations = [
          "בחרי בחולצה עם צווארון גבוה או בלייזר לכיסוי הולם",
          "חצאית עפרון או מכנסיים רחבים יחמיאו למבנה הגוף",
          "הימנעי מבגדים צמודים מדי או חשופים בסביבת העבודה"
        ];
        break;
        
      case 'V': // Inverted triangle
        outfit.description = `לוק עסקי מאוזן לגזרת משולש הפוך - ${getColorName(outfit.top)} עליון פשוט עם ${getColorName(outfit.bottom)} תחתון במבנה A`;
        outfit.recommendations = [
          "בחרי בחולצות פשוטות ללא כתפיות מודגשות",
          "מכנסיים רחבים או חצאית A יאזנו את הפרופורציות",
          "הוסיפי אביזרים עדינים כמו שרשרת דקה"
        ];
        break;
        
      case 'H': // Rectangle
        outfit.description = `לוק עסקי מובנה לגזרה ישרה - ${getColorName(outfit.top)} עליון עם פרטי עיצוב ו${getColorName(outfit.bottom)} תחתון`;
        outfit.recommendations = [
          "בלייזר מובנה ייצור אשליית עקומות",
          "חצאית עפרון או מכנסיים בגזרה גבוהה יחמיאו",
          "שכבות בגדים יוסיפו עניין ונפח"
        ];
        break;
        
      case 'O': // Apple/Round
        outfit.description = `לוק עסקי מחמיא לגזרה עגלגלה - ${getColorName(outfit.top)} עליון נופל בחופשיות עם ${getColorName(outfit.bottom)} תחתון`;
        outfit.recommendations = [
          "בחרי בחולצות שנופלות מתחת לירכיים",
          "מכנסיים או חצאית בגזרה גבוהה יחמיאו",
          "הדגישי את הצוואר באמצעות קולייר או צעיף"
        ];
        break;
        
      case 'A': // Pear/Triangle
        outfit.description = `לוק עסקי מאוזן לגזרת אגס - ${getColorName(outfit.top)} עליון בהיר עם ${getColorName(outfit.bottom)} תחתון כהה`;
        outfit.recommendations = [
          "בחרי בחולצות או בלייזרים בצבעים בהירים",
          "מכנסיים או חצאיות בצבעים כהים יאזנו",
          "הוסיפי אביזרים באזור הצוואר כמו עניבת נשים"
        ];
        break;
    }
    
    // Add work-specific recommendations
    outfit.recommendations.push(
      "וודאי שהבגדים מכסים כראוי - לא חשופים מדי",
      "בחרי בנעלים סגורות ופורמליות",
      "שמרי על צבעים נייטרליים ומקצועיים"
    );
    
    results.push(outfit);
  }
  
  return results;
}

// Generate specific outfit recommendations based on body structure with TRUE randomization
function generateOutfitForBodyStructure(bodyStructure: BodyStructure, style: StylePreference, mood: string): OutfitSuggestion[] {
  const palette = getColorPaletteForStyle(style);
  const results: OutfitSuggestion[] = [];
  
  // ✅ CRITICAL: Add timestamp-based seed for better randomization
  const seed = Date.now();
  const random = (index: number) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  };
  
  // Create 3 outfit suggestions with DIFFERENT colors each time
  for (let i = 0; i < 3; i++) {
    // ✅ Use timestamp-based randomization instead of Math.random()
    const shuffledPalette = [...palette]
      .map((color, idx) => ({ color, sort: random(i * 10 + idx) }))
      .sort((a, b) => a.sort - b.sort)
      .map(x => x.color);
    
    // Basic outfit structure
    let outfit: OutfitSuggestion = {
      top: shuffledPalette[0],
      bottom: shuffledPalette[1],
      shoes: shuffledPalette[2],
      description: "",
      recommendations: []
    };
    
    // Add a coat with randomization
    if (random(i * 5 + 100) < 0.3) {
      outfit.coat = shuffledPalette[3];
    }
    
    // Customize based on body structure
    switch(bodyStructure) {
      case 'X': // Hourglass
        outfit.description = `חליפה מחמיאה לגזרת שעון החול שלך, עם ${getColorName(outfit.top)} למעלה שמדגיש את המותניים ו${getColorName(outfit.bottom)} למטה.`;
        outfit.recommendations = [
          "בחרי בגדים עליונים שמדגישים את המותניים",
          "שקלי להוסיף חגורה כדי להדגיש עוד יותר את קו המותן"
        ];
        outfit.occasion = Math.random() > 0.5 ? 'casual' : 'work';
        break;
        
      case 'V': // Inverted triangle
        outfit.description = `לוק מאוזן לגזרת המשולש ההפוך, עם ${getColorName(outfit.top)} למעלה ו${getColorName(outfit.bottom)} בגזרה רחבה למטה.`;
        outfit.recommendations = [
          "העדיפי מכנסיים או חצאיות בגזרה רחבה",
          "הימנעי מכתפיות מודגשות או שרוולי פאף"
        ];
        outfit.occasion = Math.random() > 0.5 ? 'weekend' : 'casual';
        break;
        
      case 'H': // Rectangle
        outfit.description = `לוק שיוצר אשליית עקומות לגזרה הישרה, עם ${getColorName(outfit.top)} בחלק העליון שמוסיף נפח ו${getColorName(outfit.bottom)} בחלק התחתון.`;
        outfit.recommendations = [
          "נסי בגדים בשכבות כדי ליצור אשליית נפח",
          "הוסיפי אביזרים שיוצרים עניין חזותי"
        ];
        outfit.occasion = Math.random() > 0.5 ? 'work' : 'date night';
        break;
        
      case 'O': // Apple/Round
        outfit.description = `לוק מחמיא לגזרה עגלגלה, עם ${getColorName(outfit.top)} עליון מרופרף ו${getColorName(outfit.bottom)} תחתון מחמיא.`;
        outfit.recommendations = [
          "בחרי טופים שנופלים בחופשיות מסביב לחגורת המותן",
          "התמקדי בהדגשת הרגליים והצוואר"
        ];
        outfit.occasion = Math.random() > 0.5 ? 'casual' : 'general';
        break;
        
      case 'A': // Pear/Triangle
        outfit.description = `לוק שמאזן את הפרופורציות לגזרת האגס, עם ${getColorName(outfit.top)} בהיר בחלק העליון ו${getColorName(outfit.bottom)} כהה בחלק התחתון.`;
        outfit.recommendations = [
          "בחרי טופים בצבעים בהירים או עם פרטים מושכי עין",
          "חצאיות וג'ינסים בגזרות A עשויים להחמיא במיוחד"
        ];
        outfit.occasion = Math.random() > 0.5 ? 'weekend' : 'work';
        break;
        
      default:
        outfit.description = `שילוב אופנתי של ${getColorName(outfit.top)} עם ${getColorName(outfit.bottom)}, המשלים היטב את מבנה הגוף שלך.`;
        outfit.recommendations = [
          "בחרי בגדים שמרגישים נוחים ונותנים לך ביטחון",
          "התאימי את האביזרים לסגנון הכללי של הלוק"
        ];
        outfit.occasion = 'general';
    }
    
    // Add mood-specific recommendations
    if (mood.includes('elegant') || mood.includes('אלגנטי')) {
      outfit.recommendations.push("הוסיפי תכשיט אחד מרשים שיהיה מוקד הלוק");
      outfit.occasion = 'work';
    } else if (mood.includes('casual') || mood.includes('יום יום')) {
      outfit.recommendations.push("שלבי נעלי סניקרס לנוחות יומיומית");
      outfit.occasion = 'casual';
    } else if (mood.includes('energized') || mood.includes('/animations')) {
      outfit.recommendations.push("הוסיפי פריט אחד בצבע חי שמושך תשומת לב");
      outfit.occasion = 'weekend';
    }
    
    // Add style-specific recommendations
    if (style === 'classic') {
      outfit.recommendations.push("בחרי בפריטים באיכות גבוהה שיחזיקו מעמד לאורך זמן");
    } else if (style === 'romantic') {
      outfit.recommendations.push("שקלי להוסיף פריטים עם תחרה או דוגמאות פרחוניות");
    } else if (style === 'minimalist') {
      outfit.recommendations.push("התמקדי בקווים נקיים וטקסטורות מעניינות במקום בצבעים עזים");
    }

    results.push(outfit);
  }
  
  return results;
}

// Helper function to convert hex color to human-readable name
function getColorName(hex: string): string {
  const colorMap: Record<string, string> = {
    '#000000': 'שחור',
    '#FFFFFF': 'לבן',
    '#FF0000': 'אדום',
    '#00FF00': 'ירוק',
    '#0000FF': 'כחול',
    '#FFFF00': 'צהוב',
    '#FF00FF': 'מגנטה',
    '#00FFFF': 'טורקיז',
    '#C0C0C0': 'כסוף',
    '#808080': 'אפור',
    '#800000': 'בורדו',
    '#808000': 'זית',
    '#008000': 'ירוק כהה',
    '#800080': 'סגול',
    '#008080': 'טורקיז כהה',
    '#000080': 'כחול נייבי',
    '#FFA500': 'כתום',
    '#A52A2A': 'חום',
    '#FFC0CB': 'ורוד',
    '#F5F5DC': 'בז׳',
    '#2C3E50': 'כחול-אפור כהה',
    '#34495E': 'אפור עמוק',
    '#7F8C8D': 'אפור בינוני',
    '#BDC3C7': 'אפור בהיר',
    '#ECF0F1': 'אפור-לבן',
    '#FF4081': 'ורוד חם',
    '#F8BBD0': 'ורוד בהיר',
    '#EC407A': 'פוקסיה',
    '#C2185B': 'בורגונדי',
    '#F48FB1': 'ורוד עתיק',
    '#212121': 'שחור פחם',
    '#424242': 'אפור כהה',
    '#616161': 'אפור',
    '#FAFAFA': 'לבן שבור',
    '#607D8B': 'כחול אפרפר',
    '#90A4AE': 'תכלת אפרפר',
    '#455A64': 'אפור כחלחל',
    '#ECEFF1': 'אפור בהיר מאוד',
    '#CFD8DC': 'אפור פנינה',
    '#F44336': 'אדום בהיר',
    '#FF5722': 'אדום כתום',
    '#9C27B0': 'סגול חזק',
    '#673AB7': 'סגול עמוק',
    '#3F51B5': 'אינדיגו',
    '#00BCD4': 'טורקיז בהיר',
    '#009688': 'ירוק-טורקיז',
    '#4CAF50': 'ירוק בהיר',
    '#CDDC39': 'ליים',
    '#FFEB3B': 'צהוב בהיר'
  };

  // If color isn't in our map, return the hex code
  return colorMap[hex.toUpperCase()] || hex;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const input: OutfitRequest = await req.json();

    // Validate required params
    if (!input.bodyStructure || !input.mood || !input.style) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required parameters. Please provide bodyStructure, mood, and style."
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if this is a work-appropriate request
    const isWorkRequest = isWorkAppropriate(input.bodyStructure, input.style, input.mood);
    
    let outfitSuggestions: OutfitSuggestion[];
    
    if (isWorkRequest) {
      // Generate work-appropriate outfits
      outfitSuggestions = generateWorkAppropriateOutfit(
        input.bodyStructure, 
        input.style,
        input.mood
      );
    } else {
      // Generate regular outfit suggestions
      outfitSuggestions = generateOutfitForBodyStructure(
        input.bodyStructure, 
        input.style,
        input.mood
      );
    }

    // Return outfit suggestions
    const response: OutfitResponse = {
      success: true,
      data: outfitSuggestions,
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: `Error generating outfit: ${error.message}`
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
