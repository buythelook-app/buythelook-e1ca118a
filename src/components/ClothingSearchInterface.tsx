import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search } from 'lucide-react';

// Function to fetch clothing items from SERP API
async function getClothingItems(itemType: string) {
  const response = await fetch(`https://serpapi.com/search.json?q=${itemType}+fashion+shop&api_key=YOUR_API_KEY_HERE&tbm=shop`);
  const data = await response.json();
  return data.shopping_results || [];
}

interface ClothingItem {
  title: string;
  price: string;
  thumbnail: string;
  link: string;
  source: string;
}

export const ClothingSearchInterface = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const items = await getClothingItems(searchTerm);
      setClothingItems(items);
    } catch (err) {
      setError('Failed to fetch clothing items. Please try again.');
      console.error('Error fetching clothing items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (itemType: string) => {
    setSearchTerm(itemType);
    // Auto-search when quick button is clicked
    setTimeout(() => handleSearch(), 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Clothing Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for clothing items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleQuickSearch('shirts')}
            >
              Shirts
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleQuickSearch('pants')}
            >
              Pants
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleQuickSearch('shoes')}
            >
              Shoes
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleQuickSearch('dresses')}
            >
              Dresses
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleQuickSearch('jackets')}
            >
              Jackets
            </Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {clothingItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {clothingItems.map((item, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-square mb-3">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                    }}
                  />
                </div>
                <h3 className="font-medium text-sm mb-2 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-lg font-semibold text-netflix-accent mb-2">
                  {item.price}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  {item.source}
                </p>
                <Button 
                  asChild 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View Item
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && clothingItems.length === 0 && searchTerm && (
        <div className="text-center p-8 text-muted-foreground">
          No clothing items found. Try a different search term.
        </div>
      )}
    </div>
  );
};