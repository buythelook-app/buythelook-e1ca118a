
import { PersonalizedLookCard } from "./PersonalizedLookCard";
import { EmptyLookCard } from "./EmptyLookCard";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Look } from "@/hooks/usePersonalizedLooks";

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
          Array.from({ length: 4 }).map((_, index) => (
            <div key={`loading-${index}`} className="bg-netflix-card p-6 rounded-lg shadow-lg animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="h-64 bg-gray-300 rounded mb-4"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-8 bg-gray-300 rounded w-1/3"></div>
              </div>
            </div>
          ))
        ) : (
          occasions.map((occasion, index) => {
            const items = occasionOutfits?.[occasion] || [];
            const look = createLookFromItems(items, occasion, index);
            
            if (!look) {
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
