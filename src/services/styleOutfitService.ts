
import { supabase } from "@/integrations/supabase/client";
import logger from "@/lib/logger";
import { extractImageUrl } from "./outfitGenerationService";
import { styleRecommendations } from "@/components/quiz/constants/styleRecommendations";
import { filterWorkAppropriateItems } from "@/components/filters/WorkAppropriateFilter";

export interface StyleOutfitItem {
  id: string;
  name: string;
  type: string;
  price: string;
  image: string;
  color: string;
  description?: string;
}

/**
 * מחפש פריטים לפי סגנון וסוג
 */
export async function findStyleItems(
  styleName: keyof typeof styleRecommendations,
  itemType: 'top' | 'bottom' | 'shoes',
  limit: number = 10
): Promise<StyleOutfitItem[]> {
  try {
    logger.info(`מחפש פריטים מסוג ${itemType} לסגנון ${styleName}`, {
      context: "styleOutfitService",
      data: { styleName, itemType, limit }
    });

    // שימוש בהגדרות הסגנון מהקובץ styleRecommendations
    const targetStyle = styleRecommendations[styleName];
    if (!targetStyle) {
      logger.warn(`סגנון ${styleName} לא נמצא`, {
        context: "styleOutfitService"
      });
      return [];
    }
    let targetItems: any[] = [];

    switch (itemType) {
      case 'top':
        targetItems = targetStyle.tops || [];
        break;
      case 'bottom':
        targetItems = targetStyle.bottoms || [];
        break;
      case 'shoes':
        targetItems = targetStyle.shoes || [];
        break;
    }

    // בניית שאילתה מבוססת על המשפחות והתת-משפחות המוגדרות
    const familyQueries = targetItems.map(item => 
      `product_family.ilike.%${item.family}%,product_subfamily.ilike.%${item.subfamily}%`
    );

    let query = supabase
      .from('zara_cloth')
      .select('*')
      .or(familyQueries.join(','))
      // סינון מוצרי יופי וקוסמטיקה
      .not('product_family', 'ilike', '%maquillaje%')
      .not('product_family', 'ilike', '%cologne%')
      .not('product_family', 'ilike', '%perfume%')
      .not('product_family', 'ilike', '%borlas%')
      .not('product_family', 'ilike', '%esmalte%')
      .not('product_subfamily', 'ilike', '%cosm%')
      .not('product_subfamily', 'ilike', '%perfu%');

    // סינון נוסף לפי צבעים של הסגנון אם יש
    const styleColors = targetItems.flatMap(item => item.colors);
    if (styleColors.length > 0) {
      const colorQuery = styleColors.map(color => `colour.ilike.%${color}%`).join(',');
      query = query.or(colorQuery);
    }

    // הגבלת תוצאות ומיון לפי מחיר
    const { data: items, error } = await query
      .order('price', { ascending: true })
      .limit(limit * 3); // מגדיל את המגבלה כדי לתת מקום לפילטר העבודה

    if (error) {
      logger.error(`שגיאה בחיפוש פריטים מסוג ${itemType} לסגנון ${styleName}:`, {
        context: "styleOutfitService",
        data: error
      });
      return [];
    }

    if (!items || items.length === 0) {
      logger.warn(`לא נמצאו פריטים מסוג ${itemType} לסגנון ${styleName}`, {
        context: "styleOutfitService"
      });
      return [];
    }

    // המרת התוצאות לפורמט המתאים
    let styleItems = items.map(item => ({
      id: item.id,
      name: item.product_name,
      type: itemType,
      price: `₪${item.price}`,
      image: extractImageUrl(item.image),
      color: item.colour || 'לא צוין',
      description: item.description,
       // שדות נוספים לפילטר העבודה
      product_name: item.product_name,
      product_family: item.product_family
    }));

    // אם זה סגנון עבודה, נפלטר רק פריטים מתאימים לעבודה
    if (styleName === 'Work') {
      styleItems = filterWorkAppropriateItems(styleItems);
      // מגביל לכמות המבוקשת המקורית אחרי הפילטור
      styleItems = styleItems.slice(0, limit);
    }

    logger.info(`נמצאו ${styleItems.length} פריטים מסוג ${itemType} לסגנון ${styleName}`, {
      context: "styleOutfitService",
      data: { 
        styleName,
        itemType, 
        foundItems: styleItems.length,
        examples: styleItems.slice(0, 3).map(item => item.name)
      }
    });

    return styleItems;

  } catch (error) {
    logger.error(`שגיאה בחיפוש פריטים מסוג ${itemType} לסגנון ${styleName}:`, {
      context: "styleOutfitService",
      data: error
    });
    return [];
  }
}

/**
 * יוצר תלבושת שלמה לפי סגנון
 */
