
/**
 * Service for fetching and generating outfit suggestions
 */

import { DashboardItem } from "@/types/lookTypes";
import { generateOutfit } from "./api/outfitApi";
import { mapBodyShape, mapStyle, getEventStyles } from "./mappers/styleMappers";
import { convertToDashboardItem, getItemIdentifier } from "./outfitFactory";
import { isMinimalistTop, isMinimalistBottom, isMinimalistShoe } from "./filters/minimalistStyleCheckers";
import { scoreItem } from "./filters/styleFilters";

const validateMood = (mood: string | null): string => {
  const validMoods = [
    "mystery", "quiet", "elegant", "energized", 
    "flowing", "optimist", "calm", "romantic", 
    "unique", "sweet", "childish", "passionate", 
    "powerful"
  ];
  
  if (!mood || !validMoods.includes(mood.toLowerCase())) {
    return "energized";
  }
  return mood.toLowerCase();
};

export const fetchFirstOutfitSuggestion = async (): Promise<DashboardItem[]> => {
  try {
    const quizData = localStorage.getItem('styleAnalysis');
    const currentMood = localStorage.getItem('current-mood');
    console.log("Quiz data from localStorage:", quizData);
    
    const styleAnalysis = quizData ? JSON.parse(quizData) : null;
    
    if (!styleAnalysis?.analysis) {
      console.error('Missing style analysis data');
      throw new Error('Style analysis data is missing');
    }

    // Extract and log user preferences for debugging
    const bodyShape = mapBodyShape(styleAnalysis.analysis.bodyShape || 'H');
    const preferredStyle = styleAnalysis.analysis.styleProfile || 'classic';
    console.log("User's preferred style from quiz:", preferredStyle);
    
    // Get event style or use preferred style
    const eventStyle = getEventStyles();
    const style = mapStyle(eventStyle || preferredStyle);
    console.log("Mapped style for API request:", style);
    
    const mood = validateMood(currentMood);
    console.log("Using mood:", mood);

    // Make multiple API requests for better results
    const requests = 12; // Reduced from 18 to improve performance while still getting good options
    const promises = [];
    
    for (let i = 0; i < requests; i++) {
      promises.push(generateOutfit(bodyShape, style, mood));
    }
    
    // Handle possible API timeouts
    const responses = await Promise.allSettled(promises);
    console.log(`Received ${responses.length} API responses`);
    
    // Process all successful responses
    const allTops: any[] = [];
    const allBottoms: any[] = [];
    const allShoes: any[] = [];
    
    let successCount = 0;
    responses.forEach(result => {
      if (result.status === 'fulfilled' && result.value && Array.isArray(result.value.data)) {
        successCount++;
        result.value.data.forEach((outfit: any) => {
          if (outfit.top) allTops.push(outfit.top);
          if (outfit.bottom) allBottoms.push(outfit.bottom);
          if (outfit.shoes) allShoes.push(outfit.shoes);
        });
      }
    });
    
    console.log(`API success rate: ${successCount}/${requests}`);
    console.log(`Found ${allTops.length} tops, ${allBottoms.length} bottoms, and ${allShoes.length} shoes`);
    
    // Create the final outfit items array
    const items: DashboardItem[] = [];
    const usedItemIds = new Set<string>();
    
    // Check if preferredStyle is minimalist (case insensitive)
    const isMinimalistStyle = preferredStyle.toLowerCase().includes('minimalist') || 
                              preferredStyle.toLowerCase().includes('minimal') || 
                              preferredStyle.toLowerCase().includes('nordic') || 
                              preferredStyle.toLowerCase().includes('modern');
    
    if (isMinimalistStyle) {
      console.log("Applying strict minimalist filtering");
      
      // Filter for minimalist style items
      const filteredTops = allTops
        .filter(top => {
          const name = (top.product_name || top.name || "").toLowerCase();
          const desc = (top.description || "").toLowerCase();
          
          // Check for pattern terms
          if (name.includes("pattern") || desc.includes("pattern") ||
              name.includes("print") || desc.includes("print")) {
            return false;
          }
          
          return isMinimalistTop(top);
        })
        .sort((a, b) => scoreItem(b, 'top') - scoreItem(a, 'top'));
      
      const filteredBottoms = allBottoms
        .filter(bottom => isMinimalistBottom(bottom))
        .sort((a, b) => scoreItem(b, 'bottom') - scoreItem(a, 'bottom'));
      
      const filteredShoes = allShoes
        .filter(shoes => isMinimalistShoe(shoes))
        .sort((a, b) => scoreItem(b, 'shoes') - scoreItem(a, 'shoes'));
      
      // Add filtered items to outfit
      if (filteredTops.length > 0) {
        const topItem = convertToDashboardItem(filteredTops[0], 'top', preferredStyle);
        if (topItem) items.push(topItem);
      }
      
      if (filteredBottoms.length > 0) {
        const bottomItem = convertToDashboardItem(filteredBottoms[0], 'bottom', preferredStyle);
        if (bottomItem) items.push(bottomItem);
      }
      
      if (filteredShoes.length > 0) {
        const shoesItem = convertToDashboardItem(filteredShoes[0], 'shoes', preferredStyle);
        if (shoesItem) items.push(shoesItem);
      }
    } else {
      // For other styles, apply less strict filtering
      console.log(`Using regular filtering for style: ${preferredStyle}`);
      
      if (allTops.length > 0) {
        // Sort by quality score for the specific style
        allTops.sort((a, b) => scoreItem(b, 'top') - scoreItem(a, 'top'));
        const topItem = convertToDashboardItem(allTops[0], 'top', preferredStyle);
        if (topItem) items.push(topItem);
      }
      
      if (allBottoms.length > 0) {
        allBottoms.sort((a, b) => scoreItem(b, 'bottom') - scoreItem(a, 'bottom'));
        const bottomItem = convertToDashboardItem(allBottoms[0], 'bottom', preferredStyle);
        if (bottomItem) items.push(bottomItem);
      }
      
      if (allShoes.length > 0) {
        allShoes.sort((a, b) => scoreItem(b, 'shoes') - scoreItem(a, 'shoes'));
        const shoesItem = convertToDashboardItem(allShoes[0], 'shoes', preferredStyle);
        if (shoesItem) items.push(shoesItem);
      }
    }
    
    // Fallback - if we couldn't find enough items, add any available items
    if (items.length < 2) {
      console.log("Using fallback items due to insufficient filtered results");
      
      if (!items.some(item => item.type === 'top') && allTops.length > 0) {
        const fallbackTop = convertToDashboardItem(allTops[0], 'top', preferredStyle);
        if (fallbackTop) items.push(fallbackTop);
      }
      
      if (!items.some(item => item.type === 'bottom') && allBottoms.length > 0) {
        const fallbackBottom = convertToDashboardItem(allBottoms[0], 'bottom', preferredStyle);
        if (fallbackBottom) items.push(fallbackBottom);
      }
      
      if (!items.some(item => item.type === 'shoes') && allShoes.length > 0) {
        const fallbackShoes = convertToDashboardItem(allShoes[0], 'shoes', preferredStyle);
        if (fallbackShoes) items.push(fallbackShoes);
      }
    }
    
    console.log(`Final outfit has ${items.length} items:`, items.map(i => i.type));
    return items;
  } catch (error) {
    console.error('Error in fetchFirstOutfitSuggestion:', error);
    throw error;
  }
};
