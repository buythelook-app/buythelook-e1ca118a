
import { PersonalizedLookCard } from "./PersonalizedLookCard";
import { EmptyLookCard } from "./EmptyLookCard";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Look } from "@/hooks/usePersonalizedLooks";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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

export const PersonalizedLooksGrid = ({
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
        {isLoading ? (
          // Loading skeleton cards
          Array.from({ length: 4 }).map((_, index) => (
            <div key={`loading-${index}`} className="bg-netflix-card p-6 rounded-lg shadow-lg animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                <div className="h-3 bg-gray-300 rounded w-1/4"></div>
              </div>
              <AspectRatio ratio={3/4} className="mb-4 bg-gray-300 rounded"></AspectRatio>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-8 bg-gray-300 rounded w-1/3"></div>
              </div>
            </div>
          ))
        ) : (
          occasions.map((occasion, index) => {
            // Always ensure we have items for each occasion
            const items = occasionOutfits?.[occasion] || [];
            const look = createLookFromItems(items, occasion, index);
            
            // If for some reason we still don't have a look, show the empty look card
            if (!look || !look.items || look.items.length === 0) {
              return (
                <EmptyLookCard 
                  key={`empty-${occasion}-${index}`}
                  occasion={occasion}
                  onShuffle={() => handleShuffleLook(occasion)}
                />
              );
            }
            
            return (
              <PersonalizedLookCard
                key={look.id}
                look={look}
                onShuffle={() => handleShuffleLook(occasion)}
                onAddToCart={handleAddToCart}
                userStyleProfile={userStyleProfile}
              />
            );
          })
        )}
      </div>
    </>
  );
};
