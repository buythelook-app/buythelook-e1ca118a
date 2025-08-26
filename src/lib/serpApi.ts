// SerpAPI Integration for Fashion Styling App
// Adapted for TypeScript and Supabase Edge Functions

import { supabase } from '@/lib/supabase';

export interface FashionItem {
  id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  source: string;
  link: string;
  width?: number;
  height?: number;
  estimatedPrice?: string | null;
  category: string;
}

export interface FashionSearchResult {
  success: boolean;
  items: FashionItem[];
  query?: string;
  totalResults?: number;
  error?: string;
}

export interface SearchParams {
  eventType: string;
  style: string;
  budget: string;
  gender?: 'women' | 'men';
}

// Main function to get fashion items based on event and preferences
export async function getFashionItems(
  eventType: string, 
  style: string, 
  budget: string, 
  gender: 'women' | 'men' = 'women'
): Promise<FashionSearchResult> {
  try {
    console.log('🔍 [SERP API] Starting request to fashion-items edge function:', { eventType, style, budget, gender });
    
    const startTime = performance.now();
    const { data, error } = await supabase.functions.invoke('fashion-items', {
      body: { eventType, style, budget, gender }
    });
    const endTime = performance.now();
    
    console.log(`⏱️ [SERP API] Request completed in ${(endTime - startTime).toFixed(2)}ms`);

    if (error) {
      console.error('❌ [SERP API] Edge function error:', error);
      console.error('❌ [SERP API] Error details:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message, items: [] };
    }

    if (!data) {
      console.error('❌ [SERP API] No data received from edge function');
      return { success: false, error: 'No data received from server', items: [] };
    }

    console.log('📊 [SERP API] Raw response received:', {
      success: data.success,
      itemsCount: data.items?.length || 0,
      query: data.query,
      totalResults: data.totalResults,
      categoriesFound: data.categoriesFound
    });

    if (!data?.success) {
      console.error('❌ [SERP API] Server returned error:', data?.error);
      return { success: false, error: data?.error || 'Unknown server error', items: [] };
    }

    // Log detailed item breakdown
    if (data.items && data.items.length > 0) {
      const itemsByCategory = data.items.reduce((acc: any, item: any) => {
        const category = item.category || 'unknown';
        if (!acc[category]) acc[category] = 0;
        acc[category]++;
        return acc;
      }, {});
      
      console.log('📋 [SERP API] Items breakdown by category:', itemsByCategory);
      console.log('📋 [SERP API] Sample items:', data.items.slice(0, 3).map((item: any) => ({
        id: item.id,
        title: item.title?.substring(0, 50) + '...',
        category: item.category,
        price: item.estimatedPrice,
        hasImage: !!item.imageUrl
      })));
    } else {
      console.warn('⚠️ [SERP API] No items in successful response');
    }

    return data as FashionSearchResult;
  } catch (error: any) {
    console.error('❌ [SERP API] Unexpected error in getFashionItems:', error);
    console.error('❌ [SERP API] Error stack:', error.stack);
    return { success: false, error: error.message || 'Network or unexpected error occurred', items: [] };
  }
}

// Build search query based on user preferences
function buildSearchQuery(eventType: string, style: string, budget: string, gender: string): string {
  const eventQueries: Record<string, string> = {
    'wedding': 'elegant formal dress wedding guest outfit',
    'business': 'professional business attire office wear',
    'casual': 'casual everyday comfortable outfit',
    'party': 'party dress evening wear stylish',
    'date': 'date night outfit romantic style',
    'interview': 'job interview professional attire',
    'formal': 'formal evening wear elegant dress',
    'sport': 'activewear sportswear athletic outfit'
  };

  const styleQueries: Record<string, string> = {
    'classic': 'classic timeless elegant',
    'trendy': 'trendy modern fashionable',
    'bohemian': 'bohemian boho chic',
    'minimalist': 'minimalist simple clean',
    'romantic': 'romantic feminine delicate',
    'edgy': 'edgy modern bold'
  };

  const budgetQueries: Record<string, string> = {
    'low': 'affordable budget friendly',
    'medium': 'mid range quality',
    'high': 'luxury designer premium'
  };

  let query = `${gender} fashion `;
  query += eventQueries[eventType.toLowerCase()] || eventType;
  query += ` ${styleQueries[style.toLowerCase()] || style}`;
  query += ` ${budgetQueries[budget.toLowerCase()] || ''}`;
  
  return query.trim();
}

// Process and clean the fashion results
function processFashionResults(imageResults: any[]): FashionItem[] {
  if (!imageResults || !Array.isArray(imageResults)) return [];
  
  return imageResults
    .filter(item => {
      // Filter out unwanted results
      const title = item.title?.toLowerCase() || '';
      const source = item.source?.toLowerCase() || '';
      
      // Skip results from certain sources or with certain keywords
      const skipKeywords = ['pinterest', 'tumblr', 'instagram', 'facebook'];
      const hasSkipKeywords = skipKeywords.some(keyword => 
        source.includes(keyword) || title.includes(keyword)
      );
      
      return !hasSkipKeywords && item.original && item.thumbnail;
    })
    .map((item, index) => ({
      id: item.position?.toString() || `fashion-${index}-${Math.random().toString(36).substr(2, 9)}`,
      title: item.title || 'Fashion Item',
      imageUrl: item.original,
      thumbnailUrl: item.thumbnail,
      source: item.source || 'Unknown',
      link: item.link || '#',
      width: item.original_width,
      height: item.original_height,
      estimatedPrice: extractPriceFromTitle(item.title),
      category: categorizeFashionItem(item.title)
    }))
    .slice(0, 12); // הגבל ל-12 פריטים
}

// Try to extract price information from title
function extractPriceFromTitle(title?: string): string | null {
  if (!title) return null;
  
  const priceRegex = /[\$€£₪]\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
  const match = title.match(priceRegex);
  
  if (match) {
    return match[0];
  }
  
  return null;
}

// Categorize fashion items based on title
function categorizeFashionItem(title?: string): string {
  if (!title) return 'other';
  
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('dress')) return 'dress';
  if (titleLower.includes('shirt') || titleLower.includes('blouse')) return 'top';
  if (titleLower.includes('pants') || titleLower.includes('jeans') || titleLower.includes('trousers')) return 'bottom';
  if (titleLower.includes('shoes') || titleLower.includes('heels') || titleLower.includes('boots')) return 'shoes';
  if (titleLower.includes('bag') || titleLower.includes('purse') || titleLower.includes('handbag')) return 'accessory';
  if (titleLower.includes('jacket') || titleLower.includes('coat') || titleLower.includes('blazer')) return 'outerwear';
  
  return 'other';
}

// Utility function to get fashion items by category
export async function getFashionItemsByCategory(
  category: string, 
  style: string, 
  gender: 'women' | 'men' = 'women',
  options?: { eventType?: string; budget?: string; num?: number }
): Promise<FashionSearchResult> {
  const { eventType, budget, num = 24 } = options || {};
  const query = [gender, eventType, category, style, 'fashion', budget]
    .filter(Boolean)
    .join(' ');
  
  try {
    console.log('🔍 [SERP API] Category request →', { category, style, gender, eventType, budget, num, query });
    const { data, error } = await supabase.functions.invoke('serp-search', {
      body: {
        query,
        engine: 'google',
        num
      }
    });

    if (error) {
      console.error('❌ [SERP API] Category fetch error:', error);
      return {
        success: false,
        error: error.message,
        items: []
      };
    }

    const fashionItems = processFashionResults(data?.images_results || []);
    console.log('📦 [SERP API] Category items received:', { category, count: fashionItems.length });
    
    return {
      success: true,
      items: fashionItems,
      query,
      totalResults: fashionItems.length
    };
    
  } catch (error: any) {
    console.error('❌ [SERP API] Unexpected error in getFashionItemsByCategory:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      items: []
    };
  }
}