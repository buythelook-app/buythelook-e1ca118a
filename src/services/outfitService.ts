
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

    // Reduce to 5 parallel requests to avoid timeouts
    const promises = [];
    for (let i = 0; i < 5; i++) {
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
    
    // Apply strict minimalist filtering for Minimalist style preference
    if (preferredStyle === 'Minimalist') {
      console.log("Applying strict minimalist filtering");
      
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
      
      const topItem = filteredTops.length > 0 ? convertToDashboardItem(filteredTops[0], 'top', preferredStyle) : null;
      const bottomItem = filteredBottoms.length > 0 ? convertToDashboardItem(filteredBottoms[0], 'bottom', preferredStyle) : null;
      const shoesItem = filteredShoes.length > 0 ? convertToDashboardItem(filteredShoes[0], 'shoes', preferredStyle) : null;
      
      const items: DashboardItem[] = [];
      
      if (topItem) {
        items.push(topItem);
        console.log("Selected minimalist top:", topItem.name);
      }
      
      if (bottomItem) {
        items.push(bottomItem);
        console.log("Selected minimalist bottom:", bottomItem.name);
      }
      
      if (shoesItem) {
        items.push(shoesItem);
        console.log("Selected minimalist shoes:", shoesItem.name);
      }
      
      // Fallback to less strict criteria if not enough items found
      if (items.length < 2 && allTops.length > 0 && !topItem) {
        const fallbackTop = convertToDashboardItem(allTops[0], 'top');
        if (fallbackTop) {
          items.push(fallbackTop);
          console.log("Added fallback top (not strictly minimalist):", fallbackTop.name);
        }
      }
      
      if (items.length < 2 && allBottoms.length > 0 && !bottomItem) {
        const fallbackBottom = convertToDashboardItem(allBottoms[0], 'bottom');
        if (fallbackBottom) {
          items.push(fallbackBottom);
          console.log("Added fallback bottom (not strictly minimalist):", fallbackBottom.name);
        }
      }
      
      if (items.length < 3 && allShoes.length > 0 && !shoesItem) {
        const fallbackShoes = convertToDashboardItem(allShoes[0], 'shoes');
        if (fallbackShoes) {
          items.push(fallbackShoes);
          console.log("Added fallback shoes (not strictly minimalist):", fallbackShoes.name);
        }
      }
      
      console.log('Final outfit items:', items);
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
