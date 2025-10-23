
import { AgentResult, AgentOutfit, AGENT_NAMES } from './types.ts'

/**
 * Generate outfit results using database items
 */
export class AgentResultsGenerator {
  /**
   * Generate unique results for each agent using filtered database items
   */
  generateResults(validItems: any[]): AgentResult[] {
    const results: AgentResult[] = [];
    
    console.log(`✅ [DEBUG] Generating results for ${AGENT_NAMES.length} agents using ${validItems.length} valid items`);
    
    // Categorize items by type
    const categorizedItems = this.categorizeItems(validItems);
    console.log(`✅ [DEBUG] Categorized items:`, {
      tops: categorizedItems.tops.length,
      bottoms: categorizedItems.bottoms.length,
      shoes: categorizedItems.shoes.length
    });
    
    for (const agent of AGENT_NAMES) {
      // Select random items from each category
      const randomTop = this.getRandomItem(categorizedItems.tops);
      const randomBottom = this.getRandomItem(categorizedItems.bottoms);
      const randomShoe = this.getRandomItem(categorizedItems.shoes);
      
      const score = Math.floor(Math.random() * 30) + 70;
      
      console.log(`✅ [DEBUG] Creating outfit for ${agent}:`, {
        top: randomTop?.id,
        bottom: randomBottom?.id,
        shoes: randomShoe?.id
      });

      // Log the actual image URLs being used
      console.log('🔍 [DEBUG] Selected item images for', agent);
      console.log('Top item image:', randomTop?.image);
      console.log('Bottom item image:', randomBottom?.image);
      console.log('Shoes item image:', randomShoe?.image);
      
      const outfit: AgentOutfit = {
        top: randomTop,
        bottom: randomBottom,
        shoes: randomShoe,
        score,
        description: `Outfit by ${agent.replace('-', ' ')} using real Zara items (no model images)`,
        recommendations: [
          "Using actual items from Zara database",
          "Images selected to avoid model photos (6_x_1.jpg pattern only)"
        ],
        occasion: Math.random() > 0.5 ? 'work' : 'casual'
      };
      
      results.push({
        agent,
        output: outfit,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`✅ [DEBUG] Generated ${results.length} outfits with filtered database items`);
    return results;
  }

  /**
   * Categorize items by clothing type based on product_family and product_subfamily
   */
  private categorizeItems(items: any[]): { tops: any[], bottoms: any[], shoes: any[] } {
    const tops: any[] = [];
    const bottoms: any[] = [];
    const shoes: any[] = [];

    for (const item of items) {
      const family = item.product_family?.toLowerCase() || '';
      const subfamily = item.product_subfamily?.toLowerCase() || '';

      console.log(`🔍 [DEBUG] Categorizing item ${item.id}: family="${family}", subfamily="${subfamily}"`);

      // Check if it's shoes
      if (family.includes('sandal') || family.includes('shoe') || family.includes('boot') ||
          subfamily.includes('sandal') || subfamily.includes('shoe') || subfamily.includes('boot')) {
        shoes.push(item);
        console.log(`👠 [DEBUG] Categorized as SHOES: ${item.product_name}`);
      }
      // Check if it's bottom wear
      else if (family.includes('pant') || family.includes('jean') || family.includes('trouser') ||
               family.includes('skirt') || family.includes('short') || family.includes('bermuda') ||
               subfamily.includes('pant') || subfamily.includes('jean') || subfamily.includes('trouser') ||
               subfamily.includes('skirt') || subfamily.includes('short') || subfamily.includes('bermuda')) {
        bottoms.push(item);
        console.log(`👖 [DEBUG] Categorized as BOTTOM: ${item.product_name}`);
      }
      // Everything else is considered a top
      else {
        tops.push(item);
        console.log(`👕 [DEBUG] Categorized as TOP: ${item.product_name}`);
      }
    }

    return { tops, bottoms, shoes };
  }

  /**
   * Get random item from array
   */
  private getRandomItem(items: any[]): any {
    if (items.length === 0) return null;
    return items[Math.floor(Math.random() * items.length)];
  }
}
