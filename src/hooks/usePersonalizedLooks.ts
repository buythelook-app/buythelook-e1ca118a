
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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

// Define allowed types for proper type checking
const ALLOWED_TYPES = ['top', 'bottom', 'dress', 'shoes', 'accessory', 'sunglasses', 'outerwear', 'cart'] as const;
type AllowedType = typeof ALLOWED_TYPES[number];

// Helper function to check if a type is valid
const isValidItemType = (type: string): type is AllowedType => {
  return ALLOWED_TYPES.includes(type as AllowedType);
};

// Helper function to classify item type based on product_subfamily
const classifyItemType = (item: any): 'top' | 'bottom' | 'shoes' => {
  const subfamily = item.product_subfamily?.toLowerCase() || '';
  const name = item.product_name?.toLowerCase() || item.name?.toLowerCase() || '';
  
  console.log(`🔍 [usePersonalizedLooks] Classifying item ${item.id}: subfamily="${subfamily}", name="${name}"`);
  
  // Bottom items
  if (subfamily.includes('pants') || subfamily.includes('trousers') || 
      subfamily.includes('jeans') || subfamily.includes('shorts') || 
      subfamily.includes('skirt') || subfamily.includes('leggings') ||
      name.includes('pants') || name.includes('jeans') || name.includes('shorts') || name.includes('skirt')) {
    console.log(`✅ [usePersonalizedLooks] Classified as BOTTOM: ${item.id}`);
    return 'bottom';
  }
  
  // Shoes
  if (subfamily.includes('shoes') || subfamily.includes('sneakers') || 
      subfamily.includes('boots') || subfamily.includes('sandals') || 
      subfamily.includes('heels') || subfamily.includes('flats') ||
      name.includes('shoes') || name.includes('sneakers') || name.includes('boots')) {
    console.log(`✅ [usePersonalizedLooks] Classified as SHOES: ${item.id}`);
    return 'shoes';
  }
  
  // Default to top for everything else
  console.log(`✅ [usePersonalizedLooks] Classified as TOP: ${item.id}`);
  return 'top';
};

