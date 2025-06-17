
import { supabase } from "@/lib/supabaseClient";
import logger from "@/lib/logger";
import { extractImageUrl } from "./outfitGenerationService";

export interface CasualOutfitItem {
  id: string;
  name: string;
  type: string;
  price: string;
  image: string;
  color: string;
  description?: string;
}

/**
 * מחפש פריטים קזואליים ספציפיים לפי סוג
 */
export async function findCasualItems(itemType: 'top' | 'bottom' | 'shoes', limit: number = 10): Promise<CasualOutfitItem[]> {
  try {
    logger.info(`מחפש פריטים קזואליים מסוג ${itemType}`, {
      context: "casualOutfitService",
      data: { itemType, limit }
    });

    let searchTerms: string[] = [];
    let excludeTerms: string[] = [];

    switch (itemType) {
      case 'top':
        // חיפוש חולצות טי / פולוברים / סווטשירטים
        searchTerms = [
          'טי שירט', 'חולצת טי', 'טריקו', 'פולובר', 'סווטשירט', 
          'הודי', 'קפוצ\'ון', 'חולצה בסיסית', 'טופ בסיסי',
          't-shirt', 'tee', 'polo', 'sweatshirt', 'hoodie'
        ];
        // לא רוצים חולצות מכופתרות או פורמליות
        excludeTerms = [
          'חליפה', 'מכופתר', 'עניבה', 'פורמלי', 'עבודה',
          'suit', 'formal', 'dress shirt', 'button up'
        ];
        break;

      case 'bottom':
        // חיפוש ג'ינסים / מכנסי טרנינג / מכנסיים קצרים
        searchTerms = [
          'ג\'ינס', 'ג\'ינסים', 'דנים', 'מכנסי טרנינג', 'ג\'וגר',
          'מכנסיים קצרים', 'שורטס', 'מכנסי כותנה', 'מכנסי פנוי',
          'jeans', 'denim', 'joggers', 'shorts', 'casual pants',
          'cotton pants', 'chino'
        ];
        // לא רוצים מכנסי חליפה או פורמליים
        excludeTerms = [
          'חליפה', 'פורמלי', 'עבודה', 'מחויט',
          'suit', 'formal', 'dress pants', 'tailored'
        ];
        break;

      case 'shoes':
        // חיפוש סניקרס / נעלי ספורט / נעליים נוחות
        searchTerms = [
          'סניקרס', 'נעלי ספורט', 'נעלי ריצה', 'נעלי התעמלות',
          'אולסטאר', 'קונברס', 'נייק', 'אדידס', 'נעליים נוחות',
          'sneakers', 'sports shoes', 'running shoes', 'trainers',
          'converse', 'nike', 'adidas', 'casual shoes'
        ];
        // לא רוצים נעלי עקב או פורמליות
        excludeTerms = [
          'עקב', 'פורמלי', 'חליפה', 'עבודה', 'מחויט',
          'heel', 'formal', 'dress shoes', 'oxford', 'loafer'
        ];
        break;
    }

    // בניית שאילתה עם תנאי OR לחיפוש ו-AND NOT לאיסור
    const searchQuery = searchTerms.map(term => 
      `product_name.ilike.%${term}%,description.ilike.%${term}%,product_family.ilike.%${term}%`
    ).join(',');

    let query = supabase
      .from('zara_cloth')
      .select('*')
      .or(searchQuery);

    // הוספת תנאי שלילה לכל מונח שרוצים לא לכלול
    for (const excludeTerm of excludeTerms) {
      query = query
        .not('product_name', 'ilike', `%${excludeTerm}%`)
        .not('description', 'ilike', `%${excludeTerm}%`)
        .not('product_family', 'ilike', `%${excludeTerm}%`);
    }

    // הגבלת תוצאות ומיון לפי מחיר (להעדיף פריטים זולים יותר לקזואל)
    const { data: items, error } = await query
      .order('price', { ascending: true })
      .limit(limit);

    if (error) {
      logger.error(`שגיאה בחיפוש פריטים קזואליים מסוג ${itemType}:`, {
        context: "casualOutfitService",
        data: error
      });
      return [];
    }

    if (!items || items.length === 0) {
      logger.warn(`לא נמצאו פריטים קזואליים מסוג ${itemType}`, {
        context: "casualOutfitService"
      });
      return [];
    }

    // המרת התוצאות לפורמט המתאים
    const casualItems = items.map(item => ({
      id: item.id,
      name: item.product_name,
      type: itemType,
      price: `₪${item.price}`,
      image: extractImageUrl(item.image),
      color: item.colour || 'לא צוין',
      description: item.description
    }));

    logger.info(`נמצאו ${casualItems.length} פריטים קזואליים מסוג ${itemType}`, {
      context: "casualOutfitService",
      data: { 
        itemType, 
        foundItems: casualItems.length,
        examples: casualItems.slice(0, 3).map(item => item.name)
      }
    });

    return casualItems;

  } catch (error) {
    logger.error(`שגיאה בחיפוש פריטים קזואליים מסוג ${itemType}:`, {
      context: "casualOutfitService",
      data: error
    });
    return [];
  }
}

/**
 * יוצר תלבושת קזואלית שלמה
 */
export async function createCasualOutfit(): Promise<{
  top: CasualOutfitItem | null;
  bottom: CasualOutfitItem | null;
  shoes: CasualOutfitItem | null;
}> {
  try {
    logger.info("יוצר תלבושת קזואלית שלמה", {
      context: "casualOutfitService"
    });

    // חיפוש פריטים מכל סוג
    const [tops, bottoms, shoes] = await Promise.all([
      findCasualItems('top', 5),
      findCasualItems('bottom', 5),
      findCasualItems('shoes', 5)
    ]);

    // בחירת פריט אחד מכל סוג (ראשון ברשימה = הזול ביותר)
    const selectedOutfit = {
      top: tops.length > 0 ? tops[0] : null,
      bottom: bottoms.length > 0 ? bottoms[0] : null,
      shoes: shoes.length > 0 ? shoes[0] : null
    };

    logger.info("תלבושת קזואלית נוצרה בהצלחה", {
      context: "casualOutfitService",
      data: {
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
    logger.error("שגיאה ביצירת תלבושת קזואלית:", {
      context: "casualOutfitService",
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
 * מחזיר המלצות סטייל לתלבושת קזואלית
 */
export function getCasualStyleRecommendations(): string[] {
  return [
    'שלב שכבות - חולצת טי עם ג\'קט ג\'ינס או סווטשירט',
    'בחר צבעים ניטרליים כמו שחור, לבן, כחול ואפור',
    'התאם אביזרים פשוטים - תיק גב או כובע',
    'וודא שהבגדים נוחים ומתאימים לפעילות יומיומית',
    'נעלי סניקרס נקיות הן תמיד בחירה מצוינת',
    'ג\'ינסים כהים נראים יותר מעודנים ומתאימים לכל מקום'
  ];
}
