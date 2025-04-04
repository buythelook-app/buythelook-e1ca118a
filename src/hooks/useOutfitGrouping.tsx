
import { useMemo } from "react";
import { DashboardItem } from "@/types/lookTypes";

export const useOutfitGrouping = (dashboardItems: DashboardItem[] | undefined) => {
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

  return { outfits };
};
