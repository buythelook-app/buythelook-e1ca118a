import { supabase } from "@/lib/supabaseClient";
import { DashboardItem } from "@/types/lookTypes";
import { extractImageUrl } from "./outfitGenerationService";
import { findCasualItems } from "./casualOutfitService";
import { ColorCoordinationService } from "./colorCoordinationService";
import { extractZaraImageUrl, ZaraImageData } from "@/utils/imageUtils";
import logger from "@/lib/logger";
import { testSupabaseConnection } from "@/lib/supabaseHealthCheck";

// Global tracking to ensure variety across occasions - separate for each occasion
let globalUsedItemIds: { [occasion: string]: Set<string> } = {};
let lastResetTime = Date.now();

// Global tracking for used shoes to ensure variety
let globalUsedShoesIds: Set<string> = new Set();

// Updated type for shoes data matching the zara_cloth database schema
type ZaraShoesData = {
  id: string;
  product_id?: number | null;
  product_name: string;
  image: any; // JSONB field
  url: string | null;
  price: number;
  colour: string;
  description: string | null;
  product_family: string | null;
  product_subfamily: string | null;
  availability: boolean | null;
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

    // Test Supabase connection first
    console.log("🔍 [fetchFirstOutfitSuggestion] Testing Supabase connection...");
    const connectionTest = await testSupabaseConnection();
    
    if (!connectionTest.success) {
      console.error("❌ [fetchFirstOutfitSuggestion] Supabase connection failed:", connectionTest.error);
      logger.error("Supabase connection failed", {
        context: "lookService",
        data: connectionTest
      });
      return getFallbackOutfit();
    }
    
    console.log("✅ [fetchFirstOutfitSuggestion] Supabase connection successful:", {
      shoesCount: connectionTest.shoesCount,
      zaraCount: connectionTest.zaraCount
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
        id: item.id,
        isFromZaraShoes: item.id.includes('zara-shoes-')
      })));
      
      const shoesItems = occasionOutfit.filter(item => item.type === 'shoes');
      console.log("👠 [fetchFirstOutfitSuggestion] Found shoes items:", shoesItems.length);
      shoesItems.forEach((shoe, index) => {
        console.log(`👠 [fetchFirstOutfitSuggestion] Shoe ${index + 1}:`, {
          id: shoe.id,
          name: shoe.name,
          image: shoe.image,
          type: shoe.type,
          isFromZaraShoes: shoe.id.includes('zara-shoes-') ? 'YES - FROM ZARA_CLOTH TABLE' : 'NO - NOT FROM ZARA_CLOTH TABLE'
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
 * Extract image URL from zara_cloth JSONB field with enhanced debugging
 */
function extractZaraShoesImageFromJSONB(imageData: any, shoeName: string = 'Unknown'): string {
  console.log(`🔍 [extractZaraShoesImageFromJSONB] ===== PROCESSING ZARA SHOES: "${shoeName}" =====`);
  console.log(`🔍 [extractZaraShoesImageFromJSONB] Raw imageData:`, imageData);
  console.log(`🔍 [extractZaraShoesImageFromJSONB] Type: ${typeof imageData}, Array: ${Array.isArray(imageData)}`);
  
  if (!imageData) {
    console.log(`❌ [extractZaraShoesImageFromJSONB] No image data for ${shoeName}`);
    return '';
  }
  
  // Use the existing extractZaraImageUrl function
  const imageUrl = extractZaraImageUrl(imageData as ZaraImageData);
  console.log(`✅ [extractZaraShoesImageFromJSONB] Extracted URL for ${shoeName}: ${imageUrl}`);
  
  return imageUrl;
}

/**
 * יצירת תלבושת מתקדמת עם כללי התאמה לפי אירוע - נעליים מטבלת zara_cloth
 */
async function createAdvancedOutfit(styleProfile: string, eventType: string, colorPreferences: string[], occasion: string): Promise<DashboardItem[]> {
  console.log(`🎨 [createAdvancedOutfit] ===== CREATING OUTFIT FOR ${occasion.toUpperCase()} (SHOES FROM ZARA_CLOTH TABLE) =====`);
  
  try {
    // Initialize occasion tracking if not exists
    if (!globalUsedItemIds[occasion]) {
      globalUsedItemIds[occasion] = new Set();
    }
    
    console.log(`🚨 [createAdvancedOutfit] CRITICAL DEBUG - FETCHING CLOTHING FROM ZARA_CLOTH TABLE (NO SHOES IN THIS QUERY)`);
    
    // קבלת פריטי לבוש מהמאגר zara_cloth (ללא נעליים - נטפל בהן בנפרד)
    const { data: allClothingItems, error: clothingError } = await supabase
      .from('zara_cloth')
      .select('*')
      .not('image', 'is', null)
      .neq('availability', false)
      .not('product_family', 'ilike', '%shoe%')
      .not('product_family', 'ilike', '%sandal%')
      .not('product_family', 'ilike', '%boot%')
      .not('product_subfamily', 'ilike', '%shoe%')
      .not('product_subfamily', 'ilike', '%sandal%')
      .not('product_subfamily', 'ilike', '%boot%')
      .order('price', { ascending: true })
      .limit(1000);

    if (clothingError) {
      console.error('❌ [createAdvancedOutfit] Database error for clothing:', clothingError);
      throw new Error(`Failed to fetch clothing: ${clothingError.message}`);
    }

    if (!allClothingItems || allClothingItems.length === 0) {
      console.error('❌ [createAdvancedOutfit] No clothing items found in zara_cloth table');
      throw new Error('No clothing items available');
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
      throw new Error(`No valid clothing items for ${occasion}`);
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
        isShoes: item.type === 'shoes',
        isFromZaraShoes: item.id.includes('zara-shoes-') ? 'YES' : 'NO'
      }))
    );
    
    // Mark selected clothing items as used for this occasion
    outfitItems.forEach(item => {
      if (item.id && !item.id.includes('zara-shoes-')) {
        globalUsedItemIds[occasion].add(item.id.split('-')[0]); // Remove occasion suffix
      }
    });
    
    return outfitItems;
    
  } catch (error) {
    console.error(`❌ [createAdvancedOutfit] Error creating outfit for ${occasion}:`, error);
    throw error; // Re-throw to be handled by caller
  }
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
 * בחירת תלבושת לפי סוג אירוע - עם נעליים מטבלת zara_cloth
 */
async function selectOutfitByOccasion(categories: any, occasion: string): Promise<DashboardItem[]> {
  console.log(`🎯 [selectOutfitByOccasion] ===== SELECTING OUTFIT FOR ${occasion.toUpperCase()} (SHOES FROM ZARA_CLOTH TABLE) =====`);
  
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
        console.log(`👗 [selectOutfitByOccasion] Selected dress for evening: ${dress.product_name}`);
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

  console.log(`👠 [selectOutfitByOccasion] ===== ADDING SHOES FROM ZARA_CLOTH TABLE TO ${occasion.toUpperCase()} OUTFIT =====`);
  console.log(`👠 [selectOutfitByOccasion] Current outfit has ${selectedItems.length} items before shoes`);
  console.log(`👠 [selectOutfitByOccasion] Used colors:`, usedColors);
  
  console.log(`🚨 [selectOutfitByOccasion] CRITICAL DEBUG - CALLING getMatchingShoesFromZara`);
  
  // Add shoes from zara_cloth table - ALWAYS, even when there's a dress
  const shoesItem = await getMatchingShoesFromZara(occasion, usedColors);
  if (shoesItem) {
    selectedItems.push(shoesItem);
    console.log(`✅ [selectOutfitByOccasion] SHOES FROM ZARA_CLOTH TABLE SUCCESSFULLY ADDED: ${shoesItem.name} with ID: ${shoesItem.id}`);
    console.log(`✅ [selectOutfitByOccasion] Shoes image URL: ${shoesItem.image}`);
    console.log(`✅ [selectOutfitByOccasion] Shoes type: ${shoesItem.type}`);
    console.log(`✅ [selectOutfitByOccasion] CONFIRMED FROM ZARA_CLOTH TABLE: ${shoesItem.id.includes('zara-shoes-') ? 'YES' : 'NO'}`);
    
    // Check if we have a dress in the outfit
    const hasDress = selectedItems.some(item => item.type === 'dress');
    if (hasDress) {
      console.log(`👗👠 [selectOutfitByOccasion] DRESS + SHOES COMBINATION CREATED SUCCESSFULLY for ${occasion.toUpperCase()}`);
    }
  } else {
    console.log(`❌ [selectOutfitByOccasion] FAILED TO GET SHOES FROM ZARA_CLOTH TABLE - USING FALLBACK`);
    
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
      console.log(`      👠 FROM ZARA_CLOTH TABLE: ${item.id.includes('zara-shoes-') ? 'YES' : 'NO'}`);
    }
    if (item.type === 'dress') {
      console.log(`      👗 DRESS WITH SHOES: This outfit includes both dress and shoes recommendation`);
    }
  });
  
  return selectedItems;
}

