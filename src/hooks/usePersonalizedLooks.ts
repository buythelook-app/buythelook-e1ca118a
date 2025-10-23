import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardItems, clearOutfitCache } from "@/services/lookService";
import { toast as sonnerToast } from "sonner";
import type { Mood } from "@/components/filters/MoodFilter";
import { DashboardItem } from "@/types/lookTypes";
import { useExternalCatalog } from "./useExternalCatalog";
import { supabase } from "@/integrations/supabase/client";
import { agentCrew } from "@/agents/crew";
import { extractImageUrl } from "@/services/outfitGenerationService";

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

  // 🆕 Uses the full agent crew with all intelligence and rules
  const queryFn = useCallback(async () => {
    const outfitsByOccasion: { [key: string]: DashboardItem[] } = {};

    try {
      console.log('🎨 [usePersonalizedLooks] Starting agent crew outfit generation...');
      
      // Clear global tracking when forced refresh
      if (forceRefresh) {
        clearOutfitCache();
      }
      
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // Get user style from localStorage
      const styleData = localStorage.getItem('styleAnalysis');
      let bodyShape = 'X';
      let styleProfile = 'classic';
      
      if (styleData) {
        try {
          const parsedData = JSON.parse(styleData);
          bodyShape = parsedData?.analysis?.bodyShape || 'X';
          styleProfile = parsedData?.analysis?.styleProfile || 'classic';
        } catch (e) {
          console.error("Error parsing stored style data:", e);
        }
      }

      // Get current mood
      const currentMood = localStorage.getItem('current-mood') || selectedMood || 'elegant';
      const selectedMode = localStorage.getItem('selected-mode') || 'casual';
      
      console.log('🎨 [usePersonalizedLooks] User context:', { 
        userId, 
        bodyShape, 
        styleProfile, 
        currentMood,
        selectedMode 
      });

      // Generate outfits for each occasion using the agent crew
      for (const occasion of occasions) {
        console.log(`🎨 [usePersonalizedLooks] Generating outfit for: ${occasion}`);
        
        // Build generation context with all parameters
        const generationContext = {
          userId,
          forceRefresh,
          randomSeed: Date.now() + occasions.indexOf(occasion),
          timestamp: Date.now(),
          selectedMode,
          bodyStructure: bodyShape,
          styleProfile,
          mood: currentMood,
          occasion: occasion.toLowerCase(),
          workAppropriate: occasion === 'Work',
          requiredModesty: false
        };

        // Run the agent crew
        const result = await agentCrew.run(generationContext);

        if (!result.success || !result.data?.looks?.length) {
          console.warn(`⚠️ [usePersonalizedLooks] No outfits generated for ${occasion}`);
          outfitsByOccasion[occasion] = [];
          continue;
        }

        // Extract the first look and convert to DashboardItem format
        const look = result.data.looks[0];
        const items: DashboardItem[] = [];

        // Process each item in the look
        if (look.items) {
          look.items.forEach((item: any) => {
            const imageUrl = extractImageUrl(item.image);
            
            items.push({
              id: item.id,
              name: item.product_name || item.name || 'פריט',
              type: item.type || 'top',
              image: imageUrl,
              price: item.price ? `₪${item.price}` : '0',
              category: item.product_family || item.category || 'general',
              color: item.colour || item.color,
              affiliate_link: item.url || '#',
              season: 'all',
              formality: occasion === 'Work' ? 'formal' : 'casual',
              style: styleProfile
            });
          });
        }

        console.log(`✅ [usePersonalizedLooks] ${occasion}: ${items.length} items`);
        outfitsByOccasion[occasion] = items;
      }

      console.log('🎨 [usePersonalizedLooks] Final outfits by occasion:', 
        Object.keys(outfitsByOccasion).map(k => `${k}: ${outfitsByOccasion[k].length} items`));
      
      return outfitsByOccasion;

    } catch (err) {
      console.error("❌ [usePersonalizedLooks] Error fetching data:", err);
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
