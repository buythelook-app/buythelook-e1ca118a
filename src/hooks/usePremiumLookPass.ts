import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PremiumLookPassData {
  userId: string;
  hasPremiumLook: boolean;
  isLoading: boolean;
}

export const usePremiumLookPass = () => {
  const [passData, setPassData] = useState<PremiumLookPassData>({
    userId: '',
    hasPremiumLook: false,
    isLoading: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPassData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Check if user has purchased premium look pass
      const sessionFlag = sessionStorage.getItem(`premium_look_${user.id}`);
      
      setPassData({
        userId: user.id,
        hasPremiumLook: sessionFlag === 'true',
        isLoading: false,
      });
    } catch (error) {
      console.error('Error checking premium status:', error);
      setPassData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const purchasePremiumLook = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // For now, simulate payment success
      // In production, integrate with actual Stripe payment
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Log payment event
      await supabase.from('analytics_events').insert({
        user_id: user.id,
        event: 'look_pass_purchase',
        properties: {
          amount: 15,
          currency: 'ILS',
          timestamp: new Date().toISOString(),
        },
      });

      // Set session flag
      sessionStorage.setItem(`premium_look_${user.id}`, 'true');
      setPassData(prev => ({ ...prev, hasPremiumLook: true }));

      toast({
        title: "Upgrade Complete! 🎉",
        description: "Generating your premium look now...",
      });

      return true;
    } catch (error) {
      console.error('Error purchasing premium look:', error);
      toast({
        title: "Payment Failed",
        description: "Please try again",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    passData,
    purchasePremiumLook,
    refreshStatus: checkPremiumStatus,
  };
};
