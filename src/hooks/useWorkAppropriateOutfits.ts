
import { useMemo } from 'react';
import { filterWorkAppropriateItems } from '@/components/filters/WorkAppropriateFilter';
import { DashboardItem } from '@/types/lookTypes';

export const useWorkAppropriateOutfits = (items: DashboardItem[], selectedMode: string) => {
  const filteredItems = useMemo(() => {
    if (selectedMode === 'Work') {
      return filterWorkAppropriateItems(items);
    }
    return items;
  }, [items, selectedMode]);

  const workAppropriateStyles = useMemo(() => {
    if (selectedMode === 'Work') {
      return {
        top: {
          required: ['blouse', 'shirt', 'sweater', 'blazer'],
          forbidden: ['crop', 'tank', 'tube', 'strapless', 'backless']
        },
        bottom: {
          required: ['trousers', 'midi_skirt', 'long_skirt', 'pencil_skirt'],
          forbidden: ['mini', 'short', 'revealing']
        },
        dress: {
          required: ['formal', 'midi', 'long', 'business'],
          forbidden: ['mini', 'bodycon', 'revealing', 'party']
        },
        shoes: {
          required: ['formal', 'loafers', 'oxford', 'heels'],
          forbidden: ['flip_flops', 'athletic', 'casual_sandals']
        }
      };
    }
    return null;
  }, [selectedMode]);

  return {
    filteredItems,
    workAppropriateStyles,
    isWorkMode: selectedMode === 'Work'
  };
};
