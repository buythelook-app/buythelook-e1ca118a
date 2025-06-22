
import { supabase } from "@/lib/supabaseClient";
import { DashboardItem } from "@/types/lookTypes";
import { extractImageUrl } from "./outfitGenerationService";
import { findCasualItems } from "./casualOutfitService";
import { ColorCoordinationService } from "./colorCoordinationService";
import { extractZaraImageUrl, ZaraImageData } from "@/utils/imageUtils";
import logger from "@/lib/logger";

// Global tracking to ensure variety across occasions
let globalUsedItemIds: Set<string> = new Set();
let lastResetTime = Date.now();

/**
 * מחזיר הצעת תלבושת ראשונה על בסיס ניתוח הסטייל
 */
export async function fetchFirstOutfitSuggestion(forceRefresh: boolean = false): Promise<DashboardItem[]> {
  try {
    logger.info("מחזיר הצעת תלבושת ראשונה", {
      context: "lookService",
      data: { forceRefresh }
    });

    // Reset global tracking if needed
    if (forceRefresh || Date.now() - lastResetTime > 300000) { // Reset every 5 minutes
      globalUsedItemIds.clear();
      lastResetTime = Date.now();
    }

    // קבלת נתוני ניתוח הסטייל
    const styleAnalysis = localStorage.getItem('styleAnalysis');
    const currentMood = localStorage.getItem('current-mood');
    
    if (!styleAnalysis) {
      console.log('❌ [lookService] No style analysis found, using fallback outfit');
    }

    let parsedStyleAnalysis = null;
    let styleProfile = 'casual';
    let colorPreferences = [];
    let eventType = 'casual';

    if (styleAnalysis) {
      try {
        parsedStyleAnalysis = JSON.parse(styleAnalysis);
        styleProfile = parsedStyleAnalysis?.analysis?.styleProfile?.toLowerCase() || 'casual';
        colorPreferences = parsedStyleAnalysis?.analysis?.colorPreferences || [];
        eventType = parsedStyleAnalysis?.analysis?.eventType?.toLowerCase() || 'casual';
      } catch (e) {
        console.log('❌ [lookService] Error parsing style analysis, using defaults');
      }
    }
    
    console.log(`🎯 [LookService] פרופיל סטייל זוהה: ${styleProfile}, אירוע: ${eventType}`);

    // לוגיקה מיוחדת לסגנון קזואל
    if (styleProfile === 'casual' || currentMood === 'casual') {
      console.log(`👕 [LookService] מחזיר תלבושת קזואלית מותאמת`);
      
      try {
        const casualOutfit = await createCasualOutfitWithLogic(eventType);
        if (casualOutfit && casualOutfit.length >= 2) {
          return casualOutfit;
        }
      } catch (casualError) {
        console.log('❌ [lookService] Casual outfit failed, trying regular logic');
      }
    }

    // לוגיקה רגילה עם כללי ההתאמה החדשים
    console.log('🔍 [lookService] Using advanced outfit logic from database');

    const outfitItems = await createAdvancedOutfit(styleProfile, eventType, colorPreferences);
    
    if (outfitItems && outfitItems.length >= 2) {
      return outfitItems;
    }

    // fallback
    return getFallbackOutfit();

  } catch (error) {
    console.error("❌ [fetchFirstOutfitSuggestion] שגיאה:", error);
    logger.error("שגיאה בהחזרת הצעת תלבושת:", {
      context: "lookService",
      data: error
    });
    
    return getFallbackOutfit();
  }
}

/**
 * בדיקה אם יש תמונה תקינה בפריט
 */
function hasValidImageData(imageData: any): boolean {
  if (!imageData) return false;
  
  // Handle different image data formats
  let imageUrls: string[] = [];
  
  if (typeof imageData === 'string') {
    try {
      const parsed = JSON.parse(imageData);
      if (Array.isArray(parsed)) {
        imageUrls = parsed.filter(url => typeof url === 'string' && url.trim() !== '');
      } else if (typeof parsed === 'string' && parsed.trim() !== '') {
        imageUrls = [parsed];
      }
    } catch {
      if (imageData.trim() !== '') {
        imageUrls = [imageData];
      }
    }
  } else if (Array.isArray(imageData)) {
    imageUrls = imageData.filter(url => typeof url === 'string' && url.trim() !== '');
  }
  
  // Check if we have any valid Zara image URLs
  const hasValidZaraImage = imageUrls.some(url => {
    return url.includes('static.zara.net') && url.includes('.jpg');
  });
  
  return hasValidZaraImage;
}

