import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";
import { PremiumLookModal } from "@/components/payments/PremiumLookModal";
import { usePremiumLookPass } from "@/hooks/usePremiumLookPass";

interface PremiumLookUpgradeProps {
  onUpgradeComplete: () => void;
}

export function PremiumLookUpgrade({ onUpgradeComplete }: PremiumLookUpgradeProps) {
  const [showModal, setShowModal] = useState(false);
  const { purchasePremiumLook } = usePremiumLookPass();

  const handlePurchase = async () => {
    const success = await purchasePremiumLook();
    if (success) {
      onUpgradeComplete();
    }
    return success;
  };

  return (
    <>
      <Card className="border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            <h3 className="text-xl font-bold">Want a More Accurate, Personalized Look?</h3>
          </div>
          
          <p className="text-muted-foreground">
            Here's your basic look. Get a more accurate, flattering, and fully personalized result with advanced AI styling.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={() => setShowModal(true)}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              size="lg"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade to Premium Look – $5
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            One-time payment • Instant premium look generation
          </p>
        </CardContent>
      </Card>

      <PremiumLookModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onPurchase={handlePurchase}
      />
    </>
  );
}
