
import { Shuffle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { PersonalizedLookCard } from "./PersonalizedLookCard";
import { LookCanvas } from "../LookCanvas";
import { memo, useMemo } from "react";
import type { Look } from "@/hooks/usePersonalizedLooks";
import { DashboardItem } from "@/types/lookTypes";

interface PersonalizedLooksGridProps {
  isLoading: boolean;
  isError: boolean;
  occasionOutfits: { [key: string]: DashboardItem[] };
  occasions: string[];
  createLookFromItems: (items: any[], occasion: string, index: number) => Look | null;
  handleShuffleLook: (occasion: string) => void;
  handleAddToCart: (look: any) => void;
  resetError: () => void;
  userStyleProfile?: string;
}

export const PersonalizedLooksGrid = memo(({
  isLoading,
  isError,
  occasionOutfits,
  occasions,
  createLookFromItems,
  handleShuffleLook,
  handleAddToCart,
  resetError,
  userStyleProfile
}: PersonalizedLooksGridProps) => {

  // Track used items for this render session
  const usedItemsInCurrentSession = useMemo(() => new Set<string>(), [occasionOutfits]);

  // Function to filter out already used items for this session
  const getAvailableItems = (items: DashboardItem[]): DashboardItem[] => {
    return items.filter(item => !usedItemsInCurrentSession.has(item.id));
  };

  // Function to mark items as used in this session
  const markItemsAsUsed = (items: DashboardItem[]) => {
    items.forEach(item => usedItemsInCurrentSession.add(item.id));
  };

  if (isLoading) {
    return (
      <div className="fashion-grid">
        {occasions.map((occasion) => (
          <div key={occasion} className="fashion-card rounded-3xl p-8 min-h-[500px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-fashion-accent" />
              <p className="fashion-text font-medium">Curating your perfect {occasion.toLowerCase()} look...</p>
              <p className="fashion-muted text-sm">This may take a moment</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fashion-card rounded-3xl p-12 text-center">
        <AlertCircle className="h-12 w-12 text-fashion-accent mx-auto mb-6" />
        <h3 className="text-2xl font-display fashion-text mb-4">Something went wrong</h3>
        <p className="fashion-muted mb-8 max-w-md mx-auto">
          We're having trouble curating your looks right now. Please try again in a moment.
        </p>
        <button onClick={resetError} className="fashion-button-secondary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="fashion-grid">
      {occasions.map((occasion) => {
        const occasionItems = occasionOutfits[occasion] || [];
        
        // Get available items (not used in this session yet)
        const availableItems = getAvailableItems(occasionItems);
        
        console.log(`🔍 [PersonalizedLooksGrid] ${occasion} - Total items: ${occasionItems.length}, Available (unused): ${availableItems.length}`);
        
        const look = createLookFromItems(availableItems, occasion, 0);
        
        if (!look) {
          return (
            <div key={occasion} className="fashion-card rounded-3xl p-8 min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <h4 className="text-lg font-display fashion-text mb-2">{occasion}</h4>
                <p className="fashion-muted text-sm">No items available for this occasion</p>
              </div>
            </div>
          );
        }

        // Mark the items used in this look as used for this session
        const usedItems = availableItems.filter(item => 
          look.items.some(lookItem => lookItem.id === item.id)
        );
        markItemsAsUsed(usedItems);

        console.log(`✅ [PersonalizedLooksGrid] ${occasion} - Marked ${usedItems.length} items as used:`, usedItems.map(i => i.id));

        // Convert DashboardItems to canvas items format
        const canvasItems = availableItems
          .filter(item => look.items.some(lookItem => lookItem.id === item.id))
          .map(item => ({
            id: item.id,
            image: item.image || '/placeholder.svg',
            type: item.type,
            name: item.name
          }));

        console.log(`🔍 [PersonalizedLooksGrid] ${occasion} canvas items:`, canvasItems);

        return (
          <PersonalizedLookCard
            key={occasion}
            look={look}
            onShuffle={handleShuffleLook}
            onAddToCart={handleAddToCart}
            userStyleProfile={userStyleProfile}
            customCanvas={
              <LookCanvas 
                items={canvasItems}
                width={300}
                height={400}
              />
            }
          />
        );
      })}
    </div>
  );
});

PersonalizedLooksGrid.displayName = "PersonalizedLooksGrid";