export async function createStyleOutfit(styleName: keyof typeof styleRecommendations): Promise<{
  top: StyleOutfitItem | null;
  bottom: StyleOutfitItem | null;
  shoes: StyleOutfitItem | null;
}> {
  try {
    logger.info(`יוצר תלבושת שלמה לסגנון ${styleName}`, {
      context: "styleOutfitService"
    });

    // חיפוש פריטים מכל סוג
    const [tops, bottoms, shoes] = await Promise.all([
      findStyleItems(styleName, 'top', 5),
      findStyleItems(styleName, 'bottom', 5),
      findStyleItems(styleName, 'shoes', 5)
    ]);

    // בחירת פריט אחד מכל סוג (ראשון ברשימה = הזול ביותר)
    const selectedOutfit = {
      top: tops.length > 0 ? tops[0] : null,
      bottom: bottoms.length > 0 ? bottoms[0] : null,
      shoes: shoes.length > 0 ? shoes[0] : null
    };

    logger.info(`תלבושת לסגנון ${styleName} נוצרה בהצלחה`, {
      context: "styleOutfitService",
      data: {
        styleName,
        hasTop: !!selectedOutfit.top,
        hasBottom: !!selectedOutfit.bottom,
        hasShoes: !!selectedOutfit.shoes,
        topName: selectedOutfit.top?.name,
        bottomName: selectedOutfit.bottom?.name,
        shoesName: selectedOutfit.shoes?.name
      }
    });

    return selectedOutfit;

  } catch (error) {
    logger.error(`שגיאה ביצירת תלבושת לסגנון ${styleName}:`, {
      context: "styleOutfitService",
      data: error
    });

    return {
      top: null,
      bottom: null,
      shoes: null
    };
  }
}

/**
 * מחזיר המלצות סטייל לפי הסגנון הנבחר
 */
export function getStyleRecommendations(styleName: keyof typeof styleRecommendations): string[] {
  const styleGuides = {
    Casual: [
      'שלב שכבות - חולצת טי עם ג\'קט ג\'ינס או סווטשירט',
      'בחר צבעים ניטרליים כמו שחור, לבן, כחול ואפור',
      'התאם אביזרים פשוטים - תיק גב או כובע',
      'וודא שהבגדים נוחים ומתאימים לפעילות יומיומית',
      'נעלי סניקרס נקיות הן תמיד בחירה מצוינת'
    ],
    Classic: [
      'בחר פריטים בעלי גזרה נקייה ומחויטת',
      'דבק בפלטת צבעים נטרלית - שחור, לבן, נייבי, בז\'',
      'השתמש באיכויות טובות של בדים כמו צמר וכותנה',
      'הוסף אביזרים קלאסיים כמו שעון איכותי או צעיף משי',
      'נעלי עור קלאסיות תשלמנה את המראה'
    ],
    Elegant: [
      'בחר פריטים עם פרטים עדינים ואיכותיים',
      'השתמש בצבעים רכים ועדינים',
      'הקפד על בדים איכותיים ונעימים למגע',
      'הוסף תכשיטים עדינים ומעודנים',
      'נעלי עקב נמוכות או בלרינות יתאימו מאוד'
    ],
    Minimalist: [
      'בחר פריטים בגזרות נקיות וקווים פשוטים',
      'דבק בפלטת צבעים מינימליסטית - שחור, לבן, אפור',
      'הימנע מדפוסים מורכבים או הדפסים',
      'בחר איכות על פני כמות',
      'אביזרים מינימליים ופונקציונליים בלבד'
    ],
    Romantic: [
      'בחר בדים רכים עם מרקמים עדינים',
      'השתמש בצבעים רכים כמו ורוד פסטל, לבנדר ושמנת',
      'הוסף פרטים נשיים כמו תחרה או ריקמות',
      'בחר בפריטים עם קווים זורמים ונשיים',
      'השלם עם אביזרים עדינים ונשיים'
    ],
    Boohoo: [
      'העז בצבעים ובדפוסים',
      'בחר פריטים טרנדיים ועכשוויים',
      'שלב פריטי אופנה בולטים',
      'הוסף אביזרים מעצבניים ובולטים',
      'אל תפחד לערבב סגנונות שונים'
    ],
    Nordic: [
      'בחר בגוונים של כחול, לבן ואפור',
      'השתמש בבדים טבעיים כמו פשתן וצמר',
      'בחר פריטים פונקציונליים ונוחים',
      'הוסף אביזרים בטבעיים ופשוטים',
      'שמור על מראה נקי ומינימליסטי'
    ],
    Sportive: [
      'בחר בגדים נוחים ופונקציונליים',
      'השתמש בבדים נושמים ומתיחה',
      'בחר נעלי ספורט איכותיות',
      'הוסף אביזרי ספורט מתאימים',
      'שמור על מראה אקטיבי ואתלטי'
    ]
  };

  return styleGuides[styleName] || [
    'בחר פריטים שמתאימים לאישיותך',
    'שמור על נוחות וביטחון עצמי',
    'התאם את הבגדים לאירוע',
    'אל תשכח את הפרטים הקטנים'
  ];
}
