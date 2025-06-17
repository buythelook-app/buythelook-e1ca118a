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
  goal = "Create fashionable and appropriate outfit combinations based on user preferences, budget, mood, and color coordination";
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

    console.log(`🎯 [StylingAgent] Starting ENHANCED outfit generation with ALL FILTERS for user: ${userId}`);
    
    try {
      // Get user preferences from localStorage
      const styleData = localStorage.getItem('styleAnalysis');
      const currentMood = localStorage.getItem('current-mood') || 'elegant';
      const currentEvent = localStorage.getItem('current-event') || 'casual';
      
      // 🆕 GET BUDGET FROM FILTERS
      const budgetData = this.getBudgetFromFilters();
      const budget = budgetData.budget;
      const isUnlimited = budgetData.isUnlimited;
      
      console.log(`💰 [BUDGET FILTER] Budget: ${isUnlimited ? 'UNLIMITED' : `$${budget}`}`);
      debugInfo.filters_applied.push('BUDGET_FILTER');
      debugInfo.logic_notes.push(`Budget applied: ${isUnlimited ? 'UNLIMITED' : `$${budget}`}`);
      
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
      
      debugInfo.filters_applied.push('bodyShape', 'mood', 'style', 'event', 'NO_UNDERWEAR', 'COLOR_COORDINATION', 'FABRIC_MATCHING');
      debugInfo.logic_notes.push(`Enhanced profile: bodyShape=${bodyShape}, style=${style}, mood=${currentMood}, event=${currentEvent}, budget=${isUnlimited ? 'unlimited' : budget}`);
      debugInfo.outfit_logic.event_type = currentEvent;
      
      console.log(`🎭 [ENHANCED LOGIC] Event: ${currentEvent}, Style: ${style}, Mood: ${currentMood}, Budget: ${isUnlimited ? 'unlimited' : budget}`);
      
      // Fetch from dual sources
      const { supabase } = await import('../lib/supabaseClient');
      
      console.log(`🔍 [DEBUG] Fetching from DUAL SOURCES with BUDGET FILTER...`);
      
      // 🆕 BUDGET-FILTERED QUERIES
      let clothingQuery = supabase
        .from('zara_cloth')
        .select('*')
        .eq('availability', true);
        
      let shoesQuery = supabase
        .from('shoes')
        .select('*')
        .eq('availability', 'in stock');
      
      // Apply budget filter if not unlimited
      if (!isUnlimited && budget > 0) {
        clothingQuery = clothingQuery.lte('price', budget * 0.7); // 70% of budget for clothing
        shoesQuery = shoesQuery.lte('price', budget * 0.3); // 30% of budget for shoes
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
        debugInfo.logic_notes.push(`ERROR: Failed to fetch shoes - ${shoesError?.message}`);
        return {
          success: false,
          error: 'Failed to fetch available shoes from shoes table',
          debugInfo
        };
      }

      debugInfo.raw_data.clothing_fetched = allClothingRaw.length;
      debugInfo.raw_data.shoes_fetched = allShoesRaw.length;
      
      // Filter out underwear and apply mood-based color filtering
      const allClothing = this.filterClothingByMoodAndBudget(
        this.filterOutUnderwear(allClothingRaw, debugInfo), 
        currentMood, 
        budget, 
        isUnlimited, 
        debugInfo
      );
      
      debugInfo.raw_data.clothing_available = allClothing.length;
      debugInfo.raw_data.underwear_filtered = allClothingRaw.length - allClothing.length;
      
      console.log(`🚫 [UNDERWEAR + MOOD FILTER] Removed ${debugInfo.raw_data.underwear_filtered} items`);
      console.log(`✅ [FILTERED CLOTHING] ${allClothing.length} mood-appropriate, budget-friendly items remain`);

      // Transform and filter shoes
      const allShoes: ShoeItem[] = allShoesRaw.map(shoe => ({
        ...shoe,
        image: shoe.url || '/placeholder.svg',
        price: shoe.price || 0,
        colour: shoe.color || shoe.colour || 'unknown'
      }));
      
      // 🆕 FILTER SHOES BY MOOD COLORS
      const filteredShoes = this.filterShoesByMood(allShoes, currentMood, debugInfo);
      debugInfo.raw_data.shoes_available = filteredShoes.length;
      
      console.log(`👠 [MOOD FILTER] Filtered shoes from ${allShoes.length} to ${filteredShoes.length} mood-appropriate pairs`);
      
      // Create enhanced styling request
      const request: StylingRequest = {
        bodyStructure: bodyShape as any,
        mood: currentMood,
        style: style as any,
        event: currentEvent,
        availableItems: []
      };
      
      debugInfo.logic_notes.push(`Enhanced StylingRequest: ${JSON.stringify(request)}`);
      
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
      
      console.log(`✅ [ENHANCED STYLING COMPLETE] Created ${result.looks.length} COORDINATED outfits with mood, budget, and color matching`);
      
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
      
      console.error('❌ [StylingAgent] Error in enhanced outfit generation:', error);
      
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
      // Budget check (if not unlimited)
      if (!isUnlimited && item.price > budget * 0.7) {
        return false;
      }
      
      // Color mood check - allow items that match mood or are neutral
      const itemColor = (item.colour || '').toLowerCase();
      const itemName = (item.product_name || '').toLowerCase();
      
      const matchesMoodColor = moodColors.some(moodColor => 
        itemColor.includes(moodColor.toLowerCase()) ||
        itemName.includes(moodColor.toLowerCase()) ||
        ColorCoordinationService.areColorsCompatible(itemColor, moodColor)
      );
      
      // Allow neutral colors (they go with any mood)
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
    console.log(`👠 [SHOES MOOD FILTER] Filtering ${shoes.length} shoes for mood: ${mood}`);
    
    const moodColors = ColorCoordinationService.getColorsForMood(mood);
    
    const filtered = shoes.filter(shoe => {
      const shoeColor = (shoe.colour || shoe.color || '').toLowerCase();
      const shoeName = (shoe.name || '').toLowerCase();
      
      const matchesMoodColor = moodColors.some(moodColor => 
        shoeColor.includes(moodColor.toLowerCase()) ||
        shoeName.includes(moodColor.toLowerCase()) ||
        ColorCoordinationService.areColorsCompatible(shoeColor, moodColor)
      );
      
      // Allow neutral shoes
      const neutralColors = ['black', 'white', 'brown', 'beige', 'gray'];
      const isNeutral = neutralColors.some(neutral => 
        shoeColor.includes(neutral) || shoeName.includes(neutral)
      );
      
      return matchesMoodColor || isNeutral;
    });
    
    debugInfo.filtering_steps.push({
      step: 'Shoes Mood Filter',
      items_before: shoes.length,
      items_after: filtered.length,
      criteria: `Mood colors: [${moodColors.join(', ')}]`
    });
    
    console.log(`👠 [SHOES MOOD RESULT] Filtered from ${shoes.length} to ${filtered.length} mood-appropriate shoes`);
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
    console.log(`🎯 [ENHANCED COORDINATION] Creating outfits with color/fabric matching`);
    console.log(`📊 [DATA] Clothing: ${allClothing.length}, Shoes: ${allShoes.length}, Budget: ${isUnlimited ? 'unlimited' : `$${budget}`}`);
    
    const categorizedItems = this.categorizeClothingItems(allClothing, debugInfo);
    const categorizedShoes = this.categorizeShoesByType(allShoes);
    
    debugInfo.categorization.shoes_with_valid_images = allShoes.length;
    
    const looks: Look[] = [];
    const usedItemIds = new Set<string>();
    const usedShoeIds = new Set<string>();
    
    const eventType = request.event || 'casual';
    debugInfo.outfit_logic.event_type = eventType;
    
    const appropriateShoes = this.selectShoesForEvent(categorizedShoes, eventType);
    
    console.log(`🎯 [ENHANCED] Creating ${eventType} outfits with color coordination and mood: ${request.mood}`);
    
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
    
    // Add jumpsuit outfits if needed
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
    
    // 🆕 SCORE OUTFITS BASED ON COORDINATION
    looks.forEach((look, index) => {
      const coordinationScore = ColorCoordinationService.scoreOutfitCoordination(look.items, request.mood);
      console.log(`🏆 [COORDINATION SCORE] Look ${index + 1}: ${coordinationScore}/100`);
      debugInfo.logic_notes.push(`Look ${index + 1} coordination score: ${coordinationScore}/100`);
    });
    
    console.log(`✅ [ENHANCED CREATION COMPLETE] Created ${looks.length} coordinated outfits`);
    
    return {
      looks,
      reasoning: `Created ${looks.length} enhanced outfits for ${eventType} event with color coordination, fabric matching, mood alignment (${request.mood}), and budget consideration (${isUnlimited ? 'unlimited' : `$${budget}`})`,
      debugInfo
    };
  }

  /**
   * 🆕 Create coordinated dress outfits with color matching
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
    console.log(`👗 [COORDINATED DRESS] Creating color-matched dress outfits`);
    
    const availableDresses = dresses.filter(dress => !usedItemIds.has(dress.id));
    const availableShoes = shoes.filter(shoe => !usedShoeIds.has(shoe.name));
    
    if (availableDresses.length === 0 || availableShoes.length === 0) {
      return;
    }
    
    // Find the best color-coordinated dress + shoes combination
    for (const dress of availableDresses.slice(0, 2)) {
      // Check budget if not unlimited
      if (!isUnlimited && dress.price > budget * 0.8) {
        continue;
      }
      
      // Find shoes that coordinate with the dress
      const coordinatingShoes = availableShoes.find(shoe => {
        const totalCost = dress.price + (shoe.price || 0);
        if (!isUnlimited && totalCost > budget) {
          return false;
        }
        
        return ColorCoordinationService.areColorsCompatible(
          dress.colour || 'unknown', 
          shoe.colour || shoe.color || 'unknown'
        );
      });
      
      if (!coordinatingShoes) {
        console.log(`❌ [COORDINATION] No matching shoes found for dress: ${dress.product_name}`);
        continue;
      }
      
      console.log(`✅ [COORDINATED DRESS] ${dress.product_name} + ${coordinatingShoes.name}`);
      debugInfo.outfit_logic.outfit_rules_applied.push('COORDINATED_DRESS_SHOES');
      
      const lookItems = [
        {
          id: dress.id,
          title: dress.product_name,
          description: dress.description || '',
          image: this.normalizeImageField(dress.image, 'clothing'),
          price: dress.price ? `$${dress.price}` : '0',
          type: 'dress'
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
        id: `coordinated-dress-look-${looks.length}`,
        items: lookItems,
        description: `${dress.product_name} עם ${coordinatingShoes.name} - תואם צבעים למצב רוח ${mood}`,
        occasion: eventType as any,
        style: 'elegant',
        mood: mood as any
      };
      
      looks.push(look);
      usedItemIds.add(dress.id);
      usedShoeIds.add(coordinatingShoes.name);
      
      break; // One coordinated dress outfit is enough
    }
  }

  /**
   * 🆕 Create coordinated casual outfits with color and fabric matching
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
    console.log(`👕 [COORDINATED CASUAL] Creating color-matched casual outfits`);
    
    const availableTops = categorizedItems.tops.filter((item: ZaraClothItem) => !usedItemIds.has(item.id));
    const availableBottoms = categorizedItems.bottoms.filter((item: ZaraClothItem) => !usedItemIds.has(item.id));
    const availableShoes = shoes.filter(shoe => !usedShoeIds.has(shoe.name));
    
    if (availableTops.length === 0 || availableBottoms.length === 0 || availableShoes.length === 0) {
      return;
    }
    
    const maxCasualLooks = Math.min(2, 3 - looks.length);
    
    for (let i = 0; i < maxCasualLooks && i < availableTops.length; i++) {
      const top = availableTops[i];
      
      // Find a bottom that coordinates with the top
      const coordinatingBottom = availableBottoms.find(bottom => {
        if (usedItemIds.has(bottom.id)) return false;
        
        // Budget check
        if (!isUnlimited && (top.price + bottom.price) > budget * 0.7) {
          return false;
        }
        
        return ColorCoordinationService.areColorsCompatible(
          top.colour || 'unknown', 
          bottom.colour || 'unknown'
        );
      });
      
      if (!coordinatingBottom) {
        console.log(`❌ [COORDINATION] No matching bottom for top: ${top.product_name}`);
        continue;
      }
      
      // Find shoes that coordinate with the outfit
      const coordinatingShoes = availableShoes.find(shoe => {
        if (usedShoeIds.has(shoe.name)) return false;
        
        const totalCost = top.price + coordinatingBottom.price + (shoe.price || 0);
        if (!isUnlimited && totalCost > budget) {
          return false;
        }
        
        // Check if shoes coordinate with either top or bottom
        return (
          ColorCoordinationService.areColorsCompatible(
            top.colour || 'unknown', 
            shoe.colour || shoe.color || 'unknown'
          ) ||
          ColorCoordinationService.areColorsCompatible(
            coordinatingBottom.colour || 'unknown', 
            shoe.colour || shoe.color || 'unknown'
          )
        );
      });
      
      if (!coordinatingShoes) {
        console.log(`❌ [COORDINATION] No matching shoes for outfit: ${top.product_name} + ${coordinatingBottom.product_name}`);
        continue;
      }
      
      console.log(`✅ [COORDINATED CASUAL] ${top.product_name} + ${coordinatingBottom.product_name} + ${coordinatingShoes.name}`);
      debugInfo.outfit_logic.outfit_rules_applied.push('COORDINATED_CASUAL_OUTFIT');
      
      const lookItems = [
        {
          id: top.id,
          title: top.product_name,
          description: top.description || '',
          image: this.normalizeImageField(top.image, 'clothing'),
          price: top.price ? `$${top.price}` : '0',
          type: 'top'
        },
        {
          id: coordinatingBottom.id,
          title: coordinatingBottom.product_name,
          description: coordinatingBottom.description || '',
          image: this.normalizeImageField(coordinatingBottom.image, 'clothing'),
          price: coordinatingBottom.price ? `$${coordinatingBottom.price}` : '0',
          type: 'bottom'
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
        id: `coordinated-casual-look-${looks.length}`,
        items: lookItems,
        description: `${top.product_name} עם ${coordinatingBottom.product_name} ו${coordinatingShoes.name} - תואם צבעים למצב רוח ${mood}`,
        occasion: 'casual',
        style: 'casual',
        mood: mood as any
      };
      
      looks.push(look);
      usedItemIds.add(top.id);
      usedItemIds.add(coordinatingBottom.id);
      usedShoeIds.add(coordinatingShoes.name);
    }
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
    // Similar to casual but with formal prioritization
    await this.createCoordinatedCasualOutfits(categorizedItems, shoes, looks, usedItemIds, usedShoeIds, debugInfo, mood, budget, isUnlimited);
    debugInfo.outfit_logic.outfit_rules_applied.push('COORDINATED_FORMAL_PRIORITY');
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
    console.log(`🤸 [COORDINATED JUMPSUIT] Creating color-matched jumpsuit outfits`);
    
    // Similar logic to dress outfits but for jumpsuits
    const availableJumpsuits = jumpsuits.filter(jumpsuit => !usedItemIds.has(jumpsuit.id));
    const availableShoes = shoes.filter(shoe => !usedShoeIds.has(shoe.name));
    
    if (availableJumpsuits.length === 0 || availableShoes.length === 0) {
      return;
    }
    
    const jumpsuit = availableJumpsuits[0];
    
    // Check budget
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
    
    console.log(`✅ [COORDINATED JUMPSUIT] ${jumpsuit.product_name} + ${coordinatingShoes.name}`);
    debugInfo.outfit_logic.outfit_rules_applied.push('COORDINATED_JUMPSUIT_SHOES');
    
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
      description: `${jumpsuit.product_name} עם ${coordinatingShoes.name} - תואם צבעים למצב רוח ${mood}`,
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

    console.log(`🏷️ [CATEGORIZATION] Processing ${clothingItems.length} CLEAN clothing items...`);

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
        console.log(`🏷️ [ITEM] ${item.product_name} → ${category.toUpperCase()} (family: ${item.product_family}, subfamily: ${item.product_subfamily})`);
      }
    }

    // Update debug info with categorization
    debugInfo.categorization.tops = categorized.tops.length;
    debugInfo.categorization.bottoms = categorized.bottoms.length;
    debugInfo.categorization.dresses = categorized.dresses.length;
    debugInfo.categorization.jumpsuits = categorized.jumpsuits.length;
    debugInfo.categorization.outerwear = categorized.outerwear.length;
    
    console.log(`📊 [CATEGORIZATION SUMMARY] Tops: ${categorized.tops.length}, Bottoms: ${categorized.bottoms.length}, Dresses: ${categorized.dresses.length}, Jumpsuits: ${categorized.jumpsuits.length}, Outerwear: ${categorized.outerwear.length}`);
    
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
    console.log(`👠 [SHOE SELECTION] Selecting shoes for event: ${eventType}`);
    
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
    
    console.log(`👠 [SHOE SELECTION] Selected ${selectedShoes.length} appropriate shoes for ${eventType}`);
    return selectedShoes;
  }

  private isLeatherBoot(shoe: ShoeItem): boolean {
    const searchText = `${shoe.name} ${shoe.description}`.toLowerCase();
    return searchText.includes('leather') || searchText.includes('suede');
  }

  private normalizeImageField(image: any, itemType: string = 'clothing'): string {
    console.log(`[DEBUG] normalizeImageField called with type: ${itemType}, image:`, image);
    
    if (!image) {
      console.log(`[DEBUG] No image provided for ${itemType}`);
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
    console.log(`[DEBUG] extractShoesImageUrl called with:`, imageData);
    
    if (!imageData) {
      console.log(`⚠️ [DEBUG] No image data for shoe`);
      return '/placeholder.svg';
    }
    
    let imageUrls: string[] = [];
    
    if (typeof imageData === 'string') {
      const trimmed = imageData.trim();
      
      if (trimmed.startsWith('http') && (trimmed.includes('.jpg') || trimmed.includes('.png') || trimmed.includes('.jpeg'))) {
        console.log(`✅ [DEBUG] Direct shoe image URL found: ${trimmed}`);
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
    
    console.log(`[DEBUG] Shoe image URLs extracted:`, imageUrls);
    
    const validUrl = imageUrls.find(url => 
      url && 
      url.includes('http') && 
      (url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg'))
    );
    
    if (validUrl) {
      console.log(`✅ [DEBUG] Valid shoe image URL found: ${validUrl}`);
      return validUrl;
    }
    
    console.log(`⚠️ [DEBUG] No valid shoe image URL found, using placeholder`);
    return '/placeholder.svg';
  }

  private isValidImagePattern(imageData: any, itemType: string = 'clothing'): boolean {
    console.log(`[DEBUG] isValidImagePattern for ${itemType}:`, imageData);
    
    if (!imageData) {
      console.log('🔍 [DEBUG] No image data provided');
      return false;
    }
    
    // עבור נעליים - בדיקה פשוטה יותר
    if (itemType === 'shoes') {
      let imageUrls: string[] = [];
      
      if (typeof imageData === 'string') {
        imageUrls = [imageData];
      } else if (Array.isArray(imageData)) {
        imageUrls = imageData.filter(url => typeof url === 'string');
      } else if (typeof imageData === 'object' && imageData.url) {
        imageUrls = [imageData.url];
      }
      
      console.log(`[DEBUG] Shoe ${itemType} image(s):`, imageUrls);
      
      const hasValidUrl = imageUrls.some(url => 
        url && 
        url.includes('http') && 
        (url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg'))
      );
      
      console.log(`[DEBUG] Shoe has valid image pattern: ${hasValidUrl}`);
      return hasValidUrl;
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
    
    // EXCLUDE dresses, jumpsuits, underwear, and bottoms
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
    
    // EXCLUDE dresses, jumpsuits and underwear
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
