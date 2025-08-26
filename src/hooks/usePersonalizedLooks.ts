
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFashionItems } from "@/lib/serpApi";
import { toast as sonnerToast } from "sonner";
import type { Mood } from "@/components/filters/MoodFilter";

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

  // Memoized query function - fetch from API with proper categorization
  const queryFn = useCallback(async () => {
    try {
      console.log('🔍 [usePersonalizedLooks] Starting fetch from API...');
      
      const occasionData: { [key: string]: any[] } = {};
      const debugInfo = {
        totalApiCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalItemsReceived: 0,
        errors: [] as string[]
      };
      
      // Fetch items for each occasion from API
      for (const occasion of occasions) {
        console.log(`🔍 [usePersonalizedLooks] Fetching ${occasion} items from API...`);
        debugInfo.totalApiCalls++;
        
        const result = await getFashionItems(
          occasion.toLowerCase(), 
          userStyle?.analysis?.styleProfile || 'classic', 
          'medium',
          'women'
        );
        
        if (result.success && result.items) {
          debugInfo.successfulCalls++;
          debugInfo.totalItemsReceived += result.items.length;
          
          console.log(`📊 [usePersonalizedLooks] ${occasion} API response:`, {
            success: result.success,
            itemCount: result.items.length,
            query: result.query,
            firstItemSample: result.items[0] ? {
              id: result.items[0].id,
              title: result.items[0].title?.substring(0, 30) + '...',
              category: result.items[0].category,
              hasImage: !!result.items[0].imageUrl
            } : null
          });
          
          // Convert API items to our format and ensure proper categorization
          const categorizedItems = categorizeAPIItems(result.items);
          
          // Create balanced outfit: 1 top, 1 bottom, 1 shoes (exactly 3 items)
          const balancedOutfit = createBalancedOutfit(categorizedItems, occasion);
          
          occasionData[occasion] = balancedOutfit;
          console.log(`✅ [usePersonalizedLooks] Created balanced outfit for ${occasion}: ${balancedOutfit.length} items`);
        } else {
          debugInfo.failedCalls++;
          const errorMsg = `${occasion}: ${result.error || 'No items returned'}`;
          debugInfo.errors.push(errorMsg);
          console.log(`❌ [usePersonalizedLooks] No items found for ${occasion}:`, result.error);
          occasionData[occasion] = [];
        }
      }
      
      // Log comprehensive debug summary
      console.log('📈 [usePersonalizedLooks] API Fetch Summary:', debugInfo);
      console.log('✅ [usePersonalizedLooks] Final outfit data structure:', 
        Object.keys(occasionData).map(key => ({
          occasion: key,
          itemCount: occasionData[key].length,
          items: occasionData[key].map((item: any) => ({
            id: item.id,
            name: item.name?.substring(0, 20) + '...',
            type: item.type
          }))
        }))
      );
      
      // Store debug info for DebugPanel
      (window as any).fashionApiDebug = {
        ...debugInfo,
        occasionData,
        lastUpdated: new Date().toISOString()
      };
      
      return occasionData;
      
    } catch (err) {
      console.error("❌ [usePersonalizedLooks] Unexpected error in queryFn:", err);
      sonnerToast.error("Failed to load fashion items from API. Please try again later.");
      
      // Store error info for debugging
      (window as any).fashionApiDebug = {
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        lastUpdated: new Date().toISOString()
      };
      
      // Return empty outfits on error
      const emptyData: { [key: string]: any[] } = {};
      occasions.forEach(occasion => {
        emptyData[occasion] = [];
      });
      return emptyData;
    }
  }, [forceRefresh, userStyle]);

  // Helper function to categorize API items
  const categorizeAPIItems = useCallback((items: any[]) => {
    console.log('🔍 [categorizeAPIItems] Processing items:', items.map(item => ({
      id: item.id,
      title: item.title?.substring(0, 30) + '...',
      category: item.category,
      estimatedPrice: item.estimatedPrice
    })));
    
    const categorized = {
      tops: items.filter(item => ['top', 'shirt', 'blouse', 'jacket', 'coat', 'outerwear'].includes(item.category?.toLowerCase())),
      bottoms: items.filter(item => ['bottom', 'pants', 'trousers', 'skirt', 'jeans'].includes(item.category?.toLowerCase())),
      shoes: items.filter(item => ['shoes', 'footwear', 'boots', 'sandals', 'heels'].includes(item.category?.toLowerCase())),
      dresses: items.filter(item => ['dress', 'gown'].includes(item.category?.toLowerCase()))
    };
    
    console.log('🔍 [categorizeAPIItems] Categorization results:', {
      tops: categorized.tops.length,
      bottoms: categorized.bottoms.length, 
      shoes: categorized.shoes.length,
      dresses: categorized.dresses.length,
      uncategorized: items.length - (categorized.tops.length + categorized.bottoms.length + categorized.shoes.length + categorized.dresses.length)
    });
    
    // Log items that didn't get categorized
    const allCategorized = [...categorized.tops, ...categorized.bottoms, ...categorized.shoes, ...categorized.dresses];
    const uncategorized = items.filter(item => !allCategorized.some(cat => cat.id === item.id));
    if (uncategorized.length > 0) {
      console.warn('⚠️ [categorizeAPIItems] Uncategorized items:', uncategorized.map(item => ({
        id: item.id,
        title: item.title?.substring(0, 40),
        category: item.category
      })));
    }
    
    return categorized;
  }, []);

  // Helper function to create balanced outfit (exactly 3 items)
  const createBalancedOutfit = useCallback((categorized: any, occasion: string) => {
    console.log(`🏗️ [createBalancedOutfit] Building outfit for ${occasion} with available items:`, {
      tops: categorized.tops.length,
      bottoms: categorized.bottoms.length,
      shoes: categorized.shoes.length,
      dresses: categorized.dresses.length
    });
    
    const outfit: any[] = [];
    let strategy = '';
    
    // Strategy 1: For evening occasions, prefer dress + shoes
    if (occasion.toLowerCase() === 'evening' && categorized.dresses.length > 0) {
      strategy = 'evening-dress';
      outfit.push({
        ...categorized.dresses[0],
        type: 'dress'
      });
      console.log(`✅ [createBalancedOutfit] Added dress for evening: ${categorized.dresses[0].title?.substring(0, 30)}`);
    } 
    // Strategy 2: Standard top + bottom combination
    else {
      strategy = 'top-bottom';
      // Add top (required)
      if (categorized.tops.length > 0) {
        outfit.push({
          ...categorized.tops[0],
          type: 'top'
        });
        console.log(`✅ [createBalancedOutfit] Added top: ${categorized.tops[0].title?.substring(0, 30)}`);
      } else {
        console.warn(`⚠️ [createBalancedOutfit] No tops available for ${occasion}`);
      }
      
      // Add bottom (required if no dress)
      if (categorized.bottoms.length > 0) {
        outfit.push({
          ...categorized.bottoms[0],
          type: 'bottom'
        });
        console.log(`✅ [createBalancedOutfit] Added bottom: ${categorized.bottoms[0].title?.substring(0, 30)}`);
      } else {
        console.warn(`⚠️ [createBalancedOutfit] No bottoms available for ${occasion}`);
      }
    }
    
    // Add shoes (always required)
    if (categorized.shoes.length > 0) {
      outfit.push({
        ...categorized.shoes[0],
        type: 'shoes'
      });
      console.log(`✅ [createBalancedOutfit] Added shoes: ${categorized.shoes[0].title?.substring(0, 30)}`);
    } else {
      console.warn(`⚠️ [createBalancedOutfit] No shoes available for ${occasion}`);
    }
    
    console.log(`📦 [createBalancedOutfit] Final outfit for ${occasion} (${strategy}): ${outfit.length} items`);
    
    // Convert to proper format
    const formattedOutfit = outfit.map((item, index) => {
      const formatted = {
        id: item.id,
        name: item.title,
        image: item.imageUrl,
        type: item.type,
        price: item.estimatedPrice || '$29.99',
        product_subfamily: item.category
      };
      
      console.log(`🔄 [createBalancedOutfit] Formatted item ${index + 1}:`, {
        id: formatted.id,
        name: formatted.name?.substring(0, 30) + '...',
        type: formatted.type,
        hasImage: !!formatted.image,
        price: formatted.price
      });
      
      return formatted;
    });
    
    return formattedOutfit;
  }, []);

  // The useQuery hook - fetch from API
  const { data: occasionOutfits, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['apiItems', selectedMood, forceRefresh, userStyle?.analysis?.styleProfile],
    queryFn,
    enabled: true, // Always enabled for API
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

  const createLookFromItems = useCallback((items: any[] = [], occasion: string, index: number): Look | null => {
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
    setCombinations(prev => ({
      ...prev,
      [occasion]: (prev[occasion] || 0) + 1
    }));
    
    setForceRefresh(true);
    setApiErrorShown(false);
    
    sonnerToast.info("Finding new look combinations from API...", {
      duration: 1500
    });
    
    refetch();
  }, [refetch]);

  const resetError = useCallback(() => {
    setApiErrorShown(false);
    refetch();
  }, [refetch]);

  // Return API data
  const getOutfitData = useCallback(() => {
    const data = occasionOutfits || { Work: [], Casual: [], Evening: [], Weekend: [] };
    console.log('🔍 [usePersonalizedLooks] Returning API outfit data:', Object.keys(data).map(occasion => ({
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
