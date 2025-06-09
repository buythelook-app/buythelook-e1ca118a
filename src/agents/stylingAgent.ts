
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
    
    // Filter items by category
    const tops = availableItems.filter(item => item.category === 'top');
    const bottoms = availableItems.filter(item => item.category === 'bottom');
    const shoes = availableItems.filter(item => item.category === 'shoes');
    const dresses = availableItems.filter(item => item.category === 'dress');
    const coats = availableItems.filter(item => item.category === 'coat');
    
    const looks: Look[] = [];
    
    // Generate dress outfits (dress + shoes only - NO PANTS WITH DRESS!)
    if (dresses.length > 0 && shoes.length > 0) {
      for (let i = 0; i < Math.min(2, dresses.length); i++) {
        const dress = dresses[i];
        const shoe = shoes[i % shoes.length];
        
        const isWorkAppropriate = this.isWorkAppropriate(dress, shoe, undefined, undefined, event);
        
        if (!event || event !== 'work' || isWorkAppropriate) {
          looks.push({
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
            description: `${dress.name || 'שמלה'} עם ${shoe.name || 'נעליים'}`,
            occasion: (event as any) || 'general',
            style: style,
            mood: mood
          });
        }
      }
    }
    
    // Generate regular outfits (top + bottom + shoes, optionally + coat)
    // Only create regular outfits if we didn't create enough dress outfits
    const maxRegularOutfits = 3 - looks.length;
    let regularOutfitCount = 0;
    
    for (let i = 0; i < tops.length && regularOutfitCount < maxRegularOutfits; i++) {
      for (let j = 0; j < bottoms.length && regularOutfitCount < maxRegularOutfits; j++) {
        const top = tops[i];
        const bottom = bottoms[j];
        const shoe = shoes[regularOutfitCount % shoes.length];
        
        // Check work appropriateness
        const isWorkAppropriate = this.isWorkAppropriate(top, shoe, bottom, undefined, event);
        
        if (!event || event !== 'work' || isWorkAppropriate) {
          const baseItems = [
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
          ];
          
          // Add coat if available and it's a work event or winter mood
          if (coats.length > 0 && (event === 'work' || mood.includes('חורף'))) {
            const coat = coats[regularOutfitCount % coats.length];
            baseItems.push({
              id: coat.id || `coat-${regularOutfitCount}`,
              title: coat.name || coat.product_name || 'מעיל',
              description: coat.description || '',
              image: coat.image || '',
              price: coat.price || '0',
              type: 'outerwear'
            });
          }
          
          looks.push({
            id: `regular-look-${regularOutfitCount}`,
            items: baseItems,
            description: this.generateDescription(baseItems),
            occasion: (event as any) || 'general',
            style: style,
            mood: mood
          });
          
          regularOutfitCount++;
        }
      }
    }
    
    return {
      looks: looks.slice(0, 3),
      reasoning: `יצרתי ${looks.length} לוקים מתאימים ל${mood} בסגנון ${style}${event ? ` לאירוע ${event}` : ''}. שמות לא משולבות עם מכנסיים.`
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
