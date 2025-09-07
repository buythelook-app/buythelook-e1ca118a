import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Database, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ApiTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const { toast } = useToast();

  const testApi = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🚀 Testing ASOS API connection...');
      
      const { data, error } = await supabase.functions.invoke('catalog-test', {
        body: {}
      });

      if (error) {
        throw error;
      }

      setResult(data);
      
      if (data.success) {
        toast({
          title: "✅ הצלחה!",
          description: `נשמרו ${data.saved_items} פריטים מ-ASOS במסד הנתונים`,
        });
        // Automatically load catalog after successful API test
        loadCatalogItems();
      } else {
        toast({
          title: "❌ שגיאה",
          description: data.error || "שגיאה לא ידועה",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error('API test error:', err);
      setResult({ success: false, error: err.message });
      toast({
        title: "❌ שגיאה",
        description: err.message || "שגיאה בחיבור ל-API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogItems = async () => {
    setLoadingCatalog(true);
    try {
      const { data, error } = await supabase
        .from('catalog_items')
        .select('*')
        .eq('source', 'ASOS')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setCatalogItems(data || []);
    } catch (err: any) {
      console.error('Error loading catalog:', err);
      toast({
        title: "שגיאה בטעינת הקטלוג",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoadingCatalog(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-blue-900">בדיקת חיבור API</h1>
          <p className="text-blue-700">בדיקת חיבור ל-ASOS ושמירה במסד הנתונים</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* API Test Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-blue-600" />
                בדיקת ASOS API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testApi} 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    בודק חיבור...
                  </>
                ) : (
                  'בדוק חיבור ל-ASOS'
                )}
              </Button>

              {result && (
                <Card className={`${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                        {result.success ? 'הצלחה!' : 'שגיאה'}
                      </span>
                    </div>
                    
                    {result.success ? (
                      <div className="space-y-2 text-sm">
                        <p>✅ נשמרו {result.saved_items} פריטים חדשים</p>
                        <p>📊 סה"כ פריטי ASOS במסד הנתונים: {result.latest_items_in_db}</p>
                        {result.sample_saved_item && (
                          <div className="bg-white/60 p-2 rounded mt-2">
                            <p className="font-medium">דוגמה לפריט שנשמר:</p>
                            <p className="text-xs">🏷️ {result.sample_saved_item.title}</p>
                            <p className="text-xs">💰 {result.sample_saved_item.price} {result.sample_saved_item.currency}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm text-red-700">
                        <p>{result.error}</p>
                        {result.details && (
                          <pre className="bg-red-100 p-2 rounded text-xs overflow-auto max-h-32">
                            {result.details}
                          </pre>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Catalog View Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                פריטים במסד הנתונים
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={loadCatalogItems} 
                disabled={loadingCatalog}
                variant="outline"
                className="w-full"
              >
                {loadingCatalog ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    טוען...
                  </>
                ) : (
                  'טען פריטים מהמסד נתונים'
                )}
              </Button>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {catalogItems.length > 0 ? (
                  catalogItems.map((item, index) => (
                    <Card key={item.id} className="bg-white/60">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          {item.images && item.images[0] && (
                            <img 
                              src={item.images[0]} 
                              alt={item.title}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {item.price} {item.currency}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {item.brand}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              נוצר: {new Date(item.created_at).toLocaleString('he-IL')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    אין פריטים להצגה. הרץ בדיקת API תחילה.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;