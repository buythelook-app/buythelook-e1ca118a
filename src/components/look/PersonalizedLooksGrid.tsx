
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {occasions.map((occasion) => (
          <div key={occasion} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-netflix-accent">{occasion}</h3>
            </div>
            <div className="bg-netflix-card rounded-lg p-6 min-h-[400px] flex items-center justify-center">
              <div className="text-center space-y-2">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-netflix-accent" />
                <p className="text-netflix-text">Loading personalized looks...</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Unable to load personalized looks</h3>
        <p className="text-gray-600 mb-4">There was an issue connecting to our styling service.</p>
        <Button onClick={resetError} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {occasions.map((occasion) => {
        const occasionItems = occasionOutfits[occasion] || [];
        
        // Get available items (not used in this session yet)
        const availableItems = getAvailableItems(occasionItems);
        
        console.log(`🔍 [PersonalizedLooksGrid] ${occasion} - Total items: ${occasionItems.length}, Available (unused): ${availableItems.length}`);
        
        const look = createLookFromItems(availableItems, occasion, 0);
        
        if (!look) {
          return (
            <div key={occasion} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-netflix-accent">{occasion}</h3>
              </div>
              <div className="bg-netflix-card rounded-lg p-6 min-h-[400px] flex items-center justify-center">
                <p className="text-netflix-text">No items available for this occasion</p>
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
          <div key={occasion} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-netflix-accent">{occasion}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShuffleLook(occasion)}
                className="text-netflix-text hover:text-netflix-accent"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Shuffle
              </Button>
            </div>
            
            <PersonalizedLookCard
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
          </div>
        );
      })}
    </div>
  );
});

PersonalizedLooksGrid.displayName = "PersonalizedLooksGrid";