/**
 * יצירת תלבושת מתקדמת עם כללי התאמה
 */
async function createAdvancedOutfit(styleProfile: string, eventType: string, colorPreferences: string[]): Promise<DashboardItem[]> {
  console.log(`🎨 [createAdvancedOutfit] יצירת תלבושת עבור ${styleProfile} לאירוע ${eventType}`);
  
  // קבלת פריטים מהמאגר - רק פריטים עם תמונות תקינות
  const { data: allItems, error } = await supabase
    .from('zara_cloth')
    .select('*')
    .not('image', 'is', null)
    .neq('availability', false)
    .order('price', { ascending: true })
    .limit(300);

  if (error || !allItems || allItems.length === 0) {
    console.error('❌ [createAdvancedOutfit] Database error:', error);
    return [];
  }

  console.log(`🔍 [createAdvancedOutfit] Found ${allItems.length} items with non-null images in database`);

  // סינון פריטים בסיסי - רק פריטים עם תמונות אמיתיות מזארה וללא פריטים שכבר נבחרו
  let filteredItems = allItems.filter(item => {
    const hasValid = hasValidImageData(item.image);
    const notUsed = !globalUsedItemIds.has(item.id);
    const isClothing = isActualClothingItem(item);
    
    if (!hasValid) {
      console.log(`❌ [createAdvancedOutfit] Filtering out item without valid Zara image: ${item.id} - ${item.product_name}`);
    } else if (!notUsed) {
      console.log(`⚠️ [createAdvancedOutfit] Skipping already used item: ${item.id} - ${item.product_name}`);
    } else if (!isClothing) {
      console.log(`❌ [createAdvancedOutfit] Filtering out non-clothing item: ${item.id} - ${item.product_name}`);
    }
    
    return hasValid && notUsed && isClothing && item.availability !== false;
  });
  
  console.log(`🔍 [createAdvancedOutfit] ${filteredItems.length} valid clothing items after filtering`);
  
  if (filteredItems.length === 0) {
    console.error('❌ [createAdvancedOutfit] No valid clothing items found');
    // Reset tracking and try again
    globalUsedItemIds.clear();
    filteredItems = allItems.filter(item => hasValidImageData(item.image) && isActualClothingItem(item));
  }
  
  // סינון לפי צבעים מועדפים
  if (colorPreferences.length > 0) {
    const colorFilteredItems = filteredItems.filter(item => {
      const itemColor = item.colour?.toLowerCase() || '';
      return colorPreferences.some((pref: string) => 
        itemColor.includes(pref.toLowerCase())
      );
    });
    
    if (colorFilteredItems.length > 0) {
      filteredItems = colorFilteredItems;
      console.log(`🎨 [createAdvancedOutfit] צבעים מועדפים: נמצאו ${filteredItems.length} פריטים תואמים`);
    }
  }

  // חלוקת פריטים לקטגוריות עם לוגיקה מתקדמת
  const categorizedItems = categorizeItemsAdvanced(filteredItems, eventType);
  
  console.log(`📋 [createAdvancedOutfit] קטגוריות:`, Object.keys(categorizedItems).map(key => ({
    category: key,
    count: categorizedItems[key].length
  })));

  // יצירת תלבושת לפי כללים - עם דגש על תמונות אמיתיות
  const outfitItems = await selectOutfitByRules(categorizedItems, eventType, styleProfile);
  
  // Mark selected items as used
  outfitItems.forEach(item => globalUsedItemIds.add(item.id));
  
  return outfitItems;
}

/**
 * בדיקה אם הפריט הוא באמת בגד ולא איפור/אביזרים
 */
