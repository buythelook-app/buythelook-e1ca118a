import { supabase } from '@/integrations/supabase/client';

export type RapidApiItem = {
  id: string;
  title: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  source?: string;
  link?: string;
  estimatedPrice?: string | null;
  category?: string;
};

export type RapidApiSearchResult = {
  success: boolean;
  items?: RapidApiItem[];
  error?: string;
  totalResults?: number;
};

export const apiService = {
  async searchProducts(query: string, opts?: { category?: string; gender?: 'women' | 'men'; limit?: number }) {
    const payload = {
      provider: 'rapidapi-asos',
      query,
      gender: opts?.gender ?? 'women',
      category: opts?.category ?? 'tops',
      limit: opts?.limit ?? 12,
    } as const;

    console.group('[apiService] searchProducts -> catalog-proxy');
    console.log('Payload:', payload);

    const { data, error } = await supabase.functions.invoke('catalog-proxy', {
      body: payload,
    });

    console.log('Edge response:', { data, error });
    console.groupEnd();

    if (error) throw error;
    return (data || { success: false, items: [], error: 'No data' }) as RapidApiSearchResult;
  },
};