/**
 * Get matching shoes from the zara_cloth table (shoes only)
 */
async function getMatchingShoesFromZara(occasion: string, usedColors: string[]): Promise<DashboardItem | null> {
  try {
    console.log(`🔥 [getMatchingShoesFromZara] ===== GETTING SHOES FROM ZARA_CLOTH TABLE FOR ${occasion.toUpperCase()} =====`);
    console.log(`🔥 [getMatchingShoesFromZara] Used colors:`, usedColors);
    console.log(`🔥 [getMatchingShoesFromZara] Previously used shoes IDs:`, Array.from(globalUsedShoesIds));
    
    console.log(`🚨 [getMatchingShoesFromZara] CRITICAL DEBUG - QUERYING ZARA_CLOTH TABLE FOR SHOES`);
    
    // Get shoes data from zara_cloth table (shoes only)
    const { data: shoesData, error } = await supabase
      .from('zara_cloth')
      .select('*')
      .or('product_family.ilike.%shoe%,product_family.ilike.%sandal%,product_family.ilike.%boot%,product_subfamily.ilike.%shoe%,product_subfamily.ilike.%sandal%,product_subfamily.ilike.%boot%')
      .not('image', 'is', null)
      .neq('availability', false)
      .limit(100);

    if (error) {
      console.error('❌ [getMatchingShoesFromZara] Database error:', error);
      throw new Error(`Failed to fetch shoes from zara_cloth: ${error.message}`);
    }

    if (!shoesData || shoesData.length === 0) {
      console.error('❌ [getMatchingShoesFromZara] No shoes found in ZARA_CLOTH table');
      return null;
    }

    console.log(`✅ [getMatchingShoesFromZara] Found ${shoesData.length} total shoes in ZARA_CLOTH table`);
    
    console.log(`🚨 [getMatchingShoesFromZara] CRITICAL DEBUG - RAW SHOES DATA FROM ZARA_CLOTH TABLE:`, 
      shoesData.slice(0, 3).map(shoe => ({
        product_name: shoe.product_name,
        image: shoe.image,
        url: shoe.url,
        product_id: shoe.product_id,
        product_family: shoe.product_family
      }))
    );
    
    // Filter out previously used shoes and ensure valid images
    const availableShoes = shoesData.filter(shoe => {
      const shoeId = shoe.id || shoe.product_id?.toString() || shoe.product_name;
      const alreadyUsed = globalUsedShoesIds.has(String(shoeId));
      const hasValidImage = hasValidZaraShoesImageFromDB(shoe);
      
      console.log(`🔍 [getMatchingShoesFromZara] Checking "${shoe.product_name}" from ZARA_CLOTH table (ID: ${shoeId}): used=${alreadyUsed}, validImage=${hasValidImage}`);
      
      return !alreadyUsed && hasValidImage;
    });

    console.log(`🔍 [getMatchingShoesFromZara] Available unused shoes from ZARA_CLOTH table: ${availableShoes.length}`);

    if (availableShoes.length === 0) {
      console.log(`⚠️ [getMatchingShoesFromZara] No unused shoes with valid images from ZARA_CLOTH table, resetting and trying again`);
      globalUsedShoesIds.clear();
      
      const validShoes = shoesData.filter(shoe => hasValidZaraShoesImageFromDB(shoe));
      console.log(`🔍 [getMatchingShoesFromZara] Valid shoes from ZARA_CLOTH table after reset: ${validShoes.length}`);
      
      if (validShoes.length === 0) {
        console.error('❌ [getMatchingShoesFromZara] No shoes with valid images found in ZARA_CLOTH table');
        return null;
      }
      
      const randomIndex = Math.floor(Math.random() * validShoes.length);
      const selectedShoe = validShoes[randomIndex];
      const shoeId = selectedShoe.id || selectedShoe.product_id?.toString() || selectedShoe.product_name;
      globalUsedShoesIds.add(String(shoeId));
      
      console.log(`🎯 [getMatchingShoesFromZara] Selected from ZARA_CLOTH table after reset: "${selectedShoe.product_name}" (Index: ${randomIndex})`);
      const createdItem = createZaraShoesItemFromDB(selectedShoe, occasion);
      console.log(`🚨 [getMatchingShoesFromZara] CRITICAL DEBUG - CREATED ZARA SHOES ITEM:`, createdItem);
      return createdItem;
    }

    // Randomly select from available shoes for variety
    const randomIndex = Math.floor(Math.random() * availableShoes.length);
    const selectedShoe = availableShoes[randomIndex];
    
    console.log(`🎯 [getMatchingShoesFromZara] Randomly selected from ZARA_CLOTH table: "${selectedShoe.product_name}" (Index: ${randomIndex} of ${availableShoes.length})`);
    
    // Mark this shoe as used
    const shoeId = selectedShoe.id || selectedShoe.product_id?.toString() || selectedShoe.product_name;
    globalUsedShoesIds.add(String(shoeId));
    
    const createdItem = createZaraShoesItemFromDB(selectedShoe, occasion);
    console.log(`✅ [getMatchingShoesFromZara] Created shoes item from ZARA_CLOTH table:`, createdItem);
    console.log(`🚨 [getMatchingShoesFromZara] CRITICAL DEBUG - FINAL CREATED ITEM:`, createdItem);
    
    return createdItem;
    
  } catch (error) {
    console.error('❌ [getMatchingShoesFromZara] Unexpected error:', error);
    return null;
  }
}

