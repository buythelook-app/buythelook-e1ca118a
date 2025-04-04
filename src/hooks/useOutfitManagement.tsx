
import { useState, useEffect, useMemo } from "react";
import { DashboardItem } from "@/types/lookTypes";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const useOutfitManagement = (dashboardItems: DashboardItem[] | undefined) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<DashboardItem[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string | undefined>(undefined);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Group items into outfits based on similar occasions or types
  const outfits = useMemo(() => {
    if (!dashboardItems || dashboardItems.length === 0) {
      return [];
    }

    // Group items by occasion or some other identifier
    const groupedOutfits: DashboardItem[][] = [];
    let currentOutfit: DashboardItem[] = [];

    // Group items by shared properties like occasion or event
    dashboardItems.forEach((item, index) => {
      if (index === 0) {
        currentOutfit.push(item);
      } else {
        const prevItem = dashboardItems[index - 1];
        // Check if item shares the same occasion or event as previous item
        const sameOccasion = 
          (item.occasion && prevItem.occasion && item.occasion === prevItem.occasion) ||
          (item.event && prevItem.event && item.event === prevItem.event) ||
          (item.metadata?.occasion && prevItem.metadata?.occasion && 
           item.metadata.occasion === prevItem.metadata.occasion);
        
        if (sameOccasion) {
          currentOutfit.push(item);
        } else {
          if (currentOutfit.length > 0) {
            groupedOutfits.push([...currentOutfit]);
          }
          currentOutfit = [item];
        }
      }
    });

    // Add the last outfit if not empty
    if (currentOutfit.length > 0) {
      groupedOutfits.push(currentOutfit);
    }

    return groupedOutfits;
  }, [dashboardItems]);

  // Load selected look items from localStorage
  useEffect(() => {
    const storedItems = localStorage.getItem('selected-look-items');
    const storedOccasion = localStorage.getItem('selected-look-occasion');
    
    if (storedItems) {
      try {
        setSelectedItems(JSON.parse(storedItems));
      } catch (e) {
        console.error('Error parsing selected items:', e);
      }
    }
    
    if (storedOccasion) {
      setSelectedOccasion(storedOccasion);
    }
    
    // Clear after using to prevent stale data on refreshes
    return () => {
      localStorage.removeItem('selected-look-items');
      localStorage.removeItem('selected-look-occasion');
    };
  }, []);

  // Handle adding items to cart
  const handleAddToCart = (items: Array<any> | any) => {
    const itemsToAdd = Array.isArray(items) ? items : [items];
    const cartItems = itemsToAdd.map(item => ({
      id: item.id,
      title: item.name,
      price: item.price,
      image: item.image
    }));
    
    toast({
      title: "Success",
      description: Array.isArray(items) ? "All items added to cart" : "Item added to cart",
    });
    navigate('/cart');
    
    // Return the cart items to be used by the cart store
    return cartItems;
  };

  // Use selected items from localStorage if available, otherwise use dashboard items
  const currentOutfits = selectedItems.length > 0 ? [selectedItems] : outfits;

  // Get the current outfit based on active index
  const currentOutfit = currentOutfits[activeIndex] || [];

  // Get the occasion from the items, if available
  const currentOccasion = selectedOccasion || 
                         currentOutfit?.[0]?.occasion || 
                         (currentOutfit?.[0]?.metadata && currentOutfit[0].metadata.occasion) || 
                         currentOutfit?.[0]?.event || 
                         undefined;

  return {
    selectedItems,
    outfits: currentOutfits,
    currentOutfit,
    currentOccasion,
    activeIndex,
    setActiveIndex,
    handleAddToCart
  };
};
