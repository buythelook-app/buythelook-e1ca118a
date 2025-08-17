import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface SerpSearchParams {
  query: string;
  engine?: 'google' | 'bing' | 'yahoo' | 'duckduckgo';
  location?: string;
  num?: number;
}

interface SerpSearchResult {
  organic_results?: Array<{
    title: string;
    link: string;
    snippet: string;
    position: number;
  }>;
  news_results?: Array<{
    title: string;
    link: string;
    snippet: string;
    date: string;
    source: string;
  }>;
  images_results?: Array<{
    title: string;
    link: string;
    thumbnail: string;
    original: string;
  }>;
  related_searches?: Array<{
    query: string;
  }>;
  search_metadata?: {
    status: string;
    total_time_taken: number;
  };
}

export const useSerpSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SerpSearchResult | null>(null);

  const search = async (params: SerpSearchParams) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('🔍 Starting SerpAPI search:', params);
      
      const { data, error: functionError } = await supabase.functions.invoke('serp-search', {
        body: params
      });

      if (functionError) {
        console.error('❌ SerpAPI function error:', functionError);
        throw new Error(functionError.message || 'Search failed');
      }

      if (data?.error) {
        console.error('❌ SerpAPI response error:', data.error);
        throw new Error(data.error);
      }

      console.log('✅ SerpAPI search successful:', data);
      setResults(data);
      return data;

    } catch (err: any) {
      console.error('❌ SerpAPI search error:', err);
      const errorMessage = err.message || 'An error occurred during search';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  return {
    search,
    loading,
    error,
    results,
    clearResults
  };
};