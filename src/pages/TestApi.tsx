import { useState } from 'react';
import { useExternalCatalog } from '@/hooks/useExternalCatalog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingBag, RefreshCw } from 'lucide-react';

export default function TestApi() {
  const { items, loading, error, fetchCatalog } = useExternalCatalog();
  const [testQuery, setTestQuery] = useState('women dresses');

  const handleTestFetch = async () => {
    console.log('🧪 [TestApi] Testing RapidAPI fetch with query:', testQuery);
    await fetchCatalog({
      provider: 'rapidapi-asos',
      query: testQuery,
      gender: 'women',
      category: 'dresses',
      limit: 12
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">RapidAPI Test Page</h1>
          <p className="text-muted-foreground">
            This page tests ONLY the RapidAPI ASOS integration - no database fallback
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Test Query</label>
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="e.g., women dresses, men shirts, women tops"
              />
            </div>
            <Button onClick={handleTestFetch} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test RapidAPI
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
              <p className="text-destructive font-medium">RapidAPI Error:</p>
              <p className="text-destructive/80">{error}</p>
            </div>
          )}
        </div>

        <div className="mb-4">
          <Badge variant="outline" className="text-sm">
            <ShoppingBag className="h-3 w-3 mr-1" />
            {items.length} items from RapidAPI ASOS
          </Badge>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={item.imageUrl || item.thumbnailUrl || '/placeholder.svg'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                    RapidAPI
                  </Badge>
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm line-clamp-2">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <span className="font-medium">{item.estimatedPrice || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Source:</span>
                      <Badge variant="secondary">{item.source}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">ID:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{item.id}</code>
                    </div>
                    {item.link && item.link !== '#' && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-primary text-primary-foreground py-2 rounded-md text-sm hover:bg-primary/90 transition-colors"
                      >
                        View on ASOS
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !loading && (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Click "Test RapidAPI" to fetch clothing items from ASOS
            </p>
          </div>
        )}
      </div>
    </div>
  );
}