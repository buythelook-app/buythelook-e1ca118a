import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useCreditsSystem } from '@/hooks/useCreditsSystem';

export const RefreshItemsButton: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { deductCredit, canGenerateLook, creditsData } = useCreditsSystem();

  const handleRefresh = async () => {
    // Check if user can generate a new look
    if (!canGenerateLook()) {
      toast.error('אין מספיק קרדיטים', {
        description: 'אנא רכוש קרדיטים נוספים כדי להמשיך'
      });
      return;
    }

    setIsRefreshing(true);
    
    try {
      // Deduct credit first
      const success = await deductCredit();
      
      if (!success) {
        toast.error('שגיאה בהורדת קרדיט', {
          description: 'אנא נסה שוב'
        });
        setIsRefreshing(false);
        return;
      }

      // Show success message with updated credits
      toast.success('מרענן פריטים...', {
        description: `נותרו ${creditsData.credits - 1} קרדיטים`
      });

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
      
    } catch (error) {
      console.error('Error refreshing items:', error);
      toast.error('שגיאה ברענון נתונים');
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing || creditsData.isLoading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh Items'}
    </Button>
  );
};