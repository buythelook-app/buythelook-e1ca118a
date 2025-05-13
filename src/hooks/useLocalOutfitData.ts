
import { useMemo } from 'react';
import { DashboardItem } from '@/types/lookTypes';

export interface LocalOutfitItem {
  id: string;
  image: string;
  type: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'sunglasses' | 'outerwear' | 'cart';
}

export interface LocalOutfitSet {
  [key: string]: LocalOutfitItem[];
}

export const useLocalOutfitData = () => {
  // Define a robust set of local fallback items for each occasion
  const fallbackItems: LocalOutfitSet = useMemo(() => ({
    Work: [
      { id: 'work-top-1', image: '/lovable-uploads/028933c6-ec95-471c-804c-0aa31a0e1f15.png', type: 'top' },
      { id: 'work-bottom-1', image: '/lovable-uploads/386cf438-be54-406f-9dbb-6495a8f8bde9.png', type: 'bottom' },
      { id: 'work-shoes-1', image: '/lovable-uploads/553ba2e6-53fd-46dd-82eb-64121072a826.png', type: 'shoes' }
    ],
    Casual: [
      { id: 'casual-top-1', image: '/lovable-uploads/97187c5b-b4bd-4ead-a4bf-644148da8924.png', type: 'top' },
      { id: 'casual-bottom-1', image: '/lovable-uploads/6fe5dff3-dfba-447b-986f-7281b45a0703.png', type: 'bottom' },
      { id: 'casual-shoes-1', image: '/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png', type: 'shoes' }
    ],
    Evening: [
      { id: 'evening-top-1', image: '/lovable-uploads/b2b5da4b-c967-4791-8832-747541e275be.png', type: 'top' },
      { id: 'evening-bottom-1', image: '/lovable-uploads/a1785297-040b-496d-a2fa-af4ecb55207a.png', type: 'bottom' },
      { id: 'evening-shoes-1', image: '/lovable-uploads/c7a32d15-ffe2-4f07-ae82-a943d5128293.png', type: 'shoes' }
    ],
    Weekend: [
      { id: 'weekend-top-1', image: '/lovable-uploads/160222f3-86e6-41d7-b5c8-ecfc0b63851b.png', type: 'top' },
      { id: 'weekend-bottom-1', image: '/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png', type: 'bottom' },
      { id: 'weekend-shoes-1', image: '/lovable-uploads/553ba2e6-53fd-46dd-82eb-64121072a826.png', type: 'shoes' }
    ]
  }), []);

  return { fallbackItems };
};
