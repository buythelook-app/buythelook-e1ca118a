import { useState } from 'react';
import { useCreditsSystem } from './useCreditsSystem';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useOutfitGenerationWithCredits = () => {
  const { creditsData, deductCredit, addCredits, canGenerateLook } = useCreditsSystem();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { toast } = useToast();

  const handleGenerateLook = async (generateFunction: () => Promise<any>) => {
    // Check if user can generate
    if (!canGenerateLook()) {
      // Variant B: show payment modal
      if (creditsData.variant === 'B') {
        setShowPaymentModal(true);
        
        // Log analytics
        await supabase.from('analytics_events').insert({
          user_id: creditsData.userId,
          event: 'payment_modal_opened',
          properties: {
            remaining_credits: creditsData.credits,
            variant: creditsData.variant,
          },
        });
        return null;
      }
    }

    // Deduct credit
    const success = await deductCredit();
    if (!success && creditsData.variant === 'B') {
      toast({
        title: "No credits remaining",
        description: "Please purchase more credits to continue",
        variant: "destructive",
      });
      setShowPaymentModal(true);
      return null;
    }

    // Generate the look
    const result = await generateFunction();

    // Log analytics
    await supabase.from('analytics_events').insert({
      user_id: creditsData.userId,
      event: 'look_generated',
      properties: {
        remaining_credits: creditsData.credits - 1,
        variant: creditsData.variant,
      },
    });

    return result;
  };

  const handlePaymentSuccess = async (credits: number, amount: number) => {
    await addCredits(credits, amount);
    setShowPaymentModal(false);
  };

  return {
    creditsData,
    canGenerateLook: canGenerateLook(),
    handleGenerateLook,
    showPaymentModal,
    setShowPaymentModal,
    handlePaymentSuccess,
  };
};
