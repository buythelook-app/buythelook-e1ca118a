import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserSizes {
  top: string;
  bottom: string;
  shoes: string;
}

export function useUserSizes() {
  const [sizes, setSizes] = useState<UserSizes>({
    top: '',
    bottom: '',
    shoes: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserSizes = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Load from user_profiles
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('size_preferences')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile?.size_preferences) {
          const sizePrefs = profile.size_preferences as any;
          setSizes({
            top: sizePrefs.top || '',
            bottom: sizePrefs.bottom || '',
            shoes: sizePrefs.shoes || ''
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading user sizes:', error);
        setIsLoading(false);
      }
    };

    loadUserSizes();

    // Listen for size updates
    const handleSizeUpdate = () => {
      loadUserSizes();
    };

    window.addEventListener('userSizesUpdated', handleSizeUpdate);
    
    return () => {
      window.removeEventListener('userSizesUpdated', handleSizeUpdate);
    };
  }, []);

  return { sizes, isLoading };
}
