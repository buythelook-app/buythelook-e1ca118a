
import { PersonalizedLookCard } from "./PersonalizedLookCard";
import { EmptyLookCard } from "./EmptyLookCard";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface PersonalizedLooksGridProps {
  isLoading: boolean;
  isError: boolean;
  occasionOutfits: Record<string, any[]> | undefined;
  occasions: string[];
  createLookFromItems: (items: any[], occasion: string, index: number) => any | null;
  handleShuffleLook: (occasion: string) => void;
  handleAddToCart: (look: any) => void;
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
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Connection error: Unable to load outfit recommendations.
          </AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 ml-auto" 
            onClick={resetError}
          >
            Try Again
          </Button>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isLoading ? (
          <div className="col-span-2 text-center py-12">
            <div className="animate-pulse">Loading your personalized looks...</div>
          </div>
        ) : (
          occasions.map((occasion, index) => {
            const items = occasionOutfits?.[occasion] || [];
            const look = createLookFromItems(items, occasion, index);
            
            if (!look) {
              return (
                <EmptyLookCard 
                  key={`empty-${occasion}-${index}`}
                  occasion={occasion}
                  onShuffle={handleShuffleLook}
                />
              );
            }
            
            return (
              <PersonalizedLookCard
                key={look.id}
                look={look}
                onShuffle={handleShuffleLook}
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
