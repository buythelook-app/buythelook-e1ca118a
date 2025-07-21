import { Look } from '../types/lookTypes';
import { Agent } from './index';
import { ColorCoordinationService } from '../services/colorCoordinationService';

export interface StylingResult {
  looks: Look[];
  reasoning: string;
  debugInfo?: any; // Add debug information
}

export interface StylingRequest {
  bodyStructure: 'X' | 'V' | 'H' | 'O' | 'A';
  mood: string;
  style: 'classic' | 'romantic' | 'minimalist' | 'casual' | 'boohoo' | 'sporty';
  event?: string;
  availableItems: any[];
}

type ZaraClothItem = {
  id: string;
  product_name: string;
  price: number;
  colour: string;
  description?: string | null;
  size: string[];
  materials?: any[] | null;
  materials_description?: string | null;
  availability: boolean;
  low_on_stock?: boolean | null;
  image?: any | null;
  category_id?: number | null;
  product_id?: number | null;
  product_family?: string | null;
  product_family_en?: string | null;
  product_subfamily?: string | null;
  section?: string | null;
  currency?: string | null;
  care?: any | null;
  dimension?: string | null;
  sku?: string | null;
  url?: string | null;
  you_may_also_like?: any | null;
  created_at: string;
};

type ShoeItem = {
  name: string;
  brand?: string | null;
  description?: string | null;
  price: number | null;
  colour?: any;
  image: string; // This will be populated from url field
  discount?: string | null;
  category?: string | null;
  availability: string;
  url?: string | null;
  breadcrumbs?: any;
  // Raw database fields
  buy_the_look?: any;
  possible_sizes?: any;
  you_might_also_like?: any;
  product_id?: number | null;
  color?: any;
  about_me?: string | null;
  look_after_me?: string | null;
  product_details?: string | null;
  size_fit?: string | null;
  currency?: string | null;
};

// Debug information structure
interface DebugInfo {
  filters_applied: string[];
  raw_data: {
    clothing_fetched: number;
    shoes_fetched: number;
    clothing_available: number;
    shoes_available: number;
    underwear_filtered: number;
  };
  categorization: {
    tops: number;
    bottoms: number;
    dresses: number;
    jumpsuits: number;
    outerwear: number;
    shoes_with_valid_images: number;
  };
  filtering_steps: {
    step: string;
    items_before: number;
    items_after: number;
    criteria: string;
  }[];
  items_selected: {
    [key: string]: {
      id: string;
      name: string;
      image: string;
      source: string;
      price?: number;
      image_validation: boolean;
    };
  };
  logic_notes: string[];
  performance: {
    total_time_ms: number;
    image_debug_time_ms?: number;
  };
  outfit_logic: {
    event_type: string;
    outfit_rules_applied: string[];
    selected_combination: string;
    item_sources: {
      [key: string]: string;
    };
  };
}

class StylingAgentClass implements Agent {
  role = "Senior Fashion Stylist";
  goal = "Create fashionable and appropriate outfit combinations using clothing from zara_cloth table and shoes from shoes table";
  backstory = "An experienced fashion stylist with expertise in body shapes, color coordination, fabric matching, and budget-conscious styling";
  tools: any[] = [];

