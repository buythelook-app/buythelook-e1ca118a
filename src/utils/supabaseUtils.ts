
import { supabase } from "@/lib/supabase";

// Cache for database items to prevent repeated fetches
const itemsCache = new Map();

export const fetchAllItems = async () => {
  try {
    // Check cache first
    if (itemsCache.has('all-items')) {
      console.log('Using cached items instead of fetching again');
      return itemsCache.get('all-items');
    }
    
    console.log('Fetching all items from Supabase...');
    const { data, error } = await supabase
      .from('items')
      .select('*');
    
    if (error) {
      console.error('Error fetching items:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('No items found in the database. Using empty array.');
      itemsCache.set('all-items', []);
      return [];
    }
    
    console.log(`Successfully fetched ${data.length} items:`, data);
    
    // Cache the results
    itemsCache.set('all-items', data);
    
    return data;
  } catch (e) {
    console.error('Exception in fetchAllItems:', e);
    return [];
  }
};

export const logDatabaseItems = async () => {
  // Check if we have already logged items in this session
  if (itemsCache.has('logged-items')) {
    console.log('Items have already been logged this session');
    return;
  }
  
  const items = await fetchAllItems();
  
  if (items.length === 0) {
    console.log('No items found in the database. You may need to add some items first.');
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
  
  // Mark that we've logged items
  itemsCache.set('logged-items', true);
};
