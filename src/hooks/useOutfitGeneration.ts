import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { fetchFirstOutfitSuggestion, clearOutfitCache, matchOutfitToColors, clearGlobalItemTrackers } from "@/services/lookService";
import { DashboardItem } from "@/types/lookTypes";
import { supabase } from "@/lib/supabaseClient"; // Use the single client instance
import { generateOutfit as generateOutfitAPI, getStyleRecommendations } from "@/services/outfitGenerationService";
import logger from "@/lib/logger";

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

// Track user preferences for color combinations and styles
const userPreferences = {
  likedCombinations: new Set<string>(), // store color combinations the user liked
  dislikedCombinations: new Set<string>(), // store color combinations the user disliked
  likedItems: new Set<string>(), // store specific items the user liked
  dislikedItems: new Set<string>() // store specific items the user disliked
};

// Track API attempt counts to avoid infinite loops
let attemptCounter = 0;
const MAX_ATTEMPTS = 5;

export function useOutfitGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Function to record user feedback (like/dislike)
  const recordUserFeedback = async (outfitItems: any[], isLiked: boolean) => {
    try {
      // Extract item IDs
      const topId = outfitItems.find(item => item.type === 'top')?.id;
      const bottomId = outfitItems.find(item => item.type === 'bottom')?.id;
      const shoesId = outfitItems.find(item => item.type === 'shoes')?.id;
      
      if (!topId || !bottomId || !shoesId) {
        console.warn('Incomplete outfit for feedback', { topId, bottomId, shoesId });
        return;
      }
      
      // Create a combination signature
      const combinationKey = `${topId}-${bottomId}-${shoesId}`;
      
      // Store locally for immediate use
      if (isLiked) {
        userPreferences.likedCombinations.add(combinationKey);
        outfitItems.forEach(item => userPreferences.likedItems.add(item.id));
      } else {
        userPreferences.dislikedCombinations.add(combinationKey);
        outfitItems.forEach(item => userPreferences.dislikedItems.add(item.id));
      }
      
      console.log(`User ${isLiked ? 'liked' : 'disliked'} outfit combination: ${combinationKey}`);
      
      // Store in database if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('outfit_logs')
          .insert({
            user_id: user.id,
            top_id: topId,
            bottom_id: bottomId,
            shoes_id: shoesId,
            user_liked: isLiked
          });
          
        if (error) {
          console.error('Error saving outfit feedback:', error);
        }
      } else {
        // Store in localStorage for non-authenticated users
        const feedbackHistory = JSON.parse(localStorage.getItem('outfit-feedback') || '[]');
        feedbackHistory.push({
          timestamp: new Date().toISOString(),
          topId,
          bottomId,
          shoesId,
          isLiked
        });
        localStorage.setItem('outfit-feedback', JSON.stringify(feedbackHistory));
      }
      
      return true;
    } catch (error) {
      console.error('Error recording user feedback:', error);
      return false;
    }
  };
  
  const generateOutfitFromAPI = async () => {
    try {
      setIsGenerating(true);
      
      // Get user style data
      const styleData = localStorage.getItem('styleAnalysis');
      if (!styleData) {
        throw new Error('Style data not found');
      }
      
      const parsedData = JSON.parse(styleData);
      const bodyShape = parsedData?.analysis?.bodyShape || 'H';
      const style = parsedData?.analysis?.styleProfile || 'classic';
      const mood = localStorage.getItem('current-mood') || 'energized';
      
      logger.info("Generating outfit from API", { 
        context: "useOutfitGeneration",
        data: { bodyShape, style, mood }
      });
      
      // Call the outfit generation API with a single request object
      const response = await generateOutfitAPI({
        bodyStructure: bodyShape as any,
        mood,
        style: style as any
      });
      
      if (!response.success) {
        logger.warn("API outfit generation failed", { 
          context: "useOutfitGeneration", 
          data: response.error 
        });
        
        sonnerToast.warning("Couldn't generate outfit with AI, trying regular method...", {
          duration: 3000
        });
        
        // Fallback to regular generation
        return generateOutfitFromItems();
      }
      
      // Update recommendations
      const newRecommendations = getStyleRecommendations();
      if (newRecommendations.length > 0) {
        setRecommendations(newRecommendations);
      }
      
      // Match real items to the generated outfit colors
      logger.info("Matching outfit colors to real clothing items");
      const colorMatches = await matchOutfitToColors();
      
      // Populate items array with one item from each matched category
      const items: DashboardItem[] = [];
      for (const [type, matchedItems] of Object.entries(colorMatches)) {
        if (Array.isArray(matchedItems) && matchedItems.length > 0) {
          const randomIndex = Math.floor(Math.random() * matchedItems.length);
          const item = matchedItems[randomIndex];
          // Ensure the item conforms to DashboardItem type
          items.push({
            id: item.id,
            name: item.name,
            image: item.image,
            type: item.type, // This is already properly typed from the service
            price: item.price
          });
        }
      }
      
      // If we couldn't match enough items, fall back to regular generation
      if (items.length < 3) {
        logger.warn("Not enough color-matched items found, using fallback", {
          context: "useOutfitGeneration",
          data: { matchedCount: items.length }
        });
        return generateOutfitFromItems();
      }
      
      logger.info("Successfully generated outfit from API with matched items", {
        context: "useOutfitGeneration",
        data: { itemCount: items.length }
      });
      
      return {
        success: true,
        items: items
      };
    } catch (error) {
      logger.error("Error in API outfit generation", {
        context: "useOutfitGeneration",
        data: error
      });
      
      // Fall back to regular generation
      return generateOutfitFromItems();
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateOutfitFromItems = async (forceRefresh: boolean = true) => {
    setIsGenerating(true);
    
    try {
      // Reset attempt counter if this is a user-initiated refresh
      if (forceRefresh) {
        attemptCounter = 0;
      }
      
      // Safety check to prevent infinite loops
      if (attemptCounter >= MAX_ATTEMPTS) {
        throw new Error('Maximum generation attempts reached');
      }
      
      attemptCounter++;
      
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
      
      logger.debug("Outfit items received:", { 
        context: "useOutfitGeneration", 
        data: outfitItems.length 
      });
      
      // Validate that we have exactly one of each required item type
      const itemTypes = outfitItems.map(item => item.type);
      const hasTop = itemTypes.includes('top');
      const hasBottom = itemTypes.includes('bottom');
      const hasShoes = itemTypes.includes('shoes');
      
      logger.debug(`Outfit completeness check: top=${hasTop}, bottom=${hasBottom}, shoes=${hasShoes}`, {
        context: "useOutfitGeneration"
      });
      
      if (!hasTop || !hasBottom || !hasShoes) {
        logger.warn(`Incomplete outfit generated: top=${hasTop}, bottom=${hasBottom}, shoes=${hasShoes}`, {
          context: "useOutfitGeneration"
        });
        sonnerToast.warning("Incomplete outfit generated, trying again...");
        // Try one more time if the outfit is incomplete
        return generateOutfitFromItems(true);
      }
      
      // Store any recommendations in localStorage if they exist
      const outfitData = localStorage.getItem('last-outfit-data');
      if (outfitData) {
        try {
          const parsedOutfit = JSON.parse(outfitData);
          if (parsedOutfit.recommendations && Array.isArray(parsedOutfit.recommendations)) {
            setRecommendations(parsedOutfit.recommendations);
            localStorage.setItem('style-recommendations', JSON.stringify(parsedOutfit.recommendations));
          }
          
          // Store color palette
          if (parsedOutfit.colors && typeof parsedOutfit.colors === 'object') {
            localStorage.setItem('outfit-colors', JSON.stringify(parsedOutfit.colors));
          }
        } catch (e) {
          logger.error('Error parsing outfit data:', {
            context: "useOutfitGeneration",
            data: e
          });
        }
      }
      
      // Reset the attempt counter since we successfully generated an outfit
      attemptCounter = 0;
      
      return {
        success: true,
        items: outfitItems.map(item => ({
          ...item,
          // Ensure each item has a type property for proper look assembly
          type: item.type || 'top'
        }))
      };
    } catch (error) {
      logger.error('Error generating outfit:', {
        context: "useOutfitGeneration",
        data: error
      });
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
      // Reset the attempt counter after the operation completes
      attemptCounter = 0;
    }
  };
  
  const generateOutfit = async (forceRefresh: boolean = true) => {
    // Try to generate from API first
    const apiResult = await generateOutfitFromAPI();
    
    // If API generation succeeded, return the result
    if (apiResult.success && apiResult.items.length >= 3) {
      return apiResult;
    }
    
    // Otherwise, fall back to regular item-based generation
    logger.info("Falling back to regular item-based outfit generation");
    return generateOutfitFromItems(forceRefresh);
  };
  
  return {
    isGenerating,
    generateOutfit,
    recordUserFeedback,
    recommendations,
    clearGlobalItemTrackers
  };
}
