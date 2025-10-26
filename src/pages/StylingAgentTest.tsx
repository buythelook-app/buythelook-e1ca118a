import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function StylingAgentTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const testCases = [
    {
      name: "Classic Work Outfit",
      params: {
        bodyType: "X",
        mood: "elegant",
        style: "classic",
        budget: 300,
        userId: "test-user-1"
      }
    },
    {
      name: "Casual Weekend Look",
      params: {
        bodyType: "V",
        mood: "relaxed",
        style: "casual",
        budget: 200,
        userId: "test-user-2"
      }
    },
    {
      name: "Romantic Date Night",
      params: {
        bodyType: "A",
        mood: "elegant",
        style: "romantic",
        budget: 250,
        userId: "test-user-3"
      }
    }
  ];

  const runTest = async (testCase: typeof testCases[0]) => {
    setLoading(true);
    setResult(null);
    
    const startTime = Date.now();
    
    try {
      console.log('🧪 Testing styling agent with:', testCase.params);
      
      toast({
        title: "Testing Styling Agent",
        description: `Running: ${testCase.name}`,
      });

      const { data, error } = await supabase.functions.invoke('styling-agent', {
        body: testCase.params
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      if (error) {
        throw error;
      }

      console.log('✅ Test completed:', data);
      
      setResult({
        testCase: testCase.name,
        duration: `${duration}s`,
        ...data
      });

      toast({
        title: "Test Successful! ✅",
        description: `Generated ${data.data?.outfits?.length || 0} outfits in ${duration}s`,
      });

    } catch (error: any) {
      console.error('❌ Test failed:', error);
      
      setResult({
        testCase: testCase.name,
        error: error.message || 'Unknown error',
        duration: `${((Date.now() - startTime) / 1000).toFixed(2)}s`
      });

      toast({
        title: "Test Failed ❌",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Styling Agent Test</h1>
          <p className="text-muted-foreground">
            Test the AI-powered styling agent with different scenarios
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testCases.map((testCase, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-lg">{testCase.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">Body:</span> {testCase.params.bodyType}</div>
                  <div><span className="font-medium">Mood:</span> {testCase.params.mood}</div>
                  <div><span className="font-medium">Style:</span> {testCase.params.style}</div>
                  <div><span className="font-medium">Budget:</span> ${testCase.params.budget}</div>
                </div>
                <Button 
                  onClick={() => runTest(testCase)}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Run Test'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {result && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Test Results: {result.testCase}</CardTitle>
              <div className="text-sm text-muted-foreground">
                Duration: {result.duration} | Iterations: {result.metadata?.iterations || 'N/A'}
              </div>
            </CardHeader>
            <CardContent>
              {result.error ? (
                <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                  <p className="text-destructive font-medium">Error:</p>
                  <p className="text-sm">{result.error}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Reasoning:</h3>
                    <p className="text-sm bg-muted p-3 rounded">{result.data?.reasoning}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">
                      Outfits ({result.data?.outfits?.length || 0}):
                    </h3>
                    <div className="space-y-3">
                      {result.data?.outfits?.map((outfit: any, idx: number) => (
                        <div key={idx} className="bg-muted p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">Outfit #{idx + 1}</h4>
                            <span className="text-sm bg-primary/10 px-2 py-1 rounded">
                              {outfit.occasion}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{outfit.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>Top: {outfit.top_id?.substring(0, 8)}...</div>
                            <div>Bottom: {outfit.bottom_id?.substring(0, 8) || 'N/A'}...</div>
                            <div>Shoes: {outfit.shoes_id?.substring(0, 8)}...</div>
                            <div>Price: ${outfit.total_price?.toFixed(2) || 'N/A'}</div>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs font-medium">Color Story:</p>
                            <p className="text-xs text-muted-foreground">{outfit.color_story}</p>
                          </div>
                          {outfit.styling_tips && outfit.styling_tips.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium">Styling Tips:</p>
                              <ul className="text-xs text-muted-foreground list-disc list-inside">
                                {outfit.styling_tips.map((tip: string, i: number) => (
                                  <li key={i}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium">
                  View Raw JSON
                </summary>
                <pre className="mt-2 text-xs bg-black text-green-400 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
