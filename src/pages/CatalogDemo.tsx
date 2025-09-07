import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useExternalCatalog, CatalogProvider } from '@/hooks/useExternalCatalog';
import { Link } from 'react-router-dom';

export default function CatalogDemo() {
  const { items, loading, error, fetchCatalog } = useExternalCatalog();
  const [provider, setProvider] = useState<CatalogProvider>('rapidapi-asos');
  const [query, setQuery] = useState('women shirts');

  useEffect(() => {
    document.title = 'Catalog Demo - External Fashion API';
    fetchCatalog({ provider: 'rapidapi-asos', query: 'women shirts', category: 'tops', limit: 12 });
  }, [fetchCatalog]);

  const onSearch = () => fetchCatalog({ provider, query, category: 'tops', limit: 12 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="bg-fashion-glass rounded-2xl p-6 mb-6">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm mb-1 text-foreground">Search Query</label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., women dresses"
                className="w-full"
              />
            </div>
            <Button onClick={onSearch} disabled={loading} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-105 transition-all duration-300">
              {loading ? 'Searching...' : 'Search'}
            </Button>
            <Link to="/" className="text-primary underline hover:text-accent transition-colors">Back to Home</Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((it) => (
              <Card key={it.id} className="overflow-hidden bg-fashion-glass fashion-card-hover">
                <CardHeader>
                  <CardTitle className="text-base line-clamp-2">{it.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {it.imageUrl ? (
                    <img src={it.imageUrl} alt={it.title} loading="lazy" className="w-full h-48 object-cover rounded" />
                  ) : (
                    <div className="w-full h-48 bg-muted rounded" />
                  )}
                  <div className="mt-2 text-sm text-muted-foreground">
                    <div>Source: {it.source || 'N/A'}</div>
                    {it.estimatedPrice && <div>Price: {it.estimatedPrice}</div>}
                    {it.link && it.link !== '#' && (
                      <a href={it.link} target="_blank" rel="noreferrer" className="text-primary underline hover:text-accent transition-colors">View</a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}