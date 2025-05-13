import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { fetchDashboardItems, clearOutfitCache } from "@/services/lookService";
import { toast as sonnerToast } from "sonner";
import type { Mood } from "@/components/filters/MoodFilter";

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

export function usePersonalizedLooks() {
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [userStyle, setUserStyle] = useState<any>(null);
  const [combinations, setCombinations] = useState<{ [key: string]: number }>({});
  const [forceRefresh, setForceRefresh] = useState(false);
  const [apiErrorShown, setApiErrorShown] = useState(false);
  const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];
  
  // Enhanced fallback items with proper type assignments
  const fallbackItems = {
    Work: [
      { id: 'work-top-1', image: '/lovable-uploads/028933c6-ec95-471c-804c-0aa31a0e1f15.png', type: 'top' as const },
      { id: 'work-bottom-1', image: '/lovable-uploads/386cf438-be54-406f-9dbb-6495a8f8bde9.png', type: 'bottom' as const },
      { id: 'work-shoes-1', image: '/lovable-uploads/553ba2e6-53fd-46dd-82eb-64121072a826.png', type: 'shoes' as const }
    ],
    Casual: [
      { id: 'casual-top-1', image: '/lovable-uploads/97187c5b-b4bd-4ead-a4bf-644148da8924.png', type: 'top' as const },
      { id: 'casual-bottom-1', image: '/lovable-uploads/6fe5dff3-dfba-447b-986f-7281b45a0703.png', type: 'bottom' as const },
      { id: 'casual-shoes-1', image: '/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png', type: 'shoes' as const }
    ],
    Evening: [
      { id: 'evening-top-1', image: '/lovable-uploads/b2b5da4b-c967-4791-8832-747541e275be.png', type: 'top' as const },
      { id: 'evening-bottom-1', image: '/lovable-uploads/a1785297-040b-496d-a2fa-af4ecb55207a.png', type: 'bottom' as const },
      { id: 'evening-shoes-1', image: '/lovable-uploads/c7a32d15-ffe2-4f07-ae82-a943d5128293.png', type: 'shoes' as const }
    ],
    Weekend: [
      { id: 'weekend-top-1', image: '/lovable-uploads/160222f3-86e6-41d7-b5c8-ecfc0b63851b.png', type: 'top' as const },
      { id: 'weekend-bottom-1', image: '/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png', type: 'bottom' as const },
      { id: 'weekend-shoes-1', image: '/lovable-uploads/553ba2e6-53fd-46dd-82eb-64121072a826.png', type: 'shoes' as const }
    ]
  };

  useEffect(() => {
    console.log("Loading style analysis");
    const styleAnalysis = localStorage.getItem('styleAnalysis');
    if (styleAnalysis) {
      setUserStyle(JSON.parse(styleAnalysis));
      console.log("Style analysis loaded:", JSON.parse(styleAnalysis));
    } else {
      console.log("No style analysis found in localStorage");
    }
  }, []);

  // Initialize mood from localStorage if available
  useEffect(() => {
    const storedMood = localStorage.getItem('current-mood');
    if (storedMood) {
      setSelectedMood(storedMood as Mood);
    }
  }, []);

  // Improved query with aggressive caching and error handling
  // Fixed: Removed the keepPreviousData option that's not supported in TanStack Query v5
  const { data: occasionOutfits, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboardItems', selectedMood, forceRefresh],
    queryFn: async () => {
      try {
        const data = await fetchDashboardItems();
        console.log("Successfully fetched dashboard items:", data);
        
        // Check if we received actual data for each occasion
        const hasRealData = Object.keys(data || {}).some(key => 
          Array.isArray(data[key]) && data[key].length > 0
        );
        
        if (!hasRealData) {
          console.log("No real data found in API response, using fallbacks");
          return fallbackItems;
        }
        
        // Merge API data with fallbacks for any missing occasions
        const mergedData = { ...fallbackItems };
        
        for (const occasion of occasions) {
          if (data[occasion] && Array.isArray(data[occasion]) && data[occasion].length > 0) {
            mergedData[occasion] = data[occasion];
          }
          // Otherwise keep the fallback
        }
        
        return mergedData;
      } catch (err) {
        console.error("Error fetching dashboard items:", err);
        // Show error toast only once
        if (!apiErrorShown) {
          setApiErrorShown(true);
          toast({
            title: "Connection Issue",
            description: "Using fallback outfits while we restore connection.",
            variant: "default",
          });
        }
        // Return fallback data when API fails
        return fallbackItems;
      }
    },
    enabled: !!userStyle,
    staleTime: 30000, // Cache data for 30 seconds
    retry: 2, // Try up to 3 times total
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    // Note: keepPreviousData has been removed as it's not supported in TanStack Query v5
    // The placeholderData option can be used for similar functionality
    placeholderData: fallbackItems,
  });

  useEffect(() => {
    if (selectedMood) {
      localStorage.setItem('current-mood', selectedMood);
      refetch();
    }
  }, [selectedMood, refetch]);

  useEffect(() => {
    if (forceRefresh) {
      setForceRefresh(false);
    }
  }, [occasionOutfits, forceRefresh]);

  const createLookFromItems = (items: any[] = [], occasion: string, index: number): Look | null => {
    // Always use fallback if no items found for an occasion
    if (!items || items.length === 0) {
      items = fallbackItems[occasion as keyof typeof fallbackItems] || [];
    }
    
    // Ensure we have at least an empty array
    if (items.length === 0) {
      console.warn(`No items found for occasion ${occasion}, not even fallbacks`);
      return null;
    }
    
    // Map and ensure item types conform to the allowed types
    const lookItems = items.map(item => {
      // Ensure type is one of the allowed types, defaulting to 'top' if not valid
      const validType = ['top', 'bottom', 'dress', 'shoes', 'accessory', 'sunglasses', 'outerwear', 'cart'].includes(item.type?.toLowerCase()) 
        ? item.type.toLowerCase() as 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' | 'cart' 
        : 'top';
      
      return {
        id: item.id || `fallback-${Math.random().toString(36).substring(7)}`,
        image: item.image,
        type: validType
      };
    });
    
    let totalPrice = 0;
    items.forEach(item => {
      const itemPrice = item.price?.replace(/[^0-9.]/g, '') || '0';
      totalPrice += parseFloat(itemPrice);
    });
    
    return {
      id: `look-${occasion}-${index}`,
      title: `${occasion} Look`,
      items: lookItems,
      price: totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : '$29.99', // Default price if no price data
      category: userStyle?.analysis?.styleProfile || "Casual",
      occasion: occasion
    };
  };

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    localStorage.setItem('current-mood', mood);
    // Reset the API error flag when trying with a new mood
    setApiErrorShown(false);
  };

  const handleShuffleLook = (occasion: string) => {
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
    setApiErrorShown(false); // Reset error flag when shuffling
    
    // Show feedback to user on shuffle
    sonnerToast.info("Finding new look combinations...", {
      duration: 1500
    });
    
    refetch();
  };

  const resetError = () => {
    setApiErrorShown(false);
    refetch();
  };

  // Get the data to return, ensuring we have fallbacks ready
  const getOutfitData = () => {
    if (occasionOutfits) {
      // Check if each occasion has items, if not, use fallbacks
      const result = { ...occasionOutfits };
      
      for (const occasion of occasions) {
        if (!result[occasion] || !Array.isArray(result[occasion]) || result[occasion].length === 0) {
          result[occasion] = fallbackItems[occasion as keyof typeof fallbackItems];
        }
      }
      
      return result;
    }
    
    // If no data at all, return fallbacks
    return fallbackItems;
  };

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
