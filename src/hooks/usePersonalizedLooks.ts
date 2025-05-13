
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

  const { data: occasionOutfits, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboardItems', selectedMood, forceRefresh],
    queryFn: fetchDashboardItems,
    enabled: !!userStyle,
    staleTime: 0,
    retry: 2, // Increase retries for improved reliability
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
  });

  // Handle API errors gracefully
  useEffect(() => {
    if (isError && !apiErrorShown) {
      console.error("API error:", error);
      setApiErrorShown(true);
      toast({
        title: "Connection Error",
        description: "Unable to load outfit recommendations. Please try again later.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast, apiErrorShown]);

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
    if (!items || items.length === 0) return null;
    
    // Map and ensure item types conform to the allowed types
    const lookItems = items.map(item => {
      // Ensure type is one of the allowed types, defaulting to 'top' if not valid
      const validType = ['top', 'bottom', 'dress', 'shoes', 'accessory', 'sunglasses', 'outerwear', 'cart'].includes(item.type.toLowerCase()) 
        ? item.type.toLowerCase() as 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' | 'cart' 
        : 'top';
      
      return {
        id: item.id,
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
      price: totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : '$0.00',
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
    refetch();

    // Show feedback to user on shuffle
    sonnerToast.info("Finding new look combinations...", {
      duration: 1500
    });
  };
  
  const handleAddToCart = (look: Look) => {
    // This function will be implemented in the component
  };

  const resetError = () => {
    setApiErrorShown(false);
    refetch();
  };

  return {
    selectedMood,
    userStyle,
    occasions,
    occasionOutfits,
    isLoading,
    isError,
    createLookFromItems,
    handleMoodSelect,
    handleShuffleLook,
    resetError,
    apiErrorShown
  };
}