// Helper function to create a complete outfit from database items - returns DashboardItem[]
const createCompleteOutfitFromItems = (items: any[], occasion: string): DashboardItem[] => {
  console.log(`🔍 [usePersonalizedLooks] Creating complete outfit for ${occasion} from ${items.length} items`);
  
  if (!items || items.length === 0) {
    console.log(`❌ [usePersonalizedLooks] No items provided for ${occasion}`);
    return [];
  }
  
  // Classify all items
  const classifiedItems = items.map(item => ({
    ...item,
    classifiedType: classifyItemType(item)
  }));
  
  // Group by type
  const topItems = classifiedItems.filter(item => item.classifiedType === 'top');
  const bottomItems = classifiedItems.filter(item => item.classifiedType === 'bottom');
  const shoeItems = classifiedItems.filter(item => item.classifiedType === 'shoes');
  
  console.log(`🔍 [usePersonalizedLooks] ${occasion} - Grouped: TOP=${topItems.length}, BOTTOM=${bottomItems.length}, SHOES=${shoeItems.length}`);
  
  // Create exactly 3 items - always in this order: TOP, BOTTOM, SHOES
  const outfit: DashboardItem[] = [];
  
  // 1. TOP item (position 0)
  if (topItems.length > 0) {
    const topItem = topItems[Math.floor(Math.random() * topItems.length)];
    outfit.push({
      id: topItem.id,
      name: topItem.product_name || topItem.name || 'חלק עליון',
      description: topItem.description,
      image: topItem.image,
      type: 'top',
      price: topItem.price
    });
    console.log(`✅ [usePersonalizedLooks] ${occasion} - Added TOP: ${topItem.id}`);
  } else {
    outfit.push({
      id: `placeholder-top-${occasion}`,
      name: 'חלק עליון',
      description: 'Placeholder top item',
      image: '/placeholder.svg',
      type: 'top'
    });
    console.log(`📦 [usePersonalizedLooks] ${occasion} - Added placeholder TOP`);
  }
  
  // 2. BOTTOM item (position 1)
  if (bottomItems.length > 0) {
    const bottomItem = bottomItems[Math.floor(Math.random() * bottomItems.length)];
    outfit.push({
      id: bottomItem.id,
      name: bottomItem.product_name || bottomItem.name || 'חלק תחתון',
      description: bottomItem.description,
      image: bottomItem.image,
      type: 'bottom',
      price: bottomItem.price
    });
    console.log(`✅ [usePersonalizedLooks] ${occasion} - Added BOTTOM: ${bottomItem.id}`);
  } else {
    outfit.push({
      id: `placeholder-bottom-${occasion}`,
      name: 'חלק תחתון',
      description: 'Placeholder bottom item',
      image: '/placeholder.svg',
      type: 'bottom'
    });
    console.log(`📦 [usePersonalizedLooks] ${occasion} - Added placeholder BOTTOM`);
  }
  
  // 3. SHOES item (position 2)
  if (shoeItems.length > 0) {
    const shoeItem = shoeItems[Math.floor(Math.random() * shoeItems.length)];
    outfit.push({
      id: shoeItem.id,
      name: shoeItem.product_name || shoeItem.name || 'נעליים',
      description: shoeItem.description,
      image: shoeItem.image,
      type: 'shoes',
      price: shoeItem.price
    });
    console.log(`✅ [usePersonalizedLooks] ${occasion} - Added SHOES: ${shoeItem.id}`);
  } else {
    outfit.push({
      id: `placeholder-shoes-${occasion}`,
      name: 'נעליים',
      description: 'Placeholder shoes item',
      image: '/placeholder.svg',
      type: 'shoes'
    });
    console.log(`📦 [usePersonalizedLooks] ${occasion} - Added placeholder SHOES`);
  }
  
  console.log(`✅ [usePersonalizedLooks] ${occasion} - Complete outfit created with ${outfit.length} items:`, outfit.map((item, i) => `${i + 1}. ${item.type} (${item.id})`));
  
  return outfit;
};

export function usePersonalizedLooks() {
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [userStyle, setUserStyle] = useState<any>(null);
  const [combinations, setCombinations] = useState<{ [key: string]: number }>({});
  const [forceRefresh, setForceRefresh] = useState(false);
  const [apiErrorShown, setApiErrorShown] = useState(false);
  const occasions = ['Work', 'Casual', 'Evening', 'Weekend'];

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

  // Memoized query function - fetch from database and create complete outfits
  const queryFn = useCallback(async () => {
    try {
      console.log('🔍 [usePersonalizedLooks] Starting fetch for dashboard items...');
      
      // Clear global tracking when forced refresh
      if (forceRefresh) {
        clearOutfitCache();
      }
      
      const data = await fetchDashboardItems();
      console.log('🔍 [usePersonalizedLooks] Raw data received:', data);
      
      // Transform the data to ensure each occasion has a complete outfit
      const transformedData: { [key: string]: DashboardItem[] } = {};
      
      occasions.forEach(occasion => {
        const occasionItems = data[occasion] || [];
        console.log(`🔍 [usePersonalizedLooks] Processing ${occasion} with ${occasionItems.length} items`);
        
        // Create a complete outfit for this occasion
        const completeOutfit = createCompleteOutfitFromItems(occasionItems, occasion);
        transformedData[occasion] = completeOutfit;
        
        console.log(`✅ [usePersonalizedLooks] ${occasion} final outfit:`, completeOutfit.map(item => `${item.type} (${item.id})`));
      });
      
      console.log('✅ [usePersonalizedLooks] All occasions processed:', transformedData);
      return transformedData;
      
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
    queryKey: ['dashboardItems', selectedMood, forceRefresh],
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
    
    console.log(`✅ [usePersonalizedLooks] Created look for ${occasion}:`, look);
    return look;
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

  // Always return database data only
  const getOutfitData = useCallback(() => {
    const data = occasionOutfits || { Work: [], Casual: [], Evening: [], Weekend: [] };
    console.log('🔍 [usePersonalizedLooks] Returning outfit data:', data);
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