  async run(userId: string): Promise<any> {
    const startTime = performance.now();
    const debugInfo: DebugInfo = {
      filters_applied: [],
      raw_data: { clothing_fetched: 0, shoes_fetched: 0, clothing_available: 0, shoes_available: 0, underwear_filtered: 0 },
      categorization: { tops: 0, bottoms: 0, dresses: 0, jumpsuits: 0, outerwear: 0, shoes_with_valid_images: 0 },
      filtering_steps: [],
      items_selected: {},
      logic_notes: [],
      performance: { total_time_ms: 0 },
      outfit_logic: {
        event_type: '',
        outfit_rules_applied: [],
        selected_combination: '',
        item_sources: {}
      }
    };

    console.log(`🎯 [StylingAgent] Starting outfit generation for user: ${userId} - USING SHOES TABLE ONLY`);
    
    try {
      // Get user preferences from localStorage
      const styleData = localStorage.getItem('styleAnalysis');
      const currentMood = localStorage.getItem('current-mood') || 'elegant';
      const currentEvent = localStorage.getItem('current-event') || 'casual';
      
      // Get budget from filters
      const budgetData = this.getBudgetFromFilters();
      const budget = budgetData.budget;
      const isUnlimited = budgetData.isUnlimited;
      
      console.log(`💰 [BUDGET FILTER] Budget: ${isUnlimited ? 'UNLIMITED' : `$${budget}`}`);
      debugInfo.filters_applied.push('BUDGET_FILTER', 'SHOES_TABLE_ONLY');
      debugInfo.logic_notes.push(`Budget applied: ${isUnlimited ? 'UNLIMITED' : `$${budget}`}`);
      debugInfo.logic_notes.push(`SHOES SOURCE: "shoes" table only - NO other sources`);
      
      if (!styleData) {
        debugInfo.logic_notes.push('ERROR: No style profile found in localStorage');
        return {
          success: false,
          error: 'No style profile found. Please run personalization first.',
          debugInfo
        };
      }
      
      const parsedData = JSON.parse(styleData);
      const bodyShape = parsedData?.analysis?.bodyShape || 'H';
      const style = parsedData?.analysis?.styleProfile || 'classic';
      
      debugInfo.outfit_logic.event_type = currentEvent;
      
      console.log(`🎭 [ENHANCED LOGIC] Event: ${currentEvent}, Style: ${style}, Mood: ${currentMood}, Budget: ${isUnlimited ? 'unlimited' : budget}`);
      
      // Fetch from dual sources - CLOTHING FROM zara_cloth, SHOES FROM shoes TABLE ONLY
      const { supabase } = await import('../lib/supabaseClient');
      
      console.log(`🔍 [SHOES TABLE] Fetching shoes ONLY from "shoes" table...`);
      
      // Fetch clothing from zara_cloth table with budget filter
      let clothingQuery = supabase
        .from('zara_cloth')
        .select('*')
        .eq('availability', true);
        
      // 🆕 FETCH SHOES ONLY FROM "SHOES" TABLE
      let shoesQuery = supabase
        .from('shoes')
        .select('*')
        .eq('availability', 'in stock');
      
      // Apply budget filter if not unlimited
      if (!isUnlimited && budget > 0) {
        clothingQuery = clothingQuery.lte('price', budget * 0.7);
        shoesQuery = shoesQuery.lte('price', budget * 0.3);
        console.log(`💰 [BUDGET] Filtering clothing ≤ $${budget * 0.7}, shoes ≤ $${budget * 0.3}`);
      }
      
      const { data: allClothingRaw, error: clothError } = await clothingQuery;
      const { data: allShoesRaw, error: shoesError } = await shoesQuery;
      
      if (clothError || !allClothingRaw) {
        debugInfo.logic_notes.push(`ERROR: Failed to fetch clothing - ${clothError?.message}`);
        return {
          success: false,
          error: 'Failed to fetch available clothing items from zara_cloth table',
          debugInfo
        };
      }

      if (shoesError || !allShoesRaw) {
        debugInfo.logic_notes.push(`ERROR: Failed to fetch shoes from "shoes" table - ${shoesError?.message}`);
        return {
          success: false,
          error: 'Failed to fetch available shoes from "shoes" table',
          debugInfo
        };
      }

      debugInfo.raw_data.clothing_fetched = allClothingRaw.length;
      debugInfo.raw_data.shoes_fetched = allShoesRaw.length;
      
      console.log(`📊 [SHOES TABLE SUCCESS] Fetched ${allShoesRaw.length} shoes from "shoes" table`);
      
      // Filter out underwear and apply mood-based filtering for clothing
      const allClothing = this.filterClothingByMoodAndBudget(
        this.filterOutUnderwear(allClothingRaw, debugInfo), 
        currentMood, 
        budget, 
        isUnlimited, 
        debugInfo
      );
      
      debugInfo.raw_data.clothing_available = allClothing.length;
      debugInfo.raw_data.underwear_filtered = allClothingRaw.length - allClothing.length;
      
      console.log(`🚫 [UNDERWEAR FILTER] Removed ${debugInfo.raw_data.underwear_filtered} underwear items`);
      console.log(`✅ [FILTERED CLOTHING] ${allClothing.length} clothing items remain`);

      // Transform and filter shoes FROM "shoes" TABLE ONLY
      const allShoes: ShoeItem[] = allShoesRaw.map(shoe => ({
        ...shoe,
        image: shoe.url || '/placeholder.svg',
        price: shoe.price || 0,
        colour: shoe.color || shoe.colour || 'unknown'
      }));
      
      // Filter shoes by mood colors
      const filteredShoes = this.filterShoesByMood(allShoes, currentMood, debugInfo);
      debugInfo.raw_data.shoes_available = filteredShoes.length;
      
      console.log(`👠 [SHOES TABLE FILTERED] Filtered shoes from ${allShoes.length} to ${filteredShoes.length} mood-appropriate pairs`);
      debugInfo.logic_notes.push(`Shoes source confirmed: "shoes" table - ${filteredShoes.length} available`);
      
      // Create enhanced styling request
      const request: StylingRequest = {
        bodyStructure: bodyShape as any,
        mood: currentMood,
        style: style as any,
        event: currentEvent,
        availableItems: []
      };
      
      // Generate outfits with enhanced coordination
      const result = await this.createEnhancedOutfitsWithCoordination(
        request, 
        allClothing, 
        filteredShoes, 
        budget,
        isUnlimited,
        debugInfo
      );
      
      const endTime = performance.now();
      debugInfo.performance.total_time_ms = endTime - startTime;
      
      console.log(`✅ [STYLING COMPLETE] Created ${result.looks.length} outfits with shoes from "shoes" table only`);
      
      return {
        success: true,
        data: {
          looks: result.looks,
          reasoning: result.reasoning,
          userId,
          timestamp: new Date().toISOString(),
          debugInfo
        }
      };
      
    } catch (error) {
      debugInfo.logic_notes.push(`CRITICAL ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      debugInfo.performance.total_time_ms = performance.now() - startTime;
      
      console.error('❌ [StylingAgent] Error in outfit generation:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in styling agent',
        debugInfo
      };
    }
  }

  /**
   * 🆕 Get budget from FilterOptions component
   */
  private getBudgetFromFilters(): { budget: number; isUnlimited: boolean } {
    try {
      // Try to get budget from localStorage or component state
      const budgetData = localStorage.getItem('outfit-budget');
      if (budgetData) {
        const parsed = JSON.parse(budgetData);
        return {
          budget: parsed.budget || 500,
          isUnlimited: parsed.isUnlimited || false
        };
      }
    } catch (error) {
      console.log('Could not get budget from storage, using default');
    }
    
    // Default budget
    return { budget: 500, isUnlimited: false };
  }

  /**
   * 🆕 Filter clothing by mood colors and budget
   */
  private filterClothingByMoodAndBudget(
    clothingItems: ZaraClothItem[],
    mood: string,
    budget: number,
    isUnlimited: boolean,
    debugInfo: DebugInfo
  ): ZaraClothItem[] {
    console.log(`🎨 [MOOD + BUDGET FILTER] Filtering ${clothingItems.length} items for mood: ${mood}`);
    
    const moodColors = ColorCoordinationService.getColorsForMood(mood);
    console.log(`🎨 [MOOD COLORS] ${mood} → [${moodColors.join(', ')}]`);
    
    const filtered = clothingItems.filter(item => {
      if (!isUnlimited && item.price > budget * 0.7) {
        return false;
      }
      
      const itemColor = (item.colour || '').toLowerCase();
      const itemName = (item.product_name || '').toLowerCase();
      
      const matchesMoodColor = moodColors.some(moodColor => 
        itemColor.includes(moodColor.toLowerCase()) ||
        itemName.includes(moodColor.toLowerCase()) ||
        ColorCoordinationService.areColorsCompatible(itemColor, moodColor)
      );
      
      const neutralColors = ['black', 'white', 'gray', 'beige', 'brown'];
      const isNeutral = neutralColors.some(neutral => 
        itemColor.includes(neutral) || itemName.includes(neutral)
      );
      
      return matchesMoodColor || isNeutral;
    });
    
    debugInfo.filtering_steps.push({
      step: 'Mood + Budget Filter',
      items_before: clothingItems.length,
      items_after: filtered.length,
      criteria: `Mood: ${mood}, Budget: ${isUnlimited ? 'unlimited' : `$${budget}`}`
    });
    
    console.log(`🎨 [MOOD + BUDGET RESULT] Filtered from ${clothingItems.length} to ${filtered.length} items`);
    return filtered;
  }

  /**
   * 🆕 Filter shoes by mood appropriateness
   */
  private filterShoesByMood(shoes: ShoeItem[], mood: string, debugInfo: DebugInfo): ShoeItem[] {
    console.log(`👠 [SHOES MOOD FILTER] Filtering ${shoes.length} shoes from "shoes" table for mood: ${mood}`);
    
    const moodColors = ColorCoordinationService.getColorsForMood(mood);
    
    const filtered = shoes.filter(shoe => {
      const shoeColor = (shoe.colour || shoe.color || '').toLowerCase();
      const shoeName = (shoe.name || '').toLowerCase();
      
      const matchesMoodColor = moodColors.some(moodColor => 
        shoeColor.includes(moodColor.toLowerCase()) ||
        shoeName.includes(moodColor.toLowerCase()) ||
        ColorCoordinationService.areColorsCompatible(shoeColor, moodColor)
      );
      
      const neutralColors = ['black', 'white', 'brown', 'beige', 'gray'];
      const isNeutral = neutralColors.some(neutral => 
        shoeColor.includes(neutral) || shoeName.includes(neutral)
      );
      
      return matchesMoodColor || isNeutral;
    });
    
    debugInfo.filtering_steps.push({
      step: 'Shoes Mood Filter (shoes table)',
      items_before: shoes.length,
      items_after: filtered.length,
      criteria: `Mood colors: [${moodColors.join(', ')}] from "shoes" table`
    });
    
    console.log(`👠 [SHOES TABLE RESULT] Filtered from ${shoes.length} to ${filtered.length} mood-appropriate shoes`);
    return filtered;
  }

  /**
   * 🆕 Create outfits with enhanced color coordination and fabric matching
   */
  private async createEnhancedOutfitsWithCoordination(
    request: StylingRequest,
    allClothing: ZaraClothItem[],
    allShoes: ShoeItem[],
    budget: number,
    isUnlimited: boolean,
    debugInfo: DebugInfo
  ): Promise<StylingResult> {
    console.log(`🎯 [ENHANCED COORDINATION] Creating outfits with shoes from "shoes" table only`);
    console.log(`📊 [DATA] Clothing: ${allClothing.length}, Shoes from "shoes" table: ${allShoes.length}, Budget: ${isUnlimited ? 'unlimited' : `$${budget}`}`);
    
    const categorizedItems = this.categorizeClothingItems(allClothing, debugInfo);
    const categorizedShoes = this.categorizeShoesByType(allShoes);
    
    debugInfo.categorization.shoes_with_valid_images = allShoes.length;
    
    const looks: Look[] = [];
    const usedItemIds = new Set<string>();
    const usedShoeIds = new Set<string>();
    
    const eventType = request.event || 'casual';
    debugInfo.outfit_logic.event_type = eventType;
    
    const appropriateShoes = this.selectShoesForEvent(categorizedShoes, eventType);
    
    console.log(`🎯 [ENHANCED] Creating ${eventType} outfits with shoes from "shoes" table`);
    
    // Create coordinated outfits based on event type
    if (eventType === 'evening' || eventType === 'formal') {
      await this.createCoordinatedDressOutfits(
        categorizedItems.dresses,
        appropriateShoes,
        looks,
        usedItemIds,
        usedShoeIds,
        debugInfo,
        eventType,
        request.mood,
        budget,
        isUnlimited
      );
      
      if (looks.length < 3) {
        await this.createCoordinatedFormalOutfits(
          categorizedItems,
          appropriateShoes,
          looks,
          usedItemIds,
          usedShoeIds,
          debugInfo,
          request.mood,
          budget,
          isUnlimited
        );
      }
    } else {
      await this.createCoordinatedCasualOutfits(
        categorizedItems,
        appropriateShoes,
        looks,
        usedItemIds,
        usedShoeIds,
        debugInfo,
        request.mood,
        budget,
        isUnlimited
      );
      
      if (looks.length < 3 && categorizedItems.dresses.length > 0) {
        await this.createCoordinatedDressOutfits(
          categorizedItems.dresses,
          appropriateShoes,
          looks,
          usedItemIds,
          usedShoeIds,
          debugInfo,
          eventType,
          request.mood,
          budget,
          isUnlimited
        );
      }
    }
    
    if (looks.length < 3 && categorizedItems.jumpsuits.length > 0) {
      await this.createCoordinatedJumpsuitOutfits(
        categorizedItems.jumpsuits,
        appropriateShoes,
        looks,
        usedItemIds,
        usedShoeIds,
        debugInfo,
        request.mood,
        budget,
        isUnlimited
      );
    }
    
    // Score outfits based on coordination
    looks.forEach((look, index) => {
      const coordinationScore = ColorCoordinationService.scoreOutfitCoordination(look.items, request.mood);
      console.log(`🏆 [COORDINATION SCORE] Look ${index + 1}: ${coordinationScore}/100`);
      debugInfo.logic_notes.push(`Look ${index + 1} coordination score: ${coordinationScore}/100`);
    });
    
    console.log(`✅ [CREATION COMPLETE] Created ${looks.length} outfits with shoes from "shoes" table only`);
    
    return {
      looks,
      reasoning: `Created ${looks.length} outfits for ${eventType} event with color coordination, fabric matching, mood alignment (${request.mood}), budget consideration (${isUnlimited ? 'unlimited' : `$${budget}`}), and shoes from "shoes" table only`,
      debugInfo
    };
  }

  /**
   * 🆕 Create enhanced coordinated dress outfits with better styling
   */
  private async createCoordinatedDressOutfits(
    dresses: ZaraClothItem[], 
    shoes: ShoeItem[], 
    looks: Look[], 
    usedItemIds: Set<string>, 
    usedShoeIds: Set<string>, 
    debugInfo: DebugInfo,
    eventType: string,
    mood: string,
    budget: number,
    isUnlimited: boolean
  ) {
    console.log(`👗 [ENHANCED DRESS] Creating high-quality dress outfits with advanced coordination`);
    
    const availableDresses = dresses.filter(dress => !usedItemIds.has(dress.id));
    const availableShoes = shoes.filter(shoe => !usedShoeIds.has(shoe.name));
    
    if (availableDresses.length === 0 || availableShoes.length === 0) {
      console.log(`⚠️ [DRESS] Insufficient items - dresses: ${availableDresses.length}, shoes: ${availableShoes.length}`);
      return;
    }
    
    // Score and sort dresses by quality and appropriateness
    const scoredDresses = availableDresses.map(dress => ({
      dress,
      score: this.scoreDressForEvent(dress, eventType, mood, budget, isUnlimited)
    })).sort((a, b) => b.score - a.score);
    
    const maxDressLooks = Math.min(2, Math.max(1, 4 - looks.length));
    let addedLooks = 0;
    
    for (const { dress, score } of scoredDresses) {
      if (addedLooks >= maxDressLooks) break;
      if (score < 60) break; // Don't use low-scoring dresses
      
      // Find the best matching shoes
      const shoeMatches = availableShoes
        .map(shoe => ({
          shoe,
          compatibility: this.calculateDressShoeCompatibility(dress, shoe, eventType, mood, budget, isUnlimited)
        }))
        .filter(match => match.compatibility > 70)
        .sort((a, b) => b.compatibility - a.compatibility);
      
      if (shoeMatches.length === 0) {
        console.log(`⚠️ [DRESS] No compatible shoes found for ${dress.product_name}`);
        continue;
      }
      
      const bestShoeMatch = shoeMatches[0];
      
      if (usedShoeIds.has(bestShoeMatch.shoe.name)) {
        console.log(`⚠️ [DRESS] Best shoe already used: ${bestShoeMatch.shoe.name}`);
        continue;
      }
      
      console.log(`✅ [HIGH-QUALITY DRESS] Score: ${score}/100, Shoe Match: ${bestShoeMatch.compatibility}/100 - ${dress.product_name} + ${bestShoeMatch.shoe.name}`);
      debugInfo.outfit_logic.outfit_rules_applied.push(`ENHANCED_DRESS_SCORE_${score}_SHOE_${bestShoeMatch.compatibility}`);
      
      const lookItems = [
        {
          id: dress.id,
          title: dress.product_name,
          description: this.enhanceItemDescription(dress, 'dress', mood),
          image: this.normalizeImageField(dress.image, 'clothing'),
          price: dress.price ? `$${dress.price}` : '0',
          type: 'dress'
        },
        {
          id: bestShoeMatch.shoe.name,
          title: bestShoeMatch.shoe.name,
          description: this.enhanceItemDescription(bestShoeMatch.shoe, 'shoes', mood),
          image: bestShoeMatch.shoe.image,
          price: bestShoeMatch.shoe.price ? `$${bestShoeMatch.shoe.price}` : '0',
          type: 'shoes'
        }
      ];
      
      const look: Look = {
        id: `enhanced-dress-look-${looks.length + addedLooks}`,
        items: lookItems,
        description: this.generateEnhancedDressDescription(dress, bestShoeMatch.shoe, eventType, mood),
        occasion: eventType as any,
        style: this.determineDressStyle(dress),
        mood: mood as any
      };
      
      looks.push(look);
      usedItemIds.add(dress.id);
      usedShoeIds.add(bestShoeMatch.shoe.name);
      addedLooks++;
    }
    
    console.log(`🎉 [ENHANCED DRESS] Successfully created ${addedLooks} high-quality dress outfits`);
  }

  /**
   * 🆕 Create coordinated casual outfits with enhanced color and style matching
   */
  private async createCoordinatedCasualOutfits(
    categorizedItems: any, 
    shoes: ShoeItem[], 
    looks: Look[], 
    usedItemIds: Set<string>, 
    usedShoeIds: Set<string>, 
    debugInfo: DebugInfo,
    mood: string,
    budget: number,
    isUnlimited: boolean
  ) {
    console.log(`👕 [ENHANCED CASUAL] Creating high-quality casual outfits with advanced coordination`);
    
    const availableTops = categorizedItems.tops.filter((item: ZaraClothItem) => !usedItemIds.has(item.id));
    const availableBottoms = categorizedItems.bottoms.filter((item: ZaraClothItem) => !usedItemIds.has(item.id));
    const availableShoes = shoes.filter(shoe => !usedShoeIds.has(shoe.name));
    
    if (availableTops.length === 0 || availableBottoms.length === 0 || availableShoes.length === 0) {
      console.log(`⚠️ [CASUAL] Insufficient items - tops: ${availableTops.length}, bottoms: ${availableBottoms.length}, shoes: ${availableShoes.length}`);
      return;
    }
    
    // Enhanced: Try multiple combinations to find the best ones
    const combinations = this.generateOutfitCombinations(availableTops, availableBottoms, availableShoes, mood, budget, isUnlimited);
    const sortedCombinations = combinations
      .map(combo => ({
        ...combo,
        score: this.scoreOutfitCombination(combo, mood)
      }))
      .sort((a, b) => b.score - a.score);
    
    console.log(`🎯 [ENHANCED CASUAL] Generated ${sortedCombinations.length} combinations, selecting top ones`);
    
    const maxCasualLooks = Math.min(3, Math.max(1, 4 - looks.length));
    let addedLooks = 0;
    
    for (const combo of sortedCombinations) {
      if (addedLooks >= maxCasualLooks) break;
      
      // Check if items are still available
      if (usedItemIds.has(combo.top.id) || usedItemIds.has(combo.bottom.id) || usedShoeIds.has(combo.shoes.name)) {
        continue;
      }
      
      console.log(`✅ [HIGH-QUALITY CASUAL] Score: ${combo.score}/100 - ${combo.top.product_name} + ${combo.bottom.product_name} + ${combo.shoes.name}`);
      debugInfo.outfit_logic.outfit_rules_applied.push(`ENHANCED_CASUAL_SCORE_${combo.score}`);
      
      const lookItems = [
        {
          id: combo.top.id,
          title: combo.top.product_name,
          description: this.enhanceItemDescription(combo.top, 'top', mood),
          image: this.normalizeImageField(combo.top.image, 'clothing'),
          price: combo.top.price ? `$${combo.top.price}` : '0',
          type: 'top'
        },
        {
          id: combo.bottom.id,
          title: combo.bottom.product_name,
          description: this.enhanceItemDescription(combo.bottom, 'bottom', mood),
          image: this.normalizeImageField(combo.bottom.image, 'clothing'),
          price: combo.bottom.price ? `$${combo.bottom.price}` : '0',
          type: 'bottom'
        },
        {
          id: combo.shoes.name,
          title: combo.shoes.name,
          description: this.enhanceItemDescription(combo.shoes, 'shoes', mood),
          image: combo.shoes.image,
          price: combo.shoes.price ? `$${combo.shoes.price}` : '0',
          type: 'shoes'
        }
      ];
      
      const look: Look = {
        id: `enhanced-casual-look-${looks.length + addedLooks}`,
        items: lookItems,
        description: this.generateEnhancedLookDescription(combo.top, combo.bottom, combo.shoes, mood),
        occasion: 'casual',
        style: this.determineStyleFromItems([combo.top, combo.bottom, combo.shoes]),
        mood: mood as any
      };
      
      looks.push(look);
      usedItemIds.add(combo.top.id);
      usedItemIds.add(combo.bottom.id);
      usedShoeIds.add(combo.shoes.name);
      addedLooks++;
    }
    
    console.log(`🎉 [ENHANCED CASUAL] Successfully created ${addedLooks} high-quality casual outfits`);
  }

  private async createCoordinatedFormalOutfits(
    categorizedItems: any, 
    shoes: ShoeItem[], 
    looks: Look[], 
    usedItemIds: Set<string>, 
    usedShoeIds: Set<string>, 
    debugInfo: DebugInfo,
    mood: string,
    budget: number,
    isUnlimited: boolean
  ) {
    await this.createCoordinatedCasualOutfits(categorizedItems, shoes, looks, usedItemIds, usedShoeIds, debugInfo, mood, budget, isUnlimited);
    debugInfo.outfit_logic.outfit_rules_applied.push('COORDINATED_FORMAL_PRIORITY_SHOES_TABLE');
  }

  private async createCoordinatedJumpsuitOutfits(
    jumpsuits: ZaraClothItem[], 
    shoes: ShoeItem[], 
    looks: Look[], 
    usedItemIds: Set<string>, 
    usedShoeIds: Set<string>, 
    debugInfo: DebugInfo,
    mood: string,
    budget: number,
    isUnlimited: boolean
  ) {
    console.log(`🤸 [COORDINATED JUMPSUIT] Creating jumpsuit outfits with shoes from "shoes" table`);
    
    const availableJumpsuits = jumpsuits.filter(jumpsuit => !usedItemIds.has(jumpsuit.id));
    const availableShoes = shoes.filter(shoe => !usedShoeIds.has(shoe.name));
    
    if (availableJumpsuits.length === 0 || availableShoes.length === 0) {
      return;
    }
    
    const jumpsuit = availableJumpsuits[0];
    
    if (!isUnlimited && jumpsuit.price > budget * 0.8) {
      return;
    }
    
    const coordinatingShoes = availableShoes.find(shoe => {
      const totalCost = jumpsuit.price + (shoe.price || 0);
      if (!isUnlimited && totalCost > budget) {
        return false;
      }
      
      return ColorCoordinationService.areColorsCompatible(
        jumpsuit.colour || 'unknown', 
        shoe.colour || shoe.color || 'unknown'
      );
    });
    
    if (!coordinatingShoes) {
      return;
    }
    
    console.log(`✅ [JUMPSUIT + SHOES TABLE] ${jumpsuit.product_name} + ${coordinatingShoes.name} (from shoes table)`);
    debugInfo.outfit_logic.outfit_rules_applied.push('COORDINATED_JUMPSUIT_SHOES_TABLE');
    
    const lookItems = [
      {
        id: jumpsuit.id,
        title: jumpsuit.product_name,
        description: jumpsuit.description || '',
        image: this.normalizeImageField(jumpsuit.image, 'clothing'),
        price: jumpsuit.price ? `$${jumpsuit.price}` : '0',
        type: 'jumpsuit'
      },
      {
        id: coordinatingShoes.name,
        title: coordinatingShoes.name,
        description: coordinatingShoes.description || '',
        image: coordinatingShoes.image,
        price: coordinatingShoes.price ? `$${coordinatingShoes.price}` : '0',
        type: 'shoes'
      }
    ];
    
    const look: Look = {
      id: `coordinated-jumpsuit-look-${looks.length}`,
      items: lookItems,
      description: `${jumpsuit.product_name} עם ${coordinatingShoes.name} מטבלת הנעליים`,
      occasion: 'general',
      style: 'modern',
      mood: mood as any
    };
    
    looks.push(look);
    usedItemIds.add(jumpsuit.id);
    usedShoeIds.add(coordinatingShoes.name);
  }

  private filterOutUnderwear(clothingItems: ZaraClothItem[], debugInfo: DebugInfo): ZaraClothItem[] {
    console.log(`🚫 [UNDERWEAR FILTER] Starting to filter ${clothingItems.length} items...`);
    
    const underwearKeywords = [
      'bra', 'briefs', 'underwear', 'panties', 'boxers', 'thong',
      'lingerie', 'underpants', 'bikini bottom', 'bralette',
      'bodysuit', 'camisole', 'slip', 'nightgown', 'nightdress',
      'תחתון', 'תחתונים', 'חזייה', 'בגד תחתון', 'תחתוני',
      'bodice', 'corset', 'bustier', 'strapless bra', 'push up bra',
      'sports bra', 'triangle bra', 'balconette', 'underwire'
    ];
    
    const filtered = clothingItems.filter(item => {
      const name = (item.product_name || '').toLowerCase();
      const subfamily = (item.product_subfamily || '').toLowerCase();
      const family = (item.product_family || '').toLowerCase();
      const description = (item.description || '').toLowerCase();
      const section = (item.section || '').toLowerCase();
      
      const searchText = `${name} ${subfamily} ${family} ${description} ${section}`;
      
      const isUnderwear = underwearKeywords.some(keyword => 
        searchText.includes(keyword)
      );
      
      if (isUnderwear) {
        console.log(`🚫 [FILTERED] Underwear: ${item.product_name} (${item.product_subfamily})`);
        return false;
      }
      
      return true;
    });
    
    debugInfo.filtering_steps.push({
      step: 'Filter Underwear',
      items_before: clothingItems.length,
      items_after: filtered.length,
      criteria: 'Remove all underwear, lingerie, and intimate apparel'
    });
    
    console.log(`✅ [UNDERWEAR FILTER] Filtered from ${clothingItems.length} to ${filtered.length} items`);
    return filtered;
  }

  private categorizeClothingItems(clothingItems: ZaraClothItem[], debugInfo: DebugInfo) {
    const categorized = {
      tops: [] as ZaraClothItem[],
      bottoms: [] as ZaraClothItem[],
      dresses: [] as ZaraClothItem[],
      jumpsuits: [] as ZaraClothItem[],
      outerwear: [] as ZaraClothItem[]
    };

    console.log(`🏷️ [CATEGORIZATION] Processing ${clothingItems.length} clothing items...`);

    for (const item of clothingItems) {
      let category = 'unknown';
      
      if (this.isDressItem(item)) {
        categorized.dresses.push(item);
        category = 'dress';
      } else if (this.isJumpsuitItem(item)) {
        categorized.jumpsuits.push(item);
        category = 'jumpsuit';
      } else if (this.isOuterwearItem(item)) {
        categorized.outerwear.push(item);
        category = 'outerwear';
      } else if (this.isTopItem(item)) {
        categorized.tops.push(item);
        category = 'top';
      } else if (this.isBottomItem(item)) {
        categorized.bottoms.push(item);
        category = 'bottom';
      }
      
      if (category !== 'unknown') {
        console.log(`🏷️ [ITEM] ${item.product_name} → ${category.toUpperCase()}`);
      }
    }

    debugInfo.categorization.tops = categorized.tops.length;
    debugInfo.categorization.bottoms = categorized.bottoms.length;
    debugInfo.categorization.dresses = categorized.dresses.length;
    debugInfo.categorization.jumpsuits = categorized.jumpsuits.length;
    debugInfo.categorization.outerwear = categorized.outerwear.length;
    
    console.log(`📊 [CATEGORIZATION] Tops: ${categorized.tops.length}, Bottoms: ${categorized.bottoms.length}, Dresses: ${categorized.dresses.length}, Jumpsuits: ${categorized.jumpsuits.length}, Outerwear: ${categorized.outerwear.length}`);
    
    return categorized;
  }

  private categorizeShoesByType(shoes: ShoeItem[]): { [key: string]: ShoeItem[] } {
    const categories = {
      heels: [] as ShoeItem[],
      boots: [] as ShoeItem[],
      sneakers: [] as ShoeItem[],
      sandals: [] as ShoeItem[],
      loafers: [] as ShoeItem[],
      flats: [] as ShoeItem[],
      other: [] as ShoeItem[]
    };

    shoes.forEach(shoe => {
      const name = shoe.name?.toLowerCase() || '';
      const description = shoe.description?.toLowerCase() || '';
      const breadcrumbs = JSON.stringify(shoe.breadcrumbs || {}).toLowerCase();
      const searchText = `${name} ${description} ${breadcrumbs}`;

      if (searchText.includes('heel') || searchText.includes('stiletto') || searchText.includes('pump')) {
        categories.heels.push(shoe);
      } else if (searchText.includes('boot') || searchText.includes('ankle boot') || searchText.includes('knee boot')) {
        categories.boots.push(shoe);
      } else if (searchText.includes('sneaker') || searchText.includes('trainer') || searchText.includes('athletic')) {
        categories.sneakers.push(shoe);
      } else if (searchText.includes('sandal') || searchText.includes('flip flop') || searchText.includes('slide')) {
        categories.sandals.push(shoe);
      } else if (searchText.includes('loafer') || searchText.includes('oxford') || searchText.includes('derby')) {
        categories.loafers.push(shoe);
      } else if (searchText.includes('flat') || searchText.includes('ballet') || searchText.includes('slip on')) {
        categories.flats.push(shoe);
      } else {
        categories.other.push(shoe);
      }
    });

    return categories;
  }

  private selectShoesForEvent(categorizedShoes: { [key: string]: ShoeItem[] }, eventType: string): ShoeItem[] {
    console.log(`👠 [SHOE SELECTION] Selecting shoes from "shoes" table for event: ${eventType}`);
    
    let selectedShoes: ShoeItem[] = [];
    
    if (eventType === 'evening' || eventType === 'formal') {
      selectedShoes = [
        ...categorizedShoes.heels,
        ...categorizedShoes.boots.filter(boot => this.isLeatherBoot(boot)),
        ...categorizedShoes.loafers,
        ...categorizedShoes.other
      ];
    } else if (eventType === 'work' || eventType === 'business') {
      selectedShoes = [
        ...categorizedShoes.loafers,
        ...categorizedShoes.heels,
        ...categorizedShoes.boots,
        ...categorizedShoes.flats
      ];
    } else {
      selectedShoes = [
        ...categorizedShoes.sneakers,
        ...categorizedShoes.flats,
        ...categorizedShoes.sandals,
        ...categorizedShoes.other
      ];
    }
    
    console.log(`👠 [SHOES FROM "SHOES" TABLE] Selected ${selectedShoes.length} appropriate shoes for ${eventType}`);
    return selectedShoes;
  }

  private isLeatherBoot(shoe: ShoeItem): boolean {
    const searchText = `${shoe.name} ${shoe.description}`.toLowerCase();
    return searchText.includes('leather') || searchText.includes('suede');
  }

  private normalizeImageField(image: any, itemType: string = 'clothing'): string {
    if (!image) {
      return '/placeholder.svg';
    }
    
    if (itemType === 'shoes') {
      return this.extractShoesImageUrl(image);
    }
    
    if (typeof image === 'string') {
      return image;
    }
    
    if (Array.isArray(image) && image.length > 0) {
      return typeof image[0] === 'string' ? image[0] : '';
    }
    
    if (typeof image === 'object') {
      if (image.url) return image.url;
      if (image.src) return image.src;
      if (image.href) return image.href;
    }
    
    return '/placeholder.svg';
  }

  private extractShoesImageUrl(imageData: any): string {
    if (!imageData) {
      return '/placeholder.svg';
    }
    
    let imageUrls: string[] = [];
    
    if (typeof imageData === 'string') {
      const trimmed = imageData.trim();
      
      if (trimmed.startsWith('http') && (trimmed.includes('.jpg') || trimmed.includes('.png') || trimmed.includes('.jpeg'))) {
        return trimmed;
      }
      
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          imageUrls = parsed.filter(url => typeof url === 'string');
        }
      } catch {
        imageUrls = [trimmed];
      }
    }
    
    else if (Array.isArray(imageData)) {
      imageUrls = imageData.filter(url => typeof url === 'string');
    }
    
    else if (typeof imageData === 'object') {
      if (imageData.url) imageUrls = [imageData.url];
      else if (imageData.src) imageUrls = [imageData.src];
    }
    
    const validUrl = imageUrls.find(url => 
      url && 
      url.includes('http') && 
      (url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg'))
    );
    
    return validUrl || '/placeholder.svg';
  }

  private isValidImagePattern(imageData: any, itemType: string = 'clothing'): boolean {
    if (!imageData) {
      console.log('🔍 [DEBUG] No image data provided');
      return false;
    }
    
    // Handle different image data formats for clothing
    let imageUrls: string[] = [];
    
    if (typeof imageData === 'string') {
      // Handle JSON string arrays like "[\"https://static.zara.net/photos/...jpg\"]"
      try {
        const parsed = JSON.parse(imageData);
        if (Array.isArray(parsed)) {
          imageUrls = parsed.filter(url => typeof url === 'string');
          console.log(`🔍 [DEBUG] Parsed JSON array with ${imageUrls.length} URLs`);
        } else {
          imageUrls = [imageData];
          console.log(`🔍 [DEBUG] Using string directly: ${imageData}`);
        }
      } catch {
        imageUrls = [imageData];
        console.log(`🔍 [DEBUG] Failed to parse JSON, using string directly: ${imageData}`);
      }
    } else if (Array.isArray(imageData)) {
      imageUrls = imageData.filter(url => typeof url === 'string');
      console.log(`🔍 [DEBUG] Using array with ${imageUrls.length} URLs`);
    } else if (typeof imageData === 'object' && imageData.url) {
      imageUrls = [imageData.url];
      console.log(`🔍 [DEBUG] Using URL from object: ${imageData.url}`);
    } else {
      console.log(`🔍 [DEBUG] Unknown image data format:`, typeof imageData, imageData);
      return false;
    }
    
    // Check if any URL contains pattern _6_x_1.jpg or higher (6th image and up, without model)
    const hasValidPattern = imageUrls.some(url => /_[6-9]_\d+_1\.jpg/.test(url));
    
    console.log(`🔍 [DEBUG] Found ${imageUrls.length} URLs, has valid no-model pattern (6th+ image): ${hasValidPattern}`);
    if (hasValidPattern) {
      const validUrl = imageUrls.find(url => /_[6-9]_\d+_1\.jpg/.test(url));
      console.log(`🔍 [DEBUG] Valid no-model URL found: ${validUrl}`);
    } else {
      console.log(`🔍 [DEBUG] NO valid no-model pattern found in URLs:`, imageUrls);
    }
    
    return hasValidPattern;
  }

  private selectProfessionalOutfit(
    clothingItems: ZaraClothItem[],
    shoesItems: ShoeItem[],
    budget: number
  ): { top?: ZaraClothItem; bottom?: ZaraClothItem; shoes?: ShoeItem } {
    console.log(`💼 [PROFESSIONAL OUTFIT] Selecting items with budget: $${budget}`);
    console.log(`📊 [ITEM SOURCES] Clothing: ${clothingItems.length} (zara_cloth), Shoes: ${shoesItems.length} (shoes table)`);
    
    // Filter clothing for tops and bottoms
    const tops = clothingItems.filter(item => this.isTopItem(item));
    const bottoms = clothingItems.filter(item => this.isBottomItem(item));
    
    // Use ONLY shoes from the shoes table with valid images
    const availableShoes = shoesItems.filter(shoe => 
      shoe.availability === 'in stock' && 
      (shoe.price || 0) <= budget * 0.4 &&
      shoe.image !== '/placeholder.svg'
    );
    
    console.log(`[DEBUG] Available items - tops: ${tops.length}, bottoms: ${bottoms.length}, shoes with valid images: ${availableShoes.length}/${shoesItems.length}`);
    
    if (tops.length === 0 || bottoms.length === 0 || availableShoes.length === 0) {
      console.log(`[DEBUG] Missing items - tops: ${tops.length}, bottoms: ${bottoms.length}, shoes: ${availableShoes.length}`);
      return {};
    }
    
    // Select items within budget
    const selectedTop = tops.find(item => item.price <= budget * 0.35);
    const selectedBottom = bottoms.find(item => item.price <= budget * 0.35);
    const selectedShoes = availableShoes[0]; // Take first available shoes with valid image from shoes table
    
    if (!selectedTop || !selectedBottom || !selectedShoes) {
      console.log(`[DEBUG] Could not find suitable items within budget`);
      return {};
    }
    
    const totalCost = selectedTop.price + selectedBottom.price + (selectedShoes.price || 0);
    if (totalCost > budget) {
      console.log(`[DEBUG] Total cost $${totalCost} exceeds budget $${budget}`);
      return {};
    }
    
    console.log(`✅ [PROFESSIONAL OUTFIT] Selected: ${selectedTop.product_name} (zara_cloth) + ${selectedBottom.product_name} (zara_cloth) + ${selectedShoes.name} (shoes table)`);
    
    return {
      top: selectedTop,
      bottom: selectedBottom,
      shoes: selectedShoes
    };
  }

  private validateOutfitComposition(items: any[]): { isValid: boolean; score: number; reason: string } {
    const itemTypes = items.map(item => item.type);
    const hasDress = itemTypes.includes('dress');
    const hasJumpsuit = itemTypes.includes('jumpsuit');
    const hasTop = itemTypes.includes('top');
    const hasBottom = itemTypes.includes('bottom');
    const hasShoes = itemTypes.includes('shoes');
    const hasOuterwear = itemTypes.includes('outerwear');

    console.log(`🔍 [StylingAgent] Validating outfit: ${itemTypes.join(', ')}`);

    // CRITICAL RULE: Every outfit must have shoes
    if (!hasShoes) {
      return {
        isValid: false,
        score: 0,
        reason: 'חסרות נעליים - תלבושת לא תקינה'
      };
    }

    // RULE 1: Dress outfits (שמלה + נעליים = 2 פריטים)
    if (hasDress) {
      // Dress CANNOT be with top, bottom, or jumpsuit
      if (hasTop || hasBottom || hasJumpsuit) {
        return {
          isValid: false,
          score: 0,
          reason: 'שמלה לא יכולה להיות עם חולצה, מכנסיים או אוברול'
        };
      }
      
      // Valid dress outfits: dress + shoes (2 items) OR dress + shoes + outerwear (3 items)
      const validItems = hasOuterwear ? 3 : 2;
      if (items.length === validItems) {
        return {
          isValid: true,
          score: 100,
          reason: hasOuterwear ? 'שמלה עם נעליים ומעיל - תקין' : 'שמלה עם נעליים - תקין'
        };
      }
      
      return {
        isValid: false,
        score: 0,
        reason: `שמלה צריכה ${validItems} פריטים בלבד`
      };
    }

    // RULE 2: Jumpsuit outfits (אוברול + נעליים = 2 פריטים)
    if (hasJumpsuit) {
      // Jumpsuit CANNOT be with top, bottom, or dress
      if (hasTop || hasBottom || hasDress) {
        return {
          isValid: false,
          score: 0,
          reason: 'אוברול לא יכול להיות עם חולצה, מכנסיים או שמלה'
        };
      }
      
      // Valid jumpsuit outfits: jumpsuit + shoes (2 items) OR jumpsuit + shoes + outerwear (3 items)
      const validItems = hasOuterwear ? 3 : 2;
      if (items.length === validItems) {
        return {
          isValid: true,
          score: 100,
          reason: hasOuterwear ? 'אוברול עם נעליים ומעיל - תקין' : 'אוברול עם נעליים - תקין'
        };
      }
      
      return {
        isValid: false,
        score: 0,
        reason: `אוברול צריך ${validItems} פריטים בלבד`
      };
    }

    // RULE 3: Regular outfits MUST have EXACTLY 1 top + 1 bottom + 1 shoes (3 items) 
    // OR EXACTLY 1 top + 1 bottom + 1 shoes + 1 outerwear (4 items)
    if (!hasTop) {
      return {
        isValid: false,
        score: 0,
        reason: 'חסר חלק עליון'
      };
    }
    
    if (!hasBottom) {
      return {
        isValid: false,
        score: 0,
        reason: 'חסר חלק תחתון'
      };
    }

    // Count items of each type to ensure exactly 1 of each
    const topCount = itemTypes.filter(type => type === 'top').length;
    const bottomCount = itemTypes.filter(type => type === 'bottom').length;
    const shoesCount = itemTypes.filter(type => type === 'shoes').length;
    const outerwearCount = itemTypes.filter(type => type === 'outerwear').length;

    if (topCount !== 1) {
      return {
        isValid: false,
        score: 0,
        reason: `צריך בדיוק חלק עליון אחד, נמצא ${topCount}`
      };
    }

    if (bottomCount !== 1) {
      return {
        isValid: false,
        score: 0,
        reason: `צריך בדיוק חלק תחתון אחד, נמצא ${bottomCount}`
      };
    }

    if (shoesCount !== 1) {
      return {
        isValid: false,
        score: 0,
        reason: `צריך בדיוק זוג נעליים אחד, נמצא ${shoesCount}`
      };
    }

    if (hasOuterwear && outerwearCount !== 1) {
      return {
        isValid: false,
        score: 0,
        reason: `צריך בדיוק מעיל אחד, נמצא ${outerwearCount}`
      };
    }

    // Valid regular outfits: 3 items (top+bottom+shoes) OR 4 items (top+bottom+shoes+outerwear)
    const expectedItems = hasOuterwear ? 4 : 3;
    if (items.length === expectedItems) {
      return {
        isValid: true,
        score: 95,
        reason: hasOuterwear ? 'תלבושת מלאה עם מעיל - תקינה' : 'תלבושת תקינה - 3 פריטים'
      };
    }

    return {
      isValid: false,
      score: 0,
      reason: `תלבושת צריכה ${expectedItems} פריטים בדיוק, נמצא ${items.length}`
    };
  }

  private isTopItem(item: any): boolean {
    const subfamily = item.product_subfamily?.toLowerCase() || '';
    const name = (item.product_name || item.name || '').toLowerCase();
    const family = item.product_family?.toLowerCase() || '';
    
    const excludeKeywords = [
      'dress', 'שמלה', 'gown', 'frock',
      'jumpsuit', 'אוברול', 'overall', 'romper',
      'pants', 'trousers', 'jeans', 'shorts', 'skirt', 'leggings',
      'מכנס', 'מכנסיים', 'ג\'ינס', 'שורט', 'חצאית', 'לגינס',
      'bra', 'briefs', 'underwear', 'panties', 'lingerie', 'תחתון'
    ];
    
    const isExcluded = excludeKeywords.some(keyword => 
      subfamily.includes(keyword) || name.includes(keyword) || family.includes(keyword)
    );
    
    if (isExcluded) {
      return false;
    }
    
    const topKeywords = [
      'shirt', 'blouse', 't-shirt', 'top', 'tee',
      'sweater', 'cardigan', 'pullover', 'jumper',
      'tank', 'vest', 'hoodie',
      'חולצה', 'טופ', 'סוודר', 'קרדיגן'
    ];
    
    return topKeywords.some(keyword => 
      subfamily.includes(keyword) || 
      name.includes(keyword) || 
      family.includes(keyword)
    );
  }

  private isBottomItem(item: any): boolean {
    const subfamily = item.product_subfamily?.toLowerCase() || '';
    const name = (item.product_name || item.name || '').toLowerCase();
    const family = item.product_family?.toLowerCase() || '';
    
    const excludeKeywords = [
      'dress', 'שמלה', 'gown', 'frock',
      'jumpsuit', 'אוברול', 'overall', 'romper',
      'bra', 'briefs', 'underwear', 'panties', 'boxers',
      'lingerie', 'underpants', 'thong', 'bikini bottom',
      'תחתון', 'תחתונים', 'חזייה', 'בגד תחתון'
    ];
    
    const isExcluded = excludeKeywords.some(keyword => 
      subfamily.includes(keyword) || name.includes(keyword) || family.includes(keyword)
    );
    
    if (isExcluded) {
      return false;
    }
    
    const bottomKeywords = [
      'pants', 'trousers', 'jeans', 'shorts',
      'skirt', 'leggings', 'joggers', 'chinos',
      'מכנס', 'מכנסיים', 'ג\'ינס', 'שורט',
      'חצאית', 'לגינס'
    ];
    
    return bottomKeywords.some(keyword => 
      subfamily.includes(keyword) || 
      name.includes(keyword) || 
      family.includes(keyword)
    );
  }

  private isDressItem(item: any): boolean {
    const subfamily = item.product_subfamily?.toLowerCase() || '';
    const name = (item.product_name || '').toLowerCase();
    const family = item.product_family?.toLowerCase() || '';
    
    const dressKeywords = [
      'dress', 'שמלה', 'gown', 'frock',
      'maxi dress', 'mini dress', 'midi dress',
      'cocktail dress', 'evening dress'
    ];
    
    return dressKeywords.some(keyword => 
      subfamily.includes(keyword) || 
      name.includes(keyword) || 
      family.includes(keyword)
    );
  }

  private isJumpsuitItem(item: any): boolean {
    const subfamily = item.product_subfamily?.toLowerCase() || '';
    const name = (item.product_name || '').toLowerCase();
    const family = item.product_family?.toLowerCase() || '';
    
    const jumpsuitKeywords = [
      'jumpsuit', 'אוברול', 'overall', 'romper',
      'playsuit', 'coverall', 'boilersuit'
    ];
    
    return jumpsuitKeywords.some(keyword => 
      subfamily.includes(keyword) || 
      name.includes(keyword) || 
      family.includes(keyword)
    );
  }

  private isOuterwearItem(item: any): boolean {
    const subfamily = item.product_subfamily?.toLowerCase() || '';
    const name = (item.product_name || '').toLowerCase();
    const family = item.product_family?.toLowerCase() || '';
    
    const outerwearKeywords = [
      'coat', 'jacket', 'blazer', 'cardigan',
      'מעיל', 'ג\'קט', 'בלייזר',
      'bomber', 'parka', 'trench', 'windbreaker',
      'denim jacket', 'leather jacket'
    ];
    
    return outerwearKeywords.some(keyword => 
      subfamily.includes(keyword) || 
      name.includes(keyword) || 
      family.includes(keyword)
    );
  }

  /**
   * Generate all possible outfit combinations for better selection
   */
  private generateOutfitCombinations(
    tops: ZaraClothItem[], 
    bottoms: ZaraClothItem[], 
    shoes: ShoeItem[], 
    mood: string,
    budget: number,
    isUnlimited: boolean
  ): Array<{top: ZaraClothItem, bottom: ZaraClothItem, shoes: ShoeItem}> {
    const combinations = [];
    
    for (const top of tops.slice(0, 5)) { // Limit to first 5 tops for performance
      for (const bottom of bottoms.slice(0, 5)) { // Limit to first 5 bottoms
        for (const shoe of shoes.slice(0, 3)) { // Limit to first 3 shoes
          const totalCost = top.price + bottom.price + (shoe.price || 0);
          
          // Skip if over budget
          if (!isUnlimited && totalCost > budget) {
            continue;
          }
          
          // Check basic color compatibility
          const topBottomCompatible = ColorCoordinationService.areColorsCompatible(
            top.colour || 'unknown', 
            bottom.colour || 'unknown'
          );
          
          const topShoeCompatible = ColorCoordinationService.areColorsCompatible(
            top.colour || 'unknown', 
            shoe.colour || shoe.color || 'unknown'
          );
          
          if (topBottomCompatible && topShoeCompatible) {
            combinations.push({ top, bottom, shoes: shoe });
          }
        }
      }
    }
    
    return combinations;
  }

  /**
   * Score an outfit combination based on multiple factors
   */
  private scoreOutfitCombination(
    combo: {top: ZaraClothItem, bottom: ZaraClothItem, shoes: ShoeItem}, 
    mood: string
  ): number {
    let score = 60; // Base score
    
    // Color coordination score (30 points max)
    const items = [
      { colour: combo.top.colour, type: 'top' },
      { colour: combo.bottom.colour, type: 'bottom' },
      { colour: combo.shoes.colour || combo.shoes.color, type: 'shoes' }
    ];
    
    const coordinationScore = ColorCoordinationService.scoreOutfitCoordination(items, mood);
    score += Math.min(30, coordinationScore * 0.3);
    
    // Mood alignment (15 points max)
    const moodColors = ColorCoordinationService.getColorsForMood(mood);
    const itemColors = [combo.top.colour, combo.bottom.colour, combo.shoes.colour || combo.shoes.color];
    const moodMatch = itemColors.some(color => 
      moodColors.some(moodColor => 
        ColorCoordinationService.areColorsCompatible(color || 'unknown', moodColor)
      )
    );
    if (moodMatch) score += 15;
    
    // Price balance (5 points max) - reward balanced pricing
    const totalPrice = combo.top.price + combo.bottom.price + (combo.shoes.price || 0);
    const priceBalance = Math.abs(combo.top.price - combo.bottom.price) / Math.max(combo.top.price, combo.bottom.price);
    if (priceBalance < 0.5) score += 5; // Bonus for balanced pricing
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Enhance item descriptions with mood-appropriate styling tips
   */
  private enhanceItemDescription(item: any, itemType: string, mood: string): string {
    const baseDescription = item.description || item.product_name || item.name || '';
    
    const moodTips: Record<string, Record<string, string>> = {
      elegant: {
        top: 'מושלם למראה אלגנטי ומעודן',
        bottom: 'יוצר קו נקי ומחמיא',
        shoes: 'מעניק גימור מעודן למראה'
      },
      energized: {
        top: 'מוסיף אנרגיה ותוסס למראה',
        bottom: 'נוח ודינמי לכל יום',
        shoes: 'נעליים שמתאימות לאורח חיים פעיל'
      },
      romantic: {
        top: 'רך ונשי למראה רומנטי',
        bottom: 'יוצר צללית חיננית ומחמיאה',
        shoes: 'מוסיף נגיעה רכה ונשית'
      },
      casual: {
        top: 'נוח וסטייליש לחיי היומיום',
        bottom: 'מתאים לכל הזדמנות',
        shoes: 'נוח וטרנדי'
      }
    };
    
    const tip = moodTips[mood]?.[itemType] || 'פריט איכותי ומתאים';
    return `${baseDescription}. ${tip}`;
  }

  /**
   * Generate enhanced look descriptions
   */
  private generateEnhancedLookDescription(
    top: ZaraClothItem, 
    bottom: ZaraClothItem, 
    shoes: ShoeItem, 
    mood: string
  ): string {
    const moodDescriptions: Record<string, string> = {
      elegant: 'מראה אלגנטי ומעודן',
      energized: 'לוק אנרגטי ותוסס',
      romantic: 'מראה רומנטי וחיננית',
      casual: 'סטייל נוח וקל',
      powerful: 'מראה חזק ובטוח',
      calm: 'לוק רגוע ומאוזן'
    };
    
    const moodDesc = moodDescriptions[mood] || 'מראה מתאים';
    
    return `${moodDesc} המשלב ${top.product_name} עם ${bottom.product_name} ו${shoes.name}. הצבעים משתלבים יפה יחד ויוצרים הרמוניה חזותית.`;
  }

  /**
   * Determine style based on the items in the outfit
   */
  private determineStyleFromItems(items: Array<ZaraClothItem | ShoeItem>): string {
    const names = items.map(item => 
      ((item as ZaraClothItem).product_name || (item as ShoeItem).name || '').toLowerCase()
    );
    
    const allText = names.join(' ');
    
    if (allText.includes('elegant') || allText.includes('formal') || allText.includes('blazer')) {
      return 'elegant';
    }
    if (allText.includes('sport') || allText.includes('athletic') || allText.includes('sneaker')) {
      return 'sporty';
    }
    if (allText.includes('romantic') || allText.includes('floral') || allText.includes('lace')) {
      return 'romantic';
    }
    if (allText.includes('minimal') || allText.includes('clean') || allText.includes('simple')) {
      return 'minimalist';
    }
    
    return 'casual'; // Default style
  }

  /**
   * Score a dress for appropriateness to an event
   */
  private scoreDressForEvent(
    dress: ZaraClothItem, 
    eventType: string, 
    mood: string, 
    budget: number, 
    isUnlimited: boolean
  ): number {
    let score = 50; // Base score
    
    const dressName = (dress.product_name || '').toLowerCase();
    const dressColor = (dress.colour || '').toLowerCase();
    
    // Event appropriateness (30 points max)
    if (eventType === 'evening' || eventType === 'formal') {
      if (dressName.includes('maxi') || dressName.includes('long') || dressName.includes('gown')) score += 25;
      if (dressName.includes('sequin') || dressName.includes('satin') || dressName.includes('silk')) score += 20;
      if (dressColor.includes('black') || dressColor.includes('navy') || dressColor.includes('burgundy')) score += 15;
    } else if (eventType === 'work' || eventType === 'business') {
      if (dressName.includes('midi') || dressName.includes('knee') || dressName.includes('shift')) score += 25;
      if (dressColor.includes('black') || dressColor.includes('navy') || dressColor.includes('gray')) score += 20;
      if (dressName.includes('blazer') || dressName.includes('professional')) score += 15;
    } else { // casual
      if (dressName.includes('mini') || dressName.includes('casual') || dressName.includes('shirt')) score += 25;
      if (dressName.includes('cotton') || dressName.includes('jersey') || dressName.includes('knit')) score += 20;
    }
    
    // Mood alignment (20 points max)
    const moodColors = ColorCoordinationService.getColorsForMood(mood);
    const moodMatch = moodColors.some(moodColor => 
      ColorCoordinationService.areColorsCompatible(dressColor, moodColor)
    );
    if (moodMatch) score += 20;
    
    // Budget consideration (20 points max)
    if (isUnlimited) {
      score += 20;
    } else {
      const budgetRatio = dress.price / (budget * 0.8);
      if (budgetRatio <= 0.6) score += 20;
      else if (budgetRatio <= 0.8) score += 15;
      else if (budgetRatio <= 1.0) score += 10;
      else score -= 20; // Over budget penalty
    }
    
    // Quality indicators (10 points max)
    if (dressName.includes('premium') || dressName.includes('luxury')) score += 10;
    if (dress.description && dress.description.length > 50) score += 5; // Good description
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Calculate compatibility between dress and shoes
   */
  private calculateDressShoeCompatibility(
    dress: ZaraClothItem, 
    shoe: ShoeItem, 
    eventType: string, 
    mood: string, 
    budget: number, 
    isUnlimited: boolean
  ): number {
    let compatibility = 50; // Base compatibility
    
    const dressName = (dress.product_name || '').toLowerCase();
    const shoeName = (shoe.name || '').toLowerCase();
    const dressColor = (dress.colour || '').toLowerCase();
    const shoeColor = (shoe.colour || shoe.color || '').toLowerCase();
    
    // Color coordination (30 points max)
    if (ColorCoordinationService.areColorsCompatible(dressColor, shoeColor)) {
      compatibility += 30;
    } else if (this.areNeutralColors(dressColor, shoeColor)) {
      compatibility += 20; // Neutral colors often work
    }
    
    // Style coordination (25 points max)
    if (eventType === 'evening' || eventType === 'formal') {
      if (shoeName.includes('heel') || shoeName.includes('pump') || shoeName.includes('stiletto')) {
        compatibility += 25;
      } else if (shoeName.includes('boot') && shoeName.includes('ankle')) {
        compatibility += 15;
      }
    } else if (eventType === 'work' || eventType === 'business') {
      if (shoeName.includes('loafer') || shoeName.includes('oxford') || shoeName.includes('heel')) {
        compatibility += 25;
      } else if (shoeName.includes('flat') || shoeName.includes('pump')) {
        compatibility += 20;
      }
    } else { // casual
      if (shoeName.includes('sneaker') || shoeName.includes('flat') || shoeName.includes('sandal')) {
        compatibility += 25;
      } else if (shoeName.includes('boot') || shoeName.includes('loafer')) {
        compatibility += 15;
      }
    }
    
    // Budget consideration (15 points max)
    const totalCost = dress.price + (shoe.price || 0);
    if (isUnlimited) {
      compatibility += 15;
    } else if (totalCost <= budget) {
      compatibility += 15;
    } else if (totalCost <= budget * 1.1) {
      compatibility += 10;
    } else {
      compatibility -= 20; // Over budget penalty
    }
    
    // Mood alignment (10 points max)
    const moodColors = ColorCoordinationService.getColorsForMood(mood);
    const shoeMatchesMood = moodColors.some(moodColor => 
      ColorCoordinationService.areColorsCompatible(shoeColor, moodColor)
    );
    if (shoeMatchesMood) compatibility += 10;
    
    return Math.min(100, Math.max(0, Math.round(compatibility)));
  }

  /**
   * Generate enhanced description for dress outfits
   */
  private generateEnhancedDressDescription(
    dress: ZaraClothItem, 
    shoes: ShoeItem, 
    eventType: string, 
    mood: string
  ): string {
    const eventDescriptions: Record<string, string> = {
      evening: 'מראה ערב אלגנטי ומרשים',
      formal: 'לוק פורמלי ומעודן',
      work: 'מראה מקצועי ובטוח',
      business: 'סטייל עסקי אלגנטי',
      casual: 'מראה נוח וסטייליש',
      weekend: 'לוק סוף שבוע רגוע'
    };
    
    const moodDescriptions: Record<string, string> = {
      elegant: 'אלגנטי ומעודן',
      romantic: 'רומנטי וחיננית',
      powerful: 'חזק ובטוח',
      energized: 'אנרגטי ותוסס',
      calm: 'רגוע ומאוזן'
    };
    
    const eventDesc = eventDescriptions[eventType] || 'מראה מתאים';
    const moodDesc = moodDescriptions[mood] || '';
    
    return `${eventDesc} המשלב ${dress.product_name} עם ${shoes.name}. ${moodDesc ? `המראה ${moodDesc} ו` : ''}מתאים במיוחד ל${eventType}. הצבעים והסגנון יוצרים הרמוניה מושלמת.`;
  }

  /**
   * Determine dress style from its characteristics
   */
  private determineDressStyle(dress: ZaraClothItem): string {
    const dressName = (dress.product_name || '').toLowerCase();
    const dressDesc = (dress.description || '').toLowerCase();
    
    const allText = `${dressName} ${dressDesc}`;
    
    if (allText.includes('maxi') || allText.includes('gown') || allText.includes('evening')) {
      return 'elegant';
    }
    if (allText.includes('mini') || allText.includes('casual') || allText.includes('shirt dress')) {
      return 'casual';
    }
    if (allText.includes('floral') || allText.includes('romantic') || allText.includes('lace')) {
      return 'romantic';
    }
    if (allText.includes('midi') || allText.includes('work') || allText.includes('professional')) {
      return 'classic';
    }
    if (allText.includes('minimal') || allText.includes('clean') || allText.includes('simple')) {
      return 'minimalist';
    }
    
    return 'elegant'; // Default for dresses
  }

  /**
   * Check if colors are neutral and likely to work together
   */
  private areNeutralColors(color1: string, color2: string): boolean {
    const neutrals = ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'tan', 'cream', 'nude'];
    
    const isColor1Neutral = neutrals.some(neutral => color1.includes(neutral));
    const isColor2Neutral = neutrals.some(neutral => color2.includes(neutral));
    
    return isColor1Neutral || isColor2Neutral;
  }

  // Legacy method for backward compatibility
  async createOutfits(request: StylingRequest): Promise<StylingResult> {
    const debugInfo: DebugInfo = {
      filters_applied: [],
      raw_data: { clothing_fetched: 0, shoes_fetched: 0, clothing_available: 0, shoes_available: 0, underwear_filtered: 0 },
      categorization: { tops: 0, bottoms: 0, dresses: 0, jumpsuits: 0, outerwear: 0, shoes_with_valid_images: 0 },
      filtering_steps: [],
      items_selected: {},
      logic_notes: ['Using legacy createOutfits method'],
      performance: { total_time_ms: 0 },
      outfit_logic: {
        event_type: 'legacy',
        outfit_rules_applied: ['LEGACY_METHOD'],
        selected_combination: 'legacy',
        item_sources: {}
      }
    };
    
    return { looks: [], reasoning: 'Legacy method - use run() instead', debugInfo };
  }
}

export const stylingAgent = new StylingAgentClass();
