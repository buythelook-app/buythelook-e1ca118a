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
        const localKeysToRemove = Object.keys(localStorage).filter(key => 
          key.includes('outfit') || 
          key.includes('look') || 
          key.includes('dashboard') ||
          key.includes('external-catalog') ||
          key.includes('serp-cache')
        );
        localKeysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Clear sessionStorage cache
        const sessionKeysToRemove = Object.keys(sessionStorage).filter(key => 
          key.includes('outfit') || 
          key.includes('look') || 
          key.includes('dashboard')
        );
        sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
        
        // ✅ CRITICAL: Clear React Query cache by setting a force refresh flag
        localStorage.setItem('force-refresh-outfits', Date.now().toString());
      }

      toast.success('Refreshing items database...', {
        description: 'New data will load in a few seconds'
      });
      
      // Force a page reload to refresh all data
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
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