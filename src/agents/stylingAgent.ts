
import { Look } from '../types/lookTypes';
import { Agent } from './index';

export interface StylingResult {
  looks: Look[];
  reasoning: string;
}

export interface StylingRequest {
  bodyStructure: 'X' | 'V' | 'H' | 'O' | 'A';
  mood: string;
  style: 'classic' | 'romantic' | 'minimalist' | 'casual' | 'boohoo' | 'sporty';
  event?: string;
  availableItems: any[];
}

class StylingAgentClass implements Agent {
  role = "Senior Fashion Stylist";
  goal = "Create fashionable and appropriate outfit combinations based on user preferences";
  backstory = "An experienced fashion stylist with expertise in body shapes, color coordination, and style matching";
  tools: any[] = [];

  async run(userId: string): Promise<any> {
    console.log(`🎯 [StylingAgent] Running coordinated styling for user: ${userId}`);
    
    try {
      // Get user profile data from localStorage (populated by PersonalizationAgent)
      const styleData = localStorage.getItem('styleAnalysis');
      const currentMood = localStorage.getItem('current-mood') || 'energized';
      
      if (!styleData) {
        return {
          success: false,
          error: 'No style profile found. Please run personalization first.'
        };
      }
      
      const parsedData = JSON.parse(styleData);
      const bodyShape = parsedData?.analysis?.bodyShape || 'H';
      const style = parsedData?.analysis?.styleProfile || 'classic';
      
      // Get available items from database (this should be provided by PersonalizationAgent)
      const { supabase } = await import('../lib/supabaseClient');
      const { data: availableItems, error } = await supabase
        .from('zara_cloth')
        .select('*')
        .eq('availability', true)
        .limit(500);
      
      if (error || !availableItems) {
        return {
          success: false,
          error: 'Failed to fetch available items from database'
        };
      }
      
      console.log(`📊 [StylingAgent] Retrieved ${availableItems.length} available items`);
      
      // Create styling request
      const request: StylingRequest = {
        bodyStructure: bodyShape as any,
        mood: currentMood,
        style: style as any,
        event: undefined, // Can be added later
        availableItems
      };
      
      // Generate outfits using the existing createOutfits method
      const result = await this.createOutfits(request);
      
      if (result.looks.length === 0) {
        return {
          success: false,
          error: 'No suitable outfits could be created with available items'
        };
      }
      
      console.log(`✅ [StylingAgent] Created ${result.looks.length} outfit suggestions`);
      
      return {
        success: true,
        data: {
          looks: result.looks,
          reasoning: result.reasoning,
          userId,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('❌ [StylingAgent] Error in coordinated run:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in styling agent'
      };
    }
  }

  /**
   * Validates outfit composition and ensures correct items
   */
  private validateOutfitComposition(items: any[]): { isValid: boolean; score: number; reason: string } {
    const itemTypes = items.map(item => item.type);
    const hasDress = itemTypes.includes('dress');
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

    // RULE 1: Dress outfits (שמלה + נעליים או שמלה + נעליים + מעיל)
    if (hasDress) {
      // Dress CANNOT be with top or bottom
      if (hasTop || hasBottom) {
        return {
          isValid: false,
          score: 0,
          reason: 'שמלה לא יכולה להיות עם חולצה או מכנסיים'
        };
      }
      
      // Valid dress outfits: dress + shoes (2 items) OR dress + shoes + outerwear (3 items)
      const validDressItems = hasOuterwear ? 3 : 2;
      if (items.length === validDressItems) {
        return {
          isValid: true,
          score: 100,
          reason: hasOuterwear ? 'שמלה עם נעליים ומעיל - תקין' : 'שמלה עם נעליים - תקין'
        };
      }
      
      return {
        isValid: false,
        score: 0,
        reason: `שמלה צריכה ${validDressItems} פריטים בלבד`
      };
    }

    // RULE 2: Regular outfits MUST have top + bottom + shoes (3 items) 
    // OR top + bottom + shoes + outerwear (4 items)
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
      reason: `תלבושת צריכה ${expectedItems} פריטים בדיוק`
    };
  }

  /**
   * Enhanced item classification methods
   */
  private isShoeItem(item: any): boolean {
    const subfamily = item.product_subfamily?.toLowerCase() || '';
    const name = (item.product_name || item.name || '').toLowerCase();
    const family = item.product_family?.toLowerCase() || '';
    const section = item.section?.toLowerCase() || '';
    
    const shoeKeywords = [
      'shoes', 'shoe', 'נעליים', 'נעל',
      'sneakers', 'sneaker', 'סניקרס',
      'boots', 'boot', 'מגפיים', 'מגף',
      'sandals', 'sandal', 'סנדלים', 'סנדל',
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
    
    // EXCLUDE dresses
    const dressKeywords = ['dress', 'שמלה', 'gown', 'frock'];
    const isDress = dressKeywords.some(keyword => 
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
    
    if (isDress || isBottomItem) {
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
    
    // EXCLUDE dresses and underwear
    const excludeKeywords = [
      'dress', 'שמלה', 'gown', 'frock',
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
    const name = (item.product_name || item.name || '').toLowerCase();
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

  private isOuterwearItem(item: any): boolean {
    const subfamily = item.product_subfamily?.toLowerCase() || '';
    const name = (item.product_name || item.name || '').toLowerCase();
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

  async createOutfits(request: StylingRequest): Promise<StylingResult> {
    const { bodyStructure, mood, style, event, availableItems } = request;
    
    console.log('🎯 [StylingAgent] Creating STRICTLY VALIDATED outfits:', { bodyStructure, mood, style, event });
    console.log(`📊 [StylingAgent] Total available items: ${availableItems.length}`);
    
    // Filter only available items
    const availableFilteredItems = availableItems.filter(item => item.availability === true);
    console.log(`📊 [StylingAgent] Available items after filter: ${availableFilteredItems.length}`);
    
    // Classify items into strict categories
    const shoes = availableFilteredItems.filter(item => this.isShoeItem(item));
    const tops = availableFilteredItems.filter(item => this.isTopItem(item));
    const bottoms = availableFilteredItems.filter(item => this.isBottomItem(item));
    const dresses = availableFilteredItems.filter(item => this.isDressItem(item));
    const outerwear = availableFilteredItems.filter(item => this.isOuterwearItem(item));
    
    console.log('📊 [StylingAgent] STRICT CLASSIFICATION:');
    console.log(`👟 SHOES: ${shoes.length} items`);
    console.log(`👕 TOPS: ${tops.length} items`);
    console.log(`👖 BOTTOMS: ${bottoms.length} items`);
    console.log(`👗 DRESSES: ${dresses.length} items`);
    console.log(`🧥 OUTERWEAR: ${outerwear.length} items`);
    
    const looks: Look[] = [];
    const usedItemIds = new Set<string>();
    
    // CRITICAL CHECK: Must have shoes!
    if (shoes.length === 0) {
      console.error('❌ [StylingAgent] CRITICAL: No shoes available');
      return {
        looks: [],
        reasoning: 'לא ניתן ליצור תלבושות ללא נעליים זמינות במלאי.'
      };
    }

    // OUTFIT TYPE 1: Dress looks (שמלה + נעליים = 2 פריטים)
    if (dresses.length > 0) {
      for (let i = 0; i < Math.min(1, dresses.length) && looks.length < 3; i++) {
        const dress = dresses[i];
        if (usedItemIds.has(dress.id)) continue;
        
        const availableShoes = shoes.filter(shoe => !usedItemIds.has(shoe.id));
        if (availableShoes.length === 0) break;
        
        const shoe = availableShoes[0];
        
        const dressLookItems = [
          {
            id: dress.id || `dress-${i}`,
            title: dress.product_name || dress.name || 'שמלה',
            description: dress.description || '',
            image: dress.image || '',
            price: dress.price ? `$${dress.price}` : '0',
            type: 'dress'
          },
          {
            id: shoe.id || `shoes-${i}`,
            title: shoe.product_name || shoe.name || 'נעליים',
            description: shoe.description || '',
            image: shoe.image || '',
            price: shoe.price ? `$${shoe.price}` : '0',
            type: 'shoes'
          }
        ];
        
        // Validate this exact combination
        const validation = this.validateOutfitComposition(dressLookItems);
        if (!validation.isValid) {
          console.error(`❌ [StylingAgent] Dress outfit validation failed: ${validation.reason}`);
          continue;
        }
        
        const dressLook: Look = {
          id: `dress-look-${i}`,
          items: dressLookItems,
          description: `שמלה ${dress.product_name || ''} עם נעליים מתאימות`,
          occasion: (event as any) || 'general',
          style: style,
          mood: mood
        };
        
        looks.push(dressLook);
        usedItemIds.add(dress.id);
        usedItemIds.add(shoe.id);
        
        console.log(`✅ [StylingAgent] Created DRESS look: 2 פריטים - ${validation.reason}`);
      }
    }
    
    // OUTFIT TYPE 2: Regular looks (חלק עליון + חלק תחתון + נעליים = 3 פריטים)
    const maxRegularLooks = 3 - looks.length;
    let regularLookCount = 0;
    
    for (let i = 0; i < tops.length && regularLookCount < maxRegularLooks; i++) {
      const top = tops[i];
      if (usedItemIds.has(top.id)) continue;
      
      for (let j = 0; j < bottoms.length && regularLookCount < maxRegularLooks; j++) {
        const bottom = bottoms[j];
        if (usedItemIds.has(bottom.id)) continue;
        
        const availableShoes = shoes.filter(shoe => !usedItemIds.has(shoe.id));
        if (availableShoes.length === 0) break;
        
        const shoe = availableShoes[0];
        
        const regularLookItems = [
          {
            id: top.id || `top-${i}`,
            title: top.product_name || top.name || 'חולצה',
            description: top.description || '',
            image: top.image || '',
            price: top.price ? `$${top.price}` : '0',
            type: 'top'
          },
          {
            id: bottom.id || `bottom-${j}`,
            title: bottom.product_name || bottom.name || 'מכנס',
            description: bottom.description || '',
            image: bottom.image || '',
            price: bottom.price ? `$${bottom.price}` : '0',
            type: 'bottom'
          },
          {
            id: shoe.id || `shoes-${regularLookCount}`,
            title: shoe.product_name || shoe.name || 'נעליים',
            description: shoe.description || '',
            image: shoe.image || '',
            price: shoe.price ? `$${shoe.price}` : '0',
            type: 'shoes'
          }
        ];
        
        // Validate this exact combination
        const validation = this.validateOutfitComposition(regularLookItems);
        if (!validation.isValid) {
          console.error(`❌ [StylingAgent] Regular outfit validation failed: ${validation.reason}`);
          continue;
        }
        
        const regularLook: Look = {
          id: `regular-look-${regularLookCount}`,
          items: regularLookItems,
          description: `${top.product_name || 'חולצה'} עם ${bottom.product_name || 'מכנס'} ונעליים`,
          occasion: (event as any) || 'general',
          style: style,
          mood: mood
        };
        
        looks.push(regularLook);
        usedItemIds.add(top.id);
        usedItemIds.add(bottom.id);
        usedItemIds.add(shoe.id);
        
        console.log(`✅ [StylingAgent] Created REGULAR look: 3 פריטים - ${validation.reason}`);
        regularLookCount++;
      }
    }
    
    // OUTFIT TYPE 3: Outerwear looks (מעיל + חלק עליון + חלק תחתון + נעליים = 4 פריטים)
    if (outerwear.length > 0 && looks.length < 3) {
      const maxOuterwearLooks = 3 - looks.length;
      
      for (let i = 0; i < Math.min(maxOuterwearLooks, 1); i++) {
        const availableOuterwear = outerwear.filter(coat => !usedItemIds.has(coat.id));
        const availableTops = tops.filter(top => !usedItemIds.has(top.id));
        const availableBottoms = bottoms.filter(bottom => !usedItemIds.has(bottom.id));
        const availableShoes = shoes.filter(shoe => !usedItemIds.has(shoe.id));
        
        if (availableOuterwear.length === 0 || availableTops.length === 0 || 
            availableBottoms.length === 0 || availableShoes.length === 0) break;
        
        const coat = availableOuterwear[0];
        const top = availableTops[0];
        const bottom = availableBottoms[0];
        const shoe = availableShoes[0];
        
        const outerwearLookItems = [
          {
            id: coat.id || `coat-${i}`,
            title: coat.product_name || coat.name || 'מעיל',
            description: coat.description || '',
            image: coat.image || '',
            price: coat.price ? `$${coat.price}` : '0',
            type: 'outerwear'
          },
          {
            id: top.id || `top-${i}`,
            title: top.product_name || top.name || 'חולצה',
            description: top.description || '',
            image: top.image || '',
            price: top.price ? `$${top.price}` : '0',
            type: 'top'
          },
          {
            id: bottom.id || `bottom-${i}`,
            title: bottom.product_name || bottom.name || 'מכנס',
            description: bottom.description || '',
            image: bottom.image || '',
            price: bottom.price ? `$${bottom.price}` : '0',
            type: 'bottom'
          },
          {
            id: shoe.id || `shoes-${i}`,
            title: shoe.product_name || shoe.name || 'נעליים',
            description: shoe.description || '',
            image: shoe.image || '',
            price: shoe.price ? `$${shoe.price}` : '0',
            type: 'shoes'
          }
        ];
        
        // Validate this exact combination
        const validation = this.validateOutfitComposition(outerwearLookItems);
        if (!validation.isValid) {
          console.error(`❌ [StylingAgent] Outerwear outfit validation failed: ${validation.reason}`);
          continue;
        }
        
        const outerwearLook: Look = {
          id: `outerwear-look-${i}`,
          items: outerwearLookItems,
          description: `מעיל ${coat.product_name || ''} עם חולצה, מכנס ונעליים`,
          occasion: (event as any) || 'general',
          style: style,
          mood: mood
        };
        
        looks.push(outerwearLook);
        usedItemIds.add(coat.id);
        usedItemIds.add(top.id);
        usedItemIds.add(bottom.id);
        usedItemIds.add(shoe.id);
        
        console.log(`✅ [StylingAgent] Created OUTERWEAR look: 4 פריטים - ${validation.reason}`);
      }
    }
    
    // Final validation - ensure all looks are valid
    const validatedLooks = looks.filter(look => {
      const validation = this.validateOutfitComposition(look.items);
      if (!validation.isValid) {
        console.error(`❌ [StylingAgent] REJECTED look ${look.id}: ${validation.reason}`);
        return false;
      }
      console.log(`✅ [StylingAgent] APPROVED look ${look.id}: ${validation.reason}`);
      return true;
    });
    
    console.log(`✅ [StylingAgent] Created ${validatedLooks.length} STRICTLY VALIDATED outfits`);
    
    return {
      looks: validatedLooks.slice(0, 3),
      reasoning: `יצרתי ${validatedLooks.length} תלבושות תקינות עם המבנה הנכון של פריטים.`
    };
  }
}

export const stylingAgent = new StylingAgentClass();
