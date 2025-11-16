import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, CreditCard } from "lucide-react";

interface PremiumLookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => Promise<boolean>;
}

export function PremiumLookModal({ isOpen, onClose, onPurchase }: PremiumLookModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    setIsProcessing(true);
    const success = await onPurchase();
    setIsProcessing(false);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Upgrade to Premium Look
          </DialogTitle>
          <DialogDescription>
            Get a fully personalized, accurate, and flattering look for just 15₪
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-accent/20 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm">Premium Look includes:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Full body-type matching and analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Advanced mood and style adaptation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>AI-refined color coordination</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Personalized styling recommendations</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-b">
            <span className="font-semibold">Premium Look Pass</span>
            <span className="text-2xl font-bold">15₪</span>
          </div>

          <Button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            size="lg"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isProcessing ? "Processing..." : "Upgrade Now - 15₪"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment processing
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