function isActualClothingItem(item: any): boolean {
  const name = (item.product_name || '').toLowerCase();
  const subfamily = (item.product_subfamily || '').toLowerCase();
  const family = (item.product_family || '').toLowerCase();
  const description = (item.description || '').toLowerCase();
  
  const searchText = `${name} ${subfamily} ${family} ${description}`;
  
  // פריטי איפור ויופי לסינון
  const cosmeticKeywords = [
    'lipstick', 'lip gloss', 'איפור', 'שפתון', 'גלוס', 'makeup', 'cosmetic',
    'foundation', 'concealer', 'mascara', 'eyeshadow', 'בסיס', 'מסקרה',
    'perfume', 'fragrance', 'בושם', 'eau de', 'cologne',
    'nail polish', 'לק', 'nail', 'ציפורניים'
  ];
  
  // אביזרים ופריטים שאינם בגדים עיקריים
  const nonClothingKeywords = [
    'phone case', 'כיסוי טלפון', 'charger', 'מטען',
    'keychain', 'מחזיק מפתחות', 'sticker', 'מדבקה'
  ];
  
  // בדיקה שהפריט אינו איפור או אביזר
  const isCosmeticOrAccessory = [...cosmeticKeywords, ...nonClothingKeywords].some(keyword => 
    searchText.includes(keyword)
  );
  
  if (isCosmeticOrAccessory) {
    console.log(`🚫 [isActualClothingItem] Filtered cosmetic/accessory: ${item.product_name}`);
    return false;
  }
  
  // בדיקה חיובית - הפריט הוא בגד
  const clothingKeywords = [
    // חולצות ועליוניות
    'חולצ', 'טי שירט', 'בלוז', 'טופ', 'חזיי', 'גופי',
    'shirt', 'top', 'blouse', 'tee', 'tank', 'camisole',
    
    // מכנסיים וחצאיות
    'מכנס', 'ג\'ינס', 'חצאית', 'שורט', 'טייץ', 'לגינס',
    'pants', 'jeans', 'skirt', 'shorts', 'leggings', 'trousers',
    
    // שמלות וסט
    'שמלה', 'טוניקה', 'סט', 'קומבינזון',
    'dress', 'tunic', 'set', 'jumpsuit', 'romper',
    
    // מעילים ועליוניות
    'מעיל', 'ז\'קט', 'קרדיגן', 'בלייזר', 'סוודר', 'הודי',
    'jacket', 'coat', 'cardigan', 'blazer', 'sweater', 'hoodie',
    
    // נעליים
    'נעל', 'סנדל', 'מגף', 'כפכפ', 'נעלי',
    'shoe', 'sandal', 'boot', 'sneaker', 'heel'
  ];
  
  const isClothing = clothingKeywords.some(keyword => searchText.includes(keyword));
  
  if (!isClothing) {
    console.log(`❓ [isActualClothingItem] Unknown item type: ${item.product_name}`);
  }
  
  return isClothing;
}

/**
 * חלוקת פריטים לקטגוריות מתקדמות
 */
function categorizeItemsAdvanced(items: any[], eventType: string) {
  const categories = {
    dresses: [] as any[],
    tunics: [] as any[],
    tops: [] as any[],
    bottoms: [] as any[],
    outerwear: [] as any[],
    eveningShoes: [] as any[],
    casualShoes: [] as any[],
    formalShoes: [] as any[]
  };

  items.forEach(item => {
    const name = (item.product_name || '').toLowerCase();
    const subfamily = (item.product_subfamily || '').toLowerCase();
    const family = (item.product_family || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    
    const searchText = `${name} ${subfamily} ${family} ${description}`;
    
    // זיהוי שמלות
    if (isDress(searchText)) {
      console.log(`👗 [categorizeItemsAdvanced] שמלה זוהתה: ${item.product_name}`);
      categories.dresses.push(item);
    }
    // זיהוי טוניקות
    else if (isTunic(searchText)) {
      console.log(`👕 [categorizeItemsAdvanced] טוניקה זוהתה: ${item.product_name}`);
      categories.tunics.push(item);
    }
    // זיהוי עליוניות
    else if (isOuterwear(searchText)) {
      console.log(`🧥 [categorizeItemsAdvanced] עליונית זוהתה: ${item.product_name}`);
      categories.outerwear.push(item);
    }
    // זיהוי חולצות
    else if (isTop(searchText)) {
      console.log(`👕 [categorizeItemsAdvanced] חולצה זוהתה: ${item.product_name}`);
      categories.tops.push(item);
    }
    // זיהוי חלקים תחתונים
    else if (isBottom(searchText)) {
      console.log(`👖 [categorizeItemsAdvanced] חלק תחתון זוהה: ${item.product_name}`);
      categories.bottoms.push(item);
    }
    // זיהוי נעליים לפי סוג
    else if (isShoe(searchText)) {
      if (isEveningShoe(searchText)) {
        console.log(`👠 [categorizeItemsAdvanced] נעלי ערב זוהו: ${item.product_name}`);
        categories.eveningShoes.push(item);
      } else if (isFormalShoe(searchText)) {
        console.log(`👞 [categorizeItemsAdvanced] נעליים פורמליות זוהו: ${item.product_name}`);
        categories.formalShoes.push(item);
      } else {
        console.log(`👟 [categorizeItemsAdvanced] נעליים קז'ואליות זוהו: ${item.product_name}`);
        categories.casualShoes.push(item);
      }
    } else {
      console.log(`❓ [categorizeItemsAdvanced] פריט לא מזוהה: ${item.product_name} - ${searchText}`);
    }
  });

  return categories;
}

/**
 * בחירת תלבושת לפי כללים - עם דגש על איכות תמונות
 */
async function selectOutfitByRules(categories: any, eventType: string, styleProfile: string): Promise<DashboardItem[]> {
  console.log(`🎯 [selectOutfitByRules] בחירת תלבושת עבור ${eventType}`);
  
  const selectedItems: DashboardItem[] = [];
  let usedColors: string[] = [];

  // כלל 1: אם יש שמלה ואירוע מתאים
  if (categories.dresses.length > 0) {
    const dress = categories.dresses[0];
    
    // וידוא שלשמלה יש תמונה תקינה - המרה ל-string עם type casting
    const imageUrl = extractZaraImageUrl(dress.image as ZaraImageData);
    console.log(`🔍 [selectOutfitByRules] Dress image URL: ${imageUrl}`);
    
    if (imageUrl && imageUrl !== '/placeholder.svg' && imageUrl.includes('static.zara.net')) {
      selectedItems.push({
        id: dress.id,
        name: dress.product_name,
        image: imageUrl,
        type: 'dress',
        price: `₪${dress.price}`,
        description: dress.description || '',
        color: dress.colour
      });

      usedColors.push(dress.colour?.toLowerCase() || '');
      console.log(`👗 [selectOutfitByRules] שמלה נבחרה עם תמונה: ${dress.product_name}`);

      // בחירת נעליים מתאימות לשמלה מטבלת נעליים
      const matchingShoes = await selectMatchingShoesFromDB(eventType, usedColors);
      if (matchingShoes) {
        selectedItems.push(matchingShoes);
        usedColors.push(matchingShoes.color || '');
      }
      
      return selectedItems;
    } else {
      console.log(`❌ [selectOutfitByRules] Dress has invalid image URL: ${imageUrl}`);
    }
  }

  // כלל 2: אם יש עליונית עם תמונה תקינה
  if (categories.outerwear.length > 0 && categories.tops.length > 0) {
    const outerwear = categories.outerwear[0];
    const top = selectCompatibleTop(categories.tops, outerwear);
    
    const outerwearImageUrl = extractZaraImageUrl(outerwear.image as ZaraImageData);
    const topImageUrl = top ? extractZaraImageUrl(top.image as ZaraImageData) : null;
    
    console.log(`🔍 [selectOutfitByRules] Outerwear image: ${outerwearImageUrl}, Top image: ${topImageUrl}`);
    
    if (top && 
        outerwearImageUrl && outerwearImageUrl !== '/placeholder.svg' && outerwearImageUrl.includes('static.zara.net') &&
        topImageUrl && topImageUrl !== '/placeholder.svg' && topImageUrl.includes('static.zara.net')) {
      
      selectedItems.push({
        id: outerwear.id,
        name: outerwear.product_name,
        image: outerwearImageUrl,
        type: 'outerwear',
        price: `₪${outerwear.price}`,
        description: outerwear.description || '',
        color: outerwear.colour
      });

      selectedItems.push({
        id: top.id,
        name: top.product_name,
        image: topImageUrl,
        type: 'top',
        price: `₪${top.price}`,
        description: top.description || '',
        color: top.colour
      });

      usedColors.push(outerwear.colour?.toLowerCase() || '');
      usedColors.push(top.colour?.toLowerCase() || '');
      
      console.log(`🧥 [selectOutfitByRules] עליונית + חולצה נבחרו עם תמונות: ${outerwear.product_name} + ${top.product_name}`);
    }
  }

  // כלל 3: לוק רגיל (חולצה + מכנס/חצאית) עם תמונות תקינות
  if (selectedItems.length === 0 && categories.tops.length > 0 && categories.bottoms.length > 0) {
    const top = categories.tops[0];
    const bottom = selectCompatibleBottom(categories.bottoms, top);
    
    const topImageUrl = extractZaraImageUrl(top.image as ZaraImageData);
    const bottomImageUrl = bottom ? extractZaraImageUrl(bottom.image as ZaraImageData) : null;
    
    console.log(`🔍 [selectOutfitByRules] Top image: ${topImageUrl}, Bottom image: ${bottomImageUrl}`);
    
    if (bottom && 
        topImageUrl && topImageUrl !== '/placeholder.svg' && topImageUrl.includes('static.zara.net') &&
        bottomImageUrl && bottomImageUrl !== '/placeholder.svg' && bottomImageUrl.includes('static.zara.net')) {
      
      selectedItems.push({
        id: top.id,
        name: top.product_name,
        image: topImageUrl,
        type: 'top',
        price: `₪${top.price}`,
        description: top.description || '',
        color: top.colour
      });

      selectedItems.push({
        id: bottom.id,
        name: bottom.product_name,
        image: bottomImageUrl,
        type: 'bottom',
        price: `₪${bottom.price}`,
        description: bottom.description || '',
        color: bottom.color
      });

      usedColors.push(top.colour?.toLowerCase() || '');
      usedColors.push(bottom.colour?.toLowerCase() || '');
      
      console.log(`👕 [selectOutfitByRules] חולצה + תחתון נבחרו עם תמונות: ${top.product_name} + ${bottom.product_name}`);
    }
  }

  // הוספת נעליים אם עדיין אין - מטבלת נעליים
  if (selectedItems.length > 0 && !selectedItems.some(item => item.type === 'shoes')) {
    const matchingShoes = await selectMatchingShoesFromDB(eventType, usedColors);
    if (matchingShoes) {
      selectedItems.push(matchingShoes);
    }
  }

  // בדיקת התאמת צבעים סופית
  if (selectedItems.length >= 2) {
    const colorScore = ColorCoordinationService.scoreOutfitCoordination(
      selectedItems.map(item => ({ colour: item.color || extractColorFromName(item.name) })), 
      eventType
    );
    
    console.log(`🎨 [selectOutfitByRules] ציון התאמת צבעים: ${colorScore}/100`);
    
    if (colorScore >= 60) {
      console.log(`✅ [selectOutfitByRules] תלבושת אושרה עם ${selectedItems.length} פריטים עם תמונות אמיתיות`);
      return selectedItems;
    } else {
      console.log(`❌ [selectOutfitByRules] ציון צבעים נמוך מדי: ${colorScore}`);
    }
  }

  console.log(`⚠️ [selectOutfitByRules] No valid outfit found with real images, returning ${selectedItems.length} items`);
  return selectedItems;
}

/**
 * בחירת נעליים מתאימות מטבלת הנעליים
 */
async function selectMatchingShoesFromDB(eventType: string, usedColors: string[]): Promise<DashboardItem | null> {
  try {
    console.log(`👠 [selectMatchingShoesFromDB] מחפש נעליים עבור ${eventType}`);
    
    // קבלת נעליים מטבלת shoes
    const { data: shoesData, error } = await supabase
      .from('shoes')
      .select('*')
      .not('image', 'is', null)
      .limit(50);

    if (error || !shoesData || shoesData.length === 0) {
      console.error('❌ [selectMatchingShoesFromDB] Error fetching shoes:', error);
      return null;
    }

    console.log(`🔍 [selectMatchingShoesFromDB] מצא ${shoesData.length} זוגות נעליים במאגר`);

    // סינון נעליים לפי סוג האירוע
    let filteredShoes = shoesData.filter(shoe => {
      if (!shoe.image) return false;
      
      const shoeName = (shoe.name || '').toLowerCase();
      const shoeDescription = (shoe.description || '').toLowerCase();
      const searchText = `${shoeName} ${shoeDescription}`;
      
      if (eventType === 'evening' || eventType === 'formal') {
        // נעלי ערב/פורמליות
        return searchText.includes('heel') || 
               searchText.includes('עקב') || 
               searchText.includes('elegant') || 
               searchText.includes('אלגנט') ||
               searchText.includes('evening') ||
               searchText.includes('ערב');
      } else {
        // נעליים קז'ואליות
        return !searchText.includes('sport') && !searchText.includes('ספורט');
      }
    });

    if (filteredShoes.length === 0) {
      filteredShoes = shoesData; // fallback לכל הנעליים
    }

    // בחירת נעליים תואמות צבע או ניוטרליות
    const selectedShoes = filteredShoes.find(shoe => {
      const shoeColor = (shoe.name || '').toLowerCase();
      return usedColors.some(usedColor => 
        ColorCoordinationService.areColorsCompatible(shoeColor, usedColor)
      ) || isNeutralColor(shoeColor);
    }) || filteredShoes[0];

    if (selectedShoes) {
      console.log(`✅ [selectMatchingShoesFromDB] נעליים נבחרו מטבלת shoes: ${selectedShoes.name}`);
      
      // המרת תמונת נעליים ל-string באמצעות extractZaraImageUrl עם type casting
      const shoesImageUrl = extractZaraImageUrl(selectedShoes.image as ZaraImageData);
      
      return {
        id: selectedShoes.name || selectedShoes.product_id?.toString() || 'shoes-item',
        name: selectedShoes.name || 'נעליים',
        image: shoesImageUrl,
        type: 'shoes',
        price: selectedShoes.price ? `₪${selectedShoes.price}` : '₪199',
        description: selectedShoes.description || '',
        color: extractColorFromName(selectedShoes.name || '')
      };
    }

    return null;
  } catch (error) {
    console.error('❌ [selectMatchingShoesFromDB] Error:', error);
    return null;
  }
}

/**
 * בחירת חולצה תואמת לעליונית
 */
function selectCompatibleTop(tops: any[], outerwear: any): any | null {
  return tops.find(top => {
    const topName = top.product_name?.toLowerCase() || '';
    // ודא שזו חולצה מלאה ולא טופ קצר
    const isFullTop = !topName.includes('קרופ') && !topName.includes('crop') && !topName.includes('קצר');
    const colorCompatible = ColorCoordinationService.areColorsCompatible(
      top.colour?.toLowerCase() || '', 
      outerwear.colour?.toLowerCase() || ''
    );
    
    return isFullTop && colorCompatible;
  }) || tops[0]; // fallback לחולצה ראשונה
}

/**
 * בחירת חלק תחתון תואם
 */
function selectCompatibleBottom(bottoms: any[], top: any): any | null {
  return bottoms.find(bottom => {
    return ColorCoordinationService.areColorsCompatible(
      bottom.colour?.toLowerCase() || '', 
      top.colour?.toLowerCase() || ''
    );
  }) || bottoms[0]; // fallback לחלק תחתון ראשון
}

// פונקציות עזר לזיהוי סוגי פריטים - מותאמות לעברית ואנגלית
function isDress(searchText: string): boolean {
  const dressKeywords = ['שמלה', 'שמלת', 'dress', 'gown'];
  return dressKeywords.some(keyword => searchText.includes(keyword));
}

function isTunic(searchText: string): boolean {
  const tunicKeywords = ['טוניקה', 'tunic'];
  return tunicKeywords.some(keyword => searchText.includes(keyword));
}

function isOuterwear(searchText: string): boolean {
  const outerwearKeywords = [
    'ז\'קט', 'זקט', 'מעיל', 'קרדיגן', 'בלייזר', 'סוודר', 'הודי',
    'jacket', 'coat', 'cardigan', 'blazer', 'sweater', 'hoodie', 'עליון'
  ];
  return outerwearKeywords.some(keyword => searchText.includes(keyword));
}

function isTop(searchText: string): boolean {
  const topKeywords = [
    'חולצ', 'טי שירט', 'בלוז', 'טופ', 'חזיי', 'גופי',
    'top', 'shirt', 'blouse', 'tee', 'tank', 'camisole'
  ];
  return topKeywords.some(keyword => searchText.includes(keyword));
}

function isBottom(searchText: string): boolean {
  const bottomKeywords = [
    'מכנס', 'מכנסי', 'חצאית', 'ג\'ינס', 'שורט', 'טייץ', 'לגינס',
    'pants', 'trousers', 'skirt', 'jeans', 'shorts', 'leggings'
  ];
  return bottomKeywords.some(keyword => searchText.includes(keyword));
}

function isShoe(searchText: string): boolean {
  const shoeKeywords = [
    'נעל', 'נעלי', 'סנדל', 'מגף', 'כפכפ',
    'shoe', 'sandal', 'boot', 'heel', 'sneaker'
  ];
  return shoeKeywords.some(keyword => searchText.includes(keyword));
}

function isEveningShoe(searchText: string): boolean {
  const eveningShoeKeywords = ['עקב', 'heel', 'ערב', 'evening', 'פלטפורמה', 'platform'];
  return eveningShoeKeywords.some(keyword => searchText.includes(keyword));
}

function isFormalShoe(searchText: string): boolean {
  const formalShoeKeywords = ['פורמלי', 'formal', 'עור', 'leather', 'אלגנט', 'elegant'];
  return formalShoeKeywords.some(keyword => searchText.includes(keyword));
}

function isNeutralColor(color: string): boolean {
  const neutralColors = ['שחור', 'לבן', 'אפור', 'בז\'', 'חום', 'black', 'white', 'gray', 'grey', 'beige', 'brown', 'nude'];
  return neutralColors.some(neutral => color.includes(neutral));
}

function extractColorFromName(name: string): string {
  const colorMap: Record<string, string> = {
    'שחור': 'black', 'לבן': 'white', 'אדום': 'red', 'כחול': 'blue',
    'ירוק': 'green', 'צהוב': 'yellow', 'ורוד': 'pink', 'סגול': 'purple',
    'חום': 'brown', 'אפור': 'gray', 'בז\'': 'beige'
  };
  
  const lowerName = name.toLowerCase();
  for (const [hebrew, english] of Object.entries(colorMap)) {
    if (lowerName.includes(hebrew) || lowerName.includes(english)) {
      return english;
    }
  }
  return 'unknown';
}

/**
 * יצירת תלבושת קזואלית עם לוגיקה מתקדמת - עם תמונות אמיתיות
 */
async function createCasualOutfitWithLogic(eventType: string): Promise<DashboardItem[]> {
  const [casualTops, casualBottoms] = await Promise.all([
    findCasualItems('top', 3),
    findCasualItems('bottom', 3)
  ]);

  // קבלת נעליים מטבלת shoes
  const casualShoes = await getCasualShoesFromDB();

  if (casualTops.length === 0 || casualBottoms.length === 0 || casualShoes.length === 0) {
    console.log('❌ [createCasualOutfitWithLogic] חסרים פריטים קז\'ואליים');
    return [];
  }

  const casualOutfit: DashboardItem[] = [];
  
  // בחירת פריטים עם התאמת צבעים
  const selectedTop = casualTops[0];
  const selectedBottom = casualBottoms.find(bottom => 
    ColorCoordinationService.areColorsCompatible(
      selectedTop.color || '',
      bottom.color || ''
    )
  ) || casualBottoms[0];
  
  const selectedShoes = casualShoes.find(shoes => {
    const topColor = selectedTop.color || '';
    const bottomColor = selectedBottom.color || '';
    const shoeColor = shoes.color || '';
    
    return ColorCoordinationService.areColorsCompatible(shoeColor, topColor) ||
           ColorCoordinationService.areColorsCompatible(shoeColor, bottomColor) ||
           isNeutralColor(shoeColor);
  }) || casualShoes[0];

  casualOutfit.push({
    id: selectedTop.id,
    name: selectedTop.name,
    image: selectedTop.image,
    type: 'top',
    price: selectedTop.price,
    description: selectedTop.description || '',
    color: selectedTop.color
  });

  casualOutfit.push({
    id: selectedBottom.id,
    name: selectedBottom.name,
    image: selectedBottom.image,
    type: 'bottom',
    price: selectedBottom.price,
    description: selectedBottom.description || '',
    color: selectedBottom.color
  });

  casualOutfit.push({
    id: selectedShoes.id,
    name: selectedShoes.name,
    image: selectedShoes.image,
    type: 'shoes',
    price: selectedShoes.price,
    description: selectedShoes.description || '',
    color: selectedShoes.color
  });

  console.log("✅ [createCasualOutfitWithLogic] תלבושת קזואלית נוצרה עם תמונות אמיתיות");
  return casualOutfit;
}

async function getCasualShoesFromDB(): Promise<DashboardItem[]> {
  try {
    const { data: shoesData, error } = await supabase
      .from('shoes')
      .select('*')
      .not('image', 'is', null)
      .limit(20);

    if (error || !shoesData) {
      console.error('❌ [getCasualShoesFromDB] Error:', error);
      return [];
    }

    return shoesData
      .filter(shoe => shoe.image && typeof shoe.image === 'string')
      .map(shoe => {
        // המרת תמונת נעליים ל-string באמצעות extractZaraImageUrl עם type casting
        const shoesImageUrl = extractZaraImageUrl(shoe.image as ZaraImageData);
        
        return {
          id: shoe.name || shoe.product_id?.toString() || 'casual-shoes',
          name: shoe.name || 'נעליים קז\'ואליות',
          image: shoesImageUrl,
          type: 'shoes' as const,
          price: shoe.price ? `₪${shoe.price}` : '₪149',
          description: shoe.description || '',
          color: extractColorFromName(shoe.name || '')
        };
      });
  } catch (error) {
    console.error('❌ [getCasualShoesFromDB] Error:', error);
    return [];
  }
}

function getFallbackOutfit(): DashboardItem[] {
  return [
    {
      id: 'fallback-top',
      name: 'חולצה בסיסית',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop',
      type: 'top',
      price: '₪89',
      description: 'חולצה בסיסית'
    },
    {
      id: 'fallback-bottom',
      name: 'מכנסיים בסיסיים',
      image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=400&fit=crop',
      type: 'bottom',
      price: '₪129',
      description: 'מכנסיים בסיסיים'
    },
    {
      id: 'fallback-shoes',
      name: 'נעליים בסיסיות',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop',
      type: 'shoes',
      price: '₪199',
      description: 'נעליים בסיסיות'
    }
  ];
}

/**
 * מחזיר נתונים לכל ההזדמנויות
 */
export async function fetchDashboardItems(): Promise<{ [key: string]: DashboardItem[] }> {
  try {
    console.log('🔍 [fetchDashboardItems] Starting to fetch items for all occasions...');
    
    // Reset global tracking for fresh selection
    globalUsedItemIds.clear();
    
    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    const data: { [key: string]: DashboardItem[] } = {};
    
    // יצירת תלבושת שונה לכל הזדמנות
    for (const occasion of occasions) {
      console.log(`🔍 [fetchDashboardItems] Processing ${occasion}...`);
      
      const occasionOutfit = await createAdvancedOutfit('casual', occasion.toLowerCase(), []);
      
      if (occasionOutfit && occasionOutfit.length > 0) {
        data[occasion] = occasionOutfit.map(item => ({
          ...item,
          id: `${item.id}-${occasion.toLowerCase()}` // מזהה ייחודי לכל הזדמנות
        }));
        
        console.log(`✅ [fetchDashboardItems] Created ${occasion} outfit with ${data[occasion].length} items:`, 
          data[occasion].map(item => ({ id: item.id, name: item.name, type: item.type })));
      } else {
        // fallback אם לא נמצא תלבושת
        data[occasion] = getFallbackOutfit().map(item => ({
          ...item,
          id: `${item.id}-${occasion.toLowerCase()}`
        }));
        
        console.log(`⚠️ [fetchDashboardItems] Using fallback for ${occasion}`);
      }
    }
    
    console.log('✅ [fetchDashboardItems] All occasions processed successfully');
    return data;
    
  } catch (error) {
    console.error('❌ [fetchDashboardItems] Error:', error);
    
    // החזרת תלבושות עם פריטי fallback במקרה של שגיאה
    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    const fallbackData: { [key: string]: DashboardItem[] } = {};
    
    occasions.forEach(occasion => {
      fallbackData[occasion] = getFallbackOutfit().map(item => ({
        ...item,
        id: `${item.id}-${occasion.toLowerCase()}`
      }));
    });
    
    console.log('⚠️ [fetchDashboardItems] Returning fallback data with placeholder items');
    return fallbackData;
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
  globalUsedItemIds.clear();
  lastResetTime = Date.now();
  console.log('🔄 [clearGlobalItemTrackers] Global trackers cleared');
}

export function clearOutfitCache() {
  globalUsedItemIds.clear();
  console.log('🔄 [clearOutfitCache] Outfit cache cleared');
}
