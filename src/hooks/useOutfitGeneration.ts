
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { fetchFirstOutfitSuggestion, clearOutfitCache } from "@/services/lookService";
import { DashboardItem } from "@/types/lookTypes";
import { supabase } from "@/lib/supabaseClient";

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
  
  const generateOutfit = async (forceRefresh: boolean = true) => {
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
      
      console.log("Outfit items received:", outfitItems);
      
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
        console.log('Found too many repeated items in outfit, regenerating...', 
                    hasTooManyRepeats ? 'Items shown too many times' : 'Type repetition');
        
        // Try with a different mood to get different results
        const moods = ['elegant', 'energized', 'casual', 'relaxed', 'unique', 'powerful', 'mysterious'];
        const currentMood = localStorage.getItem('current-mood') || 'energized';
        const nextMoodIndex = moods.indexOf(currentMood) + 1;
        const newMood = moods[nextMoodIndex % moods.length];
        localStorage.setItem('current-mood', newMood);
        console.log(`Trying with different mood: ${newMood}`);
        
        return generateOutfit(true);
      }
      
      // Check if this is a disliked combination (to avoid showing disliked outfits)
      const outfitKey = `${top?.id || ''}-${bottom?.id || ''}-${shoes?.id || ''}`;
      if (userPreferences.dislikedCombinations.has(outfitKey)) {
        console.log('This combination was previously disliked, regenerating...');
        return generateOutfit(true);
      }
      
      // Validate that we have exactly one of each required item type
      const itemTypes = outfitItems.map(item => item.type);
      const hasTop = itemTypes.includes('top');
      const hasBottom = itemTypes.includes('bottom');
      const hasShoes = itemTypes.includes('shoes');
      
      console.log(`Outfit completeness check: top=${hasTop}, bottom=${hasBottom}, shoes=${hasShoes}`);
      
      if (!hasTop || !hasBottom || !hasShoes) {
        console.warn(`Incomplete outfit generated: top=${hasTop}, bottom=${hasBottom}, shoes=${hasShoes}`);
        sonnerToast.warning("Incomplete outfit generated, trying again...");
        // Try one more time if the outfit is incomplete
        return generateOutfit(true);
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
      // Reset the attempt counter after the operation completes
      attemptCounter = 0;
    }
  };
  
  return {
    isGenerating,
    generateOutfit,
    recordUserFeedback // Expose the new function
  };
}
