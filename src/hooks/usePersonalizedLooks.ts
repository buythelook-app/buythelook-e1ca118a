import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { clearOutfitCache } from "@/services/lookService";
import { toast as sonnerToast } from "sonner";
import type { Mood } from "@/components/filters/MoodFilter";
import { DashboardItem } from "@/types/lookTypes";
import { useExternalCatalog } from "./useExternalCatalog";
import { supabase } from "@/integrations/supabase/client";
import { enhancedAgentCrew } from "@/agents/enhancedCrew";
import logger from "@/lib/logger";

export interface LookItem {
  id: string;
  image: string;
  type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' | 'cart';
  name?: string;
  product_subfamily?: string;
  price?: string;
}

export interface Look {
  id: string;
  title: string;
  items: LookItem[];
  price: string;
  category: string;
  occasion: string;
}

export function usePersonalizedLooks() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [userStyle, setUserStyle] = useState<any>(null);
  const [combinations, setCombinations] = useState<{ [key: string]: number }>({});
  const [forceRefresh, setForceRefresh] = useState(false);
  const [apiErrorShown, setApiErrorShown] = useState(false);
  const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
  const { fetchCatalog } = useExternalCatalog();

  // Load style analysis from localStorage on component mount and listen for changes
  useEffect(() => {
    const loadStyleAnalysis = () => {
      const styleAnalysis = localStorage.getItem('styleAnalysis');
      if (styleAnalysis) {
        const parsed = JSON.parse(styleAnalysis);
        setUserStyle(parsed);
        console.log('🎨 [usePersonalizedLooks] Loaded style:', parsed.analysis?.styleProfile);
      }
    };

    loadStyleAnalysis();

    const handleStyleChange = () => {
      loadStyleAnalysis();
      console.log('🎨 [usePersonalizedLooks] Style changed, reloading...');
    };

    window.addEventListener('styleAnalysisChanged', handleStyleChange);
    
    return () => {
      window.removeEventListener('styleAnalysisChanged', handleStyleChange);
    };
  }, []);

  // Initialize mood from localStorage if available
  useEffect(() => {
    const storedMood = localStorage.getItem('current-mood');
    if (storedMood) {
      setSelectedMood(storedMood as Mood);
    }
  }, []);

  // Uses Enhanced Agent Crew with full AI agent logic
  const queryFn = useCallback(async () => {
    const outfitsByOccasion: { [key: string]: DashboardItem[] } = {};

    try {
      logger.info('🎯 [usePersonalizedLooks] מתחיל יצירת תלבושות עם Enhanced Agent Crew');
      
      // Clear global tracking when forced refresh
      if (forceRefresh) {
        clearOutfitCache();
      }
      
      // קבלת משתמש נוכחי
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous-user';
      
      // יצירת הקשר משופר עם פרמטרי למידה מלאים
      const enhancedContext = {
        userId,
        forceRefresh: true,
        randomSeed: Math.random(),
        timestamp: Date.now(),
        learningEnabled: true,
        attempt: Date.now()
      };
      
      logger.info('🧠 [usePersonalizedLooks] קורא ל-Enhanced Agent Crew', {
        context: 'usePersonalizedLooks',
        data: enhancedContext
      });
      
      // שימוש ב-Enhanced Agent Crew עם כל הסוכנים:
      // - PersonalizationAgent - מנתח את הפרופיל והסגנון
      // - StylingAgent - יוצר תלבושות מתאימות
      // - ValidatorAgent - מוודא תאימות צבעים ואיכות
      // - RecommendationAgent - מוסיף המלצות סטייל
      // + Learning Agent - משתמש בלמידה מעמוד הבית
      const result = await enhancedAgentCrew.runWithLearning(enhancedContext);
      
      if (!result.success || !result.data?.looks) {
        logger.warn('[usePersonalizedLooks] Enhanced Agent Crew לא החזיר לוקים', {
          context: 'usePersonalizedLooks',
          data: { error: result.error }
        });
        throw new Error(result.error || 'Failed to generate outfits');
      }
      
      logger.info('✅ [usePersonalizedLooks] קיבלנו לוקים מ-Enhanced Agent Crew', {
        context: 'usePersonalizedLooks',
        data: {
          totalLooks: result.data.looks.length,
          agentFlow: result.data.agentFlow,
          learningApplied: result.data.learningData?.applied,
          supervisorFeedback: result.data.supervisorFeedback
        }
      });
      
      // חלוקת הלוקים לפי אוקזיה
      const looks = result.data.looks;
      
      looks.forEach((look: any) => {
        const occasion = look.occasion || 'Casual';
        const occasionKey = occasions.find(o => 
          o.toLowerCase() === occasion.toLowerCase()
        ) || 'Casual';
        
        if (!outfitsByOccasion[occasionKey]) {
          outfitsByOccasion[occasionKey] = [];
        }
        
        // המרת פריטי הלוק לפורמט DashboardItem
        const items = look.items.map((item: any) => ({
          id: item.id,
          name: item.title || item.name || item.product_name,
          image: item.image,
          type: item.type,
          price: item.price,
          category: item.type,
          color: item.color || item.colour,
          affiliate_link: item.url || item.product_url || '#',
          season: 'all',
          formality: occasionKey === 'Work' ? 'formal' : 'casual',
          style: userStyle?.analysis?.styleProfile || 'classic'
        }));
        
        outfitsByOccasion[occasionKey].push(...items);
      });
      
      // וידוא שכל אוקזיה קיבלה פריטים
      occasions.forEach(occasion => {
        if (!outfitsByOccasion[occasion] || outfitsByOccasion[occasion].length === 0) {
          logger.warn(`[usePersonalizedLooks] אין פריטים עבור ${occasion}, משתמש בפריטים כלליים`);
          // אם אין פריטים לאוקזיה מסוימת, קח מהכללי
          const casualItems = outfitsByOccasion['Casual'] || [];
          outfitsByOccasion[occasion] = casualItems.slice(0, 6);
        }
      });

      logger.info('✅ [usePersonalizedLooks] חלוקת לוקים סופית לפי אוקזיה:', 
        Object.keys(outfitsByOccasion).reduce((acc, key) => ({
          ...acc,
          [key]: outfitsByOccasion[key].length
        }), {})
      );
      
      return outfitsByOccasion;

    } catch (err) {
      logger.error("❌ [usePersonalizedLooks] שגיאה ביצירת לוקים:", err);
      sonnerToast.error("שגיאה בטעינת תלבושות");
      
      // Return empty outfits
      const emptyData: { [key: string]: DashboardItem[] } = {};
      occasions.forEach(occasion => {
        emptyData[occasion] = [];
      });
      return emptyData;
    }
  }, [selectedMood, userStyle, forceRefresh, occasions]);

  const {
    data: occasionOutfits = {},
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['outfits', selectedMood, forceRefresh],
    queryFn,
    enabled: !!userStyle,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  const createLookFromItems = useCallback((items: DashboardItem[], occasion: string, index: number): Look | null => {
    if (!items || items.length === 0) return null;

    const tops = items.filter(item => item.type === 'top');
    const bottoms = items.filter(item => item.type === 'bottom');
    const shoes = items.filter(item => item.type === 'shoes');

    // Ensure we have at least one item of each required type (top, bottom, shoes)
    if (tops.length === 0 || bottoms.length === 0 || shoes.length === 0) {
      console.log(`⚠️ [createLookFromItems] Missing required items for ${occasion}:`, {
        tops: tops.length,
        bottoms: bottoms.length,
        shoes: shoes.length
      });
      return null;
    }

    const lookItems: LookItem[] = [];
    let totalPrice = 0;

    const lookKey = `${occasion}-${index}`;
    const currentCombination = combinations[lookKey] || 0;

    const getItemByIndex = (arr: DashboardItem[], idx: number) => arr[idx % arr.length];

    // Helper function to safely parse price
    const parsePrice = (price: string | number | undefined): number => {
      if (!price) return 0;
      const priceStr = typeof price === 'string' ? price.replace(/[^0-9.]/g, '') : String(price);
      const parsed = parseFloat(priceStr);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Always add top, bottom, and shoes (3 items minimum)
    const top = getItemByIndex(tops, currentCombination);
    if (top) {
      const itemPrice = parsePrice(top.price);
      lookItems.push({
        id: top.id,
        image: top.image,
        type: 'top',
        name: top.name,
        price: top.price
      });
      totalPrice += itemPrice;
    }

    const bottom = getItemByIndex(bottoms, currentCombination);
    if (bottom) {
      const itemPrice = parsePrice(bottom.price);
      lookItems.push({
        id: bottom.id,
        image: bottom.image,
        type: 'bottom',
        name: bottom.name,
        price: bottom.price
      });
      totalPrice += itemPrice;
    }

    const shoe = getItemByIndex(shoes, currentCombination);
    if (shoe) {
      const itemPrice = parsePrice(shoe.price);
      lookItems.push({
        id: shoe.id,
        image: shoe.image,
        type: 'shoes',
        name: shoe.name,
        price: shoe.price
      });
      totalPrice += itemPrice;
    }

    // Ensure we have exactly 3 items
    if (lookItems.length !== 3) {
      console.log(`⚠️ [createLookFromItems] Created look with ${lookItems.length} items instead of 3 for ${occasion}`);
      return null;
    }

    return {
      id: `${occasion}-look-${index}-${currentCombination}`,
      title: occasion,
      items: lookItems,
      price: `$${totalPrice.toFixed(2)}`,
      category: occasion,
      occasion: occasion
    };
  }, [combinations]);

  const handleMoodSelect = useCallback((mood: Mood) => {
    console.log('🎨 [usePersonalizedLooks] Mood selected:', mood);
    setSelectedMood(mood);
    localStorage.setItem('current-mood', mood);
    window.dispatchEvent(new Event('mood-changed'));
  }, []);

  const handleShuffleLook = useCallback((occasion: string) => {
    const lookKey = `${occasion}-0`;
    setCombinations(prev => ({
      ...prev,
      [lookKey]: (prev[lookKey] || 0) + 1
    }));
  }, []);

  const resetError = useCallback(() => {
    setApiErrorShown(false);
    refetch();
  }, [refetch]);

  const getOutfitData = useCallback(() => {
    return occasionOutfits;
  }, [occasionOutfits]);

  return {
    selectedMood,
    userStyle,
    occasions,
    occasionOutfits,
    isLoading,
    isError,
    error,
    combinations,
    createLookFromItems,
    handleMoodSelect,
    handleShuffleLook,
    resetError,
    getOutfitData
  };
}
