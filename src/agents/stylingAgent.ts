
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
    console.log(`StylingAgent run method called for user: ${userId}`);
    return { success: true, data: null };
  }

  /**
   * Validates outfit composition and calculates score based on styling rules
   * ALL VALID COMBINATIONS GET HIGH SCORES (90+)
   */
  private validateOutfitComposition(items: any[]): { isValid: boolean; score: number; reason: string } {
    const itemTypes = items.map(item => item.type);
    const hasDress = itemTypes.includes('dress');
    const hasTop = itemTypes.includes('top');
    const hasBottom = itemTypes.includes('bottom');
    const hasShoes = itemTypes.includes('shoes');
    const hasOuterwear = itemTypes.includes('outerwear');

    // CRITICAL RULE: If dress exists with top/bottom, severely penalize score
    if (hasDress && (hasTop || hasBottom)) {
      console.error(`❌ [StylingAgent] INVALID COMPOSITION: Dress paired with ${hasTop ? 'top' : ''}${hasBottom ? 'bottom' : ''}`);
      return {
        isValid: false,
        score: 0, // Zero score for invalid combinations
        reason: 'שמלה לא יכולה להיות עם חולצה או מכנסיים'
      };
    }

    // RULE: Every outfit must have shoes
    if (!hasShoes) {
      return {
        isValid: false,
        score: 0,
        reason: 'חסרות נעליים'
      };
    }

    // RULE: Dress can only be with shoes (and optionally outerwear for work/winter)
    if (hasDress) {
      if (hasOuterwear) {
        // שמלה + נעליים + מעיל = valid - HIGH SCORE
        return {
          isValid: true,
          score: 95,
          reason: 'שמלה עם נעליים ומעיל - הרכב תקין'
        };
      } else {
        // שמלה + נעליים = valid - HIGHEST SCORE
        return {
          isValid: true,
          score: 100,
          reason: 'שמלה עם נעליים - הרכב מושלם'
        };
      }
    }

    // RULE: Regular outfit should have top + bottom + shoes - HIGH SCORE
    if (hasTop && hasBottom && hasShoes) {
      if (hasOuterwear) {
        // מעיל + חולצה + מכנסיים + נעליים = valid - HIGH SCORE
        return {
          isValid: true,
          score: 95,
          reason: 'הרכב מלא עם מעיל - ציון גבוה'
        };
      } else {
        // חולצה + מכנסיים + נעליים = valid - HIGH SCORE
        return {
          isValid: true,
          score: 95,
          reason: 'הרכב תקין - ציון גבוה'
        };
      }
    }

    // Any other combination is incomplete
    return {
      isValid: false,
      score: 20,
      reason: 'הרכב לא שלם'
    };
  }

  /**
   * Enhanced shoes detection that checks multiple fields and patterns
   */
  private isShoeItem(item: any): boolean {
    const subfamily = item.product_subfamily?.toLowerCase() || '';
    const name = (item.product_name || item.name || '').toLowerCase();
    const family = item.product_family?.toLowerCase() || '';
    const section = item.section?.toLowerCase() || '';
    
    // Extended list of shoe-related keywords
    const shoeKeywords = [
      'shoes', 'shoe', 'נעליים', 'נעל',
      'sneakers', 'sneaker', 'סניקרס',
      'boots', 'boot', 'מגפיים', 'מגף',
      'sandals', 'sandal', 'סנדלים', 'סנדל',
      'heels', 'heel', 'עקבים', 'עקב',
      'flats', 'flat', 'שטוחות',
      'trainers', 'trainer', 'נעלי ספורט',
      'loafers', 'loafer', 'מוקסינים',
      'pumps', 'pump', 'נעלי עקב',
      'slip-on', 'oxford', 'derby',
      'ankle boots', 'knee boots',
      'running shoes', 'walking shoes',
      'basketball shoes', 'tennis shoes',
      'footwear', 'calzado'
    ];
    
    const isShoe = shoeKeywords.some(keyword => 
      subfamily.includes(keyword) || 
      name.includes(keyword) || 
      family.includes(keyword) ||
      section.includes(keyword)
    );
    
    if (isShoe) {
      console.log(`✅ [StylingAgent] DETECTED SHOE: ${item.id} - ${name} (subfamily: ${subfamily})`);
    }
    
    return isShoe;
  }

  /**
   * Enhanced function to get appropriate shoes based on event and style
   */
  private getAppropriateShoes(shoes: any[], event?: string, hasOuterwear?: boolean, hasDress?: boolean): any[] {
    console.log(`🔍 [StylingAgent] Filtering shoes for event: ${event}, hasOuterwear: ${hasOuterwear}, hasDress: ${hasDress}`);
    
    // Filter out open shoes if there's outerwear (winter/coat rule)
    let filteredShoes = shoes;
    
    if (hasOuterwear) {
      filteredShoes = shoes.filter(shoe => this.isClosedShoe(shoe));
      console.log(`❄️ [StylingAgent] Filtered to ${filteredShoes.length} closed shoes for outerwear look`);
    }
    
    // Apply event-specific filtering
    if (event) {
      const eventSpecificShoes = this.filterShoesByEvent(filteredShoes, event, hasDress);
      if (eventSpecificShoes.length > 0) {
        console.log(`🎯 [StylingAgent] Found ${eventSpecificShoes.length} event-appropriate shoes for ${event}`);
        return eventSpecificShoes;
      }
    }
    
    console.log(`👟 [StylingAgent] Using ${filteredShoes.length} general appropriate shoes`);
    return filteredShoes;
  }

  /**
   * Filter shoes by specific event type
   */
  private filterShoesByEvent(shoes: any[], event: string, hasDress?: boolean): any[] {
    const eventLower = event.toLowerCase();
    
    // Evening/Party/Date - prefer heels, pumps, elegant shoes
    if (eventLower.includes('evening') || eventLower.includes('party') || eventLower.includes('date') || eventLower.includes('ערב')) {
      return shoes.filter(shoe => this.isElegantShoe(shoe));
    }
    
    // Casual/Weekend - prefer sneakers, loafers, casual shoes
    if (eventLower.includes('casual') || eventLower.includes('weekend') || eventLower.includes('יום-יום')) {
      return shoes.filter(shoe => this.isCasualShoe(shoe));
    }
    
    // Business/Work - prefer loafers, oxford, low heels
    if (eventLower.includes('business') || eventLower.includes('work') || eventLower.includes('עבודה')) {
      return shoes.filter(shoe => this.isBusinessShoe(shoe));
    }
    
    // Winter/Cold - prefer closed boots
    if (eventLower.includes('winter') || eventLower.includes('cold') || eventLower.includes('חורף')) {
      return shoes.filter(shoe => this.isWinterShoe(shoe));
    }
    
    return shoes;
  }

  /**
   * Check if shoe is elegant (heels, pumps, dress shoes)
   */
  private isElegantShoe(shoe: any): boolean {
    const name = (shoe.product_name || shoe.name || '').toLowerCase();
    const subfamily = shoe.product_subfamily?.toLowerCase() || '';
    
    const elegantKeywords = [
      'heels', 'heel', 'עקבים', 'עקב',
      'pumps', 'pump', 'נעלי עקב',
      'dress shoes', 'evening shoes',
      'stiletto', 'platform'
    ];
    
    return elegantKeywords.some(keyword => 
      name.includes(keyword) || subfamily.includes(keyword)
    );
  }

  /**
   * Check if shoe is casual (sneakers, casual flats)
   */
  private isCasualShoe(shoe: any): boolean {
    const name = (shoe.product_name || shoe.name || '').toLowerCase();
    const subfamily = shoe.product_subfamily?.toLowerCase() || '';
    
    const casualKeywords = [
      'sneakers', 'sneaker', 'סניקרס',
      'trainers', 'נעלי ספורט',
      'flats', 'שטוחות',
      'slip-on', 'canvas shoes'
    ];
    
    return casualKeywords.some(keyword => 
      name.includes(keyword) || subfamily.includes(keyword)
    );
  }

  /**
   * Check if shoe is business appropriate (loafers, oxford, low heels)
   */
  private isBusinessShoe(shoe: any): boolean {
    const name = (shoe.product_name || shoe.name || '').toLowerCase();
    const subfamily = shoe.product_subfamily?.toLowerCase() || '';
    
    const businessKeywords = [
      'loafers', 'loafer', 'מוקסינים',
      'oxford', 'derby',
      'low heel', 'עקב נמוך',
      'dress shoes', 'formal shoes'
    ];
    
    return businessKeywords.some(keyword => 
      name.includes(keyword) || subfamily.includes(keyword)
    );
  }

  /**
   * Check if shoe is winter appropriate (boots, closed shoes)
   */
  private isWinterShoe(shoe: any): boolean {
    const name = (shoe.product_name || shoe.name || '').toLowerCase();
    const subfamily = shoe.product_subfamily?.toLowerCase() || '';
    
    const winterKeywords = [
      'boots', 'boot', 'מגפיים', 'מגף',
      'ankle boots', 'knee boots',
      'winter shoes', 'נעלי חורף'
    ];
    
    return winterKeywords.some(keyword => 
      name.includes(keyword) || subfamily.includes(keyword)
    );
  }

  /**
   * Check if shoes are closed/appropriate for outerwear
   */
  private isClosedShoe(item: any): boolean {
    const subfamily = item.product_subfamily?.toLowerCase() || '';
    const name = (item.product_name || item.name || '').toLowerCase();
    const family = item.product_family?.toLowerCase() || '';
    
    // Open shoes to avoid with outerwear
    const openShoeKeywords = [
      'sandals', 'sandal', 'סנדלים', 'סנדל',
      'flip flops', 'flip-flops', 'כפכפים',
      'slides', 'slippers', 'נעלי בית',
      'open toe', 'peep toe',
      'beach', 'summer sandals'
    ];
    
    // Check if it's an open shoe
    const isOpenShoe = openShoeKeywords.some(keyword => 
      subfamily.includes(keyword) || 
      name.includes(keyword) || 
      family.includes(keyword)
    );
    
    // Closed shoes are preferred with outerwear
    const closedShoeKeywords = [
      'boots', 'boot', 'מגפיים', 'מגף',
      'sneakers', 'sneaker', 'סניקרס',
      'oxford', 'derby', 'loafers', 'מוקסינים',
      'pumps', 'heels', 'עקבים',
      'flats', 'שטוחות',
      'trainers', 'נעלי ספורט'
    ];
    
    const isClosedShoe = closedShoeKeywords.some(keyword => 
      subfamily.includes(keyword) || 
      name.includes(keyword) || 
      family.includes(keyword)
    );
    
    // Return true if it's a closed shoe or if we can't determine (default to allowing)
    const result = !isOpenShoe || isClosedShoe;
    
    if (!result) {
      console.log(`❌ [StylingAgent] FILTERED OUT open shoe for outerwear: ${item.id} - ${name}`);
    } else {
      console.log(`✅ [StylingAgent] APPROVED closed shoe for outerwear: ${item.id} - ${name}`);
    }
    
    return result;
  }

  /**
   * Enhanced top item detection - EXCLUDES dresses completely
   */
  private isTopItem(item: any): boolean {
    const subfamily = item.product_subfamily?.toLowerCase() || '';
    const name = (item.product_name || item.name || '').toLowerCase();
    const family = item.product_family?.toLowerCase() || '';
    
    // FIRST CHECK: Make sure this is NOT a dress
    const dressKeywords = ['dress', 'שמלה', 'gown', 'frock'];
    const isDress = dressKeywords.some(keyword => 
      subfamily.includes(keyword) || name.includes(keyword) || family.includes(keyword)
    );
    
    if (isDress) {
      console.log(`❌ [StylingAgent] FILTERED OUT dress from tops: ${item.id} - ${name}`);
      return false;
    }
    
    const topKeywords = [
      'shirt', 'blouse', 't-shirt', 'top', 'tee',
      'sweater', 'cardigan', 'pullover', 'jumper',
      'tank', 'camisole', 'vest', 'hoodie',
      'חולצה', 'טופ', 'סוודר', 'קרדיגן'
    ];
    
    const isTop = topKeywords.some(keyword => 
      subfamily.includes(keyword) || 
      name.includes(keyword) || 
      family.includes(keyword)
    );
    
    if (isTop) {
      console.log(`✅ [StylingAgent] DETECTED TOP: ${item.id} - ${name} (subfamily: ${subfamily})`);
    }
    
    return isTop;
  }

  /**
   * Enhanced bottom item detection (excluding dresses AND underwear)
   */
  private isBottomItem(item: any): boolean {
    const subfamily = item.product_subfamily?.toLowerCase() || '';
    const name = (item.product_name || item.name || '').toLowerCase();
    const family = item.product_family?.toLowerCase() || '';
    
    // Make sure it's not a dress
    const dressKeywords = ['dress', 'שמלה', 'gown', 'frock'];
    const isDress = dressKeywords.some(keyword => 
      subfamily.includes(keyword) || name.includes(keyword) || family.includes(keyword)
    );
    
    // EXCLUDE UNDERWEAR ITEMS - this was the main issue!
    const underwearKeywords = [
      'bra', 'briefs', 'underwear', 'panties', 'boxers',
      'lingerie', 'underpants', 'thong', 'bikini bottom',
      'תחתון', 'תחתונים', 'חזייה', 'בגד תחתון'
    ];
    
    const isUnderwear = underwearKeywords.some(keyword => 
      subfamily.includes(keyword) || name.includes(keyword) || family.includes(keyword)
    );
    
    if (isDress || isUnderwear) {
      if (isUnderwear) {
        console.log(`❌ [StylingAgent] FILTERED OUT underwear item: ${item.id} - ${name}`);
      }
      if (isDress) {
        console.log(`❌ [StylingAgent] FILTERED OUT dress from bottoms: ${item.id} - ${name}`);
      }
      return false;
    }
    
    const bottomKeywords = [
      'pants', 'trousers', 'jeans', 'shorts',
      'skirt', 'leggings', 'joggers', 'chinos',
      'מכנס', 'מכנסיים', 'ג\'ינס', 'שורט',
      'חצאית', 'לגינס'
    ];
    
    const isBottom = bottomKeywords.some(keyword => 
      subfamily.includes(keyword) || 
      name.includes(keyword) || 
      family.includes(keyword)
    );
    
    if (isBottom) {
      console.log(`✅ [StylingAgent] DETECTED BOTTOM: ${item.id} - ${name} (subfamily: ${subfamily})`);
    }
    
    return isBottom;
  }

  /**
   * Enhanced dress detection - STRICT dress identification
   */
  private isDressItem(item: any): boolean {
    const subfamily = item.product_subfamily?.toLowerCase() || '';
    const name = (item.product_name || item.name || '').toLowerCase();
    const family = item.product_family?.toLowerCase() || '';
    
    const dressKeywords = [
      'dress', 'שמלה', 'gown', 'frock',
      'maxi dress', 'mini dress', 'midi dress',
      'cocktail dress', 'evening dress'
    ];
    
    const isDress = dressKeywords.some(keyword => 
      subfamily.includes(keyword) || 
      name.includes(keyword) || 
      family.includes(keyword)
    );
    
    if (isDress) {
      console.log(`✅ [StylingAgent] DETECTED DRESS: ${item.id} - ${name} (subfamily: ${subfamily})`);
    }
    
    return isDress;
  }

  /**
   * Enhanced outerwear detection
   */
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
    
    console.log('🎯 [StylingAgent] Creating outfits with STRICT RULES and HIGH SCORING for all valid combinations:', { bodyStructure, mood, style, event });
    
    // Filter only available items first
    const availableFilteredItems = availableItems.filter(item => {
      const isAvailable = item.availability === true;
      if (!isAvailable) {
        console.log(`❌ [StylingAgent] FILTERED OUT unavailable item: ${item.id}`);
      }
      return isAvailable;
    });
    
    console.log(`📊 [StylingAgent] Available items: ${availableFilteredItems.length} out of ${availableItems.length}`);
    
    // Use enhanced detection methods for better categorization - STRICT SEPARATION
    const shoes = availableFilteredItems.filter(item => this.isShoeItem(item));
    const tops = availableFilteredItems.filter(item => this.isTopItem(item)); // Excludes dresses
    const bottoms = availableFilteredItems.filter(item => this.isBottomItem(item)); // Excludes dresses and underwear
    const dresses = availableFilteredItems.filter(item => this.isDressItem(item)); // Only dresses
    const outerwear = availableFilteredItems.filter(item => this.isOuterwearItem(item));
    
    console.log(`📊 [StylingAgent] STRICT categorization (no overlap):`, {
      shoes: shoes.length,
      tops: tops.length,
      bottoms: bottoms.length,
      dresses: dresses.length,
      outerwear: outerwear.length
    });
    
    const looks: Look[] = [];
    const usedItemIds = new Set<string>();
    
    // Critical check: Must have shoes!
    if (shoes.length === 0) {
      console.error('❌ [StylingAgent] CRITICAL: No shoes available - cannot create complete outfits');
      return {
        looks: [],
        reasoning: 'לא ניתן ליצור תלבושות ללא נעליים זמינות במלאי. אנא וודאו שיש נעליים זמינות במאגר הנתונים.'
      };
    }
    
    // RULE 1: Create dress looks: dress + shoes (2 items) OR dress + shoes + outerwear (3 items)
    // BOTH GET HIGH SCORES (95-100) - NO OTHER ITEMS ALLOWED
    if (dresses.length > 0) {
      for (let i = 0; i < Math.min(2, dresses.length) && looks.length < 3; i++) {
        const dress = dresses[i];
        if (usedItemIds.has(dress.id)) continue;
        
        // Get appropriate shoes for dress look
        const appropriateShoes = this.getAppropriateShoes(shoes, event, false, true);
        const availableShoes = appropriateShoes.filter(shoe => !usedItemIds.has(shoe.id));
        if (availableShoes.length === 0) break;
        
        const shoe = availableShoes[0];
        
        // Check work appropriateness if needed
        const isWorkAppropriate = this.isWorkAppropriate(dress, shoe, undefined, undefined, event);
        if (event === 'work' && !isWorkAppropriate) continue;
        
        // Create dress look: DRESS + SHOES ONLY (NO bottoms/tops!)
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
        
        // RULE: Add outerwear to dress ONLY if event requires it (work/winter)
        const shouldAddOuterwear = event === 'work' || mood.includes('קר') || mood.includes('חורף') || event?.includes('winter');
        if (outerwear.length > 0 && shouldAddOuterwear) {
          const availableOuterwear = outerwear.filter(coat => !usedItemIds.has(coat.id));
          if (availableOuterwear.length > 0) {
            const coat = availableOuterwear[0];
            
            // For dress + outerwear, ensure closed shoes
            const closedShoes = this.getAppropriateShoes(shoes, event, true, true);
            const availableClosedShoes = closedShoes.filter(s => !usedItemIds.has(s.id));
            
            if (availableClosedShoes.length > 0) {
              // Replace shoe with closed shoe
              dressLookItems[1] = {
                id: availableClosedShoes[0].id || `shoes-${i}`,
                title: availableClosedShoes[0].product_name || availableClosedShoes[0].name || 'נעליים סגורות',
                description: availableClosedShoes[0].description || '',
                image: availableClosedShoes[0].image || '',
                price: availableClosedShoes[0].price ? `$${availableClosedShoes[0].price}` : '0',
                type: 'shoes'
              };
              
              dressLookItems.push({
                id: coat.id || `coat-${i}`,
                title: coat.product_name || coat.name || 'מעיל',
                description: coat.description || '',
                image: coat.image || '',
                price: coat.price ? `$${coat.price}` : '0',
                type: 'outerwear'
              });
              usedItemIds.add(coat.id);
              usedItemIds.add(availableClosedShoes[0].id);
            }
          }
        } else {
          usedItemIds.add(shoe.id);
        }
        
        // Validate the dress look composition and score
        const validation = this.validateOutfitComposition(dressLookItems);
        
        const dressLook: Look = {
          id: `dress-look-${i}`,
          items: dressLookItems,
          description: `שמלה ${dress.product_name || ''} עם נעליים מתאימות${dressLookItems.length === 3 ? ' ועליונית' : ''}`,
          occasion: (event as any) || 'general',
          style: style,
          mood: mood
        };
        
        looks.push(dressLook);
        usedItemIds.add(dress.id);
        
        console.log(`✅ [StylingAgent] Created DRESS look: ${dressLookItems.length} items (HIGH SCORE: ${validation.score}) - ${validation.reason}`);
      }
    }
    
    // RULE 2: Create outerwear looks: OUTERWEAR + TOP + BOTTOM + CLOSED SHOES (4 items exactly)
    // HIGH SCORE (95) - NO DRESSES ALLOWED
    if (outerwear.length > 0 && tops.length > 0 && bottoms.length > 0) {
      const maxOuterwearLooks = Math.min(1, 3 - looks.length);
      
      for (let i = 0; i < maxOuterwearLooks; i++) {
        const availableOuterwear = outerwear.filter(coat => !usedItemIds.has(coat.id));
        const availableTops = tops.filter(top => !usedItemIds.has(top.id));
        const availableBottoms = bottoms.filter(bottom => !usedItemIds.has(bottom.id));
        
        if (availableOuterwear.length === 0 || availableTops.length === 0 || availableBottoms.length === 0) break;
        
        const coat = availableOuterwear[0];
        const top = availableTops[0];
        const bottom = availableBottoms[0];
        
        // RULE: Outerwear REQUIRES closed shoes
        const appropriateShoes = this.getAppropriateShoes(shoes, event, true, false);
        const availableClosedShoes = appropriateShoes.filter(shoe => !usedItemIds.has(shoe.id));
        
        if (availableClosedShoes.length === 0) break;
        const shoe = availableClosedShoes[0];
        
        // Check work appropriateness if needed
        const isWorkAppropriate = this.isWorkAppropriate(top, shoe, bottom, coat, event);
        if (event === 'work' && !isWorkAppropriate) continue;
        
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
            title: shoe.product_name || shoe.name || 'נעליים סגורות',
            description: shoe.description || '',
            image: shoe.image || '',
            price: shoe.price ? `$${shoe.price}` : '0',
            type: 'shoes'
          }
        ];
        
        // Validate the outerwear look composition and score
        const validation = this.validateOutfitComposition(outerwearLookItems);
        
        // Create outerwear look: EXACTLY 4 items with closed shoes - HIGH SCORE
        const outerwearLook: Look = {
          id: `outerwear-look-${i}`,
          items: outerwearLookItems,
          description: this.generateDescription([
            { title: coat.product_name || coat.name || 'מעיל' },
            { title: top.product_name || top.name || 'חולצה' },
            { title: bottom.product_name || bottom.name || 'מכנס' },
            { title: shoe.product_name || shoe.name || 'נעליים סגורות' }
          ]),
          occasion: (event as any) || 'general',
          style: style,
          mood: mood
        };
        
        looks.push(outerwearLook);
        usedItemIds.add(coat.id);
        usedItemIds.add(top.id);
        usedItemIds.add(bottom.id);
        usedItemIds.add(shoe.id);
        
        console.log(`✅ [StylingAgent] Created OUTERWEAR look: 4 items (HIGH SCORE: ${validation.score}) - ${validation.reason}`);
      }
    }
    
    // RULE 3: Create regular looks: TOP + BOTTOM + SHOES (3 items exactly) - HIGH SCORE (95)
    // NO DRESSES ALLOWED
    const maxRegularLooks = 3 - looks.length;
    let regularLookCount = 0;
    
    for (let i = 0; i < tops.length && regularLookCount < maxRegularLooks; i++) {
      const top = tops[i];
      if (usedItemIds.has(top.id)) continue;
      
      for (let j = 0; j < bottoms.length && regularLookCount < maxRegularLooks; j++) {
        const bottom = bottoms[j];
        if (usedItemIds.has(bottom.id)) continue;
        
        // Get appropriate shoes for regular look (any shoes allowed)
        const appropriateShoes = this.getAppropriateShoes(shoes, event, false, false);
        const availableShoes = appropriateShoes.filter(shoe => !usedItemIds.has(shoe.id));
        if (availableShoes.length === 0) break;
        
        const shoe = availableShoes[0];
        
        // Check work appropriateness if needed
        const isWorkAppropriate = this.isWorkAppropriate(top, shoe, bottom, undefined, event);
        if (event === 'work' && !isWorkAppropriate) continue;
        
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
        
        // Validate the regular look composition and score
        const validation = this.validateOutfitComposition(regularLookItems);
        
        // Create regular look: exactly 3 items - HIGH SCORE
        const regularLook: Look = {
          id: `regular-look-${regularLookCount}`,
          items: regularLookItems,
          description: this.generateDescription([
            { title: top.product_name || top.name || 'חולצה' },
            { title: bottom.product_name || bottom.name || 'מכנס' },
            { title: shoe.product_name || shoe.name || 'נעליים מתאימות' }
          ]),
          occasion: (event as any) || 'general',
          style: style,
          mood: mood
        };
        
        looks.push(regularLook);
        usedItemIds.add(top.id);
        usedItemIds.add(bottom.id);
        usedItemIds.add(shoe.id);
        
        console.log(`✅ [StylingAgent] Created REGULAR look: 3 items (HIGH SCORE: ${validation.score}) - ${validation.reason}`);
        regularLookCount++;
      }
    }
    
    // Validate all looks follow the STRICT styling rules with HIGH SCORING
    const validatedLooks = looks.filter(look => {
      const validation = this.validateOutfitComposition(look.items);
      
      if (!validation.isValid || validation.score === 0) {
        console.error(`❌ [StylingAgent] REJECTED look ${look.id}: ${validation.reason} (score: ${validation.score})`);
        return false;
      }
      
      console.log(`✅ [StylingAgent] APPROVED look ${look.id}: ${validation.reason} (HIGH SCORE: ${validation.score})`);
      return true;
    });
    
    console.log(`✅ [StylingAgent] Created ${validatedLooks.length} VALID complete outfits with STRICT RULES and HIGH SCORING`);
    
    return {
      looks: validatedLooks.slice(0, 3),
      reasoning: `יצרתי ${validatedLooks.length} תלבושות תקינות עם כללים מחמירים וציונים גבוהים (90+): שמלות רק עם נעליים (ללא חולצות/מכנסיים), לוקים עם עליונית, לוקים רגילים. סינון מוצלח של פריטי תחתונים ומניעת ערבוב של שמלות עם פריטים אחרים.`
    };
  }
  
  isWorkAppropriate(top: any, shoes: any, bottom?: any, coat?: any, event?: string): boolean {
    if (event !== 'work') return true;
    
    const workInappropriateKeywords = [
      'ביקיני', 'בגד ים', 'חולצת טי', 'טי שירט', 'שורט', 'מיני', 'קרופ',
      'נעלי ספורט', 'כפכפים', 'סנדלים', 'קונברס', 'טרנינג'
    ];
    
    const isTopAppropriate = !workInappropriateKeywords.some(keyword => 
      top.name?.toLowerCase().includes(keyword) || 
      top.description?.toLowerCase().includes(keyword)
    );
    
    const isShoesAppropriate = !workInappropriateKeywords.some(keyword => 
      shoes.name?.toLowerCase().includes(keyword) || 
      shoes.description?.toLowerCase().includes(keyword)
    );
    
    let isBottomAppropriate = true;
    if (bottom) {
      isBottomAppropriate = !workInappropriateKeywords.some(keyword => 
        bottom.name?.toLowerCase().includes(keyword) || 
        bottom.description?.toLowerCase().includes(keyword)
      );
    }
    
    let isCoatAppropriate = true;
    if (coat) {
      isCoatAppropriate = !workInappropriateKeywords.some(keyword => 
        coat.name?.toLowerCase().includes(keyword) || 
        coat.description?.toLowerCase().includes(keyword)
      );
    }
    
    return isTopAppropriate && isShoesAppropriate && isBottomAppropriate && isCoatAppropriate;
  }
  
  generateDescription(items: any[]): string {
    const itemNames = items.map(item => item.title || item.name).join(' עם ');
    return itemNames;
  }
}

export const stylingAgent = new StylingAgentClass();
