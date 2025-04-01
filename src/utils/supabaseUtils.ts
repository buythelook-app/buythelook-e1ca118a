
import { supabase } from "@/lib/supabase";
import { checkDatabaseHasItems } from "@/services/fetchers/itemsFetcher";

// Cache for database items to prevent repeated fetches
const itemsCache = new Map();
// Track if we're currently fetching
let isFetchingAllItems = false;
// Flag to track if we've already determined that the database is empty
let isDatabaseEmpty = false;

export const fetchAllItems = async (forceCheck = false) => {
  try {
    // If we already know database is empty and not forcing a check, return empty array immediately
    if (isDatabaseEmpty && !forceCheck) {
      return [];
    }
    
    // If we're already fetching, return cached or empty array
    if (isFetchingAllItems) {
      return itemsCache.get('all-items') || [];
    }
    
    // Check cache first
    if (itemsCache.has('all-items')) {
      return itemsCache.get('all-items');
    }
    
    // Only check database if force check is enabled
    if (forceCheck) {
      const hasItems = await checkDatabaseHasItems(true);
      
      if (!hasItems) {
        isDatabaseEmpty = true;
        itemsCache.set('all-items', []);
        return [];
      }
    }
    
    // Set fetching flag
    isFetchingAllItems = true;
    
    const { data, error } = await supabase
      .from('items')
      .select('*');
    
    // Reset fetching flag
    isFetchingAllItems = false;
    
    if (error) {
      console.error('Error fetching items:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      isDatabaseEmpty = true;
      itemsCache.set('all-items', []);
      return [];
    }
    
    // Cache the results
    itemsCache.set('all-items', data);
    
    return data;
  } catch (e) {
    console.error('Exception in fetchAllItems:', e);
    isFetchingAllItems = false;
    return [];
  }
};

export const logDatabaseItems = async (forceCheck = false) => {
  // Skip logging if we're not forcing a check
  if (!forceCheck) {
    return;
  }
  
  // Check if we have already logged items in this session
  if (itemsCache.has('logged-items')) {
    return;
  }
  
  // Only check database if force check is enabled
  if (forceCheck) {
    const hasItems = await checkDatabaseHasItems(true);
    if (!hasItems) {
      isDatabaseEmpty = true;
      itemsCache.set('logged-items', true);
      return;
    }
  }
  
  const items = await fetchAllItems(forceCheck);
  
  if (items.length === 0) {
    isDatabaseEmpty = true;
  } else {
    const topItems = items.filter(item => item.type === 'top');
    const bottomItems = items.filter(item => item.type === 'bottom');
    const shoesItems = items.filter(item => item.type === 'shoes');
    const otherItems = items.filter(item => !['top', 'bottom', 'shoes'].includes(item.type || ''));
    
    // Cache the breakdown for future reference without logging
    itemsCache.set('items-by-type', {
      tops: topItems,
      bottoms: bottomItems,
      shoes: shoesItems,
      others: otherItems
    });
  }
  
  // Mark that we've logged items
  itemsCache.set('logged-items', true);
};
