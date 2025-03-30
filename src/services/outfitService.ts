
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

// Fallback items for when API doesn't return anything useful
const FALLBACK_ITEMS = [
  {
    id: "fallback-top-1",
    name: "Classic White Shirt",
    description: "A timeless white shirt that pairs with everything",
    image: "https://i.imgur.com/1j9ZXed.png",
    price: "$39.99",
    type: "top"
  },
  {
    id: "fallback-bottom-1",
    name: "Black Slim Pants",
    description: "Essential black pants for any style",
    image: "https://i.imgur.com/RWCV0G0.png",
    price: "$49.99",
    type: "bottom"
  },
  {
    id: "fallback-shoes-1",
    name: "Classic Loafers",
    description: "Versatile loafers to complete your look",
    image: "https://i.imgur.com/PzAHrXN.png",
    price: "$79.99",
    type: "shoes"
  }
];

export const fetchFirstOutfitSuggestion = async (): Promise<DashboardItem[]> => {
  try {
    const quizData = localStorage.getItem('styleAnalysis');
    const currentMood = localStorage.getItem('current-mood');
    console.log("Quiz data from localStorage:", quizData);
    
    const styleAnalysis = quizData ? JSON.parse(quizData) : null;
    
    if (!styleAnalysis?.analysis) {
      console.error('Missing style analysis data');
      return FALLBACK_ITEMS;
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

    // Make fewer API requests for better performance
    const requests = 5; // Reduced from 12 for faster loading
    const promises = [];
    
    for (let i = 0; i < requests; i++) {
      promises.push(generateOutfit(bodyShape, style, mood));
    }
    
    // Handle API responses with better error handling
    const responses = await Promise.allSettled(promises);
    const successfulResponses = responses.filter(r => r.status === 'fulfilled');
    console.log(`Received ${responses.length} API responses`);
    console.log(`API success rate: ${successfulResponses.length}/${requests}`);
    
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
    
    console.log(`Found ${allTops.length} tops, ${allBottoms.length} bottoms, and ${allShoes.length} shoes`);
    
    // Create the final outfit items array
    const items: DashboardItem[] = [];
    const usedItemIds = new Set<string>();
    
    // Check if preferredStyle is minimalist
    const isMinimalistStyle = style.toLowerCase().includes('minimalist');
    
    if (isMinimalistStyle && allTops.length > 0 && allBottoms.length > 0 && allShoes.length > 0) {
      console.log("Applying strict minimalist filtering");
      
      // Filter for minimalist style items
      const filteredTops = allTops
        .filter(top => isMinimalistTop(top))
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
      } else if (allTops.length > 0) {
        // Fallback to any top if no minimalist top found
        const topItem = convertToDashboardItem(allTops[0], 'top', preferredStyle);
        if (topItem) items.push(topItem);
      }
      
      if (filteredBottoms.length > 0) {
        const bottomItem = convertToDashboardItem(filteredBottoms[0], 'bottom', preferredStyle);
        if (bottomItem) items.push(bottomItem);
      } else if (allBottoms.length > 0) {
        // Fallback to any bottom if no minimalist bottom found
        const bottomItem = convertToDashboardItem(allBottoms[0], 'bottom', preferredStyle);
        if (bottomItem) items.push(bottomItem);
      }
      
      if (filteredShoes.length > 0) {
        const shoesItem = convertToDashboardItem(filteredShoes[0], 'shoes', preferredStyle);
        if (shoesItem) items.push(shoesItem);
      } else if (allShoes.length > 0) {
        // Fallback to any shoes if no minimalist shoes found
        const shoesItem = convertToDashboardItem(allShoes[0], 'shoes', preferredStyle);
        if (shoesItem) items.push(shoesItem);
      }
    } else {
      // For other styles, apply less strict filtering
      console.log(`Using regular filtering for style: ${style}`);
      
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
    
    // Final fallback - if we couldn't find any items from the API, use our hardcoded fallbacks
    if (items.length === 0) {
      console.log("Using hardcoded fallback items due to empty API results");
      return FALLBACK_ITEMS;
    }
    
    // If we're missing any essential piece, add it from fallback
    if (!items.some(item => item.type === 'top')) {
      items.push(FALLBACK_ITEMS[0]);
    }
    
    if (!items.some(item => item.type === 'bottom')) {
      items.push(FALLBACK_ITEMS[1]);
    }
    
    if (!items.some(item => item.type === 'shoes')) {
      items.push(FALLBACK_ITEMS[2]);
    }
    
    console.log(`Final outfit has ${items.length} items:`, items.map(i => i.type));
    return items;
  } catch (error) {
    console.error('Error in fetchFirstOutfitSuggestion:', error);
    // Return fallback items if anything goes wrong
    return FALLBACK_ITEMS;
  }
};
