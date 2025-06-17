
import { supabase } from "@/lib/supabaseClient";
import { DashboardItem } from "@/types/lookTypes";
import { extractImageUrl } from "./outfitGenerationService";
import { findCasualItems } from "./casualOutfitService";
import logger from "@/lib/logger";

/**
 * מחזיר הצעת תלבושת ראשונה על בסיס ניתוח הסטייל
 */
export async function fetchFirstOutfitSuggestion(forceRefresh: boolean = false): Promise<DashboardItem[]> {
  try {
    logger.info("מחזיר הצעת תלבושת ראשונה", {
      context: "lookService",
      data: { forceRefresh }
    });

    // קבלת נתוני ניתוח הסטייל
    const styleAnalysis = localStorage.getItem('styleAnalysis');
    const currentMood = localStorage.getItem('current-mood');
    
    if (!styleAnalysis) {
      throw new Error('לא נמצא ניתוח סטייל');
    }

    const parsedStyleAnalysis = JSON.parse(styleAnalysis);
    const styleProfile = parsedStyleAnalysis?.analysis?.styleProfile?.toLowerCase();
    
    console.log(`🎯 [LookService] פרופיל סטייל זוהה: ${styleProfile}`);

    // לוגיקה מיוחדת לסגנון קזואל
    if (styleProfile === 'casual' || currentMood === 'casual') {
      console.log(`👕 [LookService] מחזיר תלבושת קזואלית מותאמת`);
      
      // שימוש בשירות הקזואל
      const [casualTops, casualBottoms, casualShoes] = await Promise.all([
        findCasualItems('top', 1),
        findCasualItems('bottom', 1), 
        findCasualItems('shoes', 1)
      ]);

      const casualOutfit: DashboardItem[] = [];
      
      if (casualTops.length > 0) {
        casualOutfit.push({
          id: casualTops[0].id,
          name: casualTops[0].name,
          image: casualTops[0].image,
          type: 'top',
          price: casualTops[0].price,
          description: casualTops[0].description || ''
        });
      }

      if (casualBottoms.length > 0) {
        casualOutfit.push({
          id: casualBottoms[0].id,
          name: casualBottoms[0].name,
          image: casualBottoms[0].image,
          type: 'bottom',
          price: casualBottoms[0].price,
          description: casualBottoms[0].description || ''
        });
      }

      if (casualShoes.length > 0) {
        casualOutfit.push({
          id: casualShoes[0].id,
          name: casualShoes[0].name,
          image: casualShoes[0].image,
          type: 'shoes',
          price: casualShoes[0].price,
          description: casualShoes[0].description || ''
        });
      }

      if (casualOutfit.length >= 3) {
        logger.info("תלבושת קזואלית הוחזרה בהצלחה", {
          context: "lookService",
          data: { itemCount: casualOutfit.length }
        });
        return casualOutfit;
      }
    }

    // לוגיקה רגילה לסגנונות אחרים או אם הקזואל נכשל
    const colorPreferences = parsedStyleAnalysis?.analysis?.colorPreferences || [];
    const bodyShape = parsedStyleAnalysis?.analysis?.bodyShape;

    // קבלת פריטים מהמאגר
    const { data: allItems, error } = await supabase
      .from('zara_cloth')
      .select('*')
      .order('price', { ascending: true })
      .limit(100);

    if (error) {
      throw new Error(`שגיאה בטעינת פריטים: ${error.message}`);
    }

    if (!allItems || allItems.length === 0) {
      throw new Error('לא נמצאו פריטים במאגר');
    }

    // סינון פריטים על פי העדפות
    const filteredItems = allItems.filter(item => {
      const itemColor = item.colour?.toLowerCase() || '';
      
      // התאמה לצבעים מועדפים
      if (colorPreferences.length > 0) {
        const colorMatch = colorPreferences.some((pref: string) => 
          itemColor.includes(pref.toLowerCase())
        );
        if (!colorMatch) return false;
      }

      return true;
    });

    // זיהוי שמלות וטוניקות
    const dressesAndTunics = filteredItems.filter(item => 
      isDressOrTunic(item)
    );

    // חלוקת פריטים לקטגוריות (ללא שמלות וטוניקות)
    const tops = filteredItems.filter(item => {
      const name = item.product_name?.toLowerCase() || '';
      return !isDressOrTunic(item) && (name.includes('חולצ') || name.includes('טופ') || name.includes('בלוז'));
    });

    const bottoms = filteredItems.filter(item => {
      const name = item.product_name?.toLowerCase() || '';
      return name.includes('מכנס') || name.includes('חצאית') || name.includes('ג\'ינס');
    });

    const shoes = filteredItems.filter(item => {
      const name = item.product_name?.toLowerCase() || '';
      return name.includes('נעל') || name.includes('סנדל') || name.includes('מגף');
    });

    const selectedItems: DashboardItem[] = [];

    // אם יש שמלה או טוניקה, יצירת לוק עם 2 פריטים בלבד
    if (dressesAndTunics.length > 0 && shoes.length > 0) {
      const dressOrTunic = dressesAndTunics[0];
      const selectedShoes = shoes[0];

      selectedItems.push({
        id: dressOrTunic.id,
        name: dressOrTunic.product_name,
        image: extractImageUrl(dressOrTunic.image),
        type: 'dress',
        price: `₪${dressOrTunic.price}`,
        description: dressOrTunic.description || ''
      });

      selectedItems.push({
        id: selectedShoes.id,
        name: selectedShoes.product_name,
        image: extractImageUrl(selectedShoes.image),
        type: 'shoes',
        price: `₪${selectedShoes.price}`,
        description: selectedShoes.description || ''
      });

      logger.info("תלבושת עם שמלה/טוניקה הוחזרה בהצלחה", {
        context: "lookService",
        data: { 
          itemCount: selectedItems.length,
          type: 'dress_outfit',
          items: selectedItems.map(item => ({ name: item.name, type: item.type }))
        }
      });

      return selectedItems;
    }

    // בחירת פריט אחד מכל קטגוריה (לוק רגיל)
    if (tops.length > 0) {
      const top = tops[0];
      selectedItems.push({
        id: top.id,
        name: top.product_name,
        image: extractImageUrl(top.image),
        type: 'top',
        price: `₪${top.price}`,
        description: top.description || ''
      });
    }

    if (bottoms.length > 0) {
      const bottom = bottoms[0];
      selectedItems.push({
        id: bottom.id,
        name: bottom.product_name,
        image: extractImageUrl(bottom.image),
        type: 'bottom',
        price: `₪${bottom.price}`,
        description: bottom.description || ''
      });
    }

    if (shoes.length > 0) {
      const shoe = shoes[0];
      selectedItems.push({
        id: shoe.id,
        name: shoe.product_name,
        image: extractImageUrl(shoe.image),
        type: 'shoes',
        price: `₪${shoe.price}`,
        description: shoe.description || ''
      });
    }

    if (selectedItems.length < 2) {
      throw new Error('לא נמצאו מספיק פריטים מתאימים ליצירת תלבושת שלמה');
    }

    logger.info("הצעת תלבושת הוחזרה בהצלחה", {
      context: "lookService",
      data: { 
        itemCount: selectedItems.length,
        styleProfile,
        items: selectedItems.map(item => ({ name: item.name, type: item.type }))
      }
    });

    return selectedItems;

  } catch (error) {
    logger.error("שגיאה בהחזרת הצעת תלבושת:", {
      context: "lookService",
      data: error
    });
    throw error;
  }
}

