
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardItems, clearOutfitCache } from "@/services/lookService";
import { toast as sonnerToast } from "sonner";
import type { Mood } from "@/components/filters/MoodFilter";
import { DashboardItem } from "@/types/lookTypes";
import { useExternalCatalog } from "./useExternalCatalog";

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

  // Memoized query function - fetch from RapidAPI and database, then merge
  const queryFn = useCallback(async () => {
    try {
      console.log('🔍 [usePersonalizedLooks] Starting fetch for dashboard items...');
      
      // Clear global tracking when forced refresh
      if (forceRefresh) {
        clearOutfitCache();
      }
      
      // Fetch from RapidAPI for each occasion
      console.log('🚀 [usePersonalizedLooks] Starting RapidAPI fetch for occasions:', occasions);
      const rapidApiPromises = occasions.map(async (occasion) => {
        const query = `women ${occasion.toLowerCase()}`;
        const category = occasion === 'Work' ? 'dresses' : occasion === 'Evening' ? 'dresses' : 'tops';
        
        console.log(`📡 [usePersonalizedLooks] Calling RapidAPI for ${occasion}:`, { query, category });
        const catalogResult = await fetchCatalog({
          query,
          gender: 'women',
          category,
          limit: 6
        });
        console.log(`📦 [usePersonalizedLooks] RapidAPI result for ${occasion}:`, catalogResult);
        
        if (catalogResult.success && catalogResult.items) {
          console.log(`✅ [usePersonalizedLooks] RapidAPI SUCCESS for ${occasion}:`, catalogResult.items.length, 'items');
          // Convert CatalogItem to DashboardItem format
          const dashboardItems: DashboardItem[] = catalogResult.items.map((item, index) => ({
            id: `rapidapi-${occasion}-${item.id}`,
            name: item.title,
            type: (occasion === 'Work' || occasion === 'Evening') ? 'dress' : 
                  (index % 3 === 0 ? 'top' : index % 3 === 1 ? 'bottom' : 'shoes') as any,
            image: item.imageUrl || item.thumbnailUrl || '/placeholder.svg',
            price: item.estimatedPrice?.replace(/[^0-9.]/g, '') || '29.99',
            brand: item.source || 'ASOS',
            color: 'mixed',
            category: item.category || 'clothing',
            season: 'all',
            formality: occasion === 'Work' ? 'formal' : occasion === 'Evening' ? 'formal' : 'casual',
            style: 'modern',
            affiliate_link: item.link
          }));
          
          console.log(`🎯 [usePersonalizedLooks] Converted ${dashboardItems.length} items for ${occasion}:`, dashboardItems.map(i => ({ id: i.id, name: i.name, source: 'RapidAPI' })));
          return { occasion, items: dashboardItems };
        }
        
        console.log(`❌ [usePersonalizedLooks] RapidAPI FAILED for ${occasion}:`, catalogResult.error);
        return { occasion, items: [] };
      });
      
      // Wait for all RapidAPI calls to complete
      const rapidApiResults = await Promise.all(rapidApiPromises);
      
      // Also fetch from database as fallback
      console.log('💾 [usePersonalizedLooks] Fetching database fallback data...');
      const databaseData = await fetchDashboardItems();
      console.log('💾 [usePersonalizedLooks] Database data:', Object.keys(databaseData).map(k => ({ occasion: k, count: databaseData[k].length })));
      
      // Merge RapidAPI data with database data
      const mergedData: { [key: string]: DashboardItem[] } = {};
      
      occasions.forEach(occasion => {
        const rapidApiItems = rapidApiResults.find(r => r.occasion === occasion)?.items || [];
        const databaseItems = databaseData[occasion] || [];
        
        // Prioritize RapidAPI items, fallback to database items if needed
        mergedData[occasion] = rapidApiItems.length > 0 ? rapidApiItems : databaseItems;
        
        console.log(`📋 [usePersonalizedLooks] ${occasion} FINAL DATA SOURCE:`, {
          rapidApiCount: rapidApiItems.length,
          databaseCount: databaseItems.length,
          totalUsed: mergedData[occasion].length,
          source: rapidApiItems.length > 0 ? '🌐 RapidAPI (LIVE)' : '💾 Database (FALLBACK)',
          sampleItem: mergedData[occasion][0] ? { 
            id: mergedData[occasion][0].id, 
            name: mergedData[occasion][0].name,
            isFromRapidAPI: mergedData[occasion][0].id.startsWith('rapidapi-')
          } : 'No items'
        });
      });
      
      console.log('✅ [usePersonalizedLooks] All occasions processed with RapidAPI data:', mergedData);
      return mergedData;
      
    } catch (err) {
      console.error("❌ [usePersonalizedLooks] Error fetching data:", err);
      // Return empty outfits instead of fallbacks
      const emptyData: { [key: string]: DashboardItem[] } = {};
      occasions.forEach(occasion => {
        emptyData[occasion] = [];
      });
      return emptyData;
    }
  }, [forceRefresh, fetchCatalog, occasions]);

  // The useQuery hook - fetches RapidAPI items with database fallback
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

  // Return merged RapidAPI and database data
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
