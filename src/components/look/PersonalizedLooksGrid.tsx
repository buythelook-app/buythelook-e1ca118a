
import { Shuffle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { PersonalizedLookCard } from "./PersonalizedLookCard";
import { LookCanvas } from "../LookCanvas";
import { DebugPanel } from "../DebugPanel";
import { memo, useMemo, useEffect, useState } from "react";
import type { Look } from "@/hooks/usePersonalizedLooks";
import { DashboardItem } from "@/types/lookTypes";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

interface CategoryItems {
  tops: any[];
  bottoms: any[];
  shoes: any[];
  dresses: any[];
}

interface PersonalizedLooksGridProps {
  isLoading: boolean;
  isError: boolean;
  occasionOutfits: { [key: string]: DashboardItem[] };
  categoriesByOccasion: { [key: string]: CategoryItems };
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
  categoriesByOccasion,
  occasions,
  createLookFromItems,
  handleShuffleLook,
  handleAddToCart,
  resetError,
  userStyleProfile
}: PersonalizedLooksGridProps) => {
  // Debug state
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Track used items for this render session
  const usedItemsInCurrentSession = useMemo(() => new Set<string>(), [occasionOutfits]);

  // Update debug info from global state
  useEffect(() => {
    const interval = setInterval(() => {
      if ((window as any).fashionApiDebug) {
        setDebugInfo((window as any).fashionApiDebug);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

  const totalItemsDisplayed = occasions.reduce((total, occasion) => {
    return total + (occasionOutfits[occasion] || []).length;
  }, 0);

  const renderCategoryItems = (items: any[], categoryName: string, occasion: string) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="space-y-2">
        <h5 className="font-medium text-sm text-muted-foreground capitalize">{categoryName}</h5>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {items.slice(0, 6).map((item: any, index: number) => (
            <div key={`${item.id}-${index}`} className="bg-card border rounded-lg p-2 hover:bg-accent transition-colors">
              <div className="aspect-square relative mb-2">
                <img 
                  src={item.imageUrl || '/placeholder.svg'} 
                  alt={item.title || item.name || 'Fashion item'}
                  className="w-full h-full object-cover rounded"
                  loading="lazy"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium line-clamp-2" title={item.title || item.name}>
                  {item.title || item.name || 'Unnamed item'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.estimatedPrice || item.price || 'Price not available'}
                </p>
              </div>
            </div>
          ))}
        </div>
        {items.length > 6 && (
          <p className="text-xs text-muted-foreground">+{items.length - 6} more items</p>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="space-y-8">
        {occasions.map((occasion) => {
          const occasionItems = occasionOutfits[occasion] || [];
          const categoryData = categoriesByOccasion[occasion];
          
          console.log(`🔍 [PersonalizedLooksGrid] ${occasion} - Total items: ${occasionItems.length}`);
          console.log(`🔍 [PersonalizedLooksGrid] ${occasion} categories:`, categoryData);
          
          const look = createLookFromItems(occasionItems, occasion, 0);

          return (
            <div key={occasion} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-foreground">{occasion}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {occasionItems.length} items
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShuffleLook(occasion)}
                    className="hover:bg-accent"
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Shuffle
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left side - Generated Look */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Generated Look</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {look ? (
                      <PersonalizedLookCard
                        look={look}
                        onShuffle={handleShuffleLook}
                        onAddToCart={handleAddToCart}
                        userStyleProfile={userStyleProfile}
                        customCanvas={
                          <LookCanvas 
                            items={look.items.map(item => ({
                              id: item.id,
                              image: item.image || '/placeholder.svg',
                              type: item.type,
                              name: item.name
                            }))}
                            width={280}
                            height={350}
                          />
                        }
                      />
                    ) : (
                      <div className="bg-muted rounded-lg p-6 min-h-[350px] flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <p className="text-muted-foreground">No items available for this occasion</p>
                          <p className="text-sm text-muted-foreground">
                            Try shuffling or check the debug panel for more details
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Right side - Category Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Available Items by Category</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {categoryData ? (
                      <>
                        {renderCategoryItems(categoryData.tops, 'tops', occasion)}
                        {renderCategoryItems(categoryData.bottoms, 'bottoms', occasion)}
                        {renderCategoryItems(categoryData.dresses, 'dresses', occasion)}
                        {renderCategoryItems(categoryData.shoes, 'shoes', occasion)}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No categorized items available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Enhanced Debug Panel */}
      <DebugPanel
        apiCallStatus={isLoading ? 'loading' : isError ? 'error' : 'success'}
        itemsReceived={totalItemsDisplayed}
        rawApiData={debugInfo}
        currentDisplayState={{
          occasions: occasions.map(occasion => {
            const categoryData = categoriesByOccasion[occasion];
            return {
              name: occasion,
              itemCount: (occasionOutfits[occasion] || []).length,
              categories: categoryData ? {
                tops: categoryData.tops?.length || 0,
                bottoms: categoryData.bottoms?.length || 0,
                shoes: categoryData.shoes?.length || 0,
                dresses: categoryData.dresses?.length || 0
              } : null
            };
          }),
          isLoading,
          isError,
          totalCategories: Object.keys(categoriesByOccasion).length
        }}
        errors={debugInfo?.errors || (isError ? ['Failed to load fashion items'] : [])}
        isLoading={isLoading}
      />
    </>
  );
});

PersonalizedLooksGrid.displayName = "PersonalizedLooksGrid";
