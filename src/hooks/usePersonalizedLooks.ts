
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { fetchDashboardItems, clearOutfitCache } from "@/services/lookService";
import { toast as sonnerToast } from "sonner";
import type { Mood } from "@/components/filters/MoodFilter";
import { useLocalOutfitData } from "./useLocalOutfitData";

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

// Define DashboardItem type to match the API response structure
interface DashboardItem {
  id: string;
  image: string; // Make image required to match LocalOutfitItem
  type: LookItem['type'];
  price?: string;
}

// Type for the data structure returned by fetchDashboardItems
interface DashboardData {
  [key: string]: DashboardItem[];
}

export function usePersonalizedLooks() {
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [userStyle, setUserStyle] = useState<any>(null);
  const [combinations, setCombinations] = useState<{ [key: string]: number }>({});
  const [forceRefresh, setForceRefresh] = useState(false);
  const [apiErrorShown, setApiErrorShown] = useState(false);
  const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
  const { fallbackItems } = useLocalOutfitData();

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
      const data = await fetchDashboardItems();
      
      // Check if we received actual data
      const hasRealData = Object.keys(data || {}).some(key => 
        Array.isArray(data[key]) && data[key].length > 0
      );
      
      if (!hasRealData) {
        console.log("No real data received, using fallbacks");
        return fallbackItems;
      }
      
      // Merge API data with fallbacks for any missing occasions
      const mergedData: DashboardData = { ...fallbackItems };
      
      for (const occasion of occasions) {
        if (data[occasion] && Array.isArray(data[occasion]) && data[occasion].length > 0) {
          // Ensure all items have the required fields for LookItem
          mergedData[occasion] = data[occasion].map(item => ({
            id: item.id || `generated-${Math.random().toString(36).substring(7)}`,
            image: item.image || '/placeholder.svg', // Ensure image is never undefined
            type: item.type || 'top',
            price: item.price
          }));
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
      // Always return fallback data on failure
      console.log("Error fetching data, using fallbacks", err);
      return fallbackItems;
    }
  }, [fallbackItems, occasions, apiErrorShown, toast]);

  // The useQuery hook with improved fallback handling
  const { data: occasionOutfits, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboardItems', selectedMood, forceRefresh],
    queryFn,
    enabled: !!userStyle,
    staleTime: 30000, // Cache data for 30 seconds
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    // Use placeholderData instead of keepPreviousData
    placeholderData: fallbackItems,
    // Prevent refetching on window focus which can cause flickering
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
    // Always ensure we have items, using fallbacks if needed
    const lookItems = items.length > 0 ? items : (fallbackItems[occasion] || []);
    
    if (lookItems.length === 0) {
      return null;
    }
    
    // Map and ensure item types conform to the allowed types
    const mappedItems = lookItems.map(item => {
      const validType = ['top', 'bottom', 'dress', 'shoes', 'accessory', 'sunglasses', 'outerwear', 'cart'].includes(item.type?.toLowerCase()) 
        ? item.type.toLowerCase() as LookItem['type']
        : 'top';
      
      return {
        id: item.id || `fallback-${Math.random().toString(36).substring(7)}`,
        // Ensure image is never undefined
        image: item.image || '/placeholder.svg',
        type: validType
      };
    });
    
    let totalPrice = 0;
    items.forEach(item => {
      if (item.price) {
        const itemPrice = item.price?.replace(/[^0-9.]/g, '') || '0';
        totalPrice += parseFloat(itemPrice);
      }
    });
    
    return {
      id: `look-${occasion}-${index}`,
      title: `${occasion} Look`,
      items: mappedItems,
      price: totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : '$29.99', // Default price if no price data
      category: userStyle?.analysis?.styleProfile || "Casual",
      occasion: occasion
    };
  }, [fallbackItems]);

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
      // Check if each occasion has items, if not, use fallbacks
      const result = { ...occasionOutfits };
      
      for (const occasion of occasions) {
        if (!result[occasion] || !Array.isArray(result[occasion]) || result[occasion].length === 0) {
          result[occasion] = fallbackItems[occasion];
        }
      }
      
      return result;
    }
    
    // If no data at all, return fallbacks
    return fallbackItems;
  }, [occasionOutfits, fallbackItems, occasions]);

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
