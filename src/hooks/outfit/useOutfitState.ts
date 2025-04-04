
import { useState, useEffect } from "react";
import { OutfitColors } from "@/services/utils/outfitStorageUtils";
import { DashboardItem } from "@/types/lookTypes";

export const useOutfitState = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [outfitColors, setOutfitColors] = useState<OutfitColors | null>(null);
  const [selectedItems, setSelectedItems] = useState<DashboardItem[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string | undefined>(undefined);

  // Load selected look items from localStorage
  useEffect(() => {
    const storedColors = localStorage.getItem('outfit-colors');
    
    if (storedColors) {
      try {
        const parsedColors = JSON.parse(storedColors) as OutfitColors;
        setOutfitColors(parsedColors);
      } catch (e) {
        console.error('Error parsing outfit colors:', e);
      }
    }

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

  return {
    isRefreshing,
    setIsRefreshing,
    outfitColors,
    setOutfitColors,
    selectedItems,
    selectedOccasion,
  };
};
