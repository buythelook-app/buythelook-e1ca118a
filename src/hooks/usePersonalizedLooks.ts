
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardItems, clearOutfitCache } from "@/services/lookService";
import { toast as sonnerToast } from "sonner";
import type { Mood } from "@/components/filters/MoodFilter";
import { DashboardItem } from "@/types/lookTypes";

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

    // Load initially
    loadStyleAnalysis();

    // Create a custom event listener for style changes
    const handleStyleChange = () => {
      loadStyleAnalysis();
      console.log('🎨 [usePersonalizedLooks] Style changed, reloading...');
    };

    // Listen for custom style change events
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

  // Function to fetch clothing items from SERP API
  async function getClothingItems(itemType: string) {
    const response = await fetch(`https://serpapi.com/search.json?q=${itemType}+fashion+shop&api_key=4372aba9d8cd4bd187611e0f7ed265e130d00a0b44c9c9e2d8625c5659bcc7cb&tbm=shop`);
    const data = await response.json();
    return data.shopping_results || [];
  }

  // Memoized query function - fetch from SERP API and create complete outfits
  const queryFn = useCallback(async () => {
    try {
      console.log('🔍 [usePersonalizedLooks] Starting fetch from SERP API...');
      
      const occasionItems = {
        'Work': ['blouse', 'trousers', 'blazer', 'dress shoes'],
        'Casual': ['t-shirt', 'jeans', 'sneakers', 'casual jacket'],
        'Evening': ['dress', 'heels', 'elegant top', 'formal shoes'],
        'Weekend': ['sweater', 'casual pants', 'comfortable shoes', 'casual shirt']
      };

      const data: { [key: string]: DashboardItem[] } = {};
      
      for (const [occasion, itemTypes] of Object.entries(occasionItems)) {
        console.log(`🔍 [usePersonalizedLooks] Fetching items for ${occasion}:`, itemTypes);
        data[occasion] = [];
        
        for (const itemType of itemTypes) {
          try {
            const serpResults = await getClothingItems(itemType);
            
            // Convert SERP results to DashboardItem format
            const convertedItems: DashboardItem[] = serpResults.slice(0, 3).map((item: any, index: number) => ({
              id: `${itemType}-${index}-${Date.now()}`,
              name: item.title || `${itemType} item`,
              type: itemType.includes('shoe') ? 'shoes' : 
                    itemType.includes('dress') ? 'dress' :
                    itemType.includes('pant') || itemType.includes('jean') || itemType.includes('trouser') ? 'bottom' :
                    'top',
              image: item.thumbnail || '/placeholder.svg',
              price: item.price || '$29.99',
              category: occasion.toLowerCase(),
              brand: item.source || 'Fashion Brand'
            }));
            
            data[occasion].push(...convertedItems);
          } catch (itemError) {
            console.error(`❌ Error fetching ${itemType} for ${occasion}:`, itemError);
          }
        }
        
        console.log(`📋 [usePersonalizedLooks] ${occasion} items:`, data[occasion].length);
      }
      
      console.log('✅ [usePersonalizedLooks] All occasions processed from SERP API:', data);
      return data;
      
    } catch (err) {
      console.error("❌ [usePersonalizedLooks] Error fetching data:", err);
      // Return empty outfits instead of fallbacks
      const emptyData: { [key: string]: DashboardItem[] } = {};
      occasions.forEach(occasion => {
        emptyData[occasion] = [];
      });
      return emptyData;
    }
  }, [forceRefresh]);

  // The useQuery hook - only database items
  const { data: occasionOutfits, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboardItems', selectedMood, forceRefresh, userStyle?.analysis?.styleProfile],
    queryFn,
    enabled: !!userStyle,
    staleTime: 5000,
    retry: 1,
    placeholderData: { Work: [], Casual: [], Evening: [], Weekend: [] },
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

  const createLookFromItems = useCallback((items: DashboardItem[] = [], occasion: string, index: number): Look | null => {
    console.log(`🔍 [usePersonalizedLooks] Creating look from ${items.length} items for ${occasion}`);
    console.log(`📋 [usePersonalizedLooks] Items details:`, items.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      hasImage: !!item.image
    })));
    
    if (!items || items.length === 0) {
      console.log(`❌ [usePersonalizedLooks] No items for ${occasion} look`);
      return null;
    }
    
    // Convert DashboardItem[] to LookItem[] for the Look interface
    const lookItems: LookItem[] = items.map(item => ({
      id: item.id,
      image: item.image || '/placeholder.svg',
      type: item.type,
      name: item.name,
      price: item.price
    }));
    
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
    
    const look = {
      id: `look-${occasion}-${index}`,
      title: `${occasion} Look`,
      items: lookItems,
      price: totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : '$29.99',
      category: userStyle?.analysis?.styleProfile || "Casual",
      occasion: occasion
    };
    
    console.log(`✅ [usePersonalizedLooks] Created look for ${occasion}:`, {
      id: look.id,
      title: look.title,
      itemCount: look.items.length,
      items: look.items.map(item => ({ id: item.id, name: item.name, type: item.type }))
    });
    return look;
  }, [userStyle]);

  const handleMoodSelect = useCallback((mood: Mood) => {
    setSelectedMood(mood);
    localStorage.setItem('current-mood', mood);
    setApiErrorShown(false);
  }, []);

  const handleShuffleLook = useCallback((occasion: string) => {
    clearOutfitCache();
    
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

  // Always return database data only
  const getOutfitData = useCallback(() => {
    const data = occasionOutfits || { Work: [], Casual: [], Evening: [], Weekend: [] };
    console.log('🔍 [usePersonalizedLooks] Returning outfit data:', Object.keys(data).map(occasion => ({
      occasion,
      itemCount: data[occasion].length
    })));
    return data;
  }, [occasionOutfits]);

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
