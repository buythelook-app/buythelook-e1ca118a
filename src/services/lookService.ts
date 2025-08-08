import { supabase } from "@/lib/supabaseClient";
import { DashboardItem } from "@/types/lookTypes";
import { extractZaraImageUrl, extractShoesImageUrl, ZaraImageData } from "@/utils/imageUtils";
import { findStyleItems } from "./styleOutfitService";
import { ColorCoordinationService } from "./colorCoordinationService";
import logger from "@/lib/logger";
import { testSupabaseConnection } from "@/lib/supabaseHealthCheck";

// Enhanced variety tracking with session-based reset
let globalUsedItemIds: { [occasion: string]: Set<string> } = {};
let sessionUsedItemIds: { [occasion: string]: Set<string> } = {};
let lastResetTime = Date.now();
let sessionItemCount = 0;

// Enhanced shoes tracking with multiple rotation pools
let globalUsedShoesIds: Set<string> = new Set();
let sessionShoesRotation = 0;

// Updated type for shoes data matching the zara_cloth database schema
type ZaraShoesData = {
  id: string;
  product_id?: number | null;
  product_name: string;
  image: any; // JSONB field
  url?: string | null; // 👈 Optional field
  price: number;
  colour: string;
  description?: string | null; // 👈 Optional field
  product_family: string | null;
  product_subfamily: string | null;
  availability: boolean | null;
  [key: string]: any;
};

/**
 * Enhanced shuffle algorithm that considers style matching and variety
 */
function enhancedShuffleWithStyleMatching(items: any[], styleProfile: string, occasion: string): any[] {
  console.log(`🎲 [enhancedShuffleWithStyleMatching] Applying enhanced shuffle for ${styleProfile} style, ${occasion} occasion`);
  
  // First, score items based on style matching
  const scoredItems = items.map(item => {
    let score = Math.random(); // Base randomness
    
    // Style matching bonus
    if (styleProfile && item.product_subfamily) {
      const styleKeywords = getStyleKeywords(styleProfile);
      const itemDescription = (item.product_name + ' ' + item.product_subfamily).toLowerCase();
      
      styleKeywords.forEach(keyword => {
        if (itemDescription.includes(keyword)) {
          score += 0.3; // Boost style-matching items
        }
      });
    }
    
    // Occasion matching bonus
    const occasionKeywords = getOccasionKeywords(occasion);
    const itemDescription = (item.product_name + ' ' + (item.product_subfamily || '')).toLowerCase();
    
    occasionKeywords.forEach(keyword => {
      if (itemDescription.includes(keyword)) {
        score += 0.2; // Boost occasion-appropriate items
      }
    });
    
    // Price diversity bonus - avoid always picking cheapest
    const priceRank = items.findIndex(i => i.id === item.id) / items.length;
    if (priceRank > 0.3 && priceRank < 0.8) {
      score += 0.15; // Boost mid-range items
    }
    
    return { ...item, matchScore: score };
  });
  
  // Sort by score with some randomness to maintain variety
  scoredItems.sort((a, b) => {
    const scoreDiff = b.matchScore - a.matchScore;
    const randomFactor = (Math.random() - 0.5) * 0.3; // 30% randomness
    return scoreDiff + randomFactor;
  });
  
  console.log(`🎯 [enhancedShuffleWithStyleMatching] Top 3 scored items:`, scoredItems.slice(0, 3).map(item => ({
    name: item.product_name,
    score: item.matchScore.toFixed(2),
    family: item.product_subfamily
  })));
  
  return scoredItems;
}

/**
 * Get style-specific keywords for matching
 */
function getStyleKeywords(styleProfile: string): string[] {
  const styleMap: { [key: string]: string[] } = {
    'classic': ['blazer', 'shirt', 'trousers', 'formal', 'elegant', 'timeless'],
    'romantic': ['floral', 'lace', 'dress', 'feminine', 'soft', 'delicate'],
    'minimalist': ['simple', 'clean', 'basic', 'minimal', 'essential'],
    'casual': ['comfortable', 'relaxed', 'everyday', 'casual', 'easy'],
    'boohoo': ['trendy', 'fashion', 'statement', 'bold', 'contemporary'],
    'sporty': ['active', 'sporty', 'athletic', 'comfortable', 'functional']
  };
  
  return styleMap[styleProfile.toLowerCase()] || [];
}

/**
 * Get occasion-specific keywords for matching
 */
function getOccasionKeywords(occasion: string): string[] {
  const occasionMap: { [key: string]: string[] } = {
    'work': ['formal', 'professional', 'business', 'office', 'smart'],
    'evening': ['elegant', 'party', 'formal', 'dressy', 'special'],
    'casual': ['casual', 'everyday', 'comfortable', 'relaxed'],
    'weekend': ['relaxed', 'comfortable', 'leisure', 'casual', 'easy']
  };
  
  return occasionMap[occasion.toLowerCase()] || [];
}

