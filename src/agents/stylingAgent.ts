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

  private isJumpsuitItem(item: any): boolean {
    const subfamily = item.product_subfamily?.toLowerCase() || '';
    const name = (item.product_name || item.name || '').toLowerCase();
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
    
    console.log('🎯 [StylingAgent] Creating STRICTLY VALIDATED outfits with ONE ITEM PER CATEGORY:', { bodyStructure, mood, style, event });
    console.log(`📊 [StylingAgent] Total available items: ${availableItems.length}`);
    
    // Filter only available items
    const availableFilteredItems = availableItems.filter(item => item.availability === true);
    console.log(`📊 [StylingAgent] Available items after filter: ${availableFilteredItems.length}`);
    
    // Classify items into strict categories
    const shoes = availableFilteredItems.filter(item => this.isShoeItem(item));
    const tops = availableFilteredItems.filter(item => this.isTopItem(item));
    const bottoms = availableFilteredItems.filter(item => this.isBottomItem(item));
    const dresses = availableFilteredItems.filter(item => this.isDressItem(item));
    const jumpsuits = availableFilteredItems.filter(item => this.isJumpsuitItem(item));
    const outerwear = availableFilteredItems.filter(item => this.isOuterwearItem(item));
    
    console.log('📊 [StylingAgent] STRICT CLASSIFICATION:');
    console.log(`👟 SHOES: ${shoes.length} items`);
    console.log(`👕 TOPS: ${tops.length} items`);
    console.log(`👖 BOTTOMS: ${bottoms.length} items`);
    console.log(`👗 DRESSES: ${dresses.length} items`);
    console.log(`🤸 JUMPSUITS: ${jumpsuits.length} items`);
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

    // OUTFIT TYPE 1: Dress looks (1 שמלה + 1 נעליים = 2 פריטים)
    if (dresses.length > 0 && looks.length < 3) {
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

    // OUTFIT TYPE 2: Jumpsuit looks (1 אוברול + 1 נעליים = 2 פריטים)
    if (jumpsuits.length > 0 && looks.length < 3) {
      for (let i = 0; i < Math.min(1, jumpsuits.length) && looks.length < 3; i++) {
        const jumpsuit = jumpsuits[i];
        if (usedItemIds.has(jumpsuit.id)) continue;
        
        const availableShoes = shoes.filter(shoe => !usedItemIds.has(shoe.id));
        if (availableShoes.length === 0) break;
        
        const shoe = availableShoes[0];
        
        const jumpsuitLookItems = [
          {
            id: jumpsuit.id || `jumpsuit-${i}`,
            title: jumpsuit.product_name || jumpsuit.name || 'אוברול',
            description: jumpsuit.description || '',
            image: jumpsuit.image || '',
            price: jumpsuit.price ? `$${jumpsuit.price}` : '0',
            type: 'jumpsuit'
          },
          {
            id: shoe.id || `shoes-jumpsuit-${i}`,
            title: shoe.product_name || shoe.name || 'נעליים',
            description: shoe.description || '',
            image: shoe.image || '',
            price: shoe.price ? `$${shoe.price}` : '0',
            type: 'shoes'
          }
        ];
        
        // Validate this exact combination
        const validation = this.validateOutfitComposition(jumpsuitLookItems);
        if (!validation.isValid) {
          console.error(`❌ [StylingAgent] Jumpsuit outfit validation failed: ${validation.reason}`);
          continue;
        }
        
        const jumpsuitLook: Look = {
          id: `jumpsuit-look-${i}`,
          items: jumpsuitLookItems,
          description: `אוברול ${jumpsuit.product_name || ''} עם נעליים מתאימות`,
          occasion: (event as any) || 'general',
          style: style,
          mood: mood
        };
        
        looks.push(jumpsuitLook);
        usedItemIds.add(jumpsuit.id);
        usedItemIds.add(shoe.id);
        
        console.log(`✅ [StylingAgent] Created JUMPSUIT look: 2 פריטים - ${validation.reason}`);
      }
    }
    
    // OUTFIT TYPE 3: Regular looks (1 חלק עליון + 1 חלק תחתון + 1 נעליים = 3 פריטים)
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
            id: shoe.id || `shoes-regular-${regularLookCount}`,
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
        break; // Move to next top after finding a valid combination
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
    
    console.log(`✅ [StylingAgent] Created ${validatedLooks.length} STRICTLY VALIDATED outfits with ONE ITEM PER CATEGORY`);
    
    return {
      looks: validatedLooks.slice(0, 3),
      reasoning: `יצרתי ${validatedLooks.length} תלבושות תקינות עם פריט אחד בלבד מכל קטגוריה נדרשת.`
    };
  }
}

export const stylingAgent = new StylingAgentClass();
