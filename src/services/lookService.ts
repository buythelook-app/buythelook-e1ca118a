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

// Global tracking for used shoes to ensure variety
let globalUsedShoesIds: Set<string> = new Set();

// Updated type for shoes data matching the actual Supabase database schema
type ShoesData = {
  product_id?: number | null;
  name: string;
  brand: string | null;
  description: string | null;
  price: number | null;
  image: any; // JSONB field
  url: string | null;
  discount: string | null;
  category: string | null;
  availability: string | null;
  [key: string]: any;
};

/**
 * מחזיר הצעת תלבושת ראשונה על בסיס ניתוח הסטייל
 */
export async function fetchFirstOutfitSuggestion(forceRefresh: boolean = false): Promise<DashboardItem[]> {
  try {
    console.log("🔥 [fetchFirstOutfitSuggestion] ===== STARTING FIRST OUTFIT FETCH =====");
    logger.info("מחזיר הצעת תלבושת ראשונה", {
      context: "lookService",
      data: { forceRefresh }
    });

    // Reset global tracking if needed
    if (forceRefresh || Date.now() - lastResetTime > 300000) { // Reset every 5 minutes
      globalUsedItemIds = {};
      globalUsedShoesIds.clear();
      lastResetTime = Date.now();
    }

    const occasionOutfit = await createAdvancedOutfit('casual', 'general', [], 'general');
    
    console.log("🔥 [fetchFirstOutfitSuggestion] Raw outfit result:", occasionOutfit);
    console.log("🔥 [fetchFirstOutfitSuggestion] Number of items:", occasionOutfit?.length || 0);
    
    if (occasionOutfit) {
      console.log("🔥 [fetchFirstOutfitSuggestion] Item types:", occasionOutfit.map(item => ({
        type: item.type,
        name: item.name,
        hasImage: !!item.image,
        id: item.id
      })));
      
      const shoesItems = occasionOutfit.filter(item => item.type === 'shoes');
      console.log("👠 [fetchFirstOutfitSuggestion] Found shoes items:", shoesItems.length);
      shoesItems.forEach((shoe, index) => {
        console.log(`👠 [fetchFirstOutfitSuggestion] Shoe ${index + 1}:`, {
          id: shoe.id,
          name: shoe.name,
          image: shoe.image,
          type: shoe.type
        });
      });
    }
    
    if (occasionOutfit && occasionOutfit.length >= 2) {
      return occasionOutfit;
    }

    // fallback
    console.log("⚠️ [fetchFirstOutfitSuggestion] Using fallback outfit");
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
 * Extract image URL from shoes JSONB field with enhanced debugging
 */
function extractShoesImageFromJSONB(imageData: any, shoeName: string = 'Unknown'): string {
  console.log(`🔍 [extractShoesImageFromJSONB] ===== PROCESSING SHOES: "${shoeName}" =====`);
  console.log(`🔍 [extractShoesImageFromJSONB] Raw imageData:`, imageData);
  console.log(`🔍 [extractShoesImageFromJSONB] Type: ${typeof imageData}, Array: ${Array.isArray(imageData)}`);
  
  if (!imageData) {
    console.log(`❌ [extractShoesImageFromJSONB] No image data for ${shoeName}`);
    return '';
  }
  
  // Handle direct URL string
  if (typeof imageData === 'string') {
    const trimmed = imageData.trim();
    console.log(`🔍 [extractShoesImageFromJSONB] String data: "${trimmed}"`);
    
    if (trimmed.includes('http') && (trimmed.includes('.jpg') || trimmed.includes('.jpeg') || trimmed.includes('.png') || trimmed.includes('.webp'))) {
      console.log(`✅ [extractShoesImageFromJSONB] Direct URL string for ${shoeName}: ${trimmed}`);
      return trimmed;
    }
    
    return '';
  }
  
  // Handle array of URLs
  if (Array.isArray(imageData)) {
    console.log(`🔍 [extractShoesImageFromJSONB] Array data for ${shoeName} (length: ${imageData.length}):`, imageData);
    for (let i = 0; i < imageData.length; i++) {
      const item = imageData[i];
      console.log(`   🔍 Array item ${i}:`, item, typeof item);
      
      if (typeof item === 'string' && item.includes('http') && 
          (item.includes('.jpg') || item.includes('.jpeg') || item.includes('.png') || item.includes('.webp'))) {
        console.log(`✅ [extractShoesImageFromJSONB] Found URL in array for ${shoeName}: ${item}`);
        return item;
      }
    }
    console.log(`❌ [extractShoesImageFromJSONB] No valid URLs in array for ${shoeName}`);
    return '';
  }
  
  // Handle object with nested properties
  if (typeof imageData === 'object' && imageData !== null) {
    const keys = Object.keys(imageData);
    console.log(`🔍 [extractShoesImageFromJSONB] Object data for ${shoeName} with keys:`, keys);
    
    // Check for url property
    if (imageData.url && typeof imageData.url === 'string' && 
        imageData.url.includes('http') && 
        (imageData.url.includes('.jpg') || imageData.url.includes('.jpeg') || 
         imageData.url.includes('.png') || imageData.url.includes('.webp'))) {
      console.log(`✅ [extractShoesImageFromJSONB] Found URL in url property for ${shoeName}: ${imageData.url}`);
      return imageData.url;
    }
    
    // Check for image property
    if (imageData.image && typeof imageData.image === 'string' && 
        imageData.image.includes('http') && 
        (imageData.image.includes('.jpg') || imageData.image.includes('.jpeg') || 
         imageData.image.includes('.png') || imageData.image.includes('.webp'))) {
      console.log(`✅ [extractShoesImageFromJSONB] Found URL in image property for ${shoeName}: ${imageData.image}`);
      return imageData.image;
    }
    
    // Check for nested arrays
    for (const [key, value] of Object.entries(imageData)) {
      if (Array.isArray(value)) {
        console.log(`🔄 [extractShoesImageFromJSONB] Checking nested array ${key} for ${shoeName}:`, value);
        const url = extractShoesImageFromJSONB(value, shoeName);
        if (url) return url;
      }
    }
  }
  
  console.log(`❌ [extractShoesImageFromJSONB] No valid URL found for ${shoeName}`);
  return '';
}

/**
 * יצירת תלבושת מתקדמת עם כללי התאמה לפי אירוע - נעליים רק מטבלת shoes
 */
async function createAdvancedOutfit(styleProfile: string, eventType: string, colorPreferences: string[], occasion: string): Promise<DashboardItem[]> {
  console.log(`🎨 [createAdvancedOutfit] ===== CREATING OUTFIT FOR ${occasion.toUpperCase()} (SHOES FROM SHOES TABLE ONLY) =====`);
  
  // Initialize occasion tracking if not exists
  if (!globalUsedItemIds[occasion]) {
    globalUsedItemIds[occasion] = new Set();
  }
  
  // קבלת פריטי לבוש מהמאגר zara_cloth (ללא נעליים!)
  const { data: allClothingItems, error: clothingError } = await supabase
    .from('zara_cloth')
    .select('*')
    .not('image', 'is', null)
    .neq('availability', false)
    .order('price', { ascending: true })
    .limit(1000);

  if (clothingError || !allClothingItems || allClothingItems.length === 0) {
    console.error('❌ [createAdvancedOutfit] Database error for clothing:', clothingError);
    return [];
  }

  console.log(`🔍 [createAdvancedOutfit] Found ${allClothingItems.length} clothing items (NO SHOES) from zara_cloth`);

  // סינון פריטי לבוש בלבד (ללא נעליים)
  let filteredClothingItems = allClothingItems.filter(item => {
    const hasValid = hasValidImageData(item.image);
    const notUsed = !globalUsedItemIds[occasion].has(item.id);
    const isClothing = isActualClothingItem(item);
    
    return hasValid && notUsed && isClothing && item.availability !== false;
  });
  
  console.log(`🔍 [createAdvancedOutfit] ${filteredClothingItems.length} valid clothing items after filtering for ${occasion}`);
  
  if (filteredClothingItems.length === 0) {
    console.error(`❌ [createAdvancedOutfit] No valid clothing items found for ${occasion}`);
    return [];
  }
  
  // ערבוב הפריטים לקבלת מגוון
  filteredClothingItems = shuffleArray(filteredClothingItems);
  
  // חלוקת פריטים לקטגוריות (ללא נעליים)
  const categorizedItems = categorizeItemsAdvanced(filteredClothingItems, eventType);
  
  console.log(`📋 [createAdvancedOutfit] קטגוריות לבוש:`, Object.keys(categorizedItems).map(key => ({
    category: key,
    count: categorizedItems[key].length
  })));

  // יצירת תלבושת לפי כללים מותאמים לאירוע (ללא נעליים)
  const outfitItems = await selectOutfitByOccasion(categorizedItems, occasion);
  
  console.log(`🔥 [createAdvancedOutfit] FINAL OUTFIT ITEMS (${outfitItems.length}):`, 
    outfitItems.map(item => ({
      type: item.type,
      name: item.name,
      id: item.id,
      hasImage: !!item.image,
      isShoes: item.type === 'shoes'
    }))
  );
  
  // Mark selected clothing items as used for this occasion
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
 * בחירת תלבושת לפי סוג אירוע - עם נעליים רק מטבלת shoes
 */
async function selectOutfitByOccasion(categories: any, occasion: string): Promise<DashboardItem[]> {
  console.log(`🎯 [selectOutfitByOccasion] ===== SELECTING OUTFIT FOR ${occasion.toUpperCase()} (SHOES FROM SHOES TABLE) =====`);
  
  const selectedItems: DashboardItem[] = [];
  let usedColors: string[] = [];

  // לוגיקה שונה לכל סוג אירוע (ללא נעליים כאן)
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

  console.log(`👠 [selectOutfitByOccasion] ===== ADDING SHOES FROM SHOES TABLE ONLY TO ${occasion.toUpperCase()} OUTFIT =====`);
  console.log(`👠 [selectOutfitByOccasion] Current outfit has ${selectedItems.length} items before shoes`);
  console.log(`👠 [selectOutfitByOccasion] Used colors:`, usedColors);
  
  // Add shoes ONLY from shoes table
  const shoesItem = await getMatchingShoesForOccasion(occasion, usedColors);
  if (shoesItem) {
    selectedItems.push(shoesItem);
    console.log(`✅ [selectOutfitByOccasion] SHOES FROM SHOES TABLE SUCCESSFULLY ADDED: ${shoesItem.name} with ID: ${shoesItem.id}`);
    console.log(`✅ [selectOutfitByOccasion] Shoes image URL: ${shoesItem.image}`);
    console.log(`✅ [selectOutfitByOccasion] Shoes type: ${shoesItem.type}`);
  } else {
    console.log(`❌ [selectOutfitByOccasion] FAILED TO GET SHOES FROM SHOES TABLE - USING FALLBACK`);
    
    // Add fallback shoes only if database fails
    const fallbackShoes = getRandomFallbackShoes();
    selectedItems.push(fallbackShoes);
    console.log(`🆘 [selectOutfitByOccasion] FALLBACK SHOES ADDED: ${fallbackShoes.name}`);
  }

  console.log(`🔥 [selectOutfitByOccasion] ===== FINAL OUTFIT FOR ${occasion.toUpperCase()} =====`);
  console.log(`🔥 [selectOutfitByOccasion] Total items: ${selectedItems.length}`);
  selectedItems.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item.type.toUpperCase()}: ${item.name} (ID: ${item.id})`);
    if (item.type === 'shoes') {
      console.log(`      👠 SHOES IMAGE: ${item.image?.substring(0, 100)}...`);
      console.log(`      👠 SHOES VALID: ${item.image?.includes('http')}`);
    }
  });
  
  return selectedItems;
}

/**
 * Get matching shoes ONLY from the dedicated shoes table
 */
async function getMatchingShoesForOccasion(occasion: string, usedColors: string[]): Promise<DashboardItem | null> {
  try {
    console.log(`🔥 [getMatchingShoesForOccasion] ===== GETTING SHOES FROM SHOES TABLE ONLY FOR ${occasion.toUpperCase()} =====`);
    console.log(`🔥 [getMatchingShoesForOccasion] Used colors:`, usedColors);
    console.log(`🔥 [getMatchingShoesForOccasion] Previously used shoes IDs:`, Array.from(globalUsedShoesIds));
    
    // Get shoes ONLY from shoes table
    console.log(`🔍 [getMatchingShoesForOccasion] Fetching from SHOES table only...`);
    const { count, error: countError } = await supabase
      .from('shoes')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('❌ [getMatchingShoesForOccasion] Count query error:', countError);
      return null;
    }
    
    console.log(`📊 [getMatchingShoesForOccasion] Total shoes in SHOES table: ${count}`);
    
    // Get shoes data ONLY from shoes table
    const { data: shoesData, error } = await supabase
      .from('shoes')
      .select('product_id, name, brand, description, price, image, url, discount, category, availability')
      .limit(100);

    if (error) {
      console.error('❌ [getMatchingShoesForOccasion] Database error:', error);
      return null;
    }

    if (!shoesData || shoesData.length === 0) {
      console.error('❌ [getMatchingShoesForOccasion] No shoes found in SHOES table');
      return null;
    }

    console.log(`✅ [getMatchingShoesForOccasion] Found ${shoesData.length} total shoes in SHOES table ONLY`);
    
    // Filter out previously used shoes and ensure valid images
    const availableShoes = shoesData.filter(shoe => {
      const shoeId = shoe.product_id?.toString() || shoe.name || JSON.stringify(shoe);
      const alreadyUsed = globalUsedShoesIds.has(String(shoeId));
      const hasValidImage = hasValidShoesImageFromDB(shoe);
      
      console.log(`🔍 [getMatchingShoesForOccasion] Checking "${shoe.name}" from SHOES table (ID: ${shoeId}): used=${alreadyUsed}, validImage=${hasValidImage}`);
      
      return !alreadyUsed && hasValidImage;
    });

    console.log(`🔍 [getMatchingShoesForOccasion] Available unused shoes from SHOES table: ${availableShoes.length}`);

    if (availableShoes.length === 0) {
      console.log(`⚠️ [getMatchingShoesForOccasion] No unused shoes with valid images from SHOES table, resetting and trying again`);
      globalUsedShoesIds.clear();
      
      const validShoes = shoesData.filter(shoe => hasValidShoesImageFromDB(shoe));
      console.log(`🔍 [getMatchingShoesForOccasion] Valid shoes from SHOES table after reset: ${validShoes.length}`);
      
      if (validShoes.length === 0) {
        console.error('❌ [getMatchingShoesForOccasion] No shoes with valid images found in SHOES table');
        return null;
      }
      
      const randomIndex = Math.floor(Math.random() * validShoes.length);
      const selectedShoe = validShoes[randomIndex];
      const shoeId = selectedShoe.product_id?.toString() || selectedShoe.name || JSON.stringify(selectedShoe);
      globalUsedShoesIds.add(String(shoeId));
      
      console.log(`🎯 [getMatchingShoesForOccasion] Selected from SHOES table after reset: "${selectedShoe.name}" (Index: ${randomIndex})`);
      return createShoesItemFromDB(selectedShoe, occasion);
    }

    // Randomly select from available shoes for variety
    const randomIndex = Math.floor(Math.random() * availableShoes.length);
    const selectedShoe = availableShoes[randomIndex];
    
    console.log(`🎯 [getMatchingShoesForOccasion] Randomly selected from SHOES table: "${selectedShoe.name}" (Index: ${randomIndex} of ${availableShoes.length})`);
    
    // Mark this shoe as used
    const shoeId = selectedShoe.product_id?.toString() || selectedShoe.name || JSON.stringify(selectedShoe);
    globalUsedShoesIds.add(String(shoeId));
    
    const createdItem = createShoesItemFromDB(selectedShoe, occasion);
    console.log(`✅ [getMatchingShoesForOccasion] Created shoes item from SHOES table:`, createdItem);
    
    return createdItem;
    
  } catch (error) {
    console.error('❌ [getMatchingShoesForOccasion] Unexpected error:', error);
    return null;
  }
}

/**
 * Check if a shoe from the database has valid image data with enhanced debugging
 */
function hasValidShoesImageFromDB(shoe: ShoesData): boolean {
  console.log(`🔍 [hasValidShoesImageFromDB] Checking "${shoe.name}"...`);
  
  const imageUrl = extractShoesImageFromJSONB(shoe.image, shoe.name);
  const hasValidImage = !!(imageUrl && imageUrl.includes('http'));
  
  console.log(`🔍 [hasValidShoesImageFromDB] "${shoe.name}" -> Valid: ${hasValidImage}, URL: ${imageUrl?.substring(0, 50)}...`);
  
  return hasValidImage;
}

/**
 * Create a DashboardItem from a shoes database record with enhanced debugging
 */
function createShoesItemFromDB(shoe: ShoesData, occasion: string): DashboardItem {
  console.log(`✅ [createShoesItemFromDB] Creating item for "${shoe.name}"`);
  console.log(`   - Original shoe data:`, shoe);
  
  // Extract real image URL from the JSONB image field
  const finalImageUrl = extractShoesImageFromJSONB(shoe.image, shoe.name);
  console.log(`   - Extracted image URL: ${finalImageUrl}`);
  
  // Use real price from database or format it properly
  const realPrice = shoe.price ? `₪${shoe.price}` : '₪299';
  
  // Use real product URL from database
  const productUrl = shoe.url || '#';
  
  // Use product_id or generate a unique ID
  const actualId = shoe.product_id?.toString() || `shoe-${Date.now()}`;
  
  console.log(`✅ [createShoesItemFromDB] Final shoe item details:`);
  console.log(`   - ID: ${actualId}`);
  console.log(`   - Brand: ${shoe.brand}`);
  console.log(`   - Real Price: ${realPrice} (DB value: ${shoe.price})`);
  console.log(`   - Real Image URL: ${finalImageUrl}`);
  console.log(`   - Real Product URL: ${productUrl}`);

  const createdItem = {
    id: `shoes-db-${actualId}-${occasion}`,
    name: shoe.name,
    image: finalImageUrl || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    type: 'shoes' as const,
    price: realPrice, // Use real price from database
    description: shoe.description || `נעליים מבית ${shoe.brand || 'מותג איכותי'}`,
    color: 'black' // Default color, could be extracted from shoe data if available
  };
  
  console.log(`✅ [createShoesItemFromDB] Created DashboardItem:`, createdItem);
  
  return createdItem;
}

/**
 * Get a random fallback shoe to ensure variety even in fallback scenarios
 */
function getRandomFallbackShoes(): DashboardItem {
  const fallbackShoes = [
    {
      name: 'נעלי ספורט שחורות',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
      description: 'נעלי ספורט נוחות'
    },
    {
      name: 'נעלי עור חומות',
      image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&h=400&fit=crop',
      description: 'נעלי עור אלגנטיות'
    },
    {
      name: 'נעלי בד לבנות',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
      description: 'נעלי בד קלילות'
    },
    {
      name: 'נעלי עקב שחורות',
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop',
      description: 'נעלי עקב אלגנטיות'
    },
    {
      name: 'נעלי מוקסין חומות',
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
      description: 'נעלי מוקסין נוחות'
    }
  ];
  
  const randomShoe = fallbackShoes[Math.floor(Math.random() * fallbackShoes.length)];
  
  return {
    id: `shoes-fallback-${Date.now()}-${Math.random()}`,
    name: randomShoe.name,
    image: randomShoe.image,
    type: 'shoes',
    price: '₪299',
    description: randomShoe.description,
    color: 'black'
  };
}

/**
 * בדיקה אם יש תמונה תקינה בפריט - מותאם לטבלת zara_cloth (לא לנעליים)
 */
function hasValidImageData(imageData: any): boolean {
  if (!imageData) {
    return false;
  }
  
  // Handle different image data formats from zara_cloth table
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
    // Handle zara_cloth image format
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
 * מחזיר נתונים לכל ההזדמנויות - עם פריטים שונים לכל אירוע (נעליים רק מטבלת shoes)
 */
export async function fetchDashboardItems(): Promise<{ [key: string]: DashboardItem[] }> {
  try {
    console.log('🔥 [fetchDashboardItems] ===== STARTING DASHBOARD ITEMS FETCH (SHOES FROM SHOES TABLE ONLY) =====');
    
    // Reset global tracking for fresh selection but keep separate tracking per occasion
    globalUsedItemIds = {};
    globalUsedShoesIds.clear();
    
    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    const data: { [key: string]: DashboardItem[] } = {};
    
    // יצירת תלבושת שונה לכל הזדמנות (נעליים רק מטבלת shoes)
    for (const occasion of occasions) {
      console.log(`🔍 [fetchDashboardItems] ===== PROCESSING ${occasion.toUpperCase()} (SHOES FROM SHOES TABLE) =====`);
      
      const occasionOutfit = await createAdvancedOutfit('casual', occasion.toLowerCase(), [], occasion);
      
      if (occasionOutfit && occasionOutfit.length > 0) {
        data[occasion] = occasionOutfit.map(item => ({
          ...item,
          id: `${item.id}-${occasion.toLowerCase()}` // מזהה ייחודי לכל הזדמנות
        }));
        
        console.log(`✅ [fetchDashboardItems] Created ${occasion} outfit with ${data[occasion].length} items from SHOES table:`);
        data[occasion].forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.type}: ${item.name} (ID: ${item.id})`);
          if (item.type === 'shoes') {
            console.log(`      👠 SHOES from SHOES table in ${occasion}: ${item.name} with image: ${item.image}`);
          }
        });
      } else {
        // fallback אם לא נמצא תלבושת
        data[occasion] = getFallbackOutfit().map(item => ({
          ...item,
          id: `${item.id}-${occasion.toLowerCase()}`
        }));
        
        console.log(`⚠️ [fetchDashboardItems] Using fallback for ${occasion}`);
      }
    }
    
    console.log('🔥 [fetchDashboardItems] ===== FINAL DASHBOARD DATA (SHOES FROM SHOES TABLE) =====');
    Object.entries(data).forEach(([occasion, items]) => {
      const shoesCount = items.filter(item => item.type === 'shoes').length;
      console.log(`${occasion}: ${items.length} items (${shoesCount} shoes from SHOES table)`);
    });
    
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
  globalUsedShoesIds.clear();
  lastResetTime = Date.now();
  console.log('🔄 [clearGlobalItemTrackers] Global trackers cleared');
}

export function clearOutfitCache() {
  globalUsedItemIds = {};
  globalUsedShoesIds.clear();
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
  console.log('🆘 [getFallbackOutfit] Creating fallback outfit with variety shoes');
  const fallbackShoes = getRandomFallbackShoes();
  
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
    fallbackShoes
  ];
}
