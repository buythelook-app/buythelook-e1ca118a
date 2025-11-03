import { Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CreditsDisplayProps {
  credits: number;
  variant: 'A' | 'B' | null;
}

export const CreditsDisplay = ({ credits, variant }: CreditsDisplayProps) => {
  const getVariantMessage = () => {
    if (variant === 'A') {
      return credits === 0 
        ? 'Unlimited looks available!'
        : `${credits} tracked looks remaining`;
    }
    return credits === 0
      ? 'Purchase credits to continue'
      : `${credits} look${credits !== 1 ? 's' : ''} remaining`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={credits === 0 && variant === 'B' ? 'destructive' : 'secondary'}
            className="flex items-center gap-1.5 px-3 py-1 cursor-pointer"
          >
            <Coins className="h-3.5 w-3.5" />
            <span className="font-semibold">{credits}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{getVariantMessage()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
