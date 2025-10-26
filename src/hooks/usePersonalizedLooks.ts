import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { clearOutfitCache } from "@/services/lookService";
import { toast as sonnerToast } from "sonner";
import type { Mood } from "@/components/filters/MoodFilter";
import { DashboardItem } from "@/types/lookTypes";
import { useExternalCatalog } from "./useExternalCatalog";
import { supabase } from "@/integrations/supabase/client";
import { generateOutfit, findMatchingClothingItems } from "@/services/outfitGenerationService";
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

  // Uses color-based outfit generation with real Zara data
  const queryFn = useCallback(async () => {
    const outfitsByOccasion: { [key: string]: DashboardItem[] } = {};

    try {
      logger.info('🎯 [usePersonalizedLooks] יצירת תלבושות עם התאמת צבעים ופריטי Zara', {
        context: 'usePersonalizedLooks'
      });
      
      // Clear global tracking when forced refresh
      if (forceRefresh) {
        clearOutfitCache();
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
          logger.error("Error parsing stored style data", { context: 'usePersonalizedLooks', data: e });
        }
      }

      // Get current mood
      const currentMood = localStorage.getItem('current-mood') || selectedMood || 'elegant';

      // Generate outfit colors using the API
      logger.info('🎨 [usePersonalizedLooks] קורא ל-generate-outfit', {
        context: 'usePersonalizedLooks',
        data: { bodyShape, styleProfile, currentMood }
      });
      
      const outfitResponse = await generateOutfit({
        bodyStructure: bodyShape as any,
        style: styleProfile as any,
        mood: currentMood
      });

      if (!outfitResponse.success || !outfitResponse.data || outfitResponse.data.length === 0) {
        throw new Error(outfitResponse.error || "Failed to generate outfit");
      }

      // Get outfit colors from the first suggestion
      const firstOutfit = outfitResponse.data[0];
      const colors = {
        top: firstOutfit.top,
        bottom: firstOutfit.bottom,
        shoes: firstOutfit.shoes,
        coat: firstOutfit.coat
      };
      
      logger.info('🎨 [usePersonalizedLooks] קיבלנו צבעים', {
        context: 'usePersonalizedLooks',
        data: colors
      });

      // Find matching clothing items from real Zara data
      // Note: We don't pass occasion here since items are distributed across occasions later
      const matchingItems = await findMatchingClothingItems(colors);
      logger.info('🎨 [usePersonalizedLooks] מצאנו פריטים תואמים מ-Zara', {
        context: 'usePersonalizedLooks',
        data: { 
          tops: matchingItems.top?.length || 0,
          bottoms: matchingItems.bottom?.length || 0,
          shoes: matchingItems.shoes?.length || 0
        }
      });

      // Convert to DashboardItem format
      const allItems: DashboardItem[] = [];
      
      Object.entries(matchingItems).forEach(([type, items]) => {
        items.forEach((item: any) => {
          allItems.push({
            id: item.id,
            name: item.name,
            type: type as any,
            image: item.image,
            price: item.price,
            category: type,
            color: item.color,
            affiliate_link: item.url || '#',
            season: 'all',
            formality: currentMood === 'elegant' ? 'formal' : 'casual',
            style: styleProfile
          });
        });
      });

      logger.info('✅ [usePersonalizedLooks] המרנו פריטים', {
        context: 'usePersonalizedLooks',
        data: { totalItems: allItems.length }
      });

      // Distribute items across occasions - ensure each has tops, bottoms, and shoes
      const tops = allItems.filter(item => item.type === 'top');
      const bottoms = allItems.filter(item => item.type === 'bottom');
      const shoes = allItems.filter(item => item.type === 'shoes');
      
      occasions.forEach((occasion, index) => {
        // Distribute items evenly across occasions
        const occasionItems: DashboardItem[] = [];
        
        // Add tops for this occasion
        const topCount = Math.ceil(tops.length / occasions.length);
        const topStartIdx = index * topCount;
        occasionItems.push(...tops.slice(topStartIdx, topStartIdx + topCount));
        
        // Add bottoms for this occasion
        const bottomCount = Math.ceil(bottoms.length / occasions.length);
        const bottomStartIdx = index * bottomCount;
        occasionItems.push(...bottoms.slice(bottomStartIdx, bottomStartIdx + bottomCount));
        
        // Add shoes for this occasion - important! All occasions need shoes
        const shoeCount = Math.ceil(shoes.length / occasions.length);
        const shoeStartIdx = index * shoeCount;
        occasionItems.push(...shoes.slice(shoeStartIdx, shoeStartIdx + shoeCount));
        
        outfitsByOccasion[occasion] = occasionItems;
      });

      logger.info('✅ [usePersonalizedLooks] חילקנו לוקים לפי אוקזיה', {
        context: 'usePersonalizedLooks',
        data: Object.keys(outfitsByOccasion).reduce((acc, key) => ({
          ...acc,
          [key]: outfitsByOccasion[key].length
        }), {})
      });
      
      return outfitsByOccasion;

    } catch (err) {
      logger.error("❌ [usePersonalizedLooks] שגיאה ביצירת לוקים", {
        context: 'usePersonalizedLooks',
        data: err
      });
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
