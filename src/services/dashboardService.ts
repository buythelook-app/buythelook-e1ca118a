
/**
 * Service for fetching and organizing dashboard items
 */

import { DashboardItem, OutfitItem } from "@/types/lookTypes";
import { generateOutfit } from "./api/outfitApi";
import { mapBodyShape, mapStyle, getEventStyles, mapDashboardItemToOutfitItem } from "./mappers/styleMappers";
import { convertToDashboardItem, getItemIdentifier } from "./outfitFactory";

// Fallback items for when API doesn't return usable data
const FALLBACK_ITEMS = {
  Work: [
    {
      id: "work-top",
      name: "Professional Shirt",
      description: "Elegant shirt for work environments",
      image: "https://i.imgur.com/1j9ZXed.png",
      price: "$45.99",
      type: "top"
    },
    {
      id: "work-bottom",
      name: "Tailored Trousers",
      description: "Professional pants for the office",
      image: "https://i.imgur.com/RWCV0G0.png",
      price: "$65.99",
      type: "bottom"
    },
    {
      id: "work-shoes",
      name: "Business Shoes",
      description: "Elegant footwear for professional settings",
      image: "https://i.imgur.com/PzAHrXN.png",
      price: "$95.99",
      type: "shoes"
    }
  ],
  Casual: [
    {
      id: "casual-top",
      name: "Relaxed T-Shirt",
      description: "Comfortable tee for casual days",
      image: "https://i.imgur.com/1j9ZXed.png",
      price: "$29.99",
      type: "top"
    },
    {
      id: "casual-bottom",
      name: "Jeans",
      description: "Classic denim jeans",
      image: "https://i.imgur.com/RWCV0G0.png",
      price: "$49.99",
      type: "bottom"
    },
    {
      id: "casual-shoes",
      name: "Sneakers",
      description: "Comfortable sneakers for everyday wear",
      image: "https://i.imgur.com/PzAHrXN.png",
      price: "$79.99",
      type: "shoes"
    }
  ],
  Evening: [
    {
      id: "evening-top",
      name: "Elegant Blouse",
      description: "Sophisticated top for evening events",
      image: "https://i.imgur.com/1j9ZXed.png",
      price: "$59.99",
      type: "top"
    },
    {
      id: "evening-bottom",
      name: "Evening Skirt",
      description: "Elegant skirt for special occasions",
      image: "https://i.imgur.com/RWCV0G0.png",
      price: "$69.99",
      type: "bottom"
    },
    {
      id: "evening-shoes",
      name: "Dressy Heels",
      description: "Elegant heels for evening wear",
      image: "https://i.imgur.com/PzAHrXN.png",
      price: "$89.99",
      type: "shoes"
    }
  ],
  Weekend: [
    {
      id: "weekend-top",
      name: "Casual Sweatshirt",
      description: "Comfortable sweatshirt for relaxed weekends",
      image: "https://i.imgur.com/1j9ZXed.png",
      price: "$39.99",
      type: "top"
    },
    {
      id: "weekend-bottom",
      name: "Relaxed Pants",
      description: "Comfortable pants for weekend activities",
      image: "https://i.imgur.com/RWCV0G0.png",
      price: "$45.99",
      type: "bottom"
    },
    {
      id: "weekend-shoes",
      name: "Casual Flats",
      description: "Comfortable shoes for weekend outings",
      image: "https://i.imgur.com/PzAHrXN.png",
      price: "$65.99",
      type: "shoes"
    }
  ]
};

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

