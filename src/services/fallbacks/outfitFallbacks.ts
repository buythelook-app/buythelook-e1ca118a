
/**
 * Fallback data for outfit suggestions when API doesn't return results
 */

import { DashboardItem } from "@/types/lookTypes";

// Fallback items for when API doesn't return anything useful
export const FALLBACK_ITEMS: Record<string, DashboardItem> = {
  top: {
    id: "fallback-top-1",
    name: "Classic White Shirt",
    description: "A timeless white shirt that pairs with everything",
    image: "/placeholder.svg",
    price: "$45.99",
    type: "top"
  },
  bottom: {
    id: "fallback-bottom-1",
    name: "Black Slim Pants",
    description: "Essential black pants for any style",
    image: "/placeholder.svg",
    price: "$55.99",
    type: "bottom"
  },
  shoes: {
    id: "fallback-shoes-1",
    name: "Classic Loafers",
    description: "Versatile loafers to complete your look",
    image: "/placeholder.svg",
    price: "$75.99",
    type: "shoes"
  }
};

export const getFallbackItems = (): DashboardItem[] => {
  return [FALLBACK_ITEMS.top, FALLBACK_ITEMS.bottom, FALLBACK_ITEMS.shoes];
};
