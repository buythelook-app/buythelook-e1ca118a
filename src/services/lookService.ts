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
 * Extract image URL from shoes data - ENHANCED VERSION
 */
function extractShoesImageUrl(imageData: any, shoeName: string = 'Unknown'): string {
  console.log(`🔍 [extractShoesImageUrl] Processing shoes "${shoeName}":`, {
    imageData: imageData,
    type: typeof imageData,
    isArray: Array.isArray(imageData)
  });
  
  if (!imageData) {
    console.log(`❌ [extractShoesImageUrl] No image data for ${shoeName}`);
    return '';
  }
  
  // Handle direct URL string
  if (typeof imageData === 'string') {
    const trimmed = imageData.trim();
    if (trimmed.includes('http') && (trimmed.includes('.jpg') || trimmed.includes('.jpeg') || trimmed.includes('.png') || trimmed.includes('.webp'))) {
      console.log(`✅ [extractShoesImageUrl] Direct URL string for ${shoeName}: ${trimmed}`);
      return trimmed;
    }
    
    // Try parsing as JSON
    try {
      const parsed = JSON.parse(imageData);
      console.log(`🔄 [extractShoesImageUrl] Parsed JSON for ${shoeName}:`, parsed);
      return extractShoesImageUrl(parsed, shoeName);
    } catch (e) {
      console.log(`❌ [extractShoesImageUrl] Failed to parse JSON for ${shoeName}`);
      return '';
    }
  }
  
  // Handle array of URLs
  if (Array.isArray(imageData) && imageData.length > 0) {
    console.log(`🔍 [extractShoesImageUrl] Array data for ${shoeName}:`, imageData);
    for (const item of imageData) {
      if (typeof item === 'string' && item.includes('http') && 
          (item.includes('.jpg') || item.includes('.jpeg') || item.includes('.png') || item.includes('.webp'))) {
        console.log(`✅ [extractShoesImageUrl] Found URL in array for ${shoeName}: ${item}`);
        return item;
      }
    }
    console.log(`❌ [extractShoesImageUrl] No valid URLs in array for ${shoeName}`);
    return '';
  }
  
  // Handle object with nested properties
  if (typeof imageData === 'object' && imageData !== null) {
    console.log(`🔍 [extractShoesImageUrl] Object data for ${shoeName}:`, Object.keys(imageData));
    
    // Check common URL fields
    const urlFields = ['url', 'image', 'src', 'href', 'link'];
    for (const field of urlFields) {
      if (imageData[field] && typeof imageData[field] === 'string' && 
          imageData[field].includes('http') && 
          (imageData[field].includes('.jpg') || imageData[field].includes('.jpeg') || 
           imageData[field].includes('.png') || imageData[field].includes('.webp'))) {
        console.log(`✅ [extractShoesImageUrl] Found URL in ${field} for ${shoeName}: ${imageData[field]}`);
        return imageData[field];
      }
    }
    
    // Check for nested arrays
    for (const [key, value] of Object.entries(imageData)) {
      if (Array.isArray(value)) {
        console.log(`🔄 [extractShoesImageUrl] Checking nested array ${key} for ${shoeName}`);
        const url = extractShoesImageUrl(value, shoeName);
        if (url) return url;
      }
    }
  }
  
  console.log(`❌ [extractShoesImageUrl] No valid URL found for ${shoeName}`);
  return '';
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
  
  // 🔥 CRITICAL: ALWAYS add shoes to every outfit
  const shoesItem = await getRandomShoesFromDB();
  if (shoesItem) {
    selectedItems.push(shoesItem);
    console.log(`✅ [selectOutfitByOccasion] נעליים נוספו: ${shoesItem.name} עם ID: ${shoesItem.id}`);
  } else {
    console.log(`❌ [selectOutfitByOccasion] לא נמצאו נעליים מהמאגר - ללא נעליים`);
  }

  console.log(`✅ [selectOutfitByOccasion] תלבושת סופית עם ${selectedItems.length} פריטים עבור ${occasion}:`);
  selectedItems.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item.type}: ${item.name} (ID: ${item.id})`);
    if (item.type === 'shoes') {
      console.log(`      👠 Shoes image: ${item.image?.substring(0, 100)}...`);
    }
  });
  
  return selectedItems;
}

/**
 * Get random shoes from shoes table - ENHANCED WITH DEBUGGING
 */
async function getRandomShoesFromDB(): Promise<DashboardItem | null> {
  try {
    console.log(`🔥 [getRandomShoesFromDB] ===== קבלת נעליים אקראיות מטבלת shoes =====`);
    
    // Get shoes with comprehensive selection
    const { data: shoesData, error } = await supabase
      .from('shoes')
      .select('*')
      .limit(50); // Increase limit to have more options

    if (error) {
      console.error('❌ [getRandomShoesFromDB] Database error:', error);
      return null;
    }

    if (!shoesData || shoesData.length === 0) {
      console.error('❌ [getRandomShoesFromDB] No shoes found in database');
      return null;
    }

    console.log(`✅ [getRandomShoesFromDB] נמצאו ${shoesData.length} נעליים במאגר`);
    
    // Debug each shoe's image data
    shoesData.forEach((shoe, index) => {
      const imageUrl = extractShoesImageUrl(shoe.image, shoe.name);
      const urlField = shoe.url;
      console.log(`🔍 [getRandomShoesFromDB] Shoe ${index + 1}: "${shoe.name}"`, {
        hasImage: !!shoe.image,
        hasUrl: !!shoe.url,
        extractedImageUrl: imageUrl || 'NONE',
        urlField: urlField || 'NONE',
        imageData: shoe.image ? JSON.stringify(shoe.image).substring(0, 100) + '...' : 'NULL'
      });
    });
    
    // Find shoes with valid images (prioritize image field, fallback to url)
    const validShoes = shoesData.filter(shoe => {
      const imageUrl = extractShoesImageUrl(shoe.image, shoe.name);
      const urlField = shoe.url;
      
      // Accept if either image extraction works OR url field has valid URL
      const hasValidImage = !!(imageUrl && imageUrl.includes('http'));
      const hasValidUrl = !!(urlField && typeof urlField === 'string' && urlField.includes('http'));
      
      const isValid = hasValidImage || hasValidUrl;
      
      if (isValid) {
        console.log(`✅ [getRandomShoesFromDB] Valid shoe: "${shoe.name}" - Image: ${hasValidImage ? 'YES' : 'NO'}, URL: ${hasValidUrl ? 'YES' : 'NO'}`);
      } else {
        console.log(`❌ [getRandomShoesFromDB] Invalid shoe: "${shoe.name}" - no valid image or URL`);
      }
      
      return isValid;
    });
    
    console.log(`🔍 [getRandomShoesFromDB] ${validShoes.length} נעליים תקינות מתוך ${shoesData.length}`);
    
    if (validShoes.length === 0) {
      console.log(`❌ [getRandomShoesFromDB] אין נעליים עם תמונות תקינות - יוצר נעליים דמה`);
      // Return a fallback shoe item
      return {
        id: `shoes-fallback-${Date.now()}`,
        name: 'נעליים קלאסיות',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
        type: 'shoes' as const,
        price: '₪299',
        description: 'נעליים קלאסיות מהמאגר',
        color: 'black'
      };
    }

    // Take random valid shoe
    const randomShoe = validShoes[Math.floor(Math.random() * validShoes.length)];
    
    // Extract proper image URL - prioritize extracted image, fallback to url field
    let finalImageUrl = extractShoesImageUrl(randomShoe.image, randomShoe.name);
    if (!finalImageUrl && randomShoe.url && typeof randomShoe.url === 'string' && randomShoe.url.includes('http')) {
      finalImageUrl = randomShoe.url;
      console.log(`🔄 [getRandomShoesFromDB] Using URL field as fallback for ${randomShoe.name}: ${finalImageUrl}`);
    }
    
    if (!finalImageUrl) {
      console.log(`❌ [getRandomShoesFromDB] No valid image URL found for ${randomShoe.name} - using fallback`);
      finalImageUrl = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop';
    }

    const shoesResult: DashboardItem = {
      id: `shoes-db-${randomShoe.name?.replace(/\s+/g, '-').toLowerCase() || 'shoe'}-${Date.now()}`,
      name: randomShoe.name || 'נעליים',
      image: finalImageUrl,
      type: 'shoes' as const,
      price: randomShoe.price ? `₪${randomShoe.price}` : '₪299',
      description: randomShoe.description || 'נעליים מהמאגר',
      color: 'black'
    };
    
    console.log(`🔥 [getRandomShoesFromDB] החזרת נעליים תקינות:`, {
      id: shoesResult.id,
      name: shoesResult.name,
      image: shoesResult.image,
      imageValid: shoesResult.image.includes('http'),
      type: shoesResult.type
    });
    
    return shoesResult;
  } catch (error) {
    console.error('❌ [getRandomShoesFromDB] Error:', error);
    // Return emergency fallback
    return {
      id: `shoes-emergency-${Date.now()}`,
      name: 'נעליים',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
      type: 'shoes' as const,
      price: '₪299',
      description: 'נעליים',
      color: 'black'
    };
  }
}

/**
 * בדיקה אם יש תמונה תקינה בפריט - משופר לנעליים
 */
function hasValidImageData(imageData: any): boolean {
  if (!imageData) {
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
  
  return hasValidUrls;
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
          data[occasion].map(item => ({ 
            id: item.id, 
            name: item.name, 
            type: item.type,
            hasImage: !!item.image,
            isShoes: item.type === 'shoes'
          })));
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
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
      type: 'shoes',
      price: '₪299',
      description: 'נעליים בסיסיות'
    }
  ];
}
