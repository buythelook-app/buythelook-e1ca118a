import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (credits: number, amount: number) => void;
}

const CREDIT_PACKAGES = [
  {
    credits: 1,
    price: 3.90,
    label: 'Buy 1 Look',
    description: 'Perfect for a quick style refresh',
    icon: Sparkles,
  },
  {
    credits: 5,
    price: 14.90,
    label: 'Buy 5 Looks',
    savings: 'save 25%',
    popular: true,
    description: 'Most popular choice',
    icon: Zap,
  },
  {
    credits: 15,
    price: 34.90,
    label: 'Buy 15 Looks',
    savings: 'save 40%',
    description: 'Best value for fashion enthusiasts',
    icon: Sparkles,
  },
];

export const PaymentModal = ({ isOpen, onClose, onSuccess }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async (credits: number, price: number) => {
    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Log payment modal opened
      await supabase.from('analytics_events').insert({
        user_id: user.id,
        event: 'payment_modal_opened',
        properties: {
          credits,
          price,
        },
      });

      // TODO: Integrate with Stripe payment
      // For now, simulate payment success
      await new Promise(resolve => setTimeout(resolve, 1000));

      await onSuccess(credits, price);
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            You've used your 3 free looks 💫
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Continue creating personalized looks for a small fee per run
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          {CREDIT_PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <div
                key={pkg.credits}
                className={`relative p-4 border-2 rounded-lg transition-all ${
                  pkg.popular
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {pkg.label}
                        {pkg.savings && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-normal">
                            ({pkg.savings})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {pkg.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold">₪{pkg.price}</div>
                      <div className="text-xs text-muted-foreground">
                        ₪{(pkg.price / pkg.credits).toFixed(2)}/look
                      </div>
                    </div>
                    <Button
                      onClick={() => handlePurchase(pkg.credits, pkg.price)}
                      disabled={isProcessing}
                      variant={pkg.popular ? 'default' : 'outline'}
                      size="sm"
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          Secure payment processing • Cancel anytime
        </div>
      </DialogContent>
    </Dialog>
  );
};
