import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type CatalogProvider = 'mock' | 'rapidapi-asos' | 'shopify';

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
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('catalog-proxy', {
        body: {
          provider: opts.provider ?? 'mock',
          query: opts.query ?? 'women shirts',
          gender: opts.gender ?? 'women',
          category: opts.category ?? 'tops',
          limit: opts.limit ?? 12,
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to load catalog');

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
