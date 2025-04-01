
import { supabase } from "@/lib/supabase";
import { checkDatabaseHasItems } from "@/services/fetchers/itemsFetcher";

// Cache for database items to prevent repeated fetches
const itemsCache = new Map();
// Track if we've already done the initial log
let hasInitialLogged = false;
// Track if we're currently fetching
let isFetchingAllItems = false;
// Flag to track if we've already determined that the database is empty
let isDatabaseEmpty = false;

export const fetchAllItems = async () => {
  try {
    // If we already know database is empty, return empty array immediately
    if (isDatabaseEmpty) {
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
    
    // Check if database has any items first (uses the shared cache mechanism)
    const hasItems = await checkDatabaseHasItems();
    
    if (!hasItems) {
      isDatabaseEmpty = true;
      itemsCache.set('all-items', []);
      return [];
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

export const logDatabaseItems = async () => {
  // If we already know database is empty, exit early
  if (isDatabaseEmpty) {
    if (!hasInitialLogged) {
      hasInitialLogged = true;
    }
    return;
  }
  
  // Check if we have already logged items in this session
  if (itemsCache.has('logged-items')) {
    return;
  }
  
  // Early exit if we know database is empty
  const hasItems = await checkDatabaseHasItems();
  if (!hasItems) {
    if (!hasInitialLogged) {
      console.log('No items found in the database. You may need to add some items first.');
      hasInitialLogged = true;
    }
    isDatabaseEmpty = true;
    itemsCache.set('logged-items', true);
    return;
  }
  
  const items = await fetchAllItems();
  
  if (items.length === 0) {
    console.log('No items found in the database. You may need to add some items first.');
    isDatabaseEmpty = true;
  } else {
    console.log('Database items by type:');
    
    const topItems = items.filter(item => item.type === 'top');
    const bottomItems = items.filter(item => item.type === 'bottom');
    const shoesItems = items.filter(item => item.type === 'shoes');
    const otherItems = items.filter(item => !['top', 'bottom', 'shoes'].includes(item.type || ''));
    
    console.log(`Tops (${topItems.length}):`);
    topItems.forEach(item => console.log(`- ${item.name}: ${item.image}`));
    
    console.log(`Bottoms (${bottomItems.length}):`);
    bottomItems.forEach(item => console.log(`- ${item.name}: ${item.image}`));
    
    console.log(`Shoes (${shoesItems.length}):`);
    shoesItems.forEach(item => console.log(`- ${item.name}: ${item.image}`));
    
    if (otherItems.length > 0) {
      console.log(`Other items (${otherItems.length}):`);
      otherItems.forEach(item => console.log(`- ${item.name} (${item.type}): ${item.image}`));
    }
  }
  
  // Mark that we've logged items and done initial logging
  itemsCache.set('logged-items', true);
  hasInitialLogged = true;
};
