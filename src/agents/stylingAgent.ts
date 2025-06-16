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

// Updated ShoeItem type to match actual Supabase shoes table schema
type ShoeItem = {
  name: string;
  brand?: string | null;
  description?: string | null;
  price: number | null;
  colour?: string | null;
  image: any | null; // Changed from string | string[] to any to match Json type from database
  discount?: string | null;
  category?: string | null;
  availability: string | null;
  url?: string | null;
  breadcrumbs?: any;
  buy_the_look?: any | null;
  possible_sizes?: any | null;
  you_might_also_like?: any | null;
  product_id?: number | null;
  color?: any | null;
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

    console.log(`🎯 [StylingAgent] Starting COMPLETE outfit generation for user: ${userId}`);
    console.log(`📊 [DEBUG] Implementing NEW OUTFIT LOGIC with strict rules...`);
    
    try {
      // Get user profile data from localStorage (populated by PersonalizationAgent)
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
      
      // Dual table fetch: clothing and shoes separately
      const { supabase } = await import('../lib/supabaseClient');
      
      console.log(`🔍 [DEBUG] Fetching from DUAL SOURCES: zara_cloth + shoes tables...`);
      
      const { data: allClothing, error: clothError } = await supabase
        .from('zara_cloth')
        .select('*')
        .eq('availability', true);

      const { data: allShoes, error: shoesError } = await supabase
        .from('shoes')
        .select('*')
        .eq('availability', 'in stock');
      
      if (clothError || !allClothing) {
        debugInfo.logic_notes.push(`ERROR: Failed to fetch clothing - ${clothError?.message}`);
        return {
          success: false,
          error: 'Failed to fetch available clothing items from database',
          debugInfo
        };
      }

      if (shoesError || !allShoes) {
        debugInfo.logic_notes.push(`ERROR: Failed to fetch shoes - ${shoesError?.message}`);
        return {
          success: false,
          error: 'Failed to fetch available shoes from database',
          debugInfo
        };
      }
      
      debugInfo.raw_data.clothing_fetched = allClothing.length;
      debugInfo.raw_data.shoes_fetched = allShoes.length;
      debugInfo.raw_data.clothing_available = allClothing.length;
      debugInfo.raw_data.shoes_available = allShoes.length;
      
      console.log(`📊 [DATA] Retrieved ${allClothing.length} clothing items and ${allShoes.length} shoes`);
      
      // Filter only available items
      const availableClothing = allClothing.filter(item => item.availability === true);
      const availableShoes = allShoes.filter(shoe => shoe.availability === 'in stock');
      
      console.log(`📊 [StylingAgent] Available after filter - Clothing: ${availableClothing.length}, Shoes: ${availableShoes.length}`);
      
      // Filter shoes with valid images
      const shoesWithValidImages = availableShoes.filter(shoe => this.isValidImagePattern(shoe.image, 'shoes'));
      debugInfo.categorization.shoes_with_valid_images = shoesWithValidImages.length;
      
      console.log(`👟 [SHOES] ${shoesWithValidImages.length}/${availableShoes.length} shoes have valid images`);
      
      // Categorize clothing items with detailed logging
      const categorizedItems = this.categorizeClothingItems(availableClothing, debugInfo);
      
      console.log(`📋 [CATEGORIZATION] Tops: ${categorizedItems.tops.length}, Bottoms: ${categorizedItems.bottoms.length}, Dresses: ${categorizedItems.dresses.length}, Jumpsuits: ${categorizedItems.jumpsuits.length}, Outerwear: ${categorizedItems.outerwear.length}`);
      
      // Create styling request with separated data
      const request: StylingRequest = {
        bodyStructure: bodyShape as any,
        mood: currentMood,
        style: style as any,
        event: currentEvent,
        availableItems: [] // This will be handled differently now
      };
      
      debugInfo.logic_notes.push(`StylingRequest created: ${JSON.stringify(request)}`);
      
      // Generate outfits using the new dual-source method
      const result = await this.createOutfitsWithNewLogic(
        request, 
        categorizedItems, 
        shoesWithValidImages, 
        debugInfo
      );
      
      const endTime = performance.now();
      debugInfo.performance.total_time_ms = endTime - startTime;
      
      console.log(`✅ [STYLING COMPLETE] Created ${result.looks.length} outfits using NEW LOGIC`);
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
      
      console.error('❌ [StylingAgent] Error in outfit generation:', error);
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
        console.log(`🏷️ [ITEM] ${item.product_name} → ${category.toUpperCase()} (family: ${item.product_family}, subfamily: ${item.product_subfamily})`);
      }
    }

    // Update debug info with categorization
    debugInfo.categorization.tops = categorized.tops.length;
    debugInfo.categorization.bottoms = categorized.bottoms.length;
    debugInfo.categorization.dresses = categorized.dresses.length;
    debugInfo.categorization.jumpsuits = categorized.jumpsuits.length;
    debugInfo.categorization.outerwear = categorized.outerwear.length;
    debugInfo.categorization.shoes_with_valid_images = shoesWithValidImages.length;
    
    return categorized;
  }

  private async createOutfitsWithNewLogic(
    request: StylingRequest, 
    categorizedItems: any, 
    shoesWithValidImages: ShoeItem[],
    debugInfo: DebugInfo
  ): Promise<StylingResult> {
    const { mood, style, event } = request;
    
    console.log(`🎯 [NEW OUTFIT LOGIC] Creating outfits for event: ${event}`);
    debugInfo.outfit_logic.event_type = event || 'casual';
    
    const looks: Look[] = [];
    const usedItemIds = new Set<string>();
    const usedShoeIds = new Set<string>();
    
    // CRITICAL CHECK: Must have shoes!
    if (shoesWithValidImages.length === 0) {
      console.error('❌ [CRITICAL] No shoes with valid images available!');
      debugInfo.logic_notes.push('CRITICAL ERROR: No shoes with valid images');
      return { looks: [], reasoning: 'לא ניתן ליצור תלבושות ללא נעליים זמינות', debugInfo };
    }

    // RULE IMPLEMENTATION BASED ON EVENT TYPE
    if (event === 'evening' || event === 'formal') {
      console.log(`🌃 [EVENING/FORMAL LOGIC] Prioritizing dresses and elegant items`);
      debugInfo.outfit_logic.outfit_rules_applied.push('EVENING_FORMAL_PRIORITY');
      
      // Priority 1: Elegant dresses for formal events
      await this.createDressOutfits(categorizedItems.dresses, shoesWithValidImages, looks, usedItemIds, usedShoeIds, debugInfo, 'formal');
      
      // Priority 2: Formal top+bottom combinations if no dresses
      if (looks.length < 2) {
        await this.createFormalOutfits(categorizedItems, shoesWithValidImages, looks, usedItemIds, usedShoeIds, debugInfo);
      }
    } else {
      console.log(`☀️ [CASUAL/DAYTIME LOGIC] Prioritizing casual combinations`);
      debugInfo.outfit_logic.outfit_rules_applied.push('CASUAL_DAYTIME_PRIORITY');
      
      // Priority 1: Regular top+bottom combinations for casual
      await this.createCasualOutfits(categorizedItems, shoesWithValidImages, looks, usedItemIds, usedShoeIds, debugInfo);
      
      // Priority 2: Dresses as secondary option
      if (looks.length < 2) {
        await this.createDressOutfits(categorizedItems.dresses, shoesWithValidImages, looks, usedItemIds, usedShoeIds, debugInfo, 'casual');
      }
    }
    
    // Add jumpsuit options if space available
    if (looks.length < 3 && categorizedItems.jumpsuits.length > 0) {
      await this.createJumpsuitOutfits(categorizedItems.jumpsuits, shoesWithValidImages, looks, usedItemIds, usedShoeIds, debugInfo);
    }
    
    console.log(`🎉 [FINAL RESULT] Created ${looks.length} outfits using NEW LOGIC`);
    debugInfo.outfit_logic.selected_combination = `${looks.length} outfits created for ${event} event`;
    
    return {
      looks: looks.slice(0, 3),
      reasoning: `יצרתי ${looks.length} תלבושות עבור אירוע ${event} עם לוגיקה מחודשת!`,
      debugInfo
    };
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
    
    console.log(`✅ [DRESS OUTFIT] Selected: ${dress.product_name} + ${shoe.name}`);
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
        image: this.normalizeImageField(shoe.image, 'shoes'),
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
      
      console.log(`✅ [CASUAL OUTFIT] Selected: ${top.product_name} + ${bottom.product_name} + ${shoe.name}`);
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
          image: this.normalizeImageField(shoe.image, 'shoes'),
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
    
    console.log(`✅ [JUMPSUIT OUTFIT] Selected: ${jumpsuit.product_name} + ${shoe.name}`);
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
        image: this.normalizeImageField(shoe.image, 'shoes'),
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
    // Filter clothing for tops and bottoms
    const tops = clothingItems.filter(item => this.isTopItem(item));
    const bottoms = clothingItems.filter(item => this.isBottomItem(item));
    
    // Use only shoes from the shoes table with valid images
    const availableShoes = shoesItems.filter(shoe => 
      shoe.availability === 'in stock' && 
      (shoe.price || 0) <= budget * 0.4 &&
      this.isValidImagePattern(shoe.image, 'shoes')
    );
    
    console.log(`[DEBUG] Available shoes with valid images: ${availableShoes.length}/${shoesItems.length}`);
    
    if (tops.length === 0 || bottoms.length === 0 || availableShoes.length === 0) {
      console.log(`[DEBUG] Missing items - tops: ${tops.length}, bottoms: ${bottoms.length}, shoes: ${availableShoes.length}`);
      return {};
    }
    
    // Select items within budget
    const selectedTop = tops.find(item => item.price <= budget * 0.35);
    const selectedBottom = bottoms.find(item => item.price <= budget * 0.35);
    const selectedShoes = availableShoes[0]; // Take first available shoes with valid image
    
    if (!selectedTop || !selectedBottom || !selectedShoes) {
      return {};
    }
    
    const totalCost = selectedTop.price + selectedBottom.price + (selectedShoes.price || 0);
    if (totalCost > budget) {
      return {};
    }
    
    return {
      top: selectedTop,
      bottom: selectedBottom,
      shoes: selectedShoes
    };
  }

  async createOutfitsFromSeparateSources(
    request: StylingRequest, 
    clothingItems: ZaraClothItem[], 
    shoesItems: ShoeItem[],
    debugInfo: DebugInfo
  ): Promise<StylingResult> {
    const { bodyStructure, mood, style, event } = request;
    
    console.log('🎯 [StylingAgent] Creating outfits with DUAL SOURCE data:', { bodyStructure, mood, style, event });
    console.log(`📊 [StylingAgent] Clothing items: ${clothingItems.length}, Shoes: ${shoesItems.length}`);
    
    debugInfo.logic_notes.push(`DUAL SOURCE METHOD: Clothing=${clothingItems.length}, Shoes=${shoesItems.length}`);
    
    // Filter only available items
    const availableClothing = clothingItems.filter(item => item.availability === true);
    const availableShoes = shoesItems.filter(shoe => shoe.availability === 'in stock');
    
    console.log(`📊 [StylingAgent] Available after filter - Clothing: ${availableClothing.length}, Shoes: ${availableShoes.length}`);
    
    // בדיקת תמונות נעליים זמינות
    const shoesWithValidImages = availableShoes.filter(shoe => this.isValidImagePattern(shoe.image, 'shoes'));
    console.log(`[DEBUG] Shoes with valid images: ${shoesWithValidImages.length}/${availableShoes.length}`);
    
    // Classify clothing items (excluding shoes - they come from shoes table)
    const categorizedItems = {
      tops: [],
      bottoms: [],
      dresses: [],
      jumpsuits: [],
      outerwear: []
    };
    
    // Categorize clothing items
    for (const item of availableClothing) {
      if (this.isDressItem(item)) {
        categorizedItems.dresses.push(item);
      } else if (this.isJumpsuitItem(item)) {
        categorizedItems.jumpsuits.push(item);
      } else if (this.isOuterwearItem(item)) {
        categorizedItems.outerwear.push(item);
      } else if (this.isTopItem(item)) {
        categorizedItems.tops.push(item);
      } else if (this.isBottomItem(item)) {
        categorizedItems.bottoms.push(item);
      }
    }
    
    // Update debug info with categorization
    debugInfo.categorization.tops = categorizedItems.tops.length;
    debugInfo.categorization.bottoms = categorizedItems.bottoms.length;
    debugInfo.categorization.dresses = categorizedItems.dresses.length;
    debugInfo.categorization.jumpsuits = categorizedItems.jumpsuits.length;
    debugInfo.categorization.outerwear = categorizedItems.outerwear.length;
    debugInfo.categorization.shoes_with_valid_images = shoesWithValidImages.length;
    
    console.log('📊 [StylingAgent] DUAL SOURCE CATEGORIZATION:');
    console.log(`👕 TOPS: ${categorizedItems.tops.length} items`);
    console.log(`👖 BOTTOMS: ${categorizedItems.bottoms.length} items`);
    console.log(`👗 DRESSES: ${categorizedItems.dresses.length} items`);
    console.log(`🤸 JUMPSUITS: ${categorizedItems.jumpsuits.length} items`);
    console.log(`🧥 OUTERWEAR: ${categorizedItems.outerwear.length} items`);
    console.log(`👟 SHOES (from shoes table): ${shoesWithValidImages.length} items with valid images`);
    
    debugInfo.logic_notes.push(`CATEGORIZATION COMPLETE: ${JSON.stringify(debugInfo.categorization)}`);
    
    const looks: Look[] = [];
    const usedItemIds = new Set<string>();
    const usedShoeIds = new Set<string>();
    
    // CRITICAL CHECK: Must have shoes from shoes table with valid images!
    if (shoesWithValidImages.length === 0) {
      console.error('❌ [StylingAgent] CRITICAL: No shoes with valid images available from shoes table');
      debugInfo.logic_notes.push('CRITICAL ERROR: No shoes with valid images from shoes table');
      return {
        looks: [],
        reasoning: 'לא ניתן ליצור תלבושות ללא נעליים זמינות עם תמונות תקינות.',
        debugInfo
      };
    }

    console.log('🚨 [StylingAgent] ENSURING EVERY OUTFIT HAS SHOES FROM SHOES TABLE!');
    debugInfo.logic_notes.push('VALIDATION: All outfits must have shoes from shoes table with valid images');

    // OUTFIT TYPE 1: Dress looks (שמלה + נעליים מטבלת נעליים)
    for (let i = 0; i < Math.min(1, categorizedItems.dresses.length) && looks.length < 3; i++) {
      const dress = categorizedItems.dresses[i];
      if (usedItemIds.has(dress.id)) continue;
      
      const availableShoesForOutfit = shoesWithValidImages.filter(shoe => !usedShoeIds.has(shoe.name));
      if (availableShoesForOutfit.length === 0) {
        console.warn('⚠️ [StylingAgent] No available shoes with valid images from shoes table for dress outfit, skipping');
        debugInfo.logic_notes.push('WARNING: No available shoes for dress outfit - skipped');
        break;
      }
      
      const shoe = availableShoesForOutfit[0];
      
      const dressLookItems = [
        {
          id: dress.id || `dress-${i}`,
          title: dress.product_name || 'שמלה',
          description: dress.description || '',
          image: this.normalizeImageField(dress.image, 'clothing'),
          price: dress.price ? `$${dress.price}` : '0',
          type: 'dress'
        },
        {
          id: shoe.name || `shoes-dress-${i}`,
          title: shoe.name || 'נעליים',
          description: shoe.description || '',
          image: this.normalizeImageField(shoe.image, 'shoes'),
          price: shoe.price ? `$${shoe.price}` : '0',
          type: 'shoes'
        }
      ];
      
      // Add to debug info
      debugInfo.items_selected[`dress_look_${i}_dress`] = {
        id: dress.id,
        name: dress.product_name || 'שמלה',
        image: this.normalizeImageField(dress.image, 'clothing'),
        source: 'zara_cloth',
        price: dress.price,
        image_validation: this.isValidImagePattern(dress.image, 'clothing')
      };
      
      debugInfo.items_selected[`dress_look_${i}_shoes`] = {
        id: shoe.name,
        name: shoe.name || 'נעליים',
        image: this.normalizeImageField(shoe.image, 'shoes'),
        source: 'shoes',
        price: shoe.price || 0,
        image_validation: this.isValidImagePattern(shoe.image, 'shoes')
      };
      
      const dressLook: Look = {
        id: `dress-look-${i}`,
        items: dressLookItems,
        description: `שמלה ${dress.product_name || ''} עם נעליים ${shoe.name || ''}`,
        occasion: (event as any) || 'general',
        style: style,
        mood: mood
      };
      
      looks.push(dressLook);
      usedItemIds.add(dress.id);
      usedShoeIds.add(shoe.name);
      
      console.log(`✅ [StylingAgent] Created DRESS look with SHOES from shoes table`);
      debugInfo.logic_notes.push(`DRESS OUTFIT CREATED: dress=${dress.product_name}, shoes=${shoe.name}`);
    }

    // OUTFIT TYPE 2: Jumpsuit looks (אוברול + נעליים מטבלת נעליים)
    for (let i = 0; i < Math.min(1, categorizedItems.jumpsuits.length) && looks.length < 3; i++) {
      const jumpsuit = categorizedItems.jumpsuits[i];
      if (usedItemIds.has(jumpsuit.id)) continue;
      
      const availableShoesForOutfit = shoesWithValidImages.filter(shoe => !usedShoeIds.has(shoe.name));
      if (availableShoesForOutfit.length === 0) {
        console.warn('⚠️ [StylingAgent] No available shoes with valid images from shoes table for jumpsuit outfit, skipping');
        debugInfo.logic_notes.push('WARNING: No available shoes for jumpsuit outfit - skipped');
        break;
      }
      
      const shoe = availableShoesForOutfit[0];
      
      const jumpsuitLookItems = [
        {
          id: jumpsuit.id || `jumpsuit-${i}`,
          title: jumpsuit.product_name || 'אוברול',
          description: jumpsuit.description || '',
          image: this.normalizeImageField(jumpsuit.image, 'clothing'),
          price: jumpsuit.price ? `$${jumpsuit.price}` : '0',
          type: 'jumpsuit'
        },
        {
          id: shoe.name || `shoes-jumpsuit-${i}`,
          title: shoe.name || 'נעליים',
          description: shoe.description || '',
          image: this.normalizeImageField(shoe.image, 'shoes'),
          price: shoe.price ? `$${shoe.price}` : '0',
          type: 'shoes'
        }
      ];
      
      // Add to debug info
      debugInfo.items_selected[`jumpsuit_look_${i}_jumpsuit`] = {
        id: jumpsuit.id,
        name: jumpsuit.product_name || 'אוברול',
        image: this.normalizeImageField(jumpsuit.image, 'clothing'),
        source: 'zara_cloth',
        price: jumpsuit.price,
        image_validation: this.isValidImagePattern(jumpsuit.image, 'clothing')
      };
      
      debugInfo.items_selected[`jumpsuit_look_${i}_shoes`] = {
        id: shoe.name,
        name: shoe.name || 'נעליים',
        image: this.normalizeImageField(shoe.image, 'shoes'),
        source: 'shoes',
        price: shoe.price || 0,
        image_validation: this.isValidImagePattern(shoe.image, 'shoes')
      };
      
      const jumpsuitLook: Look = {
        id: `jumpsuit-look-${i}`,
        items: jumpsuitLookItems,
        description: `אוברול ${jumpsuit.product_name || ''} עם נעליים ${shoe.name || ''}`,
        occasion: (event as any) || 'general',
        style: style,
        mood: mood
      };
      
      looks.push(jumpsuitLook);
      usedItemIds.add(jumpsuit.id);
      usedShoeIds.add(shoe.name);
      
      console.log(`✅ [StylingAgent] Created JUMPSUIT look with SHOES from shoes table`);
      debugInfo.logic_notes.push(`JUMPSUIT OUTFIT CREATED: jumpsuit=${jumpsuit.product_name}, shoes=${shoe.name}`);
    }
    
    // OUTFIT TYPE 3: Regular looks (חלק עליון + חלק תחתון + נעליים מטבלת נעליים)
    const maxRegularLooks = 3 - looks.length;
    let regularLookCount = 0;
    
    for (let topIndex = 0; topIndex < categorizedItems.tops.length && regularLookCount < maxRegularLooks; topIndex++) {
      const top = categorizedItems.tops[topIndex];
      if (usedItemIds.has(top.id)) continue;
      
      for (let bottomIndex = 0; bottomIndex < categorizedItems.bottoms.length && regularLookCount < maxRegularLooks; bottomIndex++) {
        const bottom = categorizedItems.bottoms[bottomIndex];
        if (usedItemIds.has(bottom.id)) continue;
        
        // MANDATORY: Find available shoes with valid images from shoes table
        const availableShoesForOutfit = shoesWithValidImages.filter(shoe => !usedShoeIds.has(shoe.name));
        if (availableShoesForOutfit.length === 0) {
          console.warn('⚠️ [StylingAgent] No available shoes with valid images from shoes table for regular outfit, stopping creation');
          debugInfo.logic_notes.push('WARNING: No available shoes for regular outfit - stopping creation');
          break;
        }
        
        const shoe = availableShoesForOutfit[0];
        
        // Create outfit with EXACTLY 1 top + 1 bottom + 1 shoes from shoes table
        const regularLookItems = [
          {
            id: top.id || `top-${topIndex}`,
            title: top.product_name || 'חולצה',
            description: top.description || '',
            image: this.normalizeImageField(top.image, 'clothing'),
            price: top.price ? `$${top.price}` : '0',
            type: 'top'
          },
          {
            id: bottom.id || `bottom-${bottomIndex}`,
            title: bottom.product_name || 'מכנס',
            description: bottom.description || '',
            image: this.normalizeImageField(bottom.image, 'clothing'),
            price: bottom.price ? `$${bottom.price}` : '0',
            type: 'bottom'
          },
          {
            id: shoe.name || `shoes-regular-${regularLookCount}`,
            title: shoe.name || 'נעליים',
            description: shoe.description || '',
            image: this.normalizeImageField(shoe.image, 'shoes'),
            price: shoe.price ? `$${shoe.price}` : '0',
            type: 'shoes'
          }
        ];
        
        // Add to debug info
        debugInfo.items_selected[`regular_look_${regularLookCount}_top`] = {
          id: top.id,
          name: top.product_name || 'חולצה',
          image: this.normalizeImageField(top.image, 'clothing'),
          source: 'zara_cloth',
          price: top.price,
          image_validation: this.isValidImagePattern(top.image, 'clothing')
        };
        
        debugInfo.items_selected[`regular_look_${regularLookCount}_bottom`] = {
          id: bottom.id,
          name: bottom.product_name || 'מכנס',
          image: this.normalizeImageField(bottom.image, 'clothing'),
          source: 'zara_cloth',
          price: bottom.price,
          image_validation: this.isValidImagePattern(bottom.image, 'clothing')
        };
        
        debugInfo.items_selected[`regular_look_${regularLookCount}_shoes`] = {
          id: shoe.name,
          name: shoe.name || 'נעליים',
          image: this.normalizeImageField(shoe.image, 'shoes'),
          source: 'shoes',
          price: shoe.price || 0,
          image_validation: this.isValidImagePattern(shoe.image, 'shoes')
        };
        
        const regularLook: Look = {
          id: `regular-look-${regularLookCount}`,
          items: regularLookItems,
          description: `${top.product_name || 'חולצה'} עם ${bottom.product_name || 'מכנס'} ונעליים ${shoe.name || ''}`,
          occasion: (event as any) || 'general',
          style: style,
          mood: mood
        };
        
        looks.push(regularLook);
        usedItemIds.add(top.id);
        usedItemIds.add(bottom.id);
        usedShoeIds.add(shoe.name);
        
        console.log(`✅ [StylingAgent] Created REGULAR look with SHOES from shoes table`);
        debugInfo.logic_notes.push(`REGULAR OUTFIT CREATED: top=${top.product_name}, bottom=${bottom.product_name}, shoes=${shoe.name}`);
        regularLookCount++;
        break; // Move to next top after finding a valid combination
      }
    }
    
    console.log(`🎉 [StylingAgent] FINAL RESULT: Created ${looks.length} outfits - ALL WITH SHOES FROM SHOES TABLE!`);
    debugInfo.logic_notes.push(`FINAL RESULT: Created ${looks.length} outfits with shoes from shoes table`);
    
    // Final validation - EVERY outfit MUST have shoes from shoes table
    for (const look of looks) {
      const hasShoes = look.items.some(item => item.type === 'shoes');
      if (!hasShoes) {
        console.error(`❌ [StylingAgent] CRITICAL ERROR: Look ${look.id} has NO SHOES!`);
        debugInfo.logic_notes.push(`CRITICAL ERROR: Look ${look.id} has NO SHOES`);
      } else {
        const shoeItem = look.items.find(i => i.type === 'shoes');
        console.log(`✅ [StylingAgent] Look ${look.id} has shoes from shoes table: ${shoeItem?.title}, image: ${shoeItem?.image}`);
        debugInfo.logic_notes.push(`VALIDATION OK: Look ${look.id} has shoes: ${shoeItem?.title}`);
      }
    }
    
    return {
      looks: looks.slice(0, 3),
      reasoning: `יצרתי ${looks.length} תלבושות תקינות - כולן כוללות נעליים מטבלת הנעליים המיועדת עם תמונות תקינות!`,
      debugInfo
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
        reason: hasOuterwear ? 'תלבושת מלאה עם מעיל - תקין' : 'תלבושת תקינה - 3 פריטים'
      };
    }

    return {
      isValid: false,
      score: 0,
      reason: `תלבושת צריכה ${expectedItems} פריטים בדיוק, נמצא ${items.length}`
    };
  }

  private isShoeItem(item: any): boolean {
    const subfamily = item.product_subfamily?.toLowerCase() || '';
    const name = (item.product_name || item.name || '').toLowerCase();
    const family = item.product_family?.toLowerCase() || '';
    const section = item.section?.toLowerCase() || '';
    
    const shoeKeywords = [
      'shoes', 'shoe', 'נעליים', 'נעל',
      'sneakers', 'sneaker', 'סניקרס',
      'boots', 'boot', 'מגפיים', 'מגף',
      'sandals', 'sandal', 'סנדלים', 'סandal',
      'heels', 'heel', 'עקבים', 'עקב',
      'flats', 'flat', 'שטוחות',
      'trainers', 'trainer', 'נעלי ספורט',
      'loafers', 'loafer', 'מוקסינים',
      'pumps', 'pump', 'נעלי עקב'
    ];
    
    return shoeKeywords.some(keyword => 
      subfamily.includes(keyword) || 
      name.includes(keyword) || 
      family.includes(keyword) ||
      section.includes(keyword)
    );
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
