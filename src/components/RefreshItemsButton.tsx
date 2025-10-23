import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const RefreshItemsButton: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Clear any cached data
      if (typeof window !== 'undefined') {
        // Clear localStorage cache related to items
        const keysToRemove = Object.keys(localStorage).filter(key => 
          key.includes('outfit') || 
          key.includes('items') || 
          key.includes('cache') ||
          key.includes('dashboard')
        );
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Clear sessionStorage cache as well
        const sessionKeysToRemove = Object.keys(sessionStorage).filter(key => 
          key.includes('outfit') || 
          key.includes('items') || 
          key.includes('cache')
        );
        sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
      }

      // Force a page reload to refresh all data
      setTimeout(() => {
        window.location.reload();
      }, 500);

      toast.success('Refreshing items database...', {
        description: 'New data will load in a few seconds'
      });
      
    } catch (error) {
      console.error('Error refreshing items:', error);
      toast.error('Error refreshing data');
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh Items'}
    </Button>
  );
};