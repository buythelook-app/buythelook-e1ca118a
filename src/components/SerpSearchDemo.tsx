import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSerpSearch } from '@/hooks/useSerpSearch';
import { Loader2, Search, ExternalLink } from 'lucide-react';

export const SerpSearchDemo = () => {
  const [query, setQuery] = useState('');
  const [engine, setEngine] = useState<'google' | 'bing' | 'yahoo' | 'duckduckgo'>('google');
  const [location, setLocation] = useState('');
  const [num, setNum] = useState(10);

  const { search, loading, error, results, clearResults } = useSerpSearch();

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      await search({
        query: query.trim(),
        engine,
        location: location.trim() || undefined,
        num
      });
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SerpAPI Search Demo
          </CardTitle>
          <CardDescription>
            חפש במנועי חיפוש שונים באמצעות SerpAPI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="query">שאילתת חיפוש</Label>
              <Input
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="הכנס שאילתת חיפוש..."
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="engine">מנוע חיפוש</Label>
              <Select value={engine} onValueChange={(value: any) => setEngine(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="bing">Bing</SelectItem>
                  <SelectItem value="yahoo">Yahoo</SelectItem>
                  <SelectItem value="duckduckgo">DuckDuckGo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">מיקום (אופציונלי)</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="לדוגמה: Tel Aviv, Israel"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="num">מספר תוצאות</Label>
              <Select value={num.toString()} onValueChange={(value) => setNum(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={loading || !query.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  מחפש...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  חפש
                </>
              )}
            </Button>
            
            {results && (
              <Button variant="outline" onClick={clearResults}>
                נקה תוצאות
              </Button>
            )}
          </div>

          {error && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-red-700">
              <strong>שגיאה:</strong> {error}
            </div>
          )}
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-4">
          {/* Search Metadata */}
          {results.search_metadata && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">
                  סטטוס: {results.search_metadata.status} | 
                  זמן חיפוש: {results.search_metadata.total_time_taken?.toFixed(2)}s
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organic Results */}
          {results.organic_results && results.organic_results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>תוצאות חיפוש אורגניות ({results.organic_results.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.organic_results.map((result, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <h3 className="font-medium text-lg mb-1">
                      <a 
                        href={result.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {result.title}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </h3>
                    <p className="text-sm text-muted-foreground mb-1">{result.link}</p>
                    <p className="text-sm">{result.snippet}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* News Results */}
          {results.news_results && results.news_results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>חדשות ({results.news_results.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.news_results.map((result, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <h3 className="font-medium text-lg mb-1">
                      <a 
                        href={result.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {result.title}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      {result.source} • {result.date}
                    </p>
                    <p className="text-sm">{result.snippet}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Related Searches */}
          {results.related_searches && results.related_searches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>חיפושים קשורים</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {results.related_searches.map((related, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuery(related.query)}
                      className="text-xs"
                    >
                      {related.query}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};