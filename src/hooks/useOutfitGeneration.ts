
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { fetchFirstOutfitSuggestion, clearOutfitCache, matchOutfitToColors } from "@/services/lookService";
import { DashboardItem } from "@/types/lookTypes";
import { supabase } from "@/lib/supabaseClient";
import { generateOutfit, getStyleRecommendations } from "@/services/outfitGenerationService";
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

// Global cache to track shown items and prevent repetition
const globalItemTracker = {
  shownItems: new Map<string, number>(), // id -> times shown
  shownTops: new Set<string>(),
  shownBottoms: new Set<string>(),
  shownShoes: new Set<string>(),
  maxRepetitions: 2 // Allow an item to appear this many times max
};

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
      
      // Call the outfit generation API with the request object instead of separate arguments
      const response = await generateOutfit(
        bodyShape as any, 
        mood, 
        style as any
      );
      
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
        if (matchedItems.length > 0) {
          const randomIndex = Math.floor(Math.random() * matchedItems.length);
          items.push(matchedItems[randomIndex]);
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
      
      // Check repetition of items
      const hasTooManyRepeats = outfitItems.some(item => {
        const timesShown = globalItemTracker.shownItems.get(item.id) || 0;
        return timesShown >= globalItemTracker.maxRepetitions;
      });
      
      // Check for repeats by type
      const top = outfitItems.find(item => item.type === 'top');
      const bottom = outfitItems.find(item => item.type === 'bottom');
      const shoes = outfitItems.find(item => item.type === 'shoes');
      
      const hasRepeatedTypes = (
        (top && globalItemTracker.shownTops.has(top.id)) ||
        (bottom && globalItemTracker.shownBottoms.has(bottom.id)) ||
        (shoes && globalItemTracker.shownShoes.has(shoes.id))
      );
      
      // If we've shown these items too many times, try again
      if (hasTooManyRepeats || hasRepeatedTypes) {
        logger.debug('Found too many repeated items in outfit, regenerating...', {
          context: "useOutfitGeneration",
          data: hasTooManyRepeats ? 'Items shown too many times' : 'Type repetition'
        });
        
        // Try with a different mood to get different results
        const moods = ['elegant', 'energized', 'casual', 'relaxed', 'unique', 'powerful', 'mysterious'];
        const currentMood = localStorage.getItem('current-mood') || 'energized';
        const nextMoodIndex = moods.indexOf(currentMood) + 1;
        const newMood = moods[nextMoodIndex % moods.length];
        localStorage.setItem('current-mood', newMood);
        logger.debug(`Trying with different mood: ${newMood}`, {
          context: "useOutfitGeneration"
        });
        
        return generateOutfitFromItems(true);
      }
      
      // Check if this is a disliked combination (to avoid showing disliked outfits)
      const outfitKey = `${top?.id || ''}-${bottom?.id || ''}-${shoes?.id || ''}`;
      if (userPreferences.dislikedCombinations.has(outfitKey)) {
        logger.debug('This combination was previously disliked, regenerating...', {
          context: "useOutfitGeneration"
        });
        return generateOutfitFromItems(true);
      }
      
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
      
      // Add items to the trackers
      outfitItems.forEach(item => {
        // Track by ID
        const timesShown = globalItemTracker.shownItems.get(item.id) || 0;
        globalItemTracker.shownItems.set(item.id, timesShown + 1);
        
        // Track by type
        if (item.type === 'top') {
          globalItemTracker.shownTops.add(item.id);
        } else if (item.type === 'bottom') {
          globalItemTracker.shownBottoms.add(item.id);
        } else if (item.type === 'shoes') {
          globalItemTracker.shownShoes.add(item.id);
        }
      });
      
      // Clean up trackers if they get too large
      if (globalItemTracker.shownItems.size > 50) {
        // Remove least recently shown items
        const entries = Array.from(globalItemTracker.shownItems.entries());
        entries.sort((a, b) => a[1] - b[1]);
        for (let i = 0; i < 10; i++) {
          if (i < entries.length) {
            globalItemTracker.shownItems.delete(entries[i][0]);
          }
        }
      }
      
      // Limit the type tracking sets
      const cleanupTrackingSet = (set: Set<string>, maxSize: number) => {
        if (set.size > maxSize) {
          const items = Array.from(set);
          for (let i = 0; i < Math.min(5, items.length); i++) {
            set.delete(items[i]);
          }
        }
      };
      
      cleanupTrackingSet(globalItemTracker.shownTops, 20);
      cleanupTrackingSet(globalItemTracker.shownBottoms, 20);
      cleanupTrackingSet(globalItemTracker.shownShoes, 20);
      
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
          type: item.type || 'unknown'
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
    recommendations
  };
}
