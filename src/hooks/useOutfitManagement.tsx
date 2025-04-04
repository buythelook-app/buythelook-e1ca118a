
import { useState } from "react";
import { DashboardItem } from "@/types/lookTypes";
import { useOutfitGrouping } from "./useOutfitGrouping";
import { useSelectedOutfit } from "./useSelectedOutfit";
import { useCartManagement } from "./useCartManagement";

export const useOutfitManagement = (dashboardItems: DashboardItem[] | undefined) => {
  const { outfits: groupedOutfits } = useOutfitGrouping(dashboardItems);
  const { selectedItems, selectedOccasion } = useSelectedOutfit();
  const { handleAddToCart } = useCartManagement();
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Use selected items from localStorage if available, otherwise use dashboard items
  const currentOutfits = selectedItems.length > 0 ? [selectedItems] : groupedOutfits;

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