/**
 * מחזיר הצעת תלבושת ראשונה על בסיס ניתוח הסגנון
 */
export async function fetchFirstOutfitSuggestion(forceRefresh: boolean = false): Promise<DashboardItem[]> {
  try {
    console.log("🔥 [fetchFirstOutfitSuggestion] ===== STARTING FIRST OUTFIT FETCH =====");
    logger.info("מחזיר הצעת תלבושת ראשונה", {
      context: "lookService",
      data: { forceRefresh }
    });

    // Load user's style preference from localStorage (both original and filter)
    let baseStyle = 'casual'; // Default fallback
    let currentStyle = 'casual'; // Current filter style
    let finalStyle = 'casual'; // Final style to use
    
    try {
      // Get original style from quiz
      const originalQuizStyle = localStorage.getItem('originalQuizStyle');
      if (originalQuizStyle) {
        const originalParsed = JSON.parse(originalQuizStyle);
        baseStyle = originalParsed.styleProfile || 'casual';
        console.log("🎨 [fetchFirstOutfitSuggestion] Base style from quiz:", baseStyle);
      }
      
      // Get current style from filters
      const styleAnalysis = localStorage.getItem('styleAnalysis');
      if (styleAnalysis) {
        const parsed = JSON.parse(styleAnalysis);
        currentStyle = parsed.analysis?.styleProfile || baseStyle;
        console.log("🎨 [fetchFirstOutfitSuggestion] Current filter style:", currentStyle);
      }
      
      // Use current style for recommendations (combines quiz + filters)
      finalStyle = currentStyle;
      console.log("🎨 [fetchFirstOutfitSuggestion] Final style for recommendations:", finalStyle);
      
    } catch (error) {
      console.log("⚠️ [fetchFirstOutfitSuggestion] Could not load style from localStorage:", error);
      finalStyle = 'casual'; // Fallback
    }

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
      zaraCount: connectionTest.zaraCount,
      baseStyle: baseStyle,
      currentStyle: currentStyle,
      finalStyle: finalStyle
    });

    // Enhanced reset logic - reset when forced or when we've seen many items
    if (forceRefresh || sessionItemCount > 50 || Date.now() - lastResetTime > 1800000) { // Reset every 30 minutes or after 50 items
      console.log('🔄 [fetchFirstOutfitSuggestion] Resetting variety tracking for enhanced diversity');
      globalUsedItemIds = {};
      sessionUsedItemIds = {};
      globalUsedShoesIds.clear();
      lastResetTime = Date.now();
      sessionItemCount = 0;
      sessionShoesRotation = 0;
    }

    const occasionOutfit = await createAdvancedOutfit(finalStyle, 'general', [], 'general');
    
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

      // 🚨 CRITICAL DEBUG: Check if shoes are missing and why
      if (shoesItems.length === 0) {
        console.error("❌ [fetchFirstOutfitSuggestion] CRITICAL ERROR - NO SHOES IN OUTFIT!");
        console.error("❌ This is a bug - every outfit must have shoes!");
        
        // Try to get shoes manually
        console.log("🆘 [fetchFirstOutfitSuggestion] Attempting manual shoes addition...");
        const manualShoes = await getMatchingShoesFromZara('general', []);
        if (manualShoes) {
          occasionOutfit.push(manualShoes);
          console.log("✅ [fetchFirstOutfitSuggestion] Manually added shoes:", manualShoes.name);
        } else {
          console.error("❌ [fetchFirstOutfitSuggestion] Failed to get shoes manually - using fallback");
          const fallbackShoes = getRandomFallbackShoes();
          occasionOutfit.push(fallbackShoes);
          console.log("🆘 [fetchFirstOutfitSuggestion] Added fallback shoes:", fallbackShoes.name);
        }
      }
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
    // Initialize tracking for both global and session
    if (!globalUsedItemIds[occasion]) {
      globalUsedItemIds[occasion] = new Set();
    }
    if (!sessionUsedItemIds[occasion]) {
      sessionUsedItemIds[occasion] = new Set();
    }
    
    console.log(`🚨 [createAdvancedOutfit] CRITICAL DEBUG - FETCHING CLOTHING FROM ZARA_CLOTH TABLE (NO SHOES IN THIS QUERY)`);
    
    // Enhanced query with variety-focused ordering and price diversity
    const priceRandomizer = Math.random();
    const orderByPrice = priceRandomizer < 0.4 ? 'asc' : (priceRandomizer < 0.8 ? 'desc' : 'random');
    
    console.log(`💰 [createAdvancedOutfit] Using ${orderByPrice} price ordering for variety`);
    
    let query = supabase
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
      .limit(1500);

    // Add varied ordering for diversity
    if (orderByPrice === 'random') {
      // For random variety, offset by session count
      const offset = (sessionItemCount * 50) % 1000;
      query = query.range(offset, offset + 1499);
    } else {
      query = query.order('price', { ascending: orderByPrice === 'asc' });
    }

    const { data: allClothingItems, error: clothingError } = await query;

    if (clothingError) {
      console.error('❌ [createAdvancedOutfit] Database error for clothing:', clothingError);
      throw new Error(`Failed to fetch clothing: ${clothingError.message}`);
    }

    if (!allClothingItems || allClothingItems.length === 0) {
      console.error('❌ [createAdvancedOutfit] No clothing items found in zara_cloth table');
      throw new Error('No clothing items available');
    }

    console.log(`🔍 [createAdvancedOutfit] Found ${allClothingItems.length} clothing items (NO SHOES) from zara_cloth`);

    // Enhanced filtering with session tracking and style matching
    let filteredClothingItems = allClothingItems.filter(item => {
      const hasValid = hasValidImageData(item.image);
      const notGloballyUsed = !globalUsedItemIds[occasion].has(item.id);
      const notSessionUsed = !sessionUsedItemIds[occasion].has(item.id);
      const isClothing = isActualClothingItem(item);
      
      return hasValid && notGloballyUsed && notSessionUsed && isClothing && item.availability !== false;
    });

    // If we don't have enough items, allow session reuse but not global reuse
    if (filteredClothingItems.length < 10) {
      console.log(`⚠️ [createAdvancedOutfit] Low item count (${filteredClothingItems.length}), allowing session reuse`);
      filteredClothingItems = allClothingItems.filter(item => {
        const hasValid = hasValidImageData(item.image);
        const notGloballyUsed = !globalUsedItemIds[occasion].has(item.id);
        const isClothing = isActualClothingItem(item);
        
        return hasValid && notGloballyUsed && isClothing && item.availability !== false;
      });
    }
    
    console.log(`🔍 [createAdvancedOutfit] ${filteredClothingItems.length} valid clothing items after filtering for ${occasion}`);
    
    if (filteredClothingItems.length === 0) {
      console.error(`❌ [createAdvancedOutfit] No valid clothing items found for ${occasion}`);
      throw new Error(`No valid clothing items for ${occasion}`);
    }
    
    // Enhanced shuffling with style-based weighting
    filteredClothingItems = enhancedShuffleWithStyleMatching(filteredClothingItems, styleProfile, occasion);
    
    // Advanced categorization with style preferences
    const categorizedItems = categorizeItemsAdvanced(filteredClothingItems, eventType, styleProfile);
    
    console.log(`📋 [createAdvancedOutfit] קטגוריות לבוש:`, Object.keys(categorizedItems).map(key => ({
      category: key,
      count: categorizedItems[key].length
    })));

    // יצירת תלבושת לפי כללים מותאמים לאירוע (ללא נעליים)
    const outfitItems = await selectOutfitByOccasion(categorizedItems, occasion);
    
    console.log(`🔥 [createAdvancedOutfit] OUTFIT ITEMS AFTER selectOutfitByOccasion (${outfitItems.length}):`, 
      outfitItems.map(item => ({
        type: item.type,
        name: item.name,
        id: item.id,
        hasImage: !!item.image,
        isShoes: item.type === 'shoes',
        isFromZaraShoes: item.id.includes('zara-shoes-') ? 'YES' : 'NO'
      }))
    );

    // 🚨 CRITICAL DEBUG: Verify shoes are included
    const shoesInOutfit = outfitItems.filter(item => item.type === 'shoes');
    console.log(`👠 [createAdvancedOutfit] SHOES COUNT IN FINAL OUTFIT: ${shoesInOutfit.length}`);
    
    if (shoesInOutfit.length === 0) {
      console.error(`❌ [createAdvancedOutfit] CRITICAL BUG - NO SHOES IN OUTFIT FOR ${occasion}!`);
      console.error(`❌ This should never happen - selectOutfitByOccasion must always add shoes`);
    } else {
      console.log(`✅ [createAdvancedOutfit] SHOES SUCCESSFULLY INCLUDED IN ${occasion} OUTFIT`);
      shoesInOutfit.forEach((shoe, index) => {
        console.log(`   👠 Shoe ${index + 1}: ${shoe.name} (ID: ${shoe.id})`);
      });
    }
    
    // Mark selected clothing items as used for both tracking systems
    outfitItems.forEach(item => {
      if (item.id && !item.id.includes('zara-shoes-')) {
        const baseId = item.id.split('-')[0];
        globalUsedItemIds[occasion].add(baseId);
        sessionUsedItemIds[occasion].add(baseId);
        sessionItemCount++;
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
 * Enhanced categorization with style matching
 */
function categorizeItemsAdvanced(items: any[], eventType: string, styleProfile?: string): any {
  const categories = {
    tops: [],
    bottoms: [],
    dresses: [],
    outerwear: [],
    accessories: []
  };
  
  items.forEach(item => {
    const productFamily = item.product_family?.toLowerCase() || '';
    const productSubfamily = item.product_subfamily?.toLowerCase() || '';
    const productName = item.product_name?.toLowerCase() || '';
    
    // Enhanced categorization logic with style preferences
    if (productFamily.includes('dress') || productSubfamily.includes('dress') || productName.includes('dress')) {
      categories.dresses.push(item);
    } else if (productFamily.includes('top') || productSubfamily.includes('top') || productSubfamily.includes('shirt') || 
               productSubfamily.includes('blouse') || productName.includes('top') || productName.includes('shirt')) {
      categories.tops.push(item);
    } else if (productFamily.includes('bottom') || productSubfamily.includes('trouser') || productSubfamily.includes('pant') ||
               productSubfamily.includes('skirt') || productName.includes('trouser') || productName.includes('skirt')) {
      categories.bottoms.push(item);
    } else if (productFamily.includes('outerwear') || productSubfamily.includes('jacket') || productSubfamily.includes('coat')) {
      categories.outerwear.push(item);
    } else {
      // Try to categorize based on product name patterns
      if (productName.includes('dress')) {
        categories.dresses.push(item);
      } else if (productName.includes('shirt') || productName.includes('top') || productName.includes('blouse')) {
        categories.tops.push(item);
      } else if (productName.includes('trouser') || productName.includes('pant') || productName.includes('skirt')) {
        categories.bottoms.push(item);
      } else {
        // Default to tops for uncategorized items
        categories.tops.push(item);
      }
    }
  });
  
  return categories;
}

/**
 * בחירת תלבושת לפי סוג אירוע - עם נעליים מטבלת zara_cloth
 * 🚨 CRITICAL: תמיד מוסיף נעליים בלי קשר לסוג התלבושת
 */
async function selectOutfitByOccasion(categories: any, occasion: string): Promise<DashboardItem[]> {
  console.log(`🎯 [selectOutfitByOccasion] ===== SELECTING OUTFIT FOR ${occasion.toUpperCase()} (MANDATORY SHOES FROM ZARA_CLOTH TABLE) =====`);
  
  const selectedItems: DashboardItem[] = [];
  let usedColors: string[] = [];

  // Enhanced selection logic with variety
  const selectItemWithVariety = (itemsArray: any[], itemType: string) => {
    if (itemsArray.length === 0) return null;
    
    // Instead of always taking [0], use rotation based on session count
    const rotationIndex = sessionItemCount % Math.min(itemsArray.length, 5);
    const selectedIndex = Math.min(rotationIndex, itemsArray.length - 1);
    
    console.log(`🎲 [selectOutfitByOccasion] Selecting ${itemType} at index ${selectedIndex}/${itemsArray.length - 1} (variety rotation)`);
    return itemsArray[selectedIndex];
  };

  // לוגיקה שונה לכל סוג אירוע (ללא נעליים כאן)
  switch (occasion.toLowerCase()) {
    case 'work':
      // עבודה - תלבושת פורמלית (חולצה + מכנס/חצאית)
      if (categories.tops.length > 0 && categories.bottoms.length > 0) {
        const formalTop = categories.tops.find(item => isFormalItem(item)) || selectItemWithVariety(categories.tops, 'work top');
        const formalBottom = categories.bottoms.find(item => isFormalItem(item)) || selectItemWithVariety(categories.bottoms, 'work bottom');
        
        if (formalTop && formalBottom) {
          selectedItems.push(createDashboardItem(formalTop, 'top'));
          selectedItems.push(createDashboardItem(formalBottom, 'bottom'));
          usedColors.push(formalTop.colour?.toLowerCase() || '');
          usedColors.push(formalBottom.colour?.toLowerCase() || '');
          console.log(`👔 [selectOutfitByOccasion] Selected WORK outfit: ${formalTop.product_name} + ${formalBottom.product_name}`);
        }
      }
      break;
      
    case 'evening':
      // ערב - שמלה או תלבושת אלגנטית
      if (categories.dresses.length > 0) {
        const dress = selectItemWithVariety(categories.dresses, 'evening dress');
        selectedItems.push(createDashboardItem(dress, 'dress'));
        usedColors.push(dress.colour?.toLowerCase() || '');
        console.log(`👗 [selectOutfitByOccasion] Selected EVENING dress: ${dress.product_name}`);
      } else if (categories.tops.length > 0 && categories.bottoms.length > 0) {
        const elegantTop = selectItemWithVariety(categories.tops, 'evening top');
        const elegantBottom = selectItemWithVariety(categories.bottoms, 'evening bottom');
        selectedItems.push(createDashboardItem(elegantTop, 'top'));
        selectedItems.push(createDashboardItem(elegantBottom, 'bottom'));
        usedColors.push(elegantTop.colour?.toLowerCase() || '');
        usedColors.push(elegantBottom.colour?.toLowerCase() || '');
        console.log(`👗 [selectOutfitByOccasion] Selected EVENING outfit: ${elegantTop.product_name} + ${elegantBottom.product_name}`);
      }
      break;
      
     case 'casual':
     case 'general':
       // מזדמן - חובה לוודא שיש לפחות top + bottom או dress
       console.log(`👕 [selectOutfitByOccasion] Processing CASUAL/GENERAL outfit selection`);
     console.log(`🔍 [selectOutfitByOccasion] Available dresses: ${categories.dresses.length}, tops: ${categories.tops.length}, bottoms: ${categories.bottoms.length}`);
     
     // FORCE ensuring we have at least 2 clothing items - never less than full outfit
     if (categories.tops.length > 0 && categories.bottoms.length > 0) {
       // Prefer top + bottom combination for casual
       const casualTop = selectItemWithVariety(categories.tops, 'casual top');
       const casualBottom = selectItemWithVariety(categories.bottoms, 'casual bottom');
       
       selectedItems.push(createDashboardItem(casualTop, 'top'));
       selectedItems.push(createDashboardItem(casualBottom, 'bottom'));
       usedColors.push(casualTop.colour?.toLowerCase() || '');
       usedColors.push(casualBottom.colour?.toLowerCase() || '');
       console.log(`👕 [selectOutfitByOccasion] Selected CASUAL outfit: ${casualTop.product_name} + ${casualBottom.product_name}`);
       
     } else if (categories.dresses.length > 0) {
       // Fallback to dress if no tops or bottoms available
       const casualDress = selectItemWithVariety(categories.dresses, 'casual dress');
       selectedItems.push(createDashboardItem(casualDress, 'dress'));
       usedColors.push(casualDress.colour?.toLowerCase() || '');
       console.log(`👗 [selectOutfitByOccasion] Selected CASUAL dress (fallback): ${casualDress.product_name}`);
     } else {
       console.error(`❌ [selectOutfitByOccasion] NO CLOTHING ITEMS AVAILABLE FOR CASUAL - This should not happen!`);
     }
       break;
      
    case 'weekend':
      // סוף שבוע - נוח ורגוע, גם שמלות נוחות אפשריות
      if (categories.dresses.length > 0 && Math.random() > 0.6) {
        // לפעמים בוחרים שמלה גם לסוף השבוע
        const weekendDress = selectItemWithVariety(categories.dresses, 'weekend dress');
        selectedItems.push(createDashboardItem(weekendDress, 'dress'));
        usedColors.push(weekendDress.colour?.toLowerCase() || '');
        console.log(`👗 [selectOutfitByOccasion] Selected WEEKEND dress: ${weekendDress.product_name}`);
      } else if (categories.tops.length > 0 && categories.bottoms.length > 0) {
        const comfortableTop = selectItemWithVariety(categories.tops, 'weekend top');
        const comfortableBottom = selectItemWithVariety(categories.bottoms, 'weekend bottom');
        selectedItems.push(createDashboardItem(comfortableTop, 'top'));
        selectedItems.push(createDashboardItem(comfortableBottom, 'bottom'));
        usedColors.push(comfortableTop.colour?.toLowerCase() || '');
        usedColors.push(comfortableBottom.colour?.toLowerCase() || '');
        console.log(`👕 [selectOutfitByOccasion] Selected WEEKEND outfit: ${comfortableTop.product_name} + ${comfortableBottom.product_name}`);
      }
      break;
      
    default:
      console.log(`❓ [selectOutfitByOccasion] Unknown occasion: ${occasion}, using casual logic`);
      if (categories.tops.length > 0 && categories.bottoms.length > 0) {
        const defaultTop = selectItemWithVariety(categories.tops, 'default top');
        const defaultBottom = selectItemWithVariety(categories.bottoms, 'default bottom');
        selectedItems.push(createDashboardItem(defaultTop, 'top'));
        selectedItems.push(createDashboardItem(defaultBottom, 'bottom'));
        usedColors.push(defaultTop.colour?.toLowerCase() || '');
        usedColors.push(defaultBottom.colour?.toLowerCase() || '');
        console.log(`👕 [selectOutfitByOccasion] Selected DEFAULT outfit: ${defaultTop.product_name} + ${defaultBottom.product_name}`);
      }
      break;
  }

   // 🚨 CRITICAL: Ensure minimum 3 items - add fallback logic if needed
   if (selectedItems.length < 2) {
     console.warn(`⚠️ [selectOutfitByOccasion] Only ${selectedItems.length} items selected for ${occasion}, adding fallbacks`);
     
     // Try to add missing items with fallbacks
     if (selectedItems.length === 0) {
       // No items at all - add both top and bottom fallback
       if (categories.tops.length > 0 && categories.bottoms.length > 0) {
         const fallbackTop = selectItemWithVariety(categories.tops, 'fallback top');
         const fallbackBottom = selectItemWithVariety(categories.bottoms, 'fallback bottom');
         selectedItems.push(createDashboardItem(fallbackTop, 'top'));
         selectedItems.push(createDashboardItem(fallbackBottom, 'bottom'));
         usedColors.push(fallbackTop.colour?.toLowerCase() || '');
         usedColors.push(fallbackBottom.colour?.toLowerCase() || '');
         console.log(`🆘 [selectOutfitByOccasion] Added fallback top+bottom: ${fallbackTop.product_name} + ${fallbackBottom.product_name}`);
       } else if (categories.dresses.length > 0) {
         const fallbackDress = selectItemWithVariety(categories.dresses, 'fallback dress');
         selectedItems.push(createDashboardItem(fallbackDress, 'dress'));
         usedColors.push(fallbackDress.colour?.toLowerCase() || '');
         console.log(`🆘 [selectOutfitByOccasion] Added fallback dress: ${fallbackDress.product_name}`);
       }
     } else if (selectedItems.length === 1) {
       // Only one item - need to add another
       const existingType = selectedItems[0].type;
       if (existingType === 'dress') {
         // Already have dress, good to go
         console.log(`✅ [selectOutfitByOccasion] Have dress, outfit is complete for clothing`);
       } else if (existingType === 'top' && categories.bottoms.length > 0) {
         const fallbackBottom = selectItemWithVariety(categories.bottoms, 'fallback bottom');
         selectedItems.push(createDashboardItem(fallbackBottom, 'bottom'));
         usedColors.push(fallbackBottom.colour?.toLowerCase() || '');
         console.log(`🆘 [selectOutfitByOccasion] Added fallback bottom: ${fallbackBottom.product_name}`);
       } else if (existingType === 'bottom' && categories.tops.length > 0) {
         const fallbackTop = selectItemWithVariety(categories.tops, 'fallback top');
         selectedItems.push(createDashboardItem(fallbackTop, 'top'));
         usedColors.push(fallbackTop.colour?.toLowerCase() || '');
         console.log(`🆘 [selectOutfitByOccasion] Added fallback top: ${fallbackTop.product_name}`);
       }
     }
   }

  // 🚨 CRITICAL: תמיד מוסיף נעליים - חובה לכל סוג תלבושת
  console.log(`👠 [selectOutfitByOccasion] ===== MANDATORY SHOES ADDITION FOR ${occasion.toUpperCase()} =====`);
  console.log(`👠 [selectOutfitByOccasion] Current outfit has ${selectedItems.length} items before adding shoes`);
  console.log(`👠 [selectOutfitByOccasion] Used colors:`, usedColors);
  
  // 🔍 ENHANCED DEBUGGING: Let's check what shoes are available in the database
  console.log(`🔍 [selectOutfitByOccasion] ===== DEBUGGING SHOES AVAILABILITY =====`);
  const shoesDebugResult = await debugShoesInDatabase(occasion);
  
  console.log(`🔍 [selectOutfitByOccasion] CALLING getMatchingShoesFromZara for ${occasion.toUpperCase()}...`);
  const shoesResult = await getMatchingShoesFromZara(occasion, usedColors);
  
  console.log(`🔍 [selectOutfitByOccasion] SHOES RESULT:`, shoesResult);
  
  if (shoesResult) {
    selectedItems.push(shoesResult);
    console.log(`✅ [selectOutfitByOccasion] SHOES SUCCESSFULLY ADDED TO ${occasion.toUpperCase()}: ${shoesResult.name} with ID: ${shoesResult.id}`);
    console.log(`✅ [selectOutfitByOccasion] Shoes image URL: ${shoesResult.image}`);
    console.log(`✅ [selectOutfitByOccasion] FROM ZARA_CLOTH TABLE: ${shoesResult.id.includes('zara-shoes-') ? 'YES' : 'NO'}`);
    
    // Log the final outfit combination
    const hasDress = selectedItems.some(item => item.type === 'dress');
    if (hasDress) {
      console.log(`👗👠 [selectOutfitByOccasion] FINAL COMBINATION: DRESS + SHOES for ${occasion.toUpperCase()}`);
    } else {
      console.log(`👕👖👠 [selectOutfitByOccasion] FINAL COMBINATION: TOP + BOTTOM + SHOES for ${occasion.toUpperCase()}`);
    }
  } else {
    console.error(`❌ [selectOutfitByOccasion] FAILED TO GET SHOES FROM ZARA_CLOTH - ADDING FALLBACK SHOES FOR ${occasion.toUpperCase()}`);
    
    // Add fallback shoes - MANDATORY, never return without shoes
    const fallbackShoes = getRandomFallbackShoes();
    selectedItems.push(fallbackShoes);
    console.log(`🆘 [selectOutfitByOccasion] Added fallback shoes: ${fallbackShoes.name}`);
  }
  
   // 🚨 FINAL VALIDATION: Ensure we have at least 3 items total (2 clothing + 1 shoes)
   if (selectedItems.length < 3) {
     console.error(`❌ [selectOutfitByOccasion] CRITICAL ERROR - Final outfit has only ${selectedItems.length} items for ${occasion}`);
     console.error(`❌ Every outfit MUST have at least 3 items: 2 clothing + 1 shoes`);
     
     // Force add missing items if needed
     if (selectedItems.filter(item => item.type === 'shoes').length === 0) {
       console.error(`❌ [selectOutfitByOccasion] NO SHOES FOUND - This should never happen!`);
       const emergencyShoes = getRandomFallbackShoes();
       selectedItems.push(emergencyShoes);
       console.log(`🆘 [selectOutfitByOccasion] Added emergency fallback shoes`);
     }
   }

   console.log(`🔥 [selectOutfitByOccasion] FINAL OUTFIT FOR ${occasion.toUpperCase()}: ${selectedItems.length} items`);
   selectedItems.forEach((item, index) => {
     console.log(`   ${index + 1}. ${item.type}: ${item.name} (ID: ${item.id})`);
   });

   // 🚨 VALIDATION: Must have at least 3 items
   if (selectedItems.length < 3) {
     console.error(`❌ [selectOutfitByOccasion] FAILED TO CREATE PROPER OUTFIT - Only ${selectedItems.length} items!`);
     throw new Error(`Insufficient outfit items: ${selectedItems.length} (minimum required: 3)`);
   }

   return selectedItems;
}

/**
 * Helper: Check if item is formal (simple heuristic)
 */
function isFormalItem(item: any): boolean {
  const name = (item.product_name || '').toLowerCase();
  const subfamily = (item.product_subfamily || '').toLowerCase();
  return name.includes('formal') || name.includes('blazer') || subfamily.includes('formal') || subfamily.includes('blazer');
}

/**
 * Helper: Create DashboardItem from raw item and type
 */
// Export the main function that the hooks use
export async function fetchDashboardItems(): Promise<{ [key: string]: DashboardItem[] }> {
  try {
    console.log('🔥 [fetchDashboardItems] ===== FETCHING ENHANCED VARIETY OUTFITS =====');
    
    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    const data: { [key: string]: DashboardItem[] } = {};
    
    for (const occasion of occasions) {
      try {
        console.log(`🎯 [fetchDashboardItems] Creating outfit for ${occasion}...`);
        const occasionOutfit = await createAdvancedOutfit('casual', occasion.toLowerCase(), [], occasion);
        data[occasion] = occasionOutfit;
        console.log(`✅ [fetchDashboardItems] ${occasion} outfit created with ${occasionOutfit.length} items`);
      } catch (occasionError) {
        console.error(`❌ [fetchDashboardItems] Error creating ${occasion} outfit:`, occasionError);
        data[occasion] = getFallbackOutfit();
      }
    }
    
    return data;
  } catch (error) {
    console.error('❌ [fetchDashboardItems] Error:', error);
    return { Work: [], Casual: [], Evening: [], Weekend: [] };
  }
}

export function clearOutfitCache() {
  globalUsedItemIds = {};
  sessionUsedItemIds = {};
  globalUsedShoesIds.clear();
  sessionItemCount = 0;
  console.log('🔄 [clearOutfitCache] Cache cleared for variety');
}

function createDashboardItem(item: any, type: string): DashboardItem {
  return {
    id: item.id,
    name: item.product_name,
    image: extractZaraImageUrl(item.image),
    type: type as DashboardItem['type'],
    color: item.color || item.colour || '#000000',
    price: `₪${item.price}`,
    description: item.description || ''
  };
}

/**
 * Helper: Check if item has valid image data
 */
function hasValidImageData(imageData: any): boolean {
  if (!imageData) return false;
  if (typeof imageData === 'string' && imageData.trim() !== '') return true;
  if (Array.isArray(imageData) && imageData.length > 0) return true;
  if (typeof imageData === 'object' && Object.keys(imageData).length > 0) return true;
  return false;
}

/**
 * Helper: Check if item is actual clothing (not shoes, accessories, etc.)
 */
function isActualClothingItem(item: any): boolean {
  const family = (item.product_family || '').toLowerCase();
  const subfamily = (item.product_subfamily || '').toLowerCase();
  if (family.includes('shoe') || family.includes('sandal') || family.includes('boot')) return false;
  if (subfamily.includes('shoe') || subfamily.includes('sandal') || subfamily.includes('boot')) return false;
  return true;
}

/**
 * Debug function to check shoes availability in database
 */
async function debugShoesInDatabase(occasion: string): Promise<any> {
  try {
    const { data: shoesData, error } = await supabase
      .from('zara_cloth')
      .select('*')
      .not('image', 'is', null)
      .neq('availability', false)
      .or(`product_family.ilike.%shoe%,product_family.ilike.%sandal%,product_family.ilike.%boot%`)
      .limit(50);

    if (error) {
      console.error(`❌ [debugShoesInDatabase] Error fetching shoes:`, error);
      return null;
    }

    console.log(`🔍 [debugShoesInDatabase] Found ${shoesData.length} shoes items for debugging`);
    return shoesData;
  } catch (error) {
    console.error(`❌ [debugShoesInDatabase] Exception:`, error);
    return null;
  }
}

/**
 * Get matching shoes from zara_cloth table based on occasion and used colors
 */
async function getMatchingShoesFromZara(occasion: string, usedColors: string[]): Promise<DashboardItem | null> {
  try {
    // Build query with filters for shoes
    let query = supabase
      .from('zara_cloth')
      .select('*')
      .not('image', 'is', null)
      .neq('availability', false)
      .or(`product_family.ilike.%shoe%,product_family.ilike.%sandal%,product_family.ilike.%boot%`)
      .limit(100);

    // Optionally filter by color to avoid clashes
    if (usedColors.length > 0) {
      // Exclude shoes with colors already used in outfit
      const colorFilters = usedColors.map(color => `colour.ilike.not.%${color}%`).join(',');
      query = query.filter('colour', 'not.ilike', `%${usedColors[0]}%`); // Simplified for demo
    }

    const { data: shoesData, error } = await query;

    if (error) {
      console.error(`❌ [getMatchingShoesFromZara] Error fetching shoes:`, error);
      return null;
    }

    if (!shoesData || shoesData.length === 0) {
      console.warn(`⚠️ [getMatchingShoesFromZara] No shoes found matching criteria`);
      return null;
    }

    // Shuffle shoes for variety
    const shuffledShoes = shuffleArray(shoesData);

    // Select shoe based on session rotation to ensure variety
    const selectedShoe = shuffledShoes[sessionShoesRotation % shuffledShoes.length];
    sessionShoesRotation++;

    // Extract image URL using the specialized shoes extractor
    const imageUrl = extractShoesImageUrl(selectedShoe.image);

    // Construct DashboardItem for shoe
    const shoeItem: DashboardItem = {
      id: `zara-shoes-${selectedShoe.id}`,
      name: selectedShoe.product_name,
      image: imageUrl,
      type: 'shoes',
      color: selectedShoe.colour || '#000000',
      price: `₪${selectedShoe.price}`,
      description: selectedShoe.description || ''
    };

    return shoeItem;

  } catch (error) {
    console.error(`❌ [getMatchingShoesFromZara] Exception:`, error);
    return null;
  }
}

/**
 * Fallback outfit in case of errors or no data
 */
function getFallbackOutfit(): DashboardItem[] {
  // Return a simple default outfit with placeholder items
  return [
    {
      id: 'fallback-top-1',
      name: 'Fallback Top',
      image: '/images/fallback-top.png',
      type: 'top',
      color: 'blue',
      price: '₪99',
      description: 'Fallback top item'
    },
    {
      id: 'fallback-bottom-1',
      name: 'Fallback Bottom',
      image: '/images/fallback-bottom.png',
      type: 'bottom',
      color: 'black',
      price: '₪99',
      description: 'Fallback bottom item'
    },
    {
      id: 'fallback-shoes-1',
      name: 'Fallback Shoes',
      image: '/images/fallback-shoes.png',
      type: 'shoes',
      color: 'black',
      price: '₪149',
      description: 'Fallback shoes item'
    }
  ];
}

/**
 * Get random fallback shoes item
 */
function getRandomFallbackShoes(): DashboardItem {
  return {
    id: 'fallback-shoes-1',
    name: 'Fallback Shoes',
    image: '/images/fallback-shoes.png',
    type: 'shoes',
    color: 'black',
    price: '₪149',
    description: 'Fallback shoes item'
  };
}