/**
 * מחזיר נתונים לכל ההזדמנויות
 */
export async function fetchDashboardItems(): Promise<{ [key: string]: DashboardItem[] }> {
  try {
    console.log('🔍 [fetchDashboardItems] Starting to fetch items for all occasions...');
    
    // קבלת תלבושת בסיס
    const baseOutfit = await fetchFirstOutfitSuggestion();
    console.log('✅ [fetchDashboardItems] Base outfit received:', baseOutfit.length, 'items');
    
    // יצירת וריאציות לכל הזדמנות
    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    const data: { [key: string]: DashboardItem[] } = {};
    
    occasions.forEach(occasion => {
      // יצירת עותק של התלבושת הבסיסית לכל הזדמנות
      data[occasion] = baseOutfit.map(item => ({
        ...item,
        id: `${item.id}-${occasion.toLowerCase()}` // מזהה ייחודי לכל הזדמנות
      }));
      
      console.log(`✅ [fetchDashboardItems] Created ${occasion} outfit with ${data[occasion].length} items`);
    });
    
    console.log('✅ [fetchDashboardItems] All occasions processed successfully');
    return data;
    
  } catch (error) {
    console.error('❌ [fetchDashboardItems] Error:', error);
    
    // החזרת תלבושות ריקות במקרה של שגיאה
    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    const emptyData: { [key: string]: DashboardItem[] } = {};
    occasions.forEach(occasion => {
      emptyData[occasion] = [];
    });
    return emptyData;
  }
}

/**
 * זיהוי שמלות וטוניקות
 */
function isDressOrTunic(item: any): boolean {
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

// Export placeholder functions for compatibility
export function clearGlobalItemTrackers() {
  console.log('clearGlobalItemTrackers called');
}

export function clearOutfitCache() {
  console.log('clearOutfitCache called');
}
