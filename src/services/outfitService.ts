
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
    const styleAnalysis = quizData ? JSON.parse(quizData) : null;
    
    if (!styleAnalysis?.analysis) {
      throw new Error('Style analysis data is missing');
    }

    const bodyShape = mapBodyShape(styleAnalysis.analysis.bodyShape || 'H');
    const eventStyle = getEventStyles();
    const preferredStyle = styleAnalysis.analysis.styleProfile || 'classic';
    const style = mapStyle(eventStyle || preferredStyle);
    const mood = validateMood(currentMood);

    console.log("Using user's preferred style from quiz:", preferredStyle);

    // Increase to 8 parallel requests for better chance of finding good items
    const promises = [];
    for (let i = 0; i < 8; i++) {
      promises.push(generateOutfit(bodyShape, style, mood));
    }
    
    // Handle possible API timeouts
    const responses = await Promise.allSettled(promises);
    
    const allTops: any[] = [];
    const allBottoms: any[] = [];
    const allShoes: any[] = [];
    
    // Process successful responses
    responses.forEach(result => {
      if (result.status === 'fulfilled' && result.value && Array.isArray(result.value.data)) {
        result.value.data.forEach((outfit: any) => {
          if (outfit.top) allTops.push(outfit.top);
          if (outfit.bottom) allBottoms.push(outfit.bottom);
          if (outfit.shoes) allShoes.push(outfit.shoes);
        });
      }
    });
    
    console.log(`Found ${allTops.length} tops, ${allBottoms.length} bottoms, and ${allShoes.length} shoes to filter`);
    
    // Special handling for Minimalist style preference with relaxed fallback
    if (preferredStyle === 'Minimalist') {
      console.log("Applying minimalist filtering with improved fallback options");
      
      // First try with strict filtering
      const filteredTops = allTops
        .filter(top => isMinimalistTop(top))
        .sort((a, b) => scoreItem(b, 'top') - scoreItem(a, 'top'));
      
      const filteredBottoms = allBottoms
        .filter(bottom => isMinimalistBottom(bottom))
        .sort((a, b) => scoreItem(b, 'bottom') - scoreItem(a, 'bottom'));
      
      const filteredShoes = allShoes
        .filter(shoes => isMinimalistShoe(shoes))
        .sort((a, b) => scoreItem(b, 'shoes') - scoreItem(a, 'shoes'));
      
      console.log(`After filtering: ${filteredTops.length} tops, ${filteredBottoms.length} bottoms, and ${filteredShoes.length} shoes match minimalist criteria`);
      
      const items: DashboardItem[] = [];
      
      // Add items if they pass strict criteria
      if (filteredTops.length > 0) {
        const topItem = convertToDashboardItem(filteredTops[0], 'top', preferredStyle);
        if (topItem) {
          items.push(topItem);
          console.log("Selected minimalist top:", topItem.name);
        }
      }
      
      if (filteredBottoms.length > 0) {
        const bottomItem = convertToDashboardItem(filteredBottoms[0], 'bottom', preferredStyle);
        if (bottomItem) {
          items.push(bottomItem);
          console.log("Selected minimalist bottom:", bottomItem.name);
        }
      }
      
      if (filteredShoes.length > 0) {
        const shoesItem = convertToDashboardItem(filteredShoes[0], 'shoes', preferredStyle);
        if (shoesItem) {
          items.push(shoesItem);
          console.log("Selected minimalist shoes:", shoesItem.name);
        }
      }
      
      // Improved fallback mechanism - use the most neutral items from all available
      if (items.length < 3) {
        // Sort all items by score to get the most minimalist-like ones
        const sortedTops = allTops.sort((a, b) => scoreItem(b, 'top') - scoreItem(a, 'top'));
        const sortedBottoms = allBottoms.sort((a, b) => scoreItem(b, 'bottom') - scoreItem(a, 'bottom'));
        const sortedShoes = allShoes.sort((a, b) => scoreItem(b, 'shoes') - scoreItem(a, 'shoes'));
        
        // Add top if needed
        if (!items.some(item => item.type === 'top') && sortedTops.length > 0) {
          const fallbackTop = convertToDashboardItem(sortedTops[0], 'top', preferredStyle);
          if (fallbackTop) {
            items.push(fallbackTop);
            console.log("Added fallback top:", fallbackTop.name);
          }
        }
        
        // Add bottom if needed
        if (!items.some(item => item.type === 'bottom') && sortedBottoms.length > 0) {
          const fallbackBottom = convertToDashboardItem(sortedBottoms[0], 'bottom', preferredStyle);
          if (fallbackBottom) {
            items.push(fallbackBottom);
            console.log("Added fallback bottom:", fallbackBottom.name);
          }
        }
        
        // Add shoes if needed
        if (!items.some(item => item.type === 'shoes') && sortedShoes.length > 0) {
          const fallbackShoes = convertToDashboardItem(sortedShoes[0], 'shoes', preferredStyle);
          if (fallbackShoes) {
            items.push(fallbackShoes);
            console.log("Added fallback shoes:", fallbackShoes.name);
          }
        }
      }
      
      console.log('Final minimalist outfit items:', items);
      return items;
    } else {
      // For non-minimalist styles, just use the first items found
      console.log("Using regular filtering for non-minimalist style");
      
      const items: DashboardItem[] = [];
      
      if (allTops.length > 0) {
        const topItem = convertToDashboardItem(allTops[0], 'top');
        if (topItem) items.push(topItem);
      }
      
      if (allBottoms.length > 0) {
        const bottomItem = convertToDashboardItem(allBottoms[0], 'bottom');
        if (bottomItem) items.push(bottomItem);
      }
      
      if (allShoes.length > 0) {
        const shoesItem = convertToDashboardItem(allShoes[0], 'shoes');
        if (shoesItem) items.push(shoesItem);
      }
      
      return items;
    }
  } catch (error) {
    console.error('Error in fetchFirstOutfitSuggestion:', error);
    throw error;
  }
};
