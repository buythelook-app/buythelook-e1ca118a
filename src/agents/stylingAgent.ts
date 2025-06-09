
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

  async createOutfits(request: StylingRequest): Promise<StylingResult> {
    const { bodyStructure, mood, style, event, availableItems } = request;
    
    console.log('Styling agent creating outfits for:', { bodyStructure, mood, style, event });
    
    // סינון פריטים לפי קטגוריות עם זמינות
    const availableFilteredItems = availableItems.filter(item => item.availability === true);
    
    const tops = availableFilteredItems.filter(item => 
      item.category === 'top' || 
      item.category === 'חולצה' || 
      item.category === 'גופייה' ||
      item.category === 'בלוזה'
    );
    
    const bottoms = availableFilteredItems.filter(item => 
      item.category === 'bottom' || 
      item.category === 'מכנס' || 
      item.category === 'חצאית' ||
      item.category === 'ג\'ינס'
    );
    
    const shoes = availableFilteredItems.filter(item => 
      item.category === 'shoes' || 
      item.category === 'נעליים'
    );
    
    const dresses = availableFilteredItems.filter(item => 
      item.category === 'dress' || 
      item.category === 'שמלה'
    );
    
    const outerwear = availableFilteredItems.filter(item => 
      item.category === 'coat' || 
      item.category === 'jacket' ||
      item.category === 'blazer' ||
      item.category === 'מעיל' || 
      item.category === 'ג\'קט' ||
      item.category === 'בלייזר'
    );
    
    const looks: Look[] = [];
    const usedItemIds = new Set<string>();
    
    console.log('Available items by category:', {
      tops: tops.length,
      bottoms: bottoms.length,
      shoes: shoes.length,
      dresses: dresses.length,
      outerwear: outerwear.length
    });
    
    // בדיקה קריטית: חייבות להיות נעליים!
    if (shoes.length === 0) {
      console.warn('❌ No shoes available - cannot create complete outfits');
      return {
        looks: [],
        reasoning: 'לא ניתן ליצור תלבושות ללא נעליים זמינות במלאי'
      };
    }
    
    // 1. צור לוקי שמלה: שמלה + נעליים (ו-אופציונלי עליונית)
    if (dresses.length > 0) {
      for (let i = 0; i < Math.min(2, dresses.length) && looks.length < 3; i++) {
        const dress = dresses[i];
        if (usedItemIds.has(dress.id)) continue;
        
        // מצא נעליים זמינות
        const availableShoes = shoes.filter(shoe => !usedItemIds.has(shoe.id));
        if (availableShoes.length === 0) break;
        
        const shoe = availableShoes[0];
        
        // בדוק התאמה לאירוע
        const isWorkAppropriate = this.isWorkAppropriate(dress, shoe, undefined, undefined, event);
        if (event === 'work' && !isWorkAppropriate) continue;
        
        // צור לוק שמלה: רק שמלה + נעליים (ללא מכנסיים!)
        const dressLookItems = [
          {
            id: dress.id || `dress-${i}`,
            title: dress.name || dress.product_name || 'שמלה',
            description: dress.description || '',
            image: dress.image || '',
            price: dress.price || '0',
            type: 'dress'
          },
          {
            id: shoe.id || `shoes-${i}`,
            title: shoe.name || shoe.product_name || 'נעליים',
            description: shoe.description || '',
            image: shoe.image || '',
            price: shoe.price || '0',
            type: 'shoes'
          }
        ];
        
        // הוסף עליונית רק אם מתאים (עבודה או מזג אוויר קר)
        if (outerwear.length > 0 && (event === 'work' || mood.includes('קר') || mood.includes('חורף'))) {
          const availableOuterwear = outerwear.filter(coat => !usedItemIds.has(coat.id));
          if (availableOuterwear.length > 0) {
            const coat = availableOuterwear[0];
            dressLookItems.push({
              id: coat.id || `coat-${i}`,
              title: coat.name || coat.product_name || 'מעיל',
              description: coat.description || '',
              image: coat.image || '',
              price: coat.price || '0',
              type: 'outerwear'
            });
            usedItemIds.add(coat.id);
          }
        }
        
        const dressLook: Look = {
          id: `dress-look-${i}`,
          items: dressLookItems,
          description: `שמלה ${dress.name || ''} עם נעליים ${shoe.name || ''}`,
          occasion: (event as any) || 'general',
          style: style,
          mood: mood
        };
        
        looks.push(dressLook);
        usedItemIds.add(dress.id);
        usedItemIds.add(shoe.id);
        
        console.log(`✅ Created dress look: dress ${dress.id} + shoes ${shoe.id} (NO bottom!)`);
      }
    }
    
    // 2. צור לוקים עם עליונית: עליונית + חולצה + מכנס + נעליים (4 פריטים)
    if (outerwear.length > 0 && tops.length > 0 && bottoms.length > 0) {
      const maxOuterwearLooks = Math.min(1, 3 - looks.length);
      
      for (let i = 0; i < maxOuterwearLooks; i++) {
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
        
        // בדוק התאמה לאירוע
        const isWorkAppropriate = this.isWorkAppropriate(top, shoe, bottom, coat, event);
        if (event === 'work' && !isWorkAppropriate) continue;
        
        // צור לוק עליונית: 4 פריטים - עליונית + חולצה + מכנס + נעליים
        const outerwearLook: Look = {
          id: `outerwear-look-${i}`,
          items: [
            {
              id: coat.id || `coat-${i}`,
              title: coat.name || coat.product_name || 'מעיל',
              description: coat.description || '',
              image: coat.image || '',
              price: coat.price || '0',
              type: 'outerwear'
            },
            {
              id: top.id || `top-${i}`,
              title: top.name || top.product_name || 'חולצה',
              description: top.description || '',
              image: top.image || '',
              price: top.price || '0',
              type: 'top'
            },
            {
              id: bottom.id || `bottom-${i}`,
              title: bottom.name || bottom.product_name || 'מכנס',
              description: bottom.description || '',
              image: bottom.image || '',
              price: bottom.price || '0',
              type: 'bottom'
            },
            {
              id: shoe.id || `shoes-${i}`,
              title: shoe.name || shoe.product_name || 'נעליים',
              description: shoe.description || '',
              image: shoe.image || '',
              price: shoe.price || '0',
              type: 'shoes'
            }
          ],
          description: this.generateDescription([
            { title: coat.name || coat.product_name || 'מעיל' },
            { title: top.name || top.product_name || 'חולצה' },
            { title: bottom.name || bottom.product_name || 'מכנס' },
            { title: shoe.name || shoe.product_name || 'נעליים' }
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
        
        console.log(`✅ Created outerwear look: coat ${coat.id} + top ${top.id} + bottom ${bottom.id} + shoes ${shoe.id}`);
      }
    }
    
    // 3. צור לוקים רגילים: חולצה + מכנס + נעליים (3 פריטים)
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
        
        // בדוק התאמה לאירוע
        const isWorkAppropriate = this.isWorkAppropriate(top, shoe, bottom, undefined, event);
        if (event === 'work' && !isWorkAppropriate) continue;
        
        // צור לוק רגיל: 3 פריטים - חולצה + מכנס + נעליים
        const regularLook: Look = {
          id: `regular-look-${regularLookCount}`,
          items: [
            {
              id: top.id || `top-${i}`,
              title: top.name || top.product_name || 'חולצה',
              description: top.description || '',
              image: top.image || '',
              price: top.price || '0',
              type: 'top'
            },
            {
              id: bottom.id || `bottom-${j}`,
              title: bottom.name || bottom.product_name || 'מכנס',
              description: bottom.description || '',
              image: bottom.image || '',
              price: bottom.price || '0',
              type: 'bottom'
            },
            {
              id: shoe.id || `shoes-${regularLookCount}`,
              title: shoe.name || shoe.product_name || 'נעליים',
              description: shoe.description || '',
              image: shoe.image || '',
              price: shoe.price || '0',
              type: 'shoes'
            }
          ],
          description: this.generateDescription([
            { title: top.name || top.product_name || 'חולצה' },
            { title: bottom.name || bottom.product_name || 'מכנס' },
            { title: shoe.name || shoe.product_name || 'נעליים' }
          ]),
          occasion: (event as any) || 'general',
          style: style,
          mood: mood
        };
        
        looks.push(regularLook);
        usedItemIds.add(top.id);
        usedItemIds.add(bottom.id);
        usedItemIds.add(shoe.id);
        
        console.log(`✅ Created regular look: top ${top.id} + bottom ${bottom.id} + shoes ${shoe.id}`);
        regularLookCount++;
      }
    }
    
    // ודא שכל תלבושת כוללת נעליים
    const looksWithShoes = looks.filter(look => 
      look.items.some(item => item.type === 'shoes')
    );
    
    if (looksWithShoes.length !== looks.length) {
      console.error('❌ Some looks created without shoes!');
    }
    
    console.log(`✅ Created ${looks.length} complete outfits following all logic rules`);
    
    return {
      looks: looks.slice(0, 3),
      reasoning: `יצרתי ${looks.length} תלבושות לפי הכללים: שמלות רק עם נעליים, לוקים עם עליונית כוללים 4 פריטים, לוקים רגילים כוללים 3 פריטים. כל תלבושת כוללת נעליים בהכרח.`
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
