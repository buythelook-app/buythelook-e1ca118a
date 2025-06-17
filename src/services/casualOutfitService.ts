
import { supabase } from "@/lib/supabaseClient";
import { extractImageUrl } from "./outfitGenerationService";
import logger from "@/lib/logger";

export interface CasualItem {
  id: string;
  name: string;
  image: string;
  price: string;
  type: 'top' | 'bottom' | 'shoes';
  description?: string;
}

export interface CasualOutfit {
  top: CasualItem;
  bottom: CasualItem;
  shoes: CasualItem;
}

/**
 * מוצא פריטים קזואליים לפי סוג
 */
export async function findCasualItems(type: 'top' | 'bottom' | 'shoes', limit: number = 5): Promise<CasualItem[]> {
  try {
    let namePatterns: string[] = [];
    
    switch (type) {
      case 'top':
        namePatterns = ['טי שירט', 'חולצת טי', 'טריקו', 'פולו', 'הודי', 'סוודר'];
        break;
      case 'bottom':
        namePatterns = ['ג\'ינס', 'מכנסי ג\'ינס', 'מכנסי טרנינג', 'מכנסי פוטר', 'שורטס'];
        break;
      case 'shoes':
        namePatterns = ['סניקרס', 'נעלי ספורט', 'נעלי התעמלות', 'קונברס'];
        break;
    }

    // בניית שאילתה עם תנאי OR לכל הדפוסים
    let query = supabase
      .from('zara_cloth')
      .select('*');

    // הוספת תנאי חיפוש לכל דפוס
    const orConditions = namePatterns.map(pattern => 
      `product_name.ilike.%${pattern}%`
    ).join(',');

    if (orConditions) {
      query = query.or(orConditions);
    }

    const { data: items, error } = await query.limit(limit * 2); // לקחת יותר כדי לסנן

    if (error) {
      logger.error(`שגיאה בחיפוש פריטים קזואליים מסוג ${type}:`, {
        context: "casualOutfitService",
        data: error
      });
      return [];
    }

    if (!items || items.length === 0) {
      logger.warn(`לא נמצאו פריטים קזואליים מסוג ${type}`);
      return [];
    }

    // סינון נוסף ומיפוי לפורמט הנדרש
    const casualItems: CasualItem[] = items
      .filter(item => {
        const name = item.product_name?.toLowerCase() || '';
        // ודא שזה באמת פריט קזואל
        return namePatterns.some(pattern => 
          name.includes(pattern.toLowerCase())
        );
      })
      .slice(0, limit)
      .map(item => ({
        id: item.id,
        name: item.product_name,
        image: extractImageUrl(item.image),
        price: `₪${item.price}`,
        type,
        description: item.description || ''
      }));

    logger.info(`נמצאו ${casualItems.length} פריטים קזואליים מסוג ${type}`, {
      context: "casualOutfitService"
    });

    return casualItems;

  } catch (error) {
    logger.error(`שגיאה בחיפוש פריטים קזואליים מסוג ${type}:`, {
      context: "casualOutfitService",
      data: error
    });
    return [];
  }
}

/**
 * יוצר תלבושת קזואלית שלמה עם בדיוק 3 פריטים
 */
export async function createCasualOutfit(): Promise<Partial<CasualOutfit>> {
  try {
    logger.info("יוצר תלבושת קזואלית", {
      context: "casualOutfitService"
    });

    const [tops, bottoms, shoes] = await Promise.all([
      findCasualItems('top', 3),
      findCasualItems('bottom', 3),
      findCasualItems('shoes', 3)
    ]);

    const outfit: Partial<CasualOutfit> = {};

    if (tops.length > 0) {
      outfit.top = tops[Math.floor(Math.random() * tops.length)];
    }

    if (bottoms.length > 0) {
      outfit.bottom = bottoms[Math.floor(Math.random() * bottoms.length)];
    }

    if (shoes.length > 0) {
      outfit.shoes = shoes[Math.floor(Math.random() * shoes.length)];
    }

    logger.info("תלבושת קזואלית נוצרה", {
      context: "casualOutfitService",
      data: {
        hasTop: !!outfit.top,
        hasBottom: !!outfit.bottom,
        hasShoes: !!outfit.shoes
      }
    });

    return outfit;

  } catch (error) {
    logger.error("שגיאה ביצירת תלבושת קזואלית:", {
      context: "casualOutfitService",
      data: error
    });
    return {};
  }
}

/**
 * מחזיר המלצות לסטייל קזואל
 */
export function getCasualStyleRecommendations(): string[] {
  return [
    'השלב צבעים נייטרליים לחיזוק המראה הקזואל',
    'הוסף אביזרים פשוטים כמו כובע או תיק גב',
    'ודא שהבגדים נוחים ומתאימים לפעילות יומיומית',
    'נסה לשחק עם שכבות קלות בהתאם למזג האוויר'
  ];
}