/**
 * Check if a shoe from zara_cloth database has valid image data
 */
function hasValidZaraShoesImageFromDB(shoe: ZaraShoesData): boolean {
  console.log(`🔍 [hasValidZaraShoesImageFromDB] Checking "${shoe.product_name}"...`);
  
  const imageUrl = extractZaraShoesImageFromJSONB(shoe.image, shoe.product_name);
  const hasValidImage = !!(imageUrl && imageUrl.includes('http'));
  
  console.log(`🔍 [hasValidZaraShoesImageFromDB] "${shoe.product_name}" -> Valid: ${hasValidImage}, URL: ${imageUrl?.substring(0, 50)}...`);
  
  return hasValidImage;
}

/**
 * Create a DashboardItem from a zara_cloth shoes record
 */
function createZaraShoesItemFromDB(shoe: ZaraShoesData, occasion: string): DashboardItem {
  console.log(`✅ [createZaraShoesItemFromDB] Creating item for "${shoe.product_name}"`);
  console.log(`   - Original zara shoe data:`, shoe);
  
  // Extract real image URL from the JSONB image field
  const finalImageUrl = extractZaraShoesImageFromJSONB(shoe.image, shoe.product_name);
  console.log(`   - Extracted image URL: ${finalImageUrl}`);
  
  // Use real price from database or format it properly
  const realPrice = shoe.price ? `₪${shoe.price}` : '₪299';
  
  // Use real product URL from database
  const productUrl = shoe.url || '#';
  
  // Use id or generate a unique ID
  const actualId = shoe.id || `zara-shoe-${Date.now()}`;
  
  console.log(`✅ [createZaraShoesItemFromDB] Final zara shoe item details:`);
  console.log(`   - ID: ${actualId}`);
  console.log(`   - Product Family: ${shoe.product_family}`);
  console.log(`   - Real Price: ${realPrice} (DB value: ${shoe.price})`);
  console.log(`   - Real Image URL: ${finalImageUrl}`);
  console.log(`   - Real Product URL: ${productUrl}`);

  const createdItem = {
    id: `zara-shoes-${actualId}-${occasion}`,
    name: shoe.product_name,
    image: finalImageUrl || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    type: 'shoes' as const,
    price: realPrice, // Use real price from database
    description: shoe.description || `נעליים מבית זארה - ${shoe.product_family || 'נעליים איכותיות'}`,
    color: shoe.colour || 'unknown'
  };
  
  console.log(`✅ [createZaraShoesItemFromDB] Created DashboardItem:`, createdItem);
  console.log(`🚨 [createZaraShoesItemFromDB] CRITICAL DEBUG - ITEM ID CONTAINS zara-shoes-: ${createdItem.id.includes('zara-shoes-')}`);
  
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
 * מחזיר נתונים לכל ההזדמנויות - עם פריטים שונים לכל אירוע (נעליים מטבלת zara_cloth)
 */
export async function fetchDashboardItems(): Promise<{ [key: string]: DashboardItem[] }> {
  try {
    console.log('🔥 [fetchDashboardItems] ===== STARTING DASHBOARD ITEMS FETCH (SHOES FROM ZARA_CLOTH TABLE) =====');
    
    // Test connection first
    const connectionTest = await testSupabaseConnection();
    if (!connectionTest.success) {
      console.error('❌ [fetchDashboardItems] Supabase connection failed:', connectionTest.error);
      throw new Error(`Supabase connection failed: ${connectionTest.error}`);
    }
    
    console.log('✅ [fetchDashboardItems] Supabase connection verified');
    
    // Reset global tracking for fresh selection but keep separate tracking per occasion
    globalUsedItemIds = {};
    globalUsedShoesIds.clear();
    
    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    const data: { [key: string]: DashboardItem[] } = {};
    
    // יצירת תלבושת שונה לכל הזדמנות (נעליים מטבלת zara_cloth)
    for (const occasion of occasions) {
      try {
        console.log(`🔍 [fetchDashboardItems] ===== PROCESSING ${occasion.toUpperCase()} (SHOES FROM ZARA_CLOTH TABLE) =====`);
        
        const occasionOutfit = await createAdvancedOutfit('casual', occasion.toLowerCase(), [], occasion);
        
        if (occasionOutfit && occasionOutfit.length > 0) {
          data[occasion] = occasionOutfit.map(item => ({
            ...item,
            id: `${item.id}-${occasion.toLowerCase()}` // מזהה ייחודי לכל הזדמנות
          }));
          
          console.log(`✅ [fetchDashboardItems] Created ${occasion} outfit with ${data[occasion].length} items from ZARA_CLOTH table:`);
          data[occasion].forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.type}: ${item.name} (ID: ${item.id})`);
            if (item.type === 'shoes') {
              console.log(`      👠 SHOES from ZARA_CLOTH table in ${occasion}: ${item.name} with image: ${item.image}`);
            }
          });
        } else {
          throw new Error(`No outfit created for ${occasion}`);
        }
      } catch (occasionError) {
        console.error(`❌ [fetchDashboardItems] Error creating ${occasion} outfit:`, occasionError);
        
        // fallback אם לא נמצא תלבושת
        data[occasion] = getFallbackOutfit().map(item => ({
          ...item,
          id: `${item.id}-${occasion.toLowerCase()}`
        }));
        
        console.log(`⚠️ [fetchDashboardItems] Using fallback for ${occasion}`);
      }
    }
    
    console.log('🔥 [fetchDashboardItems] ===== FINAL DASHBOARD DATA (SHOES FROM ZARA_CLOTH TABLE) =====');
    Object.entries(data).forEach(([occasion, items]) => {
      const shoesCount = items.filter(item => item.type === 'shoes').length;
      console.log(`${occasion}: ${items.length} items (${shoesCount} shoes from ZARA_CLOTH table)`);
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
