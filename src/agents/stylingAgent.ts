import { Look } from '../types/lookTypes';
import { Agent } from './index';

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
  goal = "Create fashionable and appropriate outfit combinations based on user preferences";
  backstory = "An experienced fashion stylist with expertise in body shapes, color coordination, and style matching";
  tools: any[] = [];

  async run(userId: string): Promise<any> {
    const startTime = performance.now();
    const debugInfo: DebugInfo = {
      filters_applied: [],
      raw_data: { clothing_fetched: 0, shoes_fetched: 0, clothing_available: 0, shoes_available: 0 },
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

    console.log(`🎯 [StylingAgent] Starting DUAL SOURCE outfit generation for user: ${userId}`);
    console.log(`📊 [DEBUG] Using SEPARATE TABLES for clothing and shoes...`);
    
    try {
      // Get user profile data from localStorage
      const styleData = localStorage.getItem('styleAnalysis');
      const currentMood = localStorage.getItem('current-mood') || 'energized';
      const currentEvent = localStorage.getItem('current-event') || 'casual';
      
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
      
      debugInfo.filters_applied.push('bodyShape', 'mood', 'style', 'event');
      debugInfo.logic_notes.push(`Profile loaded: bodyShape=${bodyShape}, style=${style}, mood=${currentMood}, event=${currentEvent}`);
      debugInfo.outfit_logic.event_type = currentEvent;
      
      console.log(`🎭 [OUTFIT LOGIC] Event: ${currentEvent}, Style: ${style}, Mood: ${currentMood}`);
      
      // DUAL TABLE FETCH: clothing from zara_cloth, shoes from shoes table
      const { supabase } = await import('../lib/supabaseClient');
      
      console.log(`🔍 [DEBUG] Fetching from DUAL SOURCES: zara_cloth + shoes tables...`);
      
      const { data: allClothing, error: clothError } = await supabase
        .from('zara_cloth')
        .select('*')
        .eq('availability', true);

      const { data: allShoesRaw, error: shoesError } = await supabase
        .from('shoes')
        .select('*')
        .eq('availability', 'in stock');
      
      if (clothError || !allClothing) {
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

      // Transform shoes data to match ShoeItem interface
      const allShoes: ShoeItem[] = allShoesRaw.map(shoe => ({
        ...shoe,
        image: shoe.url || '/placeholder.svg', // Use url field for image
        price: shoe.price || 0,
        colour: shoe.color || shoe.colour || 'unknown'
      }));
      
      debugInfo.raw_data.clothing_fetched = allClothing.length;
      debugInfo.raw_data.shoes_fetched = allShoes.length;
      debugInfo.raw_data.clothing_available = allClothing.length;
      debugInfo.raw_data.shoes_available = allShoes.length;
      
      console.log(`📊 [DUAL SOURCE DATA] Retrieved ${allClothing.length} clothing items and ${allShoes.length} shoes`);
      console.log(`🔍 [SOURCE SEPARATION] Clothing from zara_cloth, Shoes from shoes table`);
      
      // Create styling request
      const request: StylingRequest = {
        bodyStructure: bodyShape as any,
        mood: currentMood,
        style: style as any,
        event: currentEvent,
        availableItems: [] // This will be handled differently now with dual sources
      };
      
      debugInfo.logic_notes.push(`StylingRequest created: ${JSON.stringify(request)}`);
      
      // Generate outfits using the dual-source method
      const result = await this.createOutfitsFromSeparateSources(
        request, 
        allClothing, 
        allShoes, 
        debugInfo
      );
      
      const endTime = performance.now();
      debugInfo.performance.total_time_ms = endTime - startTime;
      
      console.log(`✅ [STYLING COMPLETE] Created ${result.looks.length} outfits using DUAL SOURCE logic`);
      console.log(`📊 [FINAL DEBUG REPORT]`, JSON.stringify(debugInfo.outfit_logic, null, 2));
      
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
      
      console.error('❌ [StylingAgent] Error in dual source outfit generation:', error);
      console.log(`📊 [DEBUG] ERROR DEBUG REPORT:`, JSON.stringify(debugInfo, null, 2));
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in styling agent',
        debugInfo
      };
    }
  }

  private categorizeClothingItems(clothingItems: ZaraClothItem[], debugInfo: DebugInfo) {
    const categorized = {
      tops: [] as ZaraClothItem[],
      bottoms: [] as ZaraClothItem[],
      dresses: [] as ZaraClothItem[],
      jumpsuits: [] as ZaraClothItem[],
      outerwear: [] as ZaraClothItem[]
    };

    console.log(`🏷️ [CATEGORIZATION] Processing ${clothingItems.length} clothing items from zara_cloth...`);

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
    
    return categorized;
  }

  private async createOutfitsFromSeparateSources(
    request: StylingRequest,
    allClothing: ZaraClothItem[],
    allShoes: ShoeItem[],
    debugInfo: DebugInfo
  ): Promise<StylingResult> {
    console.log(`🎯 [DUAL SOURCE LOGIC] Starting outfit creation with separate sources`);
    console.log(`📊 [DATA] Clothing items: ${allClothing.length}, Shoes: ${allShoes.length}`);
    
    // Categorize clothing items from zara_cloth
    const categorizedItems = this.categorizeClothingItems(allClothing, debugInfo);
    
    // Filter shoes and categorize by type for event matching
    const categorizedShoes = this.categorizeShoesByType(allShoes);
    
    debugInfo.categorization.shoes_with_valid_images = allShoes.length;
    
    console.log(`👟 [SHOES CATEGORIZATION] Total shoes: ${allShoes.length}`);
    Object.entries(categorizedShoes).forEach(([type, shoes]) => {
      console.log(`👟 [${type.toUpperCase()}] ${shoes.length} pairs`);
    });
    
    const looks: Look[] = [];
    const usedItemIds = new Set<string>();
    const usedShoeIds = new Set<string>();
    
    const eventType = request.event || 'casual';
    debugInfo.outfit_logic.event_type = eventType;
    
    // Select appropriate shoes based on event type
    const appropriateShoes = this.selectShoesForEvent(categorizedShoes, eventType);
    
    // Create outfits based on event type and available items
    if (eventType === 'evening' || eventType === 'formal') {
      console.log(`✨ [EVENING/FORMAL LOGIC] Creating elegant outfits`);
      debugInfo.outfit_logic.outfit_rules_applied.push('EVENING_FORMAL_PRIORITY');
      
      // Priority 1: Dress outfits for formal events
      if (categorizedItems.dresses.length > 0) {
        await this.createDressOutfits(
          categorizedItems.dresses,
          appropriateShoes,
          looks,
          usedItemIds,
          usedShoeIds,
          debugInfo,
          eventType
        );
      }
      
      // Priority 2: Formal top+bottom combinations
      if (looks.length < 3) {
        await this.createFormalOutfits(
          categorizedItems,
          appropriateShoes,
          looks,
          usedItemIds,
          usedShoeIds,
          debugInfo
        );
      }
    } else {
      console.log(`👕 [CASUAL/DAYTIME LOGIC] Creating relaxed outfits`);
      debugInfo.outfit_logic.outfit_rules_applied.push('CASUAL_DAYTIME_PRIORITY');
      
      // Priority 1: Casual top+bottom combinations
      await this.createCasualOutfits(
        categorizedItems,
        appropriateShoes,
        looks,
        usedItemIds,
        usedShoeIds,
        debugInfo
      );
      
      // Priority 2: Add dress outfits if available
      if (looks.length < 3 && categorizedItems.dresses.length > 0) {
        await this.createDressOutfits(
          categorizedItems.dresses,
          appropriateShoes,
          looks,
          usedItemIds,
          usedShoeIds,
          debugInfo,
          eventType
        );
      }
    }
    
    // Priority 3: Add jumpsuit outfits if we have space
    if (looks.length < 3 && categorizedItems.jumpsuits.length > 0) {
      await this.createJumpsuitOutfits(
        categorizedItems.jumpsuits,
        appropriateShoes,
        looks,
        usedItemIds,
        usedShoeIds,
        debugInfo
      );
    }
    
    console.log(`✅ [OUTFIT CREATION COMPLETE] Created ${looks.length} outfits using dual source logic`);
    
    return {
      looks,
      reasoning: `Created ${looks.length} outfits for ${eventType} event using clothing from zara_cloth and shoes from shoes table`,
      debugInfo
    };
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
      // For formal events: heels > boots > loafers > other
      selectedShoes = [
        ...categorizedShoes.heels,
        ...categorizedShoes.boots.filter(boot => this.isLeatherBoot(boot)),
        ...categorizedShoes.loafers,
        ...categorizedShoes.other
      ];
    } else if (eventType === 'work' || eventType === 'business') {
      // For work: loafers > heels > boots > flats
      selectedShoes = [
        ...categorizedShoes.loafers,
        ...categorizedShoes.heels,
        ...categorizedShoes.boots,
        ...categorizedShoes.flats
      ];
    } else {
      // For casual: sneakers > flats > sandals > other
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

  private async createDressOutfits(
    dresses: ZaraClothItem[], 
    shoes: ShoeItem[], 
    looks: Look[], 
    usedItemIds: Set<string>, 
    usedShoeIds: Set<string>, 
    debugInfo: DebugInfo,
    eventType: string
  ) {
    console.log(`👗 [DRESS LOGIC] Creating dress outfits for ${eventType} event`);
    
    const availableDresses = dresses.filter(dress => !usedItemIds.has(dress.id));
    const availableShoes = shoes.filter(shoe => !usedShoeIds.has(shoe.name));
    
    if (availableDresses.length === 0 || availableShoes.length === 0) {
      console.log(`⚠️ [DRESS LOGIC] No available dresses or shoes`);
      return;
    }
    
    // RULE: Dress + Shoes (2 items) or Dress + Shoes + Outerwear (3 items)
    const dress = availableDresses[0];
    const shoe = availableShoes[0];
    
    console.log(`✅ [DRESS OUTFIT] Selected: ${dress.product_name} (zara_cloth) + ${shoe.name} (shoes table)`);
    debugInfo.outfit_logic.outfit_rules_applied.push('DRESS_SHOES_COMBINATION');
    debugInfo.outfit_logic.item_sources[`dress_${looks.length}`] = 'zara_cloth';
    debugInfo.outfit_logic.item_sources[`shoes_${looks.length}`] = 'shoes_table';
    
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
        id: shoe.name,
        title: shoe.name,
        description: shoe.description || '',
        image: shoe.image, // Already processed from url field
        price: shoe.price ? `$${shoe.price}` : '0',
        type: 'shoes'
      }
    ];
    
    const look: Look = {
      id: `dress-look-${looks.length}`,
      items: lookItems,
      description: `${dress.product_name} עם ${shoe.name} לאירוע ${eventType}`,
      occasion: eventType as any,
      style: 'classic',
      mood: 'elegant'
    };
    
    looks.push(look);
    usedItemIds.add(dress.id);
    usedShoeIds.add(shoe.name);
    
    console.log(`✅ [DRESS OUTFIT CREATED] Look ID: ${look.id}`);
  }

  private async createCasualOutfits(
    categorizedItems: any, 
    shoes: ShoeItem[], 
    looks: Look[], 
    usedItemIds: Set<string>, 
    usedShoeIds: Set<string>, 
    debugInfo: DebugInfo
  ) {
    console.log(`👕 [CASUAL LOGIC] Creating top+bottom+shoes combinations`);
    
    const availableTops = categorizedItems.tops.filter((item: ZaraClothItem) => !usedItemIds.has(item.id));
    const availableBottoms = categorizedItems.bottoms.filter((item: ZaraClothItem) => !usedItemIds.has(item.id));
    const availableShoes = shoes.filter(shoe => !usedShoeIds.has(shoe.name));
    
    if (availableTops.length === 0 || availableBottoms.length === 0 || availableShoes.length === 0) {
      console.log(`⚠️ [CASUAL LOGIC] Missing items - tops: ${availableTops.length}, bottoms: ${availableBottoms.length}, shoes: ${availableShoes.length}`);
      return;
    }
    
    // RULE: Top + Bottom + Shoes (3 items) - NO DRESS when creating this combination
    const maxCasualLooks = Math.min(2, 3 - looks.length);
    
    for (let i = 0; i < maxCasualLooks && i < availableTops.length && i < availableBottoms.length; i++) {
      const top = availableTops[i];
      const bottom = availableBottoms[i];
      const shoe = availableShoes[i % availableShoes.length];
      
      console.log(`✅ [CASUAL OUTFIT] Selected: ${top.product_name} (zara_cloth) + ${bottom.product_name} (zara_cloth) + ${shoe.name} (shoes table)`);
      debugInfo.outfit_logic.outfit_rules_applied.push('TOP_BOTTOM_SHOES_COMBINATION');
      debugInfo.outfit_logic.item_sources[`top_${looks.length}`] = 'zara_cloth';
      debugInfo.outfit_logic.item_sources[`bottom_${looks.length}`] = 'zara_cloth';
      debugInfo.outfit_logic.item_sources[`shoes_${looks.length}`] = 'shoes_table';
      
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
          id: bottom.id,
          title: bottom.product_name,
          description: bottom.description || '',
          image: this.normalizeImageField(bottom.image, 'clothing'),
          price: bottom.price ? `$${bottom.price}` : '0',
          type: 'bottom'
        },
        {
          id: shoe.name,
          title: shoe.name,
          description: shoe.description || '',
          image: shoe.image, // Already processed from url field
          price: shoe.price ? `$${shoe.price}` : '0',
          type: 'shoes'
        }
      ];
      
      const look: Look = {
        id: `casual-look-${looks.length}`,
        items: lookItems,
        description: `${top.product_name} עם ${bottom.product_name} ו${shoe.name}`,
        occasion: 'casual',
        style: 'casual',
        mood: 'relaxed'
      };
      
      looks.push(look);
      usedItemIds.add(top.id);
      usedItemIds.add(bottom.id);
      usedShoeIds.add(shoe.name);
      
      console.log(`✅ [CASUAL OUTFIT CREATED] Look ID: ${look.id}`);
    }
  }

  private async createFormalOutfits(
    categorizedItems: any, 
    shoes: ShoeItem[], 
    looks: Look[], 
    usedItemIds: Set<string>, 
    usedShoeIds: Set<string>, 
    debugInfo: DebugInfo
  ) {
    console.log(`🤵 [FORMAL LOGIC] Creating formal top+bottom combinations`);
    
    // Similar to casual but prioritize formal items
    await this.createCasualOutfits(categorizedItems, shoes, looks, usedItemIds, usedShoeIds, debugInfo);
    debugInfo.outfit_logic.outfit_rules_applied.push('FORMAL_TOP_BOTTOM_PRIORITY');
  }

  private async createJumpsuitOutfits(
    jumpsuits: ZaraClothItem[], 
    shoes: ShoeItem[], 
    looks: Look[], 
    usedItemIds: Set<string>, 
    usedShoeIds: Set<string>, 
    debugInfo: DebugInfo
  ) {
    console.log(`🤸 [JUMPSUIT LOGIC] Creating jumpsuit outfits`);
    
    const availableJumpsuits = jumpsuits.filter(jumpsuit => !usedItemIds.has(jumpsuit.id));
    const availableShoes = shoes.filter(shoe => !usedShoeIds.has(shoe.name));
    
    if (availableJumpsuits.length === 0 || availableShoes.length === 0) {
      console.log(`⚠️ [JUMPSUIT LOGIC] No available jumpsuits or shoes`);
      return;
    }
    
    // RULE: Jumpsuit + Shoes (2 items) - NO TOP/BOTTOM when using jumpsuit
    const jumpsuit = availableJumpsuits[0];
    const shoe = availableShoes[0];
    
    console.log(`✅ [JUMPSUIT OUTFIT] Selected: ${jumpsuit.product_name} (zara_cloth) + ${shoe.name} (shoes table)`);
    debugInfo.outfit_logic.outfit_rules_applied.push('JUMPSUIT_SHOES_COMBINATION');
    debugInfo.outfit_logic.item_sources[`jumpsuit_${looks.length}`] = 'zara_cloth';
    debugInfo.outfit_logic.item_sources[`shoes_${looks.length}`] = 'shoes_table';
    
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
        id: shoe.name,
        title: shoe.name,
        description: shoe.description || '',
        image: shoe.image, // Already processed from url field
        price: shoe.price ? `$${shoe.price}` : '0',
        type: 'shoes'
      }
    ];
    
    const look: Look = {
      id: `jumpsuit-look-${looks.length}`,
      items: lookItems,
      description: `${jumpsuit.product_name} עם ${shoe.name}`,
      occasion: 'general',
      style: 'modern',
      mood: 'confident'
    };
    
    looks.push(look);
    usedItemIds.add(jumpsuit.id);
    usedShoeIds.add(shoe.name);
    
    console.log(`✅ [JUMPSUIT OUTFIT CREATED] Look ID: ${look.id}`);
  }

  private normalizeImageField(image: any, itemType: string = 'clothing'): string {
    console.log(`[DEBUG] normalizeImageField called with type: ${itemType}, image:`, image);
    
    if (!image) {
      console.log(`[DEBUG] No image provided for ${itemType}`);
      return '/placeholder.svg';
    }
    
    // עבור נעליים - טיפול מיוחד
    if (itemType === 'shoes') {
      return this.extractShoesImageUrl(image);
    }
    
    // If it's a string, return as is
    if (typeof image === 'string') {
      return image;
    }
    
    // If it's an array, take the first item
    if (Array.isArray(image) && image.length > 0) {
      return typeof image[0] === 'string' ? image[0] : '';
    }
    
    // If it's a JSON object, try to extract URL
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
    
    // אם זה מחרוזת יחידה
    if (typeof imageData === 'string') {
      const trimmed = imageData.trim();
      
      // בדיקה אם זה URL ישיר
      if (trimmed.startsWith('http') && (trimmed.includes('.jpg') || trimmed.includes('.png') || trimmed.includes('.jpeg'))) {
        console.log(`✅ [DEBUG] Direct shoe image URL found: ${trimmed}`);
        return trimmed;
      }
      
      // ניסיון פרסור JSON
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          imageUrls = parsed.filter(url => typeof url === 'string');
        }
      } catch {
        // אם הפרסור נכשל, נשתמש במחרוזת כמו שהיא
        imageUrls = [trimmed];
      }
    }
    
    // אם זה מערך
    else if (Array.isArray(imageData)) {
      imageUrls = imageData.filter(url => typeof url === 'string');
    }
    
    // אם זה אובייקט
    else if (typeof imageData === 'object') {
      if (imageData.url) imageUrls = [imageData.url];
      else if (imageData.src) imageUrls = [imageData.src];
    }
    
    console.log(`[DEBUG] Shoe image URLs extracted:`, imageUrls);
    
    // חיפוש URL תקין
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
    
    // EXCLUDE dresses and jumpsuits
    const excludeKeywords = [
      'dress', 'שמלה', 'gown', 'frock',
      'jumpsuit', 'אוברול', 'overall', 'romper'
    ];
    const isExcluded = excludeKeywords.some(keyword => 
      subfamily.includes(keyword) || name.includes(keyword) || family.includes(keyword)
    );
    
    // EXCLUDE bottoms
    const bottomKeywords = [
      'pants', 'trousers', 'jeans', 'shorts',
      'skirt', 'leggings', 'joggers', 'chinos',
      'מכנס', 'מכנסיים', 'ג\'ינס', 'שורט',
      'חצאית', 'לגינס'
    ];
    
    const isBottomItem = bottomKeywords.some(keyword => 
      subfamily.includes(keyword) || name.includes(keyword) || family.includes(keyword)
    );
    
    if (isExcluded || isBottomItem) {
      return false;
    }
    
    const topKeywords = [
      'shirt', 'blouse', 't-shirt', 'top', 'tee',
      'sweater', 'cardigan', 'pullover', 'jumper',
      'tank', 'camisole', 'vest', 'hoodie',
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
      raw_data: { clothing_fetched: 0, shoes_fetched: 0, clothing_available: 0, shoes_available: 0 },
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
