/**
 * Service for fetching and generating outfit suggestions
 */

import { DashboardItem } from "@/types/lookTypes";
import { generateOutfit } from "./api/outfitApi";
import { mapBodyShape, mapStyle, getEventStyles } from "./mappers/styleMappers";
import { convertToDashboardItem, getItemIdentifier, hasSolidColorIndicator } from "./outfitFactory";
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

    // Increase to 24 parallel requests for better chance of finding truly solid color items
    const promises = [];
    for (let i = 0; i < 24; i++) {
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
    
    // Special handling for Minimalist style preference with improved filtering
    if (preferredStyle === 'Minimalist') {
      console.log("Applying strict minimalist filtering based on user examples");
      
      // Load recently shown items to avoid repeating
      const recentTopIds: string[] = (() => {
        try {
          const saved = localStorage.getItem('recent-minimalist-tops');
          return saved ? JSON.parse(saved) : [];
        } catch (e) {
          console.error("Error parsing recent tops:", e);
          return [];
        }
      })();
      
      // Filter out items with any pattern or non-solid color indicators
      const filteredTops = allTops
        .filter(top => {
          const name = (top.product_name || top.name || "").toLowerCase();
          const description = (top.description || "").toLowerCase();
          const topId = getItemIdentifier(top);
          
          // Skip recently shown items
          if (recentTopIds.includes(topId)) {
            console.log(`Skipping recently shown top: ${name}`);
            return false;
          }
          
          // Explicitly filter out gingham/checked/textured items
          if (name.includes("gingham") || 
              name.includes("check") || 
              name.includes("plaid") || 
              name.includes("texture") || 
              name.includes("print")) {
            console.log(`Explicitly rejected patterned top: ${name}`);
            return false;
          }
          
          // Pattern indication in description
          if (description.includes("pattern") || 
              description.includes("gingham") || 
              description.includes("check") || 
              description.includes("texture") || 
              description.includes("print")) {
            console.log(`Rejected top with pattern in description: ${name}`);
            return false;
          }
          
          // Prefer tops that mention "solid" or "plain" in name/description
          if (hasSolidColorIndicator(top) && isMinimalistTop(top)) {
            console.log(`Found ideal solid color top: ${name}`);
            return true;
          }
          
          return isMinimalistTop(top);
        })
        .sort((a, b) => {
          // Prioritize items with "solid" or "plain" in their name/description
          const aSolid = hasSolidColorIndicator(a);
          const bSolid = hasSolidColorIndicator(b);
          
          if (aSolid && !bSolid) return -1;
          if (!aSolid && bSolid) return 1;
          
          return scoreItem(b, 'top') - scoreItem(a, 'top');
        });
      
      // Filter bottoms with similar logic
      const filteredBottoms = allBottoms
        .filter(bottom => {
          const name = (bottom.product_name || bottom.name || "").toLowerCase();
          const description = (bottom.description || "").toLowerCase();
          
          // Check for specific pattern terms
          if (name.includes("square") || description.includes("square") ||
              name.includes("pattern") || description.includes("pattern") ||
              name.includes("gingham") || description.includes("gingham") ||
              name.includes("plaid") || description.includes("plaid") ||
              name.includes("check") || description.includes("check") ||
              name.includes("textured") || description.includes("textured") ||
              name.includes("print") || description.includes("print")) {
            console.log(`Explicitly rejected patterned bottom: ${name}`);
            return false;
          }
          
          return isMinimalistBottom(bottom);
        })
        .sort((a, b) => {
          // Prioritize items with "solid" or "plain" in their name/description
          const aName = (a.product_name || a.name || "").toLowerCase();
          const aDesc = (a.description || "").toLowerCase();
          const bName = (b.product_name || b.name || "").toLowerCase();
          const bDesc = (b.description || "").toLowerCase();
          
          const aHasSolid = aName.includes("solid") || aDesc.includes("solid") || 
                            aName.includes("plain") || aDesc.includes("plain");
          const bHasSolid = bName.includes("solid") || bDesc.includes("solid") ||
                            bName.includes("plain") || bDesc.includes("plain");
          
          if (aHasSolid && !bHasSolid) return -1;
          if (!aHasSolid && bHasSolid) return 1;
          
          return scoreItem(b, 'bottom') - scoreItem(a, 'bottom');
        });
      
      // Filter shoes with similar logic  
      const filteredShoes = allShoes
        .filter(shoes => {
          const name = (shoes.product_name || shoes.name || "").toLowerCase();
          const description = (shoes.description || "").toLowerCase();
          
          // Check for specific pattern terms
          if (name.includes("pattern") || description.includes("pattern") ||
              name.includes("print") || description.includes("print")) {
            console.log(`Explicitly rejected patterned shoes: ${name}`);
            return false;
          }
          
          return isMinimalistShoe(shoes);
        })
        .sort((a, b) => scoreItem(b, 'shoes') - scoreItem(a, 'shoes'));
      
      console.log(`After filtering: ${filteredTops.length} tops, ${filteredBottoms.length} bottoms, and ${filteredShoes.length} shoes match minimalist criteria`);
      
      const items: DashboardItem[] = [];
      
      // Find a top that hasn't been shown recently
      if (filteredTops.length > 0) {
        // Get a new top that wasn't recently shown
        const selectedTop = filteredTops[0];
        const topId = getItemIdentifier(selectedTop);
        
        // Add to recently shown tops
        recentTopIds.push(topId);
        if (recentTopIds.length > 10) recentTopIds.shift(); // Keep last 10
        localStorage.setItem('recent-minimalist-tops', JSON.stringify(recentTopIds));
        
        const topItem = convertToDashboardItem(selectedTop, 'top', preferredStyle);
        if (topItem) {
          items.push(topItem);
          console.log("Selected minimalist top:", topItem.name);
        }
      }
      
      // Add bottom and shoes
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
      
      // Improved fallback mechanism if we're missing items
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