export const fetchDashboardItems = async (): Promise<{[key: string]: DashboardItem[]}> => {
  try {
    const quizData = localStorage.getItem('styleAnalysis');
    const currentMood = localStorage.getItem('current-mood');
    const styleAnalysis = quizData ? JSON.parse(quizData) : null;
    
    if (!styleAnalysis?.analysis) {
      console.log('No style analysis data, using fallbacks');
      return {
        Work: FALLBACK_ITEMS.Work,
        Casual: FALLBACK_ITEMS.Casual,
        Evening: FALLBACK_ITEMS.Evening,
        Weekend: FALLBACK_ITEMS.Weekend
      };
    }

    const bodyShape = mapBodyShape(styleAnalysis.analysis.bodyShape || 'H');
    
    const userPreferredStyle = styleAnalysis.analysis.styleProfile || 'classic';
    console.log("User's quiz preference:", userPreferredStyle);
    
    const eventStyle = getEventStyles();
    const baseStyle = mapStyle(userPreferredStyle);
    
    const mood = validateMood(currentMood);

    const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
    const occasionStyles = {
      'Work': [baseStyle, 'classic', 'minimalist'],
      'Casual': [baseStyle, 'casual', 'sporty'],
      'Evening': [baseStyle, 'romantic', 'classic'],
      'Weekend': [baseStyle, 'boohoo', 'casual']
    };
    
    console.log("Using base style for outfit generation:", baseStyle);
    
    const outfitPromises = [];
    
    for (let i = 0; i < occasions.length; i++) {
      const occasion = occasions[i];
      
      const styleOptions = [baseStyle, ...(occasionStyles[occasion as keyof typeof occasionStyles] || [])];
      
      const uniqueStyles = Array.from(new Set(styleOptions));
      
      const selectedStyle = uniqueStyles[0];
      
      console.log(`Generating outfit for ${occasion} with style: ${selectedStyle}`);
      
      // Make multiple requests per occasion to increase chances of complete outfits
      for (let j = 0; j < 3; j++) {
        outfitPromises.push(generateOutfit(bodyShape, selectedStyle, mood));
      }
    }
    
    const responses = await Promise.all(outfitPromises);
    const occasionOutfits: {[key: string]: DashboardItem[]} = {};
    
    // Initialize each occasion with its respective fallback items
    for (const occasion of occasions) {
      occasionOutfits[occasion] = [...FALLBACK_ITEMS[occasion as keyof typeof FALLBACK_ITEMS]];
    }

    // Process responses in batches of 3 (since we made 3 requests per occasion)
    for (let i = 0; i < responses.length; i += 3) {
      const occasionIndex = Math.floor(i / 3);
      const occasion = occasions[occasionIndex];
      
      // Collect all items from the 3 responses for this occasion
      const tops: any[] = [];
      const bottoms: any[] = [];
      const shoes: any[] = [];
      
      for (let j = 0; j < 3; j++) {
        const responseIndex = i + j;
        if (responseIndex < responses.length) {
          const response = responses[responseIndex];
          
          if (Array.isArray(response.data)) {
            response.data.forEach((outfit: any) => {
              if (outfit.top) tops.push(outfit.top);
              if (outfit.bottom) bottoms.push(outfit.bottom);
              if (outfit.shoes) shoes.push(outfit.shoes);
            });
          }
        }
      }
      
      console.log(`${occasion}: Found ${tops.length} tops, ${bottoms.length} bottoms, ${shoes.length} shoes`);
      
      // Create outfit items if we have all types
      if (tops.length > 0 && bottoms.length > 0 && shoes.length > 0) {
        const outfitItems: DashboardItem[] = [];
        
        // Add top
        const topItem = convertToDashboardItem(tops[0], 'top');
        if (topItem) outfitItems.push(topItem);
        else outfitItems.push(FALLBACK_ITEMS[occasion as keyof typeof FALLBACK_ITEMS][0]);
        
        // Add bottom
        const bottomItem = convertToDashboardItem(bottoms[0], 'bottom');
        if (bottomItem) outfitItems.push(bottomItem);
        else outfitItems.push(FALLBACK_ITEMS[occasion as keyof typeof FALLBACK_ITEMS][1]);
        
        // Add shoes
        const shoesItem = convertToDashboardItem(shoes[0], 'shoes');
        if (shoesItem) outfitItems.push(shoesItem);
        else outfitItems.push(FALLBACK_ITEMS[occasion as keyof typeof FALLBACK_ITEMS][2]);
        
        // Only replace fallbacks if we have real items
        if (outfitItems.length >= 3) {
          occasionOutfits[occasion] = outfitItems;
        }
      }
      
      // Double-check that we have all three types
      const hasTop = occasionOutfits[occasion].some(item => item.type === 'top');
      const hasBottom = occasionOutfits[occasion].some(item => item.type === 'bottom');
      const hasShoes = occasionOutfits[occasion].some(item => item.type === 'shoes');
      
      // If any type is missing, add fallback
      if (!hasTop) {
        occasionOutfits[occasion].push(FALLBACK_ITEMS[occasion as keyof typeof FALLBACK_ITEMS][0]);
      }
      if (!hasBottom) {
        occasionOutfits[occasion].push(FALLBACK_ITEMS[occasion as keyof typeof FALLBACK_ITEMS][1]);
      }
      if (!hasShoes) {
        occasionOutfits[occasion].push(FALLBACK_ITEMS[occasion as keyof typeof FALLBACK_ITEMS][2]);
      }
    }

    console.log('Final outfit items by occasion:', occasionOutfits);
    return occasionOutfits;
  } catch (error) {
    console.error('Error in fetchDashboardItems:', error);
    
    // Return fallback items for all occasions
    return {
      Work: FALLBACK_ITEMS.Work,
      Casual: FALLBACK_ITEMS.Casual,
      Evening: FALLBACK_ITEMS.Evening,
      Weekend: FALLBACK_ITEMS.Weekend
    };
  }
};
