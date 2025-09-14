import { ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { ClickTrackingService } from "../services/clickTrackingService";

interface AffiliateLinkProps {
  item: {
    id: string;
    title: string;
    url?: string;
    type?: string;
  };
  className?: string;
  children?: React.ReactNode;
}

/**
 * Reusable component for affiliate links with tracking
 */
export const AffiliateLink = ({ item, className, children }: AffiliateLinkProps) => {
  const handleClick = async () => {
    // Map item type to category for tracking
    const getCategory = (type?: string): 'top' | 'bottom' | 'shoes' => {
      if (!type) return 'top';
      const lowerType = type.toLowerCase();
      if (lowerType.includes('shoe') || lowerType.includes('boot') || lowerType.includes('sandal')) return 'shoes';
      if (lowerType.includes('pant') || lowerType.includes('jean') || lowerType.includes('skirt') || lowerType.includes('bottom')) return 'bottom';
      return 'top';
    };

    try {
      // Track the click
      await ClickTrackingService.trackClick({
        item_id: item.id,
        category: getCategory(item.type)
      });

      // Open product URL in new tab
      if (item.url) {
        window.open(item.url, '_blank');
      } else {
        // Create a better fallback URL using Zara search
        const searchQuery = encodeURIComponent(item.title);
        const zaraSearchUrl = `https://www.zara.com/il/en/search?searchTerm=${searchQuery}`;
        window.open(zaraSearchUrl, '_blank');
      }
    } catch (error) {
      console.error('Error handling affiliate link click:', error);
      // Still open the link even if tracking fails
      if (item.url) {
        window.open(item.url, '_blank');
      }
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={className || "bg-netflix-accent hover:bg-netflix-accent/80 text-white flex items-center gap-2"}
      size="sm"
    >
      {children || (
        <>
          <ExternalLink className="h-4 w-4" />
          Buy Now
        </>
      )}
    </Button>
  );
};