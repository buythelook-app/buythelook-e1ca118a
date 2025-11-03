import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserCreditsData {
  userId: string;
  credits: number;
  variant: 'A' | 'B' | null;
  isLoading: boolean;
}

export const useCreditsSystem = () => {
  const [creditsData, setCreditsData] = useState<UserCreditsData>({
    userId: '',
    credits: 3,
    variant: null,
    isLoading: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadUserCredits();
  }, []);

  const loadUserCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCreditsData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('user_credits, pricing_variant')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setCreditsData({
        userId: user.id,
        credits: profile?.user_credits ?? 3,
        variant: profile?.pricing_variant as 'A' | 'B' | null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading credits:', error);
      setCreditsData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const deductCredit = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Variant B blocks when credits = 0
      if (creditsData.variant === 'B' && creditsData.credits <= 0) {
        return false;
      }

      const newCredits = Math.max(0, creditsData.credits - 1);

      const { error } = await supabase
        .from('profiles')
        .update({ user_credits: newCredits })
        .eq('id', user.id);

      if (error) throw error;

      setCreditsData(prev => ({ ...prev, credits: newCredits }));

      // Log analytics
      await supabase.from('analytics_events').insert({
        user_id: user.id,
        event: 'credits_used',
        properties: {
          remaining_credits: newCredits,
          variant: creditsData.variant,
        },
      });

      // Show message after 3 runs for variant A
      if (creditsData.variant === 'A' && newCredits === 0) {
        toast({
          title: "You've completed your 3 free looks! 🎉",
          description: "Keep exploring - no limits for now",
          duration: 5000,
        });
      }

      return true;
    } catch (error) {
      console.error('Error deducting credit:', error);
      toast({
        title: "Error",
        description: "Failed to update credits",
        variant: "destructive",
      });
      return false;
    }
  };

  const addCredits = async (amount: number, paymentAmount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const newCredits = creditsData.credits + amount;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ user_credits: newCredits })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Log payment
      const { error: paymentError } = await supabase
        .from('user_payments')
        .insert({
          user_id: user.id,
          variant: creditsData.variant,
          credits_purchased: amount,
          amount: paymentAmount,
          currency: 'ILS',
        });

      if (paymentError) throw paymentError;

      // Log analytics
      await supabase.from('analytics_events').insert({
        user_id: user.id,
        event: 'payment_completed',
        properties: {
          credits_purchased: amount,
          amount: paymentAmount,
          variant: creditsData.variant,
        },
      });

      setCreditsData(prev => ({ ...prev, credits: newCredits }));

      toast({
        title: "Credits Added! 🎉",
        description: `${amount} credits added to your account`,
      });

      return true;
    } catch (error) {
      console.error('Error adding credits:', error);
      toast({
        title: "Error",
        description: "Failed to add credits",
        variant: "destructive",
      });
      return false;
    }
  };

  const canGenerateLook = (): boolean => {
    // Variant A: always allowed (credits are just tracked)
    if (creditsData.variant === 'A') return true;
    
    // Variant B: blocked when credits = 0
    if (creditsData.variant === 'B') return creditsData.credits > 0;
    
    // Default: allow
    return true;
  };

  return {
    creditsData,
    deductCredit,
    addCredits,
    canGenerateLook,
    refreshCredits: loadUserCredits,
  };
};
