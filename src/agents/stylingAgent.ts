
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
   * Enhanced top item detection
   */
  private isTopItem(item: any): boolean {
    const subfamily = item.product_subfamily?.toLowerCase() || '';
    const name = (item.product_name || item.name || '').toLowerCase();
    const family = item.product_family?.toLowerCase() || '';
    
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

  /**
   * Enhanced bottom item detection (excluding dresses)
   */
  private isBottomItem(item: any): boolean {
    const subfamily = item.product_subfamily?.toLowerCase() || '';
    const name = (item.product_name || item.name || '').toLowerCase();
    const family = item.product_family?.toLowerCase() || '';
    
    const bottomKeywords = [
      'pants', 'trousers', 'jeans', 'shorts',
      'skirt', 'leggings', 'joggers', 'chinos',
      'מכנס', 'מכנסיים', 'ג\'ינס', 'שורט',
      'חצאית', 'לגינס'
    ];
    
    // Make sure it's not a dress
    const dressKeywords = ['dress', 'שמלה', 'gown', 'frock'];
    const isDress = dressKeywords.some(keyword => 
      subfamily.includes(keyword) || name.includes(keyword) || family.includes(keyword)
    );
    
    if (isDress) return false;
    
    return bottomKeywords.some(keyword => 
      subfamily.includes(keyword) || 
      name.includes(keyword) || 
      family.includes(keyword)
    );
  }

  /**
   * Enhanced dress detection
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
    
    return dressKeywords.some(keyword => 
      subfamily.includes(keyword) || 
      name.includes(keyword) || 
      family.includes(keyword)
    );
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
    
    console.log('🎯 [StylingAgent] Creating outfits with advanced styling rules for:', { bodyStructure, mood, style, event });
    
    // Filter only available items first
    const availableFilteredItems = availableItems.filter(item => {
      const isAvailable = item.availability === true;
      if (!isAvailable) {
        console.log(`❌ [StylingAgent] FILTERED OUT unavailable item: ${item.id}`);
      }
      return isAvailable;
    });
    
    console.log(`📊 [StylingAgent] Available items: ${availableFilteredItems.length} out of ${availableItems.length}`);
    
    // Use enhanced detection methods for better categorization
    const shoes = availableFilteredItems.filter(item => this.isShoeItem(item));
    const tops = availableFilteredItems.filter(item => this.isTopItem(item));
    const bottoms = availableFilteredItems.filter(item => this.isBottomItem(item));
    const dresses = availableFilteredItems.filter(item => this.isDressItem(item));
    const outerwear = availableFilteredItems.filter(item => this.isOuterwearItem(item));
    
    console.log(`📊 [StylingAgent] Enhanced categorization:`, {
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
        
        // Create dress look: DRESS + SHOES (NO bottoms!)
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
        
        console.log(`✅ [StylingAgent] Created DRESS look: ${dressLookItems.length} items (dress + shoes${dressLookItems.length === 3 ? ' + outerwear' : ''})`);
      }
    }
    
    // RULE 2: Create outerwear looks: OUTERWEAR + TOP + BOTTOM + CLOSED SHOES (4 items exactly)
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
        
        // Create outerwear look: EXACTLY 4 items with closed shoes
        const outerwearLook: Look = {
          id: `outerwear-look-${i}`,
          items: [
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
          ],
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
        
        console.log(`✅ [StylingAgent] Created OUTERWEAR look: 4 items with event-appropriate closed shoes`);
      }
    }
    
    // RULE 3: Create regular looks: TOP + BOTTOM + SHOES (3 items exactly)
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
        
        // Create regular look: exactly 3 items
        const regularLook: Look = {
          id: `regular-look-${regularLookCount}`,
          items: [
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
          ],
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
        
        console.log(`✅ [StylingAgent] Created REGULAR look: 3 items with event-appropriate shoes`);
        regularLookCount++;
      }
    }
    
    // Validate all looks follow the advanced styling rules
    const validatedLooks = looks.filter(look => {
      const hasShoes = look.items.some(item => item.type === 'shoes');
      const hasDress = look.items.some(item => item.type === 'dress');
      const hasBottom = look.items.some(item => item.type === 'bottom');
      const hasOuterwear = look.items.some(item => item.type === 'outerwear');
      const hasTop = look.items.some(item => item.type === 'top');
      
      // RULE: If has dress, should not have bottom
      if (hasDress && hasBottom) {
        console.error(`❌ [StylingAgent] Invalid look ${look.id}: has both dress AND bottom!`);
        return false;
      }
      
      // RULE: Every look must have shoes
      if (!hasShoes) {
        console.error(`❌ [StylingAgent] Invalid look ${look.id}: missing shoes!`);
        return false;
      }
      
      // RULE: If has outerwear, must have top
      if (hasOuterwear && !hasTop && !hasDress) {
        console.error(`❌ [StylingAgent] Invalid look ${look.id}: outerwear without top!`);
        return false;
      }
      
      console.log(`✅ [StylingAgent] Valid look ${look.id}: ${look.items.length} items following styling rules`);
      return true;
    });
    
    console.log(`✅ [StylingAgent] Created ${validatedLooks.length} VALID complete outfits with advanced styling rules`);
    
    return {
      looks: validatedLooks.slice(0, 3),
      reasoning: `יצרתי ${validatedLooks.length} תלבושות תקינות לפי כללי סטיילינג מתקדמים: שמלות (2-3 פריטים), לוקים עם עליונית (4 פריטים), לוקים רגילים (3 פריטים). נעליים נבחרו לפי האירוע והסגנון, עם נעליים סגורות לעליוניות בלבד.`
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
