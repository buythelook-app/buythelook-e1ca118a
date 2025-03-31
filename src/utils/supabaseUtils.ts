
import { supabase } from "@/lib/supabase";

export const fetchAllItems = async () => {
  try {
    console.log('Fetching all items from Supabase...');
    const { data, error } = await supabase
      .from('items')
      .select('*');
    
    if (error) {
      console.error('Error fetching items:', error);
      return [];
    }
    
    console.log(`Successfully fetched ${data.length} items:`, data);
    return data;
  } catch (e) {
    console.error('Exception in fetchAllItems:', e);
    return [];
  }
};

export const logDatabaseItems = async () => {
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
};
