import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { fetchFirstOutfitSuggestion, clearOutfitCache } from "@/services/lookService";
import { DashboardItem } from "@/types/lookTypes";

interface OutfitColors {
  top: string;
  bottom: string;
  shoes: string;
  [key: string]: string;
}

interface StyleRecommendation {
  description: string;
  recommendations: string[];
}

// Keep track of previously shown items to avoid repetition
const shownItemIds = new Set<string>();
const usedShoeIds = new Set<string>();

export function useOutfitGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const generateOutfit = async (forceRefresh: boolean = true) => {
    setIsGenerating(true);
    
    try {
      // Get user style data
      const styleData = localStorage.getItem('styleAnalysis');
      if (!styleData) {
        throw new Error('Style data not found');
      }
      
      const parsedData = JSON.parse(styleData);
      const bodyShape = parsedData?.analysis?.bodyShape || 'H';
      const style = parsedData?.analysis?.styleProfile || 'classic';
      const mood = localStorage.getItem('current-mood') || 'energized';
      
      // Clear the outfit cache to force a new generation
      if (forceRefresh) {
        clearOutfitCache(bodyShape, style, mood);
      }
      
      // Fetch a new outfit suggestion
      const outfitItems = await fetchFirstOutfitSuggestion(forceRefresh);
      
      // Check if this is the same outfit we've shown before
      const outfitSignature = outfitItems.map(item => item.id).join('-');
      const hasDuplicates = outfitItems.some(item => shownItemIds.has(item.id));
      
      // Check specifically for duplicate shoes
      const shoes = outfitItems.find(item => item.type === 'shoes');
      const hasDuplicateShoes = shoes && usedShoeIds.has(shoes.id);
      
      // If we've shown this outfit before or it has the same shoes, try once more
      if (hasDuplicates || hasDuplicateShoes) {
        console.log('Found duplicate items in outfit, regenerating...', 
                    hasDuplicates ? 'Duplicate items' : 'Duplicate shoes');
        
        // If this is already a refresh attempt, don't get stuck in a loop
        if (forceRefresh) {
          // Try with a different mood to get different results
          const moods = ['elegant', 'energized', 'casual', 'relaxed', 'unique'];
          const currentMood = localStorage.getItem('current-mood') || 'energized';
          const nextMoodIndex = moods.indexOf(currentMood) + 1;
          const newMood = moods[nextMoodIndex % moods.length];
          localStorage.setItem('current-mood', newMood);
          console.log(`Trying with different mood: ${newMood}`);
        }
        
        return generateOutfit(true);
      }
      
      // Validate that we have exactly one of each required item type
      const itemTypes = outfitItems.map(item => item.type);
      const hasTop = itemTypes.includes('top');
      const hasBottom = itemTypes.includes('bottom');
      const hasShoes = itemTypes.includes('shoes');
      
      if (!hasTop || !hasBottom || !hasShoes) {
        console.warn(`Incomplete outfit generated: top=${hasTop}, bottom=${hasBottom}, shoes=${hasShoes}`);
        sonnerToast.warning("Incomplete outfit generated, trying again...");
        // Try one more time if the outfit is incomplete
        return generateOutfit(true);
      }
      
      // Add items to the shown items set
      outfitItems.forEach(item => {
        shownItemIds.add(item.id);
        if (item.type === 'shoes') {
          usedShoeIds.add(item.id);
        }
      });
      
      // Limit the size of our tracking sets to prevent memory issues
      if (shownItemIds.size > 50) {
        const itemsArray = Array.from(shownItemIds);
        for (let i = 0; i < 10; i++) {
          shownItemIds.delete(itemsArray[i]);
        }
      }
      
      if (usedShoeIds.size > 20) {
        const shoesArray = Array.from(usedShoeIds);
        for (let i = 0; i < 5; i++) {
          usedShoeIds.delete(shoesArray[i]);
        }
      }
      
      // Store any recommendations in localStorage if they exist
      const outfitData = localStorage.getItem('last-outfit-data');
      if (outfitData) {
        try {
          const parsedOutfit = JSON.parse(outfitData);
          if (parsedOutfit.recommendations && Array.isArray(parsedOutfit.recommendations)) {
            localStorage.setItem('style-recommendations', JSON.stringify(parsedOutfit.recommendations));
          }
          
          // Store color palette
          if (parsedOutfit.colors && typeof parsedOutfit.colors === 'object') {
            localStorage.setItem('outfit-colors', JSON.stringify(parsedOutfit.colors));
          }
        } catch (e) {
          console.error('Error parsing outfit data:', e);
        }
      }
      
      return {
        success: true,
        items: outfitItems
      };
    } catch (error) {
      console.error('Error generating outfit:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate a new outfit. Please try again.",
        variant: "destructive",
      });
      return {
        success: false,
        items: []
      };
    } finally {
      setIsGenerating(false);
    }
  };
  
  return {
    isGenerating,
    generateOutfit
  };
}
