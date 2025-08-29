import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type CatalogProvider = 'rapidapi-asos';

export interface CatalogItem {
  id: string;
  title: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  source?: string;
  link?: string;
  estimatedPrice?: string | null;
  category?: string;
}

export function useExternalCatalog() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = useCallback(async (opts: {
    provider?: CatalogProvider;
    query?: string;
    gender?: 'women' | 'men';
    category?: string;
    limit?: number;
  } = {}) => {
    console.log('🔧 [useExternalCatalog] Starting catalog fetch with params:', opts);
    setLoading(true);
    setError(null);
    try {
      const requestBody = {
        provider: 'rapidapi-asos',
        query: opts.query ?? 'women shirts',
        gender: opts.gender ?? 'women',
        category: opts.category ?? 'tops',
        limit: opts.limit ?? 12,
      };
      console.log('📡 [useExternalCatalog] Calling catalog-proxy edge function with:', requestBody);
      
      const { data, error } = await supabase.functions.invoke('catalog-proxy', {
        body: requestBody
      });

      console.log('📨 [useExternalCatalog] Edge function response:', { data, error });
      
      if (error) {
        console.error('❌ [useExternalCatalog] Edge function error:', error);
        throw error;
      }
      if (!data?.success) {
        console.error('❌ [useExternalCatalog] API error:', data?.error);
        throw new Error(data?.error || 'Failed to load catalog');
      }

      console.log('✅ [useExternalCatalog] SUCCESS! Got', data.items?.length || 0, 'items from RapidAPI');
      setItems((data.items || []) as CatalogItem[]);
      return { success: true, items: (data.items || []) as CatalogItem[] };
    } catch (e: any) {
      const msg = e?.message || 'Unexpected error';
      setError(msg);
      setItems([]);
      return { success: false, error: msg, items: [] as CatalogItem[] };
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setError(null);
  }, []);

  return { items, loading, error, fetchCatalog, clear };
}
