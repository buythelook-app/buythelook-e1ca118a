import { ProductGrid } from "./ProductGrid";
import { useSimpleFashionData } from "@/hooks/useSimpleFashionData";
import { Button } from "./ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";

export function SimpleFashionDisplay() {
  const { items, isLoading, error, refetch } = useSimpleFashionData();

  console.log('🔍 [SimpleFashionDisplay] Current state:', {
    itemsCount: items.length,
    isLoading,
    error,
    sampleItems: items.slice(0, 3).map(item => ({
      id: item.id,
      title: item.title?.substring(0, 30) + '...',
      hasImage: !!item.imageUrl,
      price: item.estimatedPrice
    }))
  });

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h3 className="text-lg font-semibold">Failed to Load Items</h3>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fashion Items</h1>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <ProductGrid
        items={items}
        title="Tops"
        isLoading={isLoading}
      />

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">Debug Info</h3>
        <div className="text-sm space-y-1">
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>Items Count: {items.length}</p>
          <p>Error: {error || 'None'}</p>
          <p>Sample Item: {items[0] ? JSON.stringify({
            id: items[0].id,
            title: items[0].title?.substring(0, 30),
            hasImage: !!items[0].imageUrl
          }, null, 2) : 'No items'}</p>
        </div>
      </div>
    </div>
  );
}