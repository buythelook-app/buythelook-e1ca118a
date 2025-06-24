import { supabase } from "@/lib/supabaseClient";
import { DashboardItem } from "@/types/lookTypes";
import { extractImageUrl } from "./outfitGenerationService";
import { findCasualItems } from "./casualOutfitService";
import { ColorCoordinationService } from "./colorCoordinationService";
import { extractZaraImageUrl, ZaraImageData } from "@/utils/imageUtils";
import logger from "@/lib/logger";

// Global tracking to ensure variety across occasions - separate for each occasion
let globalUsedItemIds: { [occasion: string]: Set<string> } = {};
let lastResetTime = Date.now();

// Type for shoes data matching the actual database schema
type ShoesData = {
  name: string;
  brand: string | null;
  description: string | null;
  price: number | null;
  colour: string | null;
  image: any;
  discount: string | null;
  category: string | null;
  availability: string | null;
  url: string | null;
  [key: string]: any;
};

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
      globalUsedItemIds = {};
      lastResetTime = Date.now();
    }

    const occasionOutfit = await createAdvancedOutfit('casual', 'general', [], 'general');
    
    if (occasionOutfit && occasionOutfit.length >= 2) {
      return occasionOutfit;
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
 * DEBUG: בדיקת נתוני טבלת הנעליים - משופר
 */
async function debugShoesTable(): Promise<void> {
  try {
    console.log("🔍 [DEBUG SHOES] בודק נתוני טבלת הנעליים...");
    
    const { data: shoesData, error } = await supabase
      .from('shoes')
      .select('*')
      .limit(20);

    if (error) {
      console.error("❌ [DEBUG SHOES] שגיאה בקריאת טבלת הנעליים:", error);
      return;
    }

    console.log(`✅ [DEBUG SHOES] נמצאו ${shoesData?.length || 0} זוגות נעליים בטבלה`);
    
    if (shoesData && shoesData.length > 0) {
      console.log("🔍 [DEBUG SHOES] דוגמאות נתונים:");
      
      shoesData.slice(0, 5).forEach((shoe, index) => {
        const shoeWithId = shoe as ShoesData;
        console.log(`👟 [DEBUG SHOES] נעליים ${index + 1}:`, {
          name: shoeWithId.name,
          brand: shoeWithId.brand,
          price: shoeWithId.price,
          imageType: typeof shoeWithId.image,
          imageData: shoeWithId.image,
          url: shoeWithId.url,
          availability: shoeWithId.availability,
          hasValidImage: hasValidImageData(shoeWithId.image)
        });
        
        // בדיקת מבנה התמונה
        if (shoeWithId.image) {
          console.log(`🖼️ [DEBUG SHOES] מבנה תמונה לנעליים ${index + 1}:`, shoeWithId.image);
        }
      });
      
      // ספירת נעליים עם תמונות תקינות
      const validShoes = shoesData.filter(shoe => hasValidImageData(shoe.image));
      console.log(`✅ [DEBUG SHOES] ${validShoes.length} נעליים עם תמונות תקינות מתוך ${shoesData.length}`);
    }
    
  } catch (error) {
    console.error("❌ [DEBUG SHOES] שגיאה בבדיקת טבלת הנעליים:", error);
  }
}

/**
 * בדיקה אם יש תמונה תקינה בפריט - משופר לנעליים
 */
function hasValidImageData(imageData: any): boolean {
  if (!imageData) {
    console.log("❌ [hasValidImageData] אין נתוני תמונה");
    return false;
  }
  
  // Handle different image data formats from shoes table
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
  } else if (typeof imageData === 'object' && imageData !== null) {
    // Handle shoes table format - check for common image fields
    if (imageData.url && typeof imageData.url === 'string') {
      imageUrls = [imageData.url];
    } else if (imageData.image && typeof imageData.image === 'string') {
      imageUrls = [imageData.image];
    } else if (Array.isArray(imageData.urls)) {
      imageUrls = imageData.urls.filter(url => typeof url === 'string' && url.trim() !== '');
    }
  }
  
  // Check if we have any valid image URLs
  const hasValidUrls = imageUrls.length > 0 && imageUrls.some(url => {
    return url.includes('http') && (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.webp'));
  });
  
  console.log(`🔍 [hasValidImageData] נמצאו ${imageUrls.length} URLs, תקינות: ${hasValidUrls}`);
  if (hasValidUrls) {
    console.log(`✅ [hasValidImageData] URLs תקינים:`, imageUrls);
  }
  
  return hasValidUrls;
}

/**
 * יצירת תלבושת מתקדמת עם כללי התאמה לפי אירוע
 */
async function createAdvancedOutfit(styleProfile: string, eventType: string, colorPreferences: string[], occasion: string): Promise<DashboardItem[]> {
  console.log(`🎨 [createAdvancedOutfit] יצירת תלבושת עבור ${styleProfile} לאירוע ${eventType}, הזדמנות: ${occasion}`);
  
  // Initialize occasion tracking if not exists
  if (!globalUsedItemIds[occasion]) {
    globalUsedItemIds[occasion] = new Set();
  }
  
  // קבלת פריטים מהמאגר
  const { data: allItems, error } = await supabase
    .from('zara_cloth')
    .select('*')
    .not('image', 'is', null)
    .neq('availability', false)
    .order('price', { ascending: true })
    .limit(1000);

  if (error || !allItems || allItems.length === 0) {
    console.error('❌ [createAdvancedOutfit] Database error:', error);
    return [];
  }

  console.log(`🔍 [createAdvancedOutfit] Found ${allItems.length} items with non-null images in database`);

  // סינון פריטים בסיסי
  let filteredItems = allItems.filter(item => {
    const hasValid = hasValidImageData(item.image);
    const notUsed = !globalUsedItemIds[occasion].has(item.id);
    const isClothing = isActualClothingItem(item);
    
    return hasValid && notUsed && isClothing && item.availability !== false;
  });
  
  console.log(`🔍 [createAdvancedOutfit] ${filteredItems.length} valid clothing items after filtering for ${occasion}`);
  
  if (filteredItems.length === 0) {
    console.error(`❌ [createAdvancedOutfit] No valid clothing items found for ${occasion}`);
    return [];
  }
  
  // ערבוב הפריטים לקבלת מגוון
  filteredItems = shuffleArray(filteredItems);
  
  // חלוקת פריטים לקטגוריות
  const categorizedItems = categorizeItemsAdvanced(filteredItems, eventType);
  
  console.log(`📋 [createAdvancedOutfit] קטגוריות:`, Object.keys(categorizedItems).map(key => ({
    category: key,
    count: categorizedItems[key].length
  })));

  // יצירת תלבושת לפי כללים מותאמים לאירוע
  const outfitItems = await selectOutfitByOccasion(categorizedItems, occasion);
  
  // Mark selected items as used for this occasion
  outfitItems.forEach(item => {
    if (item.id && !item.id.includes('shoes-db-')) {
      globalUsedItemIds[occasion].add(item.id.split('-')[0]); // Remove occasion suffix
    }
  });
  
  return outfitItems;
}

/**
 * ערבוב מערך
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * בחירת תלבושת לפי סוג אירוע - עם דגש על נעליים חובה
 */
async function selectOutfitByOccasion(categories: any, occasion: string): Promise<DashboardItem[]> {
  console.log(`🎯 [selectOutfitByOccasion] בחירת תלבושת עבור ${occasion}`);
  
  const selectedItems: DashboardItem[] = [];
  let usedColors: string[] = [];

  // לוגיקה שונה לכל סוג אירוע
  switch (occasion.toLowerCase()) {
    case 'work':
      // עבודה - תלבושת פורמלית (חולצה + מכנס/חצאית)
      if (categories.tops.length > 0 && categories.bottoms.length > 0) {
        const formalTop = categories.tops.find(item => isFormalItem(item)) || categories.tops[0];
        const formalBottom = categories.bottoms.find(item => isFormalItem(item)) || categories.bottoms[0];
        
        if (formalTop && formalBottom) {
          selectedItems.push(createDashboardItem(formalTop, 'top'));
          selectedItems.push(createDashboardItem(formalBottom, 'bottom'));
          usedColors.push(formalTop.colour?.toLowerCase() || '');
          usedColors.push(formalBottom.colour?.toLowerCase() || '');
        }
      }
      break;
      
    case 'evening':
      // ערב - שמלה או תלבושת אלגנטית
      if (categories.dresses.length > 0) {
        const dress = categories.dresses[0];
        selectedItems.push(createDashboardItem(dress, 'dress'));
        usedColors.push(dress.colour?.toLowerCase() || '');
      } else if (categories.tops.length > 0 && categories.bottoms.length > 0) {
        const elegantTop = categories.tops[0];
        const elegantBottom = categories.bottoms[0];
        selectedItems.push(createDashboardItem(elegantTop, 'top'));
        selectedItems.push(createDashboardItem(elegantBottom, 'bottom'));
        usedColors.push(elegantTop.colour?.toLowerCase() || '');
        usedColors.push(elegantBottom.colour?.toLowerCase() || '');
      }
      break;
      
    case 'casual':
      // מזדמן - חולצה + מכנס/חצאית
      if (categories.tops.length > 0 && categories.bottoms.length > 0) {
        const casualTop = categories.tops[0];
        const casualBottom = categories.bottoms[0];
        selectedItems.push(createDashboardItem(casualTop, 'top'));
        selectedItems.push(createDashboardItem(casualBottom, 'bottom'));
        usedColors.push(casualTop.colour?.toLowerCase() || '');
        usedColors.push(casualBottom.colour?.toLowerCase() || '');
      }
      break;
      
    case 'weekend':
      // סוף שבוע - נוח ורגוע
      if (categories.tops.length > 0 && categories.bottoms.length > 0) {
        const comfortableTop = categories.tops[0];
        const comfortableBottom = categories.bottoms[0];
        selectedItems.push(createDashboardItem(comfortableTop, 'top'));
        selectedItems.push(createDashboardItem(comfortableBottom, 'bottom'));
        usedColors.push(comfortableTop.colour?.toLowerCase() || '');
        usedColors.push(comfortableBottom.colour?.toLowerCase() || '');
      }
      break;
  }

  console.log(`👠 [selectOutfitByOccasion] מחפש נעליים מתאימות עבור ${occasion}...`);
  console.log(`🎨 [selectOutfitByOccasion] צבעים בשימוש:`, usedColors);
  
  // DEBUG: הוספת לוג לפני חיפוש נעליים
  await debugShoesTable();
  
  // הוספת נעליים - חובה! 
  const matchingShoes = await selectMatchingShoesFromDB(occasion, usedColors);
  if (matchingShoes) {
    selectedItems.push(matchingShoes);
    console.log(`✅ [selectOutfitByOccasion] נעליים נוספו בהצלחה: ${matchingShoes.name} עם ID: ${matchingShoes.id}`);
  } else {
    console.log(`❌ [selectOutfitByOccasion] לא נמצאו נעליים - מוסיף נעליים כלליות`);
    // אם לא נמצאו נעליים, נוסיף נעליים כלליות
    const fallbackShoes = await getFallbackShoes();
    if (fallbackShoes) {
      selectedItems.push(fallbackShoes);
      console.log(`✅ [selectOutfitByOccasion] נעליים חלופיות נוספו: ${fallbackShoes.name} עם ID: ${fallbackShoes.id}`);
    }
  }

  console.log(`✅ [selectOutfitByOccasion] תלבושת סופית עם ${selectedItems.length} פריטים עבור ${occasion}:`);
  selectedItems.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item.type}: ${item.name} (ID: ${item.id})`);
  });
  
  return selectedItems;
}

/**
 * יצירת פריט לוח מחוונים
 */
function createDashboardItem(item: any, type: string): DashboardItem {
  const imageUrl = extractZaraImageUrl(item.image as ZaraImageData);
  
  return {
    id: item.id,
    name: item.product_name,
    image: imageUrl,
    type: type as any,
    price: `₪${item.price}`,
    description: item.description || '',
    color: item.colour
  };
}

/**
 * בדיקה אם פריט פורמלי
 */
function isFormalItem(item: any): boolean {
  const name = (item.product_name || '').toLowerCase();
  const subfamily = (item.product_subfamily || '').toLowerCase();
  const family = (item.product_family || '').toLowerCase();
  const searchText = `${name} ${subfamily} ${family}`;
  
  const formalKeywords = ['בלייזר', 'חליפה', 'חצאית', 'blazer', 'suit', 'formal', 'dress shirt'];
  return formalKeywords.some(keyword => searchText.includes(keyword));
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
  
  // פריטי איפור ויופי לסינון - פשוט יותר
  const cosmeticKeywords = [
    'lipstick', 'makeup', 'perfume', 'fragrance', 'nail polish', 'cream', 'serum',
    'איפור', 'שפתון', 'בושם', 'לק', 'קרם', 'סרום'
  ];
  
  // בדיקה שהפריט אינו איפור
  const isCosmeticOrAccessory = cosmeticKeywords.some(keyword => 
    searchText.includes(keyword)
  );
  
  if (isCosmeticOrAccessory) {
    return false;
  }
  
  // בדיקה חיובית - הפריט הוא בגד
  const clothingKeywords = [
    'חולצ', 'טי שירט', 'בלוז', 'טופ', 'מכנס', 'ג\'ינס', 'חצאית', 'שמלה', 'מעיל', 'ז\'קט',
    'shirt', 'top', 'blouse', 'pants', 'jeans', 'skirt', 'dress', 'jacket', 'coat'
  ];
  
  return clothingKeywords.some(keyword => searchText.includes(keyword));
}

/**
 * חלוקת פריטים לקטגוריות מתקדמות - פשוט יותר ויעיל יותר
 */
function categorizeItemsAdvanced(items: any[], eventType: string) {
  const categories = {
    dresses: [] as any[],
    tops: [] as any[],
    bottoms: [] as any[],
    outerwear: [] as any[]
  };

  items.forEach(item => {
    const name = (item.product_name || '').toLowerCase();
    const subfamily = (item.product_subfamily || '').toLowerCase();
    const family = (item.product_family || '').toLowerCase();
    
    const searchText = `${name} ${subfamily} ${family}`;
    
    if (searchText.includes('שמלה') || searchText.includes('dress')) {
      categories.dresses.push(item);
    } else if (searchText.includes('מכנס') || searchText.includes('ג\'ינס') || searchText.includes('חצאית') || 
               searchText.includes('pants') || searchText.includes('jeans') || searchText.includes('skirt')) {
      categories.bottoms.push(item);
    } else if (searchText.includes('מעיל') || searchText.includes('ז\'קט') || 
               searchText.includes('jacket') || searchText.includes('coat')) {
      categories.outerwear.push(item);
    } else if (searchText.includes('חולצ') || searchText.includes('טופ') || searchText.includes('בלוז') ||
               searchText.includes('shirt') || searchText.includes('top') || searchText.includes('blouse')) {
      categories.tops.push(item);
    }
  });

  console.log(`📊 [categorizeItemsAdvanced] Categorized: ${categories.dresses.length} dresses, ${categories.tops.length} tops, ${categories.bottoms.length} bottoms, ${categories.outerwear.length} outerwear`);
  return categories;
}

/**
 * בחירת נעליים מתאימות מטבלת הנעליים לפי אירוע - משופר עם תיקון תמונות
 */
async function selectMatchingShoesFromDB(occasion: string, usedColors: string[]): Promise<DashboardItem | null> {
  try {
    console.log(`🔥 [selectMatchingShoesFromDB] ===== מתחיל חיפוש נעליים עבור ${occasion} =====`);
    console.log(`🎨 [selectMatchingShoesFromDB] צבעים לשיקול:`, usedColors);
    
    // Initialize occasion tracking for shoes if not exists
    const shoesOccasion = `${occasion}-shoes`;
    if (!globalUsedItemIds[shoesOccasion]) {
      globalUsedItemIds[shoesOccasion] = new Set();
    }
    
    // קבלת נעליים מטבלת shoes
    console.log(`🔍 [selectMatchingShoesFromDB] שולח שאילתה לטבלת shoes...`);
    const { data: shoesData, error } = await supabase
      .from('shoes')
      .select('*')
      .not('image', 'is', null)
      .limit(200);

    if (error) {
      console.error('❌ [selectMatchingShoesFromDB] שגיאה בקריאת נתוני הנעליים:', error);
      return null;
    }

    console.log(`🔍 [selectMatchingShoesFromDB] מצא ${shoesData?.length || 0} זוגות נעליים במאגר`);
    
    if (!shoesData || shoesData.length === 0) {
      console.error('❌ [selectMatchingShoesFromDB] לא נמצאו נעליים בטבלה');
      return null;
    }

    // DEBUG: הדפסת פרטי הנעליים הראשונות
    console.log(`🔍 [selectMatchingShoesFromDB] דוגמאות נעליים מהמאגר:`, shoesData.slice(0, 3).map(shoe => ({
      name: shoe.name,
      imageType: typeof shoe.image,
      hasValidImage: hasValidImageData(shoe.image)
    })));

    // Filter shoes with valid images and extract proper URLs
    let availableShoes = shoesData.filter(shoe => {
      const shoeId = shoe.name || `shoes-${Math.random()}`;
      const hasImage = hasValidImageData(shoe.image);
      const notUsed = !globalUsedItemIds[shoesOccasion].has(shoeId);
      
      console.log(`👟 [selectMatchingShoesFromDB] בודק נעליים: ${shoe.name}, יש תמונה: ${hasImage}, לא בשימוש: ${notUsed}`);
      
      return hasImage && notUsed;
    });

    console.log(`🔍 [selectMatchingShoesFromDB] ${availableShoes.length} נעליים זמינות עם תמונות תקינות`);

    if (availableShoes.length === 0) {
      console.log(`⚠️ [selectMatchingShoesFromDB] אין נעליים זמינות, מנסה את כל הנעליים`);
      availableShoes = shoesData.filter(shoe => hasValidImageData(shoe.image));
      console.log(`🔍 [selectMatchingShoesFromDB] לאחר הסרת סינון שימוש: ${availableShoes.length} נעליים`);
    }

    if (availableShoes.length === 0) {
      console.log(`❌ [selectMatchingShoesFromDB] אין נעליים עם תמונות תקינות`);
      return null;
    }

    // ערבוב לקבלת מגוון
    availableShoes = shuffleArray(availableShoes);

    // בחירת נעליים מתאימות לאירוע
    const selectedShoes = availableShoes.find(shoe => {
      const shoeName = (shoe.name || '').toLowerCase();
      const shoeDescription = (shoe.description || '').toLowerCase();
      const shoeCategory = (shoe.category || '').toLowerCase();
      const searchText = `${shoeName} ${shoeDescription} ${shoeCategory}`;
      
      switch (occasion.toLowerCase()) {
        case 'work':
          return !searchText.includes('ספורט') && !searchText.includes('sport') && !searchText.includes('sneaker');
        case 'evening':
          return searchText.includes('heel') || searchText.includes('עקב') || searchText.includes('elegant') || searchText.includes('dress');
        case 'casual':
          return searchText.includes('casual') || searchText.includes('sneaker') || searchText.includes('flat');
        case 'weekend':
          return searchText.includes('comfortable') || searchText.includes('casual') || searchText.includes('sneaker');
        default:
          return true;
      }
    }) || availableShoes[0];

    if (selectedShoes) {
      const shoeId = selectedShoes.name || `shoes-${Date.now()}`;
      
      // Mark this shoe as used for this occasion
      globalUsedItemIds[shoesOccasion].add(shoeId);
      
      console.log(`✅ [selectMatchingShoesFromDB] נעליים נבחרו עבור ${occasion}: ${selectedShoes.name}`);
      
      // Extract image URL from shoes table - תיקון קריטי!
      let shoesImageUrl = extractBestShoesImageUrl(selectedShoes.image);
      
      // וידוא שיש תמונה תקינה
      if (!shoesImageUrl || shoesImageUrl === '/placeholder.svg') {
        console.log(`⚠️ [selectMatchingShoesFromDB] תמונה לא תקינה, מנסה דרכים אחרות...`);
        shoesImageUrl = selectedShoes.url || 
                       (typeof selectedShoes.image === 'string' ? selectedShoes.image : null) ||
                       '/placeholder.svg';
      }
      
      console.log(`🎯 [selectMatchingShoesFromDB] תמונה סופית לנעליים: ${shoesImageUrl}`);
      
      // יצירת אובייקט נעליים לחזרה
      const shoesResult = {
        id: `shoes-db-${shoeId.replace(/\s+/g, '-')}`, // Use name-based ID that LookCanvas will recognize
        name: selectedShoes.name || 'נעליים',
        image: shoesImageUrl,
        type: 'shoes' as const,
        price: selectedShoes.price ? `₪${selectedShoes.price}` : '₪199',
        description: selectedShoes.description || '',
        color: extractColorFromName(selectedShoes.name || '')
      };
      
      console.log(`🔥 [selectMatchingShoesFromDB] החזרת אובייקט נעליים:`, shoesResult);
      return shoesResult;
    }

    console.log(`❌ [selectMatchingShoesFromDB] לא נמצאו נעליים מתאימות`);
    return null;
  } catch (error) {
    console.error('❌ [selectMatchingShoesFromDB] Error:', error);
    return null;
  }
}

/**
 * חילוץ תמונה מתאימה מנתוני נעליים - משופר עם בדיקות נוספות
 */
function extractBestShoesImageUrl(imageData: any): string {
  console.log(`🔍 [extractBestShoesImageUrl] מעבד נתוני תמונה:`, imageData);
  
  if (!imageData) {
    console.log('❌ [extractBestShoesImageUrl] אין נתוני תמונה');
    return '/placeholder.svg';
  }
  
  let potentialUrls: string[] = [];
  
  // Handle different formats from shoes table
  if (typeof imageData === 'string') {
    if (imageData.includes('http')) {
      potentialUrls.push(imageData);
    } else {
      try {
        const parsed = JSON.parse(imageData);
        if (Array.isArray(parsed)) {
          potentialUrls = parsed.filter(url => typeof url === 'string' && url.includes('http'));
        } else if (typeof parsed === 'string' && parsed.includes('http')) {
          potentialUrls.push(parsed);
        }
      } catch {
        // Not JSON, skip
      }
    }
  } else if (Array.isArray(imageData)) {
    potentialUrls = imageData.filter(url => typeof url === 'string' && url.includes('http'));
  } else if (typeof imageData === 'object' && imageData !== null) {
    // Handle shoes table object format
    if (imageData.url && typeof imageData.url === 'string' && imageData.url.includes('http')) {
      potentialUrls.push(imageData.url);
    }
    if (imageData.image && typeof imageData.image === 'string' && imageData.image.includes('http')) {
      potentialUrls.push(imageData.image);
    }
    if (Array.isArray(imageData.urls)) {
      potentialUrls = potentialUrls.concat(imageData.urls.filter(url => typeof url === 'string' && url.includes('http')));
    }
    
    // Search for any URL in the object
    for (const key in imageData) {
      if (typeof imageData[key] === 'string' && imageData[key].includes('http') && 
          (imageData[key].includes('.jpg') || imageData[key].includes('.jpeg') || 
           imageData[key].includes('.png') || imageData[key].includes('.webp'))) {
        potentialUrls.push(imageData[key]);
      }
    }
  }
  
  // Return first valid URL or placeholder
  const validUrl = potentialUrls.find(url => 
    url.includes('http') && 
    (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.webp'))
  );
  
  if (validUrl) {
    console.log(`✅ [extractBestShoesImageUrl] תמונה תקינה נמצאה: ${validUrl}`);
    return validUrl;
  }
  
  console.log(`❌ [extractBestShoesImageUrl] לא נמצא URL תקין, משתמש ב-placeholder`);
  return '/placeholder.svg';
}

/**
 * נעליים חלופיות אם לא נמצאו נעליים במאגר
 */
async function getFallbackShoes(): Promise<DashboardItem | null> {
  try {
    console.log(`🔥 [getFallbackShoes] ===== מחפש נעליים חלופיות =====`);
    
    const { data: shoesData } = await supabase
      .from('shoes')
      .select('*')
      .limit(1);
      
    if (shoesData && shoesData.length > 0) {
      const shoe = shoesData[0];
      const fallbackResult = {
        id: `shoes-db-fallback-${shoe.name.replace(/\s+/g, '-')}`, // Use name-based ID for consistency
        name: shoe.name || 'נעליים',
        image: extractBestShoesImageUrl(shoe.image),
        type: 'shoes' as const,
        price: shoe.price ? `₪${shoe.price}` : '₪199',
        description: shoe.description || ''
      };
      
      console.log(`🔥 [getFallbackShoes] החזרת נעליים חלופיות:`, fallbackResult);
      return fallbackResult;
    }
  } catch (error) {
    console.error('Error getting fallback shoes:', error);
  }
  
  const basicFallback = {
    id: 'shoes-db-basic-fallback',
    name: 'נעליים בסיסיות',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop',
    type: 'shoes' as const,
    price: '₪199',
    description: 'נעליים בסיסיות'
  };
  
  console.log(`🔥 [getFallbackShoes] החזרת נעליים בסיסיות:`, basicFallback);
  return basicFallback;
}

/**
 * מחזיר נתונים לכל ההזדמנויות - עם פריטים שונים לכל אירוע
 */
export async function fetchDashboardItems(): Promise<{ [key: string]: DashboardItem[] }> {
  try {
    console.log('🔍 [fetchDashboardItems] Starting to fetch items for all occasions...');
    
    // Reset global tracking for fresh selection but keep separate tracking per occasion
    globalUsedItemIds = {};
    
    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    const data: { [key: string]: DashboardItem[] } = {};
    
    // יצירת תלבושת שונה לכל הזדמנות
    for (const occasion of occasions) {
      console.log(`🔍 [fetchDashboardItems] Processing ${occasion}...`);
      
      const occasionOutfit = await createAdvancedOutfit('casual', occasion.toLowerCase(), [], occasion);
      
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

// Export placeholder functions for compatibility
export function clearGlobalItemTrackers() {
  globalUsedItemIds = {};
  lastResetTime = Date.now();
  console.log('🔄 [clearGlobalItemTrackers] Global trackers cleared');
}

export function clearOutfitCache() {
  globalUsedItemIds = {};
  console.log('🔄 [clearOutfitCache] Outfit cache cleared');
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
