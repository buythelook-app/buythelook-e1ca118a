
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { fetchDashboardItems, clearOutfitCache } from "@/services/lookService";
import { toast as sonnerToast } from "sonner";
import type { Mood } from "@/components/filters/MoodFilter";
import { useLocalOutfitData } from "./useLocalOutfitData";
import { DashboardItem } from "@/types/lookTypes";

export interface LookItem {
  id: string;
  image: string;
  type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' | 'cart';
}

export interface Look {
  id: string;
  title: string;
  items: LookItem[];
  price: string;
  category: string;
  occasion: string;
}

// Define allowed types for proper type checking
const ALLOWED_TYPES = ['top', 'bottom', 'dress', 'shoes', 'accessory', 'sunglasses', 'outerwear', 'cart'] as const;
type AllowedType = typeof ALLOWED_TYPES[number];

// Helper function to check if a type is valid
const isValidItemType = (type: string): type is AllowedType => {
  return ALLOWED_TYPES.includes(type as AllowedType);
};

// Track used items to prevent duplication across different occasions
const globalUsedItemIds = new Map<string, Set<string>>();

export function usePersonalizedLooks() {
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [userStyle, setUserStyle] = useState<any>(null);
  const [combinations, setCombinations] = useState<{ [key: string]: number }>({});
  const [forceRefresh, setForceRefresh] = useState(false);
  const [apiErrorShown, setApiErrorShown] = useState(false);
  const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
  const { fallbackItems } = useLocalOutfitData();

  // Convert LocalOutfitItems to DashboardItems
  const convertedFallbackItems = useCallback(() => {
    const result: { [key: string]: DashboardItem[] } = {};
    
    for (const [occasion, items] of Object.entries(fallbackItems)) {
      // Filter and map to ensure all items have valid types, and ensure variety
      const validItems = items
        .filter(item => isValidItemType(item.type))
        .map((item, index) => ({
          id: `${item.id}-${occasion}-${index}`, // Ensure unique IDs per occasion
          name: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Item`,
          image: item.image,
          type: item.type,
          price: '$49.99'
        }));
      
      // Ensure we have at least one of each essential type
      const hasTop = validItems.some(item => item.type === 'top');
      const hasBottom = validItems.some(item => item.type === 'bottom');
      const hasShoes = validItems.some(item => item.type === 'shoes');
      
      // Add missing essential types if needed
      if (!hasTop && validItems.length > 0) {
        validItems.push({
          id: `fallback-top-${occasion}`,
          name: 'Top Item',
          image: validItems[0].image,
          type: 'top',
          price: '$49.99'
        });
      }
      
      if (!hasBottom && validItems.length > 0) {
        validItems.push({
          id: `fallback-bottom-${occasion}`,
          name: 'Bottom Item', 
          image: validItems[0].image,
          type: 'bottom',
          price: '$49.99'
        });
      }
      
      if (!hasShoes && validItems.length > 0) {
        validItems.push({
          id: `fallback-shoes-${occasion}`,
          name: 'Shoes Item',
          image: validItems[0].image,
          type: 'shoes',
          price: '$49.99'
        });
      }
      
      result[occasion] = validItems;
    }
    
    return result;
  }, [fallbackItems]);

  // Load style analysis from localStorage on component mount
  useEffect(() => {
    const styleAnalysis = localStorage.getItem('styleAnalysis');
    if (styleAnalysis) {
      setUserStyle(JSON.parse(styleAnalysis));
    }
  }, []);

  // Initialize mood from localStorage if available
  useEffect(() => {
    const storedMood = localStorage.getItem('current-mood');
    if (storedMood) {
      setSelectedMood(storedMood as Mood);
    }
  }, []);

  // Memoized query function to prevent unnecessary re-creations
  const queryFn = useCallback(async () => {
    try {
      // Clear global tracking when forced refresh to ensure completely different items
      if (forceRefresh) {
        globalUsedItemIds.clear();
      }
      
      const data = await fetchDashboardItems();
      
      // Check if we received actual data for each occasion
      const hasRealData = Object.keys(data || {}).some(key => 
        Array.isArray(data[key]) && data[key].length > 0
      );
      
      if (!hasRealData) {
        console.log("No real data received, using fallbacks");
        return convertedFallbackItems();
      }
      
      // Process and diversify API data for each occasion
      const mergedData: {[key: string]: DashboardItem[]} = {};
      
      for (const occasion of occasions) {
        if (data[occasion] && Array.isArray(data[occasion]) && data[occasion].length > 0) {
          // Validate and ensure diversity for each occasion
          let validItems = data[occasion]
            .filter(item => item && item.type && isValidItemType(item.type))
            .map((item, index) => ({
              id: `${item.id || `generated-${Math.random().toString(36).substring(7)}`}-${occasion}-${index}`,
              image: item.image || '/placeholder.svg',
              type: item.type as AllowedType,
              price: item.price || '$49.99',
              name: item.name || 'Item'
            }));
          
          // Ensure we have variety by type for this occasion
          const typeGroups = validItems.reduce((acc, item) => {
            if (!acc[item.type]) acc[item.type] = [];
            acc[item.type].push(item);
            return acc;
          }, {} as Record<string, DashboardItem[]>);
          
          // Pick diverse items, ensuring at least one of each essential type
          const diverseItems: DashboardItem[] = [];
          const essentialTypes = ['top', 'bottom', 'shoes'];
          
          essentialTypes.forEach(type => {
            if (typeGroups[type] && typeGroups[type].length > 0) {
              const randomItem = typeGroups[type][Math.floor(Math.random() * typeGroups[type].length)];
              diverseItems.push(randomItem);
            }
          });
          
          // Add other types to reach a good variety
          Object.keys(typeGroups).forEach(type => {
            if (!essentialTypes.includes(type) && typeGroups[type].length > 0) {
              const randomItem = typeGroups[type][Math.floor(Math.random() * typeGroups[type].length)];
              diverseItems.push(randomItem);
            }
          });
          
          // If we still don't have enough variety, add more items
          while (diverseItems.length < Math.min(10, validItems.length)) {
            const randomItem = validItems[Math.floor(Math.random() * validItems.length)];
            if (!diverseItems.find(item => item.id === randomItem.id)) {
              diverseItems.push(randomItem);
            }
          }
          
          if (diverseItems.length >= 3) {
            mergedData[occasion] = diverseItems;
          } else {
            mergedData[occasion] = convertedFallbackItems()[occasion];
          }
        } else {
          mergedData[occasion] = convertedFallbackItems()[occasion];
        }
      }
      
      return mergedData;
    } catch (err) {
      // Show error toast only once
      if (!apiErrorShown) {
        setApiErrorShown(true);
        toast({
          title: "Connection Issue",
          description: "Using fallback outfits while we restore connection.",
          variant: "default",
        });
      }
      console.log("Error fetching data, using fallbacks", err);
      return convertedFallbackItems();
    }
  }, [convertedFallbackItems, occasions, apiErrorShown, toast, forceRefresh]);

  // The useQuery hook with improved fallback handling
  const { data: occasionOutfits, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboardItems', selectedMood, forceRefresh],
    queryFn,
    enabled: !!userStyle,
    staleTime: 5000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    placeholderData: convertedFallbackItems(),
    refetchOnWindowFocus: false,
  });

  // Only trigger refetch when mood actually changes
  useEffect(() => {
    if (selectedMood) {
      localStorage.setItem('current-mood', selectedMood);
      refetch();
    }
  }, [selectedMood, refetch]);

  // Reset forceRefresh after update
  useEffect(() => {
    if (forceRefresh) {
      setForceRefresh(false);
    }
  }, [occasionOutfits, forceRefresh]);

  const createLookFromItems = useCallback((items: any[] = [], occasion: string, index: number): Look | null => {
    if (!items || items.length === 0) return null;
    
    // Ensure we have diverse items by type
    const typeGroups = items.reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item);
      return acc;
    }, {} as Record<string, any[]>);
    
    // Create a diverse outfit
    const outfitItems = [];
    const essentialTypes = ['top', 'bottom', 'shoes'];
    
    essentialTypes.forEach(type => {
      if (typeGroups[type] && typeGroups[type].length > 0) {
        const randomItem = typeGroups[type][Math.floor(Math.random() * typeGroups[type].length)];
        outfitItems.push({
          id: randomItem.id || `fallback-${type}-${Math.random().toString(36).substring(7)}`,
          image: randomItem.image || '/placeholder.svg',
          type: type
        });
      }
    });
    
    // If we don't have all essential types, use fallbacks
    while (outfitItems.length < 3 && items.length > 0) {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      if (!outfitItems.find(item => item.id === randomItem.id)) {
        outfitItems.push({
          id: randomItem.id || `fallback-${Math.random().toString(36).substring(7)}`,
          image: randomItem.image || '/placeholder.svg',
          type: randomItem.type
        });
      }
    }
    
    // Calculate total price
    let totalPrice = 0;
    items.forEach(item => {
      if (item.price) {
        const price = typeof item.price === 'string' 
          ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
          : (typeof item.price === 'number' ? item.price : 0);
        
        if (!isNaN(price)) {
          totalPrice += price;
        }
      }
    });
    
    return {
      id: `look-${occasion}-${index}`,
      title: `${occasion} Look`,
      items: outfitItems,
      price: totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : '$29.99',
      category: userStyle?.analysis?.styleProfile || "Casual",
      occasion: occasion
    };
  }, [userStyle]);

  const handleMoodSelect = useCallback((mood: Mood) => {
    setSelectedMood(mood);
    localStorage.setItem('current-mood', mood);
    setApiErrorShown(false);
  }, []);

  const handleShuffleLook = useCallback((occasion: string) => {
    const styleAnalysis = localStorage.getItem('styleAnalysis');
    if (styleAnalysis) {
      const parsed = JSON.parse(styleAnalysis);
      const bodyShape = parsed?.analysis?.bodyShape || 'H';
      const style = parsed?.analysis?.styleProfile || 'classic';
      const mood = localStorage.getItem('current-mood') || 'energized';
      
      clearOutfitCache(bodyShape, style, mood);
    }
    
    setCombinations(prev => ({
      ...prev,
      [occasion]: (prev[occasion] || 0) + 1
    }));
    
    setForceRefresh(true);
    setApiErrorShown(false);
    
    sonnerToast.info("Finding new look combinations...", {
      duration: 1500
    });
    
    refetch();
  }, [refetch]);

  const resetError = useCallback(() => {
    setApiErrorShown(false);
    refetch();
  }, [refetch]);

  // Always ensure we have data to return
  const getOutfitData = useCallback(() => {
    if (occasionOutfits) {
      const result = { ...occasionOutfits };
      
      for (const occasion of occasions) {
        if (!result[occasion] || !Array.isArray(result[occasion]) || result[occasion].length === 0) {
          result[occasion] = convertedFallbackItems()[occasion];
        }
      }
      
      return result;
    }
    
    return convertedFallbackItems();
  }, [occasionOutfits, convertedFallbackItems, occasions]);

  return {
    selectedMood,
    userStyle,
    occasions,
    occasionOutfits: getOutfitData(),
    isLoading,
    isError,
    createLookFromItems,
    handleMoodSelect,
    handleShuffleLook,
    resetError,
    apiErrorShown
  };
}
