
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
    // This method can be implemented when needed for the agent crew
    console.log(`StylingAgent run method called for user: ${userId}`);
    return { success: true, data: null };
  }

  async createOutfits(request: StylingRequest): Promise<StylingResult> {
    const { bodyStructure, mood, style, event, availableItems } = request;
    
    console.log('Styling agent creating outfits for:', { bodyStructure, mood, style, event });
    
    // Filter items by category with strict categorization
    const tops = availableItems.filter(item => 
      item.category === 'top' || 
      item.category === 'חולצה' || 
      item.category === 'גופייה' ||
      item.category === 'בלייזר'
    );
    
    const bottoms = availableItems.filter(item => 
      item.category === 'bottom' || 
      item.category === 'מכנס' || 
      item.category === 'חצאית' ||
      item.category === 'ג\'ינס'
    );
    
    const shoes = availableItems.filter(item => 
      item.category === 'shoes' || 
      item.category === 'נעליים'
    );
    
    const dresses = availableItems.filter(item => 
      item.category === 'dress' || 
      item.category === 'שמלה'
    );
    
    const coats = availableItems.filter(item => 
      item.category === 'coat' || 
      item.category === 'מעיל' || 
      item.category === 'ג\'קט'
    );
    
    const looks: Look[] = [];
    const usedItemIds = new Set<string>(); // Track used items to avoid duplicates
    
    console.log('Available items by category:', {
      tops: tops.length,
      bottoms: bottoms.length,
      shoes: shoes.length,
      dresses: dresses.length,
      coats: coats.length
    });
    
    // בדיקה חשובה: חייבות להיות נעליים!
    if (shoes.length === 0) {
      console.warn('❌ No shoes available - cannot create complete outfits');
      return {
        looks: [],
        reasoning: 'לא ניתן ליצור תלבושות ללא נעליים זמינות במלאי'
      };
    }
    
    // 1. צור תלבושות שמלה - רק שמלה + נעליים (ללא מכנסיים!)
    if (dresses.length > 0) {
      for (let i = 0; i < Math.min(2, dresses.length) && looks.length < 3; i++) {
        const dress = dresses[i];
        
        // בחר נעליים שלא נוצלו עדיין
        const availableShoes = shoes.filter(shoe => !usedItemIds.has(shoe.id));
        if (availableShoes.length === 0) break;
        
        const shoe = availableShoes[0];
        
        // וודא שהפריטים לא נוצלו כבר
        if (usedItemIds.has(dress.id) || usedItemIds.has(shoe.id)) continue;
        
        const isWorkAppropriate = this.isWorkAppropriate(dress, shoe, undefined, undefined, event);
        
        if (!event || event !== 'work' || isWorkAppropriate) {
          // צור תלבושת שמלה - רק 2 פריטים: שמלה + נעליים
          const dressLook: Look = {
            id: `dress-look-${i}`,
            items: [
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
            ],
            description: `שמלה ${dress.name || ''} עם נעליים ${shoe.name || ''}`,
            occasion: (event as any) || 'general',
            style: style,
            mood: mood
          };
          
          looks.push(dressLook);
          
          // סמן פריטים כמנוצלים
          usedItemIds.add(dress.id);
          usedItemIds.add(shoe.id);
          
          console.log(`✅ Created dress look: dress ${dress.id} + shoes ${shoe.id} (NO PANTS!)`);
        }
      }
    }
    
    // 2. צור תלבושות רגילות - חולצה + מכנס + נעליים (3 פריטים בדיוק)
    const maxRegularOutfits = 3 - looks.length;
    let regularOutfitCount = 0;
    
    for (let i = 0; i < tops.length && regularOutfitCount < maxRegularOutfits; i++) {
      const top = tops[i];
      if (usedItemIds.has(top.id)) continue;
      
      for (let j = 0; j < bottoms.length && regularOutfitCount < maxRegularOutfits; j++) {
        const bottom = bottoms[j];
        if (usedItemIds.has(bottom.id)) continue;
        
        // מצא נעליים זמינות (לא בשימוש)
        const availableShoes = shoes.filter(shoe => !usedItemIds.has(shoe.id));
        if (availableShoes.length === 0) {
          console.warn('❌ No more available shoes for regular outfits');
          break;
        }
        
        const shoe = availableShoes[0];
        
        // בדוק התאמה לעבודה
        const isWorkAppropriate = this.isWorkAppropriate(top, shoe, bottom, undefined, event);
        
        if (!event || event !== 'work' || isWorkAppropriate) {
          // צור תלבושת רגילה - 3 פריטים: חולצה + מכנס + נעליים
          const regularLook: Look = {
            id: `regular-look-${regularOutfitCount}`,
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
                id: shoe.id || `shoes-${regularOutfitCount}`,
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
          
          // הוסף מעיל רק אם צריך (עבודה או חורף) - כפריט רביעי נוסף
          if (coats.length > 0 && (event === 'work' || mood.includes('חורף'))) {
            const availableCoats = coats.filter(coat => !usedItemIds.has(coat.id));
            if (availableCoats.length > 0) {
              const coat = availableCoats[0];
              
              regularLook.items.push({
                id: coat.id || `coat-${regularOutfitCount}`,
                title: coat.name || coat.product_name || 'מעיל',
                description: coat.description || '',
                image: coat.image || '',
                price: coat.price || '0',
                type: 'outerwear'
              });
              
              usedItemIds.add(coat.id);
            }
          }
          
          looks.push(regularLook);
          
          // סמן פריטים כמנוצלים
          usedItemIds.add(top.id);
          usedItemIds.add(bottom.id);
          usedItemIds.add(shoe.id);
          
          console.log(`✅ Created regular look: top ${top.id} + bottom ${bottom.id} + shoes ${shoe.id}`);
          
          regularOutfitCount++;
        }
      }
    }
    
    console.log(`✅ Created ${looks.length} complete outfits - each dress look has 2 items (dress+shoes), each regular look has 3+ items (top+bottom+shoes+optional coat)`);
    
    // וודא שכל תלבושת יש לה נעליים
    const looksWithShoes = looks.filter(look => 
      look.items.some(item => item.type === 'shoes')
    );
    
    if (looksWithShoes.length !== looks.length) {
      console.error('❌ Some looks created without shoes!');
    }
    
    return {
      looks: looks.slice(0, 3),
      reasoning: `יצרתי ${looks.length} תלבושות ייחודיות: שמלות רק עם נעליים (ללא מכנסיים), תלבושות רגילות עם חולצה+מכנס+נעליים. כל תלבושת כוללת נעליים בהכרח.`
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
    
    return isTopAppropriate && isShoesAppropriate && isBottomAppropriate;
  }
  
  generateDescription(items: any[]): string {
    const itemNames = items.map(item => item.title || item.name).join(' עם ');
    return itemNames;
  }
}

export const stylingAgent = new StylingAgentClass();
