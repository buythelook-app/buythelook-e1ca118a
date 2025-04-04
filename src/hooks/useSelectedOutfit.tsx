
import { useState, useEffect } from "react";
import { DashboardItem } from "@/types/lookTypes";

export const useSelectedOutfit = () => {
  const [selectedItems, setSelectedItems] = useState<DashboardItem[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string | undefined>(undefined);

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

  return {
    selectedItems,
    selectedOccasion
  };
};
