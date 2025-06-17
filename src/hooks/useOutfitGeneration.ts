
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { agentCrew } from "@/agents/crew";
import { DashboardItem } from "@/types/lookTypes";
import { supabase } from "@/lib/supabaseClient";
import logger from "@/lib/logger";

// Track user preferences for color combinations and styles
const userPreferences = {
  likedCombinations: new Set<string>(),
  dislikedCombinations: new Set<string>(),
  likedItems: new Set<string>(),
  dislikedItems: new Set<string>()
};

// Track previously generated combinations to avoid duplicates
const previousCombinations = new Set<string>();

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
        outfitItems.forEach(item => userPreferences.dislikedCombinations.add(item.id));
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
      logger.info("🚀 Starting COORDINATED outfit generation", { 
        context: "useOutfitGeneration",
        data: { forceRefresh, attempt: previousCombinations.size + 1 }
      });
      
      // Get current user ID (or use anonymous ID)
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous-user';
      
      // Add randomization parameters to ensure different results
      const randomSeed = Math.random();
      const timestamp = Date.now();
      const previousCount = previousCombinations.size;
      
      // Create context with randomization and exclusions
      const generationContext = {
        userId,
        forceRefresh,
        randomSeed,
        timestamp,
        excludeCombinations: Array.from(previousCombinations),
        excludeItems: Array.from(userPreferences.dislikedItems),
        preferredItems: Array.from(userPreferences.likedItems),
        attempt: previousCount + 1
      };
      
      logger.info("🎲 Generation context with randomization", {
        context: "useOutfitGeneration",
        data: generationContext
      });
      
      // Use the coordinated agent crew workflow with enhanced parameters
      const result = await agentCrew.run(generationContext);
      
      if (!result.success) {
        logger.error("❌ Coordinated outfit generation failed", {
          context: "useOutfitGeneration",
          data: { error: result.error }
        });
        
        toast({
          title: "Generation Failed",
          description: result.error || "Could not generate outfit using coordinated agents.",
          variant: "destructive",
        });
        
        return {
          success: false,
          items: []
        };
      }
      
      // Extract the first look from the coordinated results
      const looks = result.data?.looks || [];
      if (looks.length === 0) {
        logger.warn("No looks generated by coordinated agents");
        
        toast({
          title: "No Outfits Generated",
          description: "The styling agents couldn't create suitable outfits with available items.",
          variant: "destructive",
        });
        
        return {
          success: false,
          items: []
        };
      }
      
      // Convert the first look to DashboardItem format
      const firstLook = looks[0];
      const items: DashboardItem[] = firstLook.items.map(item => ({
        id: item.id,
        name: item.title,
        image: item.image,
        type: item.type as any,
        price: item.price
      }));
      
      // Track this combination to avoid future duplicates
      const topItem = items.find(item => item.type === 'top');
      const bottomItem = items.find(item => item.type === 'bottom');
      const shoesItem = items.find(item => item.type === 'shoes');
      
      if (topItem && bottomItem && shoesItem) {
        const combinationKey = `${topItem.id}-${bottomItem.id}-${shoesItem.id}`;
        previousCombinations.add(combinationKey);
        
        logger.info("📝 Tracking new combination", {
          context: "useOutfitGeneration",
          data: { combinationKey, totalTracked: previousCombinations.size }
        });
      }
      
      // Update recommendations from the coordinated result
      if (result.data?.recommendations && Array.isArray(result.data.recommendations)) {
        setRecommendations(result.data.recommendations);
        localStorage.setItem('style-recommendations', JSON.stringify(result.data.recommendations));
      }
      
      logger.info("✅ Coordinated outfit generation completed successfully", {
        context: "useOutfitGeneration",
        data: { 
          itemCount: items.length,
          lookId: firstLook.id,
          hasRecommendations: result.data?.recommendations?.length > 0,
          attempt: previousCount + 1
        }
      });
      
      sonnerToast.success("נוצרה תלבושת חדשה באמצעות אייגנטים מתואמים!", {
        duration: 3000
      });
      
      return {
        success: true,
        items: items
      };
      
    } catch (error) {
      logger.error('❌ Error in coordinated outfit generation:', {
        context: "useOutfitGeneration",
        data: error
      });
      
      toast({
        title: "Generation Failed",
        description: "Could not generate outfit with coordinated agents. Please try again.",
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
  
  const clearGlobalItemTrackers = () => {
    // Clear user preferences
    userPreferences.likedCombinations.clear();
    userPreferences.dislikedCombinations.clear();
    userPreferences.likedItems.clear();
    userPreferences.dislikedItems.clear();
    
    // Clear previous combinations
    previousCombinations.clear();
    
    // Clear local storage
    localStorage.removeItem('outfit-feedback');
    localStorage.removeItem('style-recommendations');
    
    logger.info("Cleared global item trackers and user preferences");
  };
  
  return {
    isGenerating,
    generateOutfit,
    recordUserFeedback,
    recommendations,
    clearGlobalItemTrackers
  };
}
