
import { Look } from '../types/lookTypes';

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

export const stylingAgent = {
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
    
    // Generate dress outfits (dress + shoes only)
    if (dresses.length > 0 && shoes.length > 0) {
      for (let i = 0; i < Math.min(2, dresses.length); i++) {
        const dress = dresses[i];
        const shoe = shoes[i % shoes.length];
        
        const isWorkAppropriate = this.isWorkAppropriate(dress, shoe, undefined, undefined, event);
        
        if (!event || event !== 'work' || isWorkAppropriate) {
          looks.push({
            id: `dress-look-${i}`,
            items: [dress, shoe],
            description: `${dress.name} עם ${shoe.name}`,
            occasion: event as any || 'general',
            style: style,
            mood: mood
          });
        }
      }
    }
    
    // Generate regular outfits (top + bottom + shoes, optionally + coat)
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
          const baseItems = [top, bottom, shoe];
          let outfitItems = [...baseItems];
          
          // Add coat if available and it's a work event or winter mood
          if (coats.length > 0 && (event === 'work' || mood.includes('חורף'))) {
            const coat = coats[regularOutfitCount % coats.length];
            outfitItems.push(coat);
          }
          
          looks.push({
            id: `regular-look-${regularOutfitCount}`,
            items: outfitItems,
            description: this.generateDescription(outfitItems),
            occasion: event as any || 'general',
            style: style,
            mood: mood
          });
          
          regularOutfitCount++;
        }
      }
    }
    
    return {
      looks: looks.slice(0, 3),
      reasoning: `יצרתי ${looks.length} לוקים מתאימים ל${mood} בסגנון ${style}${event ? ` לאירוע ${event}` : ''}`
    };
  },
  
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
  },
  
  generateDescription(items: any[]): string {
    const itemNames = items.map(item => item.name).join(' עם ');
    return itemNames;
  }
};
