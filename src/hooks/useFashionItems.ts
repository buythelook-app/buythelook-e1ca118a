import { useState } from 'react';
import { getFashionItems, FashionItem, FashionSearchResult } from '@/lib/serpApi';
import { useExternalCatalog, CatalogItem } from './useExternalCatalog';

export function useFashionItems() {
  const [items, setItems] = useState<FashionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchCatalog } = useExternalCatalog();

  const fetchFashionItems = async (
    eventType: string, 
    style: string, 
    budget: string, 
    gender: 'women' | 'men' = 'women'
  ): Promise<FashionSearchResult> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching fashion items from RapidAPI:', { eventType, style, budget, gender });
      
      // Use RapidAPI as primary data source
      const query = `${gender} ${eventType} ${style}`.trim();
      const catalogResult = await fetchCatalog({
        query,
        gender,
        category: eventType === 'casual' ? 'tops' : 'dresses',
        limit: 12
      });
      
      if (catalogResult.success && catalogResult.items) {
        // Convert CatalogItem to FashionItem format
        const fashionItems: FashionItem[] = catalogResult.items.map((item: CatalogItem) => ({
          id: item.id,
          title: item.title,
          imageUrl: item.imageUrl || item.thumbnailUrl || '/placeholder.svg',
          thumbnailUrl: item.thumbnailUrl || item.imageUrl || '/placeholder.svg',
          link: item.link || '#',
          source: item.source || 'ASOS',
          estimatedPrice: item.estimatedPrice || 'N/A',
          category: item.category || 'clothing'
        }));
        
        setItems(fashionItems);
        console.log('✅ Fashion items loaded from RapidAPI:', fashionItems.length);
        return { success: true, items: fashionItems };
      } else {
        // Fallback to original SERP API if RapidAPI fails
        console.log('⚠️ RapidAPI failed, falling back to SERP API');
        const result = await getFashionItems(eventType, style, budget, gender);
        
        if (result.success) {
          setItems(result.items);
          console.log('✅ Fashion items loaded from SERP API:', result.items.length);
        } else {
          setError(result.error || 'Unknown error');
          setItems([]);
        }
        
        return result;
      }
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