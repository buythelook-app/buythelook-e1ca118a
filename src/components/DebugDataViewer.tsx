
import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { supabase } from '@/lib/supabase';

// Cache for debug data 
const debugCache = {
  items: null,
  lastFetchTime: 0
};

export const DebugDataViewer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const fetchDebugData = async () => {
    // Only fetch if cache is older than 1 minute or doesn't exist
    const now = Date.now();
    if (debugCache.items && now - debugCache.lastFetchTime < 60000) {
      console.log('[Debug] Using cached debug data');
      setItems(debugCache.items);
      return;
    }
    
    setLoading(true);
    try {
      // Check if we already have items in the state
      if (items.length > 0) {
        console.log('[Debug] Using existing items data');
        setLoading(false);
        return;
      }
      
      // Fetch items from Supabase
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .limit(10);
      
      if (error) {
        console.error('[Debug] Error fetching items:', error);
        setItems([]);
      } else {
        console.log('[Debug] Items fetched:', data);
        setItems(data || []);
        // Update cache
        debugCache.items = data || [];
        debugCache.lastFetchTime = now;
      }
    } catch (e) {
      console.error('[Debug] Exception:', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="fixed bottom-4 right-4 bg-white/80 z-50 text-xs"
        onClick={() => {
          setIsOpen(true);
          fetchDebugData();
        }}
      >
        Debug Data
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Database Items Debug View</DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="py-8 text-center">Loading data...</div>
          ) : (
            <>
              <div className="text-sm mb-2">Found {items.length} items in Supabase:</div>
              
              {items.length === 0 ? (
                <div className="p-4 bg-red-50 text-red-800 rounded-md">
                  No items found in the database. You may need to add some items first.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <div key={item.id} className="border rounded-md p-4">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                      <div className="mt-2 text-xs">
                        <div>ID: {item.id}</div>
                        <div>Type: {item.type}</div>
                        <div>Price: {item.price}</div>
                        <div className="truncate">Image: {item.image}</div>
                      </div>
                      {item.image && (
                        <div className="mt-2 h-24 bg-gray-100 relative">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="h-full w-auto object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML += '<div class="absolute inset-0 flex items-center justify-center text-xs text-red-500">Image failed to load</div>';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => fetchDebugData()}>
                  Refresh Data
                </Button>
                <Button variant="default" size="sm" onClick={() => setIsOpen(false)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
