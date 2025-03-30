
/**
 * Service for fetching and generating outfit suggestions
 */

import { DashboardItem } from "@/types/lookTypes";
import { generateOutfit } from "./api/outfitApi";
import { mapBodyShape, mapStyle, getEventStyles } from "./mappers/styleMappers";
import { convertToDashboardItem, getItemIdentifier, hasSolidColorIndicator, hasPatternInName } from "./outfitFactory";
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

// Fallback items in case API returns nothing
const fallbackItems = {
  top: {
    product_id: "fallback-top-1",
    product_name: "Minimalist Cotton T-Shirt",
    description: "A simple, versatile white cotton t-shirt with a clean silhouette",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    price: "29.99"
  },
  bottom: {
    product_id: "fallback-bottom-1",
    product_name: "Solid Relaxed Trousers",
    description: "Clean-lined neutral trousers with a relaxed fit",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    price: "49.99"
  },
  shoes: {
    product_id: "fallback-shoes-1",
    product_name: "Minimal Leather Sneakers",
    description: "Simple white leather sneakers with clean lines",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    price: "89.99"
  }
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

    // Increase to only 12 parallel requests to avoid too many timeouts
    const promises = [];
    for (let i = 0; i < 12; i++) {
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
    
    // If we have no items at all from the API, use fallback items
    if (allTops.length === 0 && allBottoms.length === 0 && allShoes.length === 0) {
      console.log("No items returned from API, using fallback items");
      const items: DashboardItem[] = [];
      
      // Add fallback top
      const topItem = convertToDashboardItem(fallbackItems.top, 'top', preferredStyle);
      if (topItem) items.push(topItem);
      
      // Add fallback bottom
      const bottomItem = convertToDashboardItem(fallbackItems.bottom, 'bottom', preferredStyle);
      if (bottomItem) items.push(bottomItem);
      
      // Add fallback shoes
      const shoesItem = convertToDashboardItem(fallbackItems.shoes, 'shoes', preferredStyle);
      if (shoesItem) items.push(shoesItem);
      
      return items;
    }
    
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
          if (hasPatternInName(top)) {
            console.log(`Explicitly rejected patterned top: ${name}`);
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
          
          // Check for pattern terms
          if (hasPatternInName(bottom)) {
            console.log(`Explicitly rejected patterned bottom: ${name}`);
            return false;
          }
          
          return isMinimalistBottom(bottom);
        })
        .sort((a, b) => {
          // Prioritize items with "solid" or "plain" in their name/description
          const aSolid = hasSolidColorIndicator(a);
          const bSolid = hasSolidColorIndicator(b);
          
          if (aSolid && !bSolid) return -1;
          if (!aSolid && bSolid) return 1;
          
          return scoreItem(b, 'bottom') - scoreItem(a, 'bottom');
        });
      
      // Filter shoes with similar logic  
      const filteredShoes = allShoes
        .filter(shoes => {
          const name = (shoes.product_name || shoes.name || "").toLowerCase();
          const description = (shoes.description || "").toLowerCase();
          
          // Check for pattern terms
          if (hasPatternInName(shoes)) {
            console.log(`Explicitly rejected patterned shoes: ${name}`);
            return false;
          }
          
          return isMinimalistShoe(shoes);
        })
        .sort((a, b) => {
          // Prioritize items with "solid" in their name/description
          const aSolid = hasSolidColorIndicator(a);
          const bSolid = hasSolidColorIndicator(b);
          
          if (aSolid && !bSolid) return -1;
          if (!aSolid && bSolid) return 1;
          
          return scoreItem(b, 'shoes') - scoreItem(a, 'shoes');
        });
      
      console.log(`After filtering: ${filteredTops.length} tops, ${filteredBottoms.length} bottoms, and ${filteredShoes.length} shoes match minimalist criteria`);
      
      const items: DashboardItem[] = [];
      
      // Add tops
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
      } else if (allTops.length > 0) {
        // Fallback to any top if no minimalist tops
        const topItem = convertToDashboardItem(allTops[0], 'top', preferredStyle);
        if (topItem) {
          items.push(topItem);
          console.log("Selected fallback top:", topItem.name);
        }
      } else {
        // Use hardcoded fallback
        const topItem = convertToDashboardItem(fallbackItems.top, 'top', preferredStyle);
        if (topItem) {
          items.push(topItem);
          console.log("Selected hardcoded fallback top");
        }
      }
      
      // Add bottom
      if (filteredBottoms.length > 0) {
        const bottomItem = convertToDashboardItem(filteredBottoms[0], 'bottom', preferredStyle);
        if (bottomItem) {
          items.push(bottomItem);
          console.log("Selected minimalist bottom:", bottomItem.name);
        }
      } else if (allBottoms.length > 0) {
        // Fallback to any bottom
        const bottomItem = convertToDashboardItem(allBottoms[0], 'bottom', preferredStyle);
        if (bottomItem) {
          items.push(bottomItem);
          console.log("Selected fallback bottom:", bottomItem.name);
        }
      } else {
        // Use hardcoded fallback
        const bottomItem = convertToDashboardItem(fallbackItems.bottom, 'bottom', preferredStyle);
        if (bottomItem) {
          items.push(bottomItem);
          console.log("Selected hardcoded fallback bottom");
        }
      }
      
      // Add shoes
      if (filteredShoes.length > 0) {
        const shoesItem = convertToDashboardItem(filteredShoes[0], 'shoes', preferredStyle);
        if (shoesItem) {
          items.push(shoesItem);
          console.log("Selected minimalist shoes:", shoesItem.name);
        }
      } else if (allShoes.length > 0) {
        // Fallback to any shoes
        const shoesItem = convertToDashboardItem(allShoes[0], 'shoes', preferredStyle);
        if (shoesItem) {
          items.push(shoesItem);
          console.log("Selected fallback shoes:", shoesItem.name);
        }
      } else {
        // Use hardcoded fallback
        const shoesItem = convertToDashboardItem(fallbackItems.shoes, 'shoes', preferredStyle);
        if (shoesItem) {
          items.push(shoesItem);
          console.log("Selected hardcoded fallback shoes");
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
      } else {
        const topItem = convertToDashboardItem(fallbackItems.top, 'top');
        if (topItem) items.push(topItem);
      }
      
      if (allBottoms.length > 0) {
        const bottomItem = convertToDashboardItem(allBottoms[0], 'bottom');
        if (bottomItem) items.push(bottomItem);
      } else {
        const bottomItem = convertToDashboardItem(fallbackItems.bottom, 'bottom');
        if (bottomItem) items.push(bottomItem);
      }
      
      if (allShoes.length > 0) {
        const shoesItem = convertToDashboardItem(allShoes[0], 'shoes');
        if (shoesItem) items.push(shoesItem);
      } else {
        const shoesItem = convertToDashboardItem(fallbackItems.shoes, 'shoes');
        if (shoesItem) items.push(shoesItem);
      }
      
      return items;
    }
  } catch (error) {
    console.error('Error in fetchFirstOutfitSuggestion:', error);
    
    // Provide fallback outfit in case of errors
    const items: DashboardItem[] = [];
    
    const topItem = convertToDashboardItem(fallbackItems.top, 'top');
    if (topItem) items.push(topItem);
    
    const bottomItem = convertToDashboardItem(fallbackItems.bottom, 'bottom');
    if (bottomItem) items.push(bottomItem);
    
    const shoesItem = convertToDashboardItem(fallbackItems.shoes, 'shoes');
    if (shoesItem) items.push(shoesItem);
    
    return items;
  }
};
