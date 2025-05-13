
import { PersonalizedLookCard } from "./PersonalizedLookCard";
import { EmptyLookCard } from "./EmptyLookCard";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Look } from "@/hooks/usePersonalizedLooks";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { memo } from "react";

interface PersonalizedLooksGridProps {
  isLoading: boolean;
  isError: boolean;
  occasionOutfits: Record<string, any[]> | undefined;
  occasions: string[];
  createLookFromItems: (items: any[], occasion: string, index: number) => Look | null;
  handleShuffleLook: (occasion: string) => void;
  handleAddToCart: (look: Look) => void;
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
  return (
    <>
      {isError && (
        <Alert variant="default" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Using locally stored outfit combinations while we try to reconnect.
          </AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 ml-auto flex items-center gap-1" 
            onClick={resetError}
          >
            <RefreshCw className="h-3 w-3" />
            Try Again
          </Button>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Use key with item id and loading state to prevent flicker during state transitions */}
        {occasions.map((occasion, index) => {
          // Always ensure we have items for each occasion
          const items = occasionOutfits?.[occasion] || [];
          const look = createLookFromItems(items, occasion, index);
          
          if (!look || !look.items || look.items.length === 0) {
            return (
              <EmptyLookCard 
                key={`empty-${occasion}-${index}-${isLoading}`}
                occasion={occasion}
                onShuffle={() => handleShuffleLook(occasion)}
                isLoading={isLoading}
              />
            );
          }
          
          return (
            <PersonalizedLookCard
              key={`${look.id}-${look.items.map(i => i.id).join('-')}`}
              look={look}
              onShuffle={() => handleShuffleLook(occasion)}
              onAddToCart={handleAddToCart}
              userStyleProfile={userStyleProfile}
            />
          );
        })}
      </div>
    </>
  );
});

PersonalizedLooksGrid.displayName = "PersonalizedLooksGrid";
