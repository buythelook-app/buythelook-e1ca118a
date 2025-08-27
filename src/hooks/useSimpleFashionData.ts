import { useState, useEffect } from "react";
import { getFashionItemsByCategory } from "@/lib/serpApi";

interface ApiItem {
  id: string;
  title: string;
  imageUrl: string;
  estimatedPrice: string;
  category?: string;
}

export function useSimpleFashionData() {
  const [items, setItems] = useState<ApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔍 [useSimpleFashionData] Fetching top items...');
        
        // Start with just one category to test
        const response = await getFashionItemsByCategory('top', 'classic', 'women', {
          eventType: 'work',
          budget: 'medium',
          num: 20
        });
        
        console.log('📦 [useSimpleFashionData] API Response:', response);
        
        if (response.success && response.items) {
          console.log('✅ [useSimpleFashionData] Got items:', response.items.length);
          // Map the API response to our interface
          const mappedItems: ApiItem[] = response.items.map(item => ({
            id: item.id,
            title: item.title,
            imageUrl: item.imageUrl,
            estimatedPrice: item.estimatedPrice || '$29.99',
            category: item.category
          }));
          setItems(mappedItems);
        } else {
          console.warn('⚠️ [useSimpleFashionData] No items received:', response.error);
          setError(response.error || 'No items received');
        }
        
      } catch (err) {
        console.error('❌ [useSimpleFashionData] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const refetch = () => {
    setItems([]);
    setIsLoading(true);
    setError(null);
    // Re-trigger the effect
    window.location.reload();
  };

  return {
    items,
    isLoading,
    error,
    refetch
  };
}