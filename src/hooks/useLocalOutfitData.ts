
import { LookItem } from "./usePersonalizedLooks";

// Remove all fallback data - we only want database items
export const useLocalOutfitData = () => {
  const fallbackItems: { [key: string]: LookItem[] } = {
    'Work': [],
    'Casual': [],
    'Evening': [],
    'Weekend': []
  };

  return {
    fallbackItems
  };
};
