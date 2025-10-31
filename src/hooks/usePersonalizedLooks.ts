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

      // Generate outfits for EACH occasion separately with appropriate styling
      for (const occasion of occasions) {
        logger.info(`🎨 [usePersonalizedLooks] קורא ל-styling-agent עבור ${occasion}`, {
          context: 'usePersonalizedLooks',
          data: { bodyShape, styleProfile, currentMood, occasion }
        });
        
        const { data: stylingData, error: stylingError } = await supabase.functions.invoke('styling-agent', {
          body: {
            bodyType: bodyShape,
            mood: currentMood,
            style: styleProfile,
            budget: 500,
            occasion: occasion.toLowerCase(), // Pass occasion!
            userId: 'default-user'
          }
        });

        
        if (stylingError || !stylingData?.success || !stylingData?.outfits) {
          logger.error(`❌ [usePersonalizedLooks] שגיאה ב-styling-agent עבור ${occasion}`, {
            context: 'usePersonalizedLooks',
            data: { error: stylingError, stylingData }
          });
          continue; // Skip this occasion
        }

        logger.info(`✅ [usePersonalizedLooks] קיבלנו ${stylingData.outfits.length} outfits עבור ${occasion}`, {
          context: 'usePersonalizedLooks'
        });

        // Convert styling-agent outfits to DashboardItems
        const occasionItems: DashboardItem[] = [];
        
        for (const outfit of stylingData.outfits) {
          // Add top
          if (outfit.top_id) {
            const { data: topData } = await supabase
              .from('zara_cloth')
              .select('*')
              .eq('id', outfit.top_id)
              .single();
            
            if (topData) {
              occasionItems.push({
                id: topData.id,
                name: topData.product_name,
                type: 'top',
                image: topData.image as any, // Json type
                price: `₪${topData.price}`,
                category: 'top',
                color: topData.colour,
                affiliate_link: (topData.url as string) || '#',
                season: 'all',
                formality: occasion === 'Work' ? 'formal' : 'casual',
                style: styleProfile
              });
            }
          }

          // Add bottom
          if (outfit.bottom_id) {
            const { data: bottomData } = await supabase
              .from('zara_cloth')
              .select('*')
              .eq('id', outfit.bottom_id)
              .single();
            
            if (bottomData) {
              occasionItems.push({
                id: bottomData.id,
                name: bottomData.product_name,
                type: 'bottom',
                image: bottomData.image as any, // Json type
                price: `₪${bottomData.price}`,
                category: 'bottom',
                color: bottomData.colour,
                affiliate_link: (bottomData.url as string) || '#',
                season: 'all',
                formality: occasion === 'Work' ? 'formal' : 'casual',
                style: styleProfile
              });
            }
          }

          // Add shoes
          if (outfit.shoes_id) {
            const { data: shoesData } = await supabase
              .from('shoes')
              .select('*')
              .eq('id', outfit.shoes_id)
              .single();
            
            if (shoesData) {
              occasionItems.push({
                id: shoesData.id,
                name: shoesData.name as string,
                type: 'shoes',
                image: shoesData.image as any, // Json type
                price: `₪${shoesData.price}`,
                category: 'shoes',
                color: shoesData.color as any, // Json type
                affiliate_link: (shoesData.url as string) || '#',
                season: 'all',
                formality: occasion === 'Work' ? 'formal' : 'casual',
                style: styleProfile
              });
            }
          }
        }

        outfitsByOccasion[occasion] = occasionItems;
        
        logger.info(`✅ [usePersonalizedLooks] ${occasion} - סה"כ ${occasionItems.length} פריטים`, {
          context: 'usePersonalizedLooks',
          data: {
            tops: occasionItems.filter(i => i.type === 'top').length,
            bottoms: occasionItems.filter(i => i.type === 'bottom').length,
            shoes: occasionItems.filter(i => i.type === 'shoes').length
          }
        });
      }

      
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

    // Must have shoes always
    if (shoes.length === 0) {
      console.log(`⚠️ [createLookFromItems] No shoes for ${occasion}`);
      return null;
    }

    // Must have at least one top
    if (tops.length === 0) {
      console.log(`⚠️ [createLookFromItems] No tops for ${occasion}`);
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

    // Check if the top is a dress - dresses don't need bottoms
    const top = getItemByIndex(tops, currentCombination);
    const isDress = top && (
      top.name.toUpperCase().includes('VESTIDO') || 
      top.name.toUpperCase().includes('DRESS')
    );

    // Add top (or dress)
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

    // Only add bottom if it's NOT a dress
    if (!isDress) {
      // Only add bottom if we have bottoms available
      if (bottoms.length > 0) {
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
      }
    }

    // Always add shoes
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

    // For dresses: expect 2 items (dress + shoes)
    // For regular outfits: expect at least 2 items (top + shoes), 3 if we have bottoms (top + bottom + shoes)
    const minItems = isDress ? 2 : 2;
    const maxItems = isDress ? 2 : 3;
    
    if (lookItems.length < minItems) {
      console.log(`⚠️ [createLookFromItems] Created look with only ${lookItems.length} items for ${occasion} (isDress: ${isDress})`);
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
