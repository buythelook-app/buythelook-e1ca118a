
/**
 * Service for caching API responses and dashboard items
 */

// Cache for API responses to avoid redundant calls
const responseCache = new Map();

/**
 * Get an item from the response cache
 */
export const getCachedResponse = (cacheKey: string) => {
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }
  return null;
};

/**
 * Store an item in the response cache
 */
export const setCachedResponse = (cacheKey: string, data: any) => {
  responseCache.set(cacheKey, data);
  
  // Limit cache size
  if (responseCache.size > 10) {
    const oldestKey = responseCache.keys().next().value;
    responseCache.delete(oldestKey);
  }
};

/**
 * Clear the entire response cache
 */
export const clearCache = () => {
  responseCache.clear();
};
