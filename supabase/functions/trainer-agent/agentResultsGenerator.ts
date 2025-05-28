
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
    
    for (const agent of AGENT_NAMES) {
      // Shuffle items for each agent to get different combinations
      const shuffledItems = [...validItems].sort(() => Math.random() - 0.5);
      
      const randomTop = shuffledItems[0];
      const randomBottom = shuffledItems[1] || shuffledItems[0]; // Fallback if not enough items
      const randomShoe = shuffledItems[2] || shuffledItems[0]; // Fallback if not enough items
      
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
}
