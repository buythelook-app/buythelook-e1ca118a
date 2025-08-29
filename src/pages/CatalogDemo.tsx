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
    <div className="min-h-screen bg-netflix-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="flex items-end gap-3 mb-6">
          <div className="flex-1">
            <label className="block text-sm mb-1">Search Query</label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., women dresses"
              className="w-full"
            />
          </div>
          <Button onClick={onSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
          <Link to="/" className="text-netflix-accent underline">Back to Home</Link>
        </div>

        {error && (
          <div className="mb-4 text-red-400">{error}</div>
        )}

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((it) => (
              <Card key={it.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-base line-clamp-2">{it.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {it.imageUrl ? (
                    <img src={it.imageUrl} alt={it.title} loading="lazy" className="w-full h-48 object-cover rounded" />
                  ) : (
                    <div className="w-full h-48 bg-black/20 rounded" />
                  )}
                  <div className="mt-2 text-sm opacity-80">
                    <div>Source: {it.source || 'N/A'}</div>
                    {it.estimatedPrice && <div>Price: {it.estimatedPrice}</div>}
                    {it.link && it.link !== '#' && (
                      <a href={it.link} target="_blank" rel="noreferrer" className="text-netflix-accent underline">View</a>
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