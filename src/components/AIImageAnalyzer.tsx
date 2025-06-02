
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, Zap, CheckCircle } from "lucide-react";
import { analyzeImagesWithAI, updateItemImageWithAI } from "@/services/aiImageAnalysisService";
import { toast } from "sonner";

interface AnalysisResult {
  itemId: string;
  productName: string;
  selectedImage: string;
  originalImageData: any;
  timestamp: string;
}

export function AIImageAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<{ [key: string]: boolean }>({});

  const runAnalysis = async (limit: number = 10) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setResults([]);
      
      console.log(`🤖 Starting AI analysis for ${limit} items...`);
      toast.info(`Starting AI analysis for ${limit} items...`);
      
      const analysisResult = await analyzeImagesWithAI(undefined, limit);
      
      if (!analysisResult.success) {
        throw new Error(analysisResult.error || 'Analysis failed');
      }
      
      setResults(analysisResult.results || []);
      toast.success(`✅ Analysis completed! Processed ${analysisResult.totalProcessed} items`);
      
    } catch (err: any) {
      console.error('❌ Analysis error:', err);
      setError(err.message);
      toast.error('Analysis failed: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateItemImage = async (itemId: string) => {
    try {
      setIsUpdating(prev => ({ ...prev, [itemId]: true }));
      
      const updateResult = await updateItemImageWithAI(itemId);
      
      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Update failed');
      }
      
      toast.success(`✅ Item ${itemId} updated with new image`);
      
      // Update the results to show the item was updated
      setResults(prev => prev.map(result => 
        result.itemId === itemId 
          ? { ...result, isUpdated: true } 
          : result
      ));
      
    } catch (err: any) {
      console.error(`❌ Update error for item ${itemId}:`, err);
      toast.error(`Update failed for item ${itemId}: ${err.message}`);
    } finally {
      setIsUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            AI Image Analyzer
          </CardTitle>
          <CardDescription>
            Use AI to automatically detect and select the best product images without models
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={() => runAnalysis(5)} 
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Analyze 5 Items
            </Button>
            <Button 
              onClick={() => runAnalysis(10)} 
              disabled={isAnalyzing}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Analyze 10 Items
            </Button>
            <Button 
              onClick={() => runAnalysis(20)} 
              disabled={isAnalyzing}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Analyze 20 Items
            </Button>
          </div>
          
          {isAnalyzing && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                AI is analyzing images to find the best product photos without models...
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              AI-selected best images for each item (without models)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result) => (
                <div key={result.itemId} className="border rounded-lg p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm truncate">{result.productName}</h3>
                    <p className="text-xs text-gray-500">ID: {result.itemId}</p>
                  </div>
                  
                  <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={result.selectedImage}
                      alt={result.productName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => updateItemImage(result.itemId)}
                    disabled={isUpdating[result.itemId]}
                    className="w-full flex items-center gap-2"
                  >
                    {isUpdating[result.itemId] ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (result as any).isUpdated ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Zap className="h-3 w-3" />
                    )}
                    {(result as any).isUpdated ? 'Updated' : 'Update Item'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
