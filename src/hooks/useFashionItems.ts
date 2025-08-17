import { useState } from 'react';
import { getFashionItems, FashionItem, FashionSearchResult } from '@/lib/serpApi';

export function useFashionItems() {
  const [items, setItems] = useState<FashionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFashionItems = async (
    eventType: string, 
    style: string, 
    budget: string, 
    gender: 'women' | 'men' = 'women'
  ): Promise<FashionSearchResult> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching fashion items:', { eventType, style, budget, gender });
      const result = await getFashionItems(eventType, style, budget, gender);
      
      if (result.success) {
        setItems(result.items);
        console.log('✅ Fashion items loaded:', result.items.length);
      } else {
        setError(result.error || 'Unknown error');
        setItems([]);
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch fashion items';
      setError(errorMessage);
      setItems([]);
      console.error('❌ useFashionItems error:', err);
      return { success: false, error: errorMessage, items: [] };
    } finally {
      setLoading(false);
    }
  };

  const clearItems = () => {
    setItems([]);
    setError(null);
  };

  return {
    items,
    loading,
    error,
    fetchFashionItems,
    clearItems
  };
}