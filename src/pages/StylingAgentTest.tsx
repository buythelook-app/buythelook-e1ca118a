import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { LookImage } from "@/components/look/LookImage";
import { useFeedbackTrigger } from "@/hooks/useFeedbackTrigger";

export default function StylingAgentTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [outfitItems, setOutfitItems] = useState<Record<string, any>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [feedbackDialog, setFeedbackDialog] = useState<{ open: boolean; outfitId: string; outfit: any } | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [analyzingFeedback, setAnalyzingFeedback] = useState(false);
  const { toast } = useToast();

  // Initialize user session
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  // Enable feedback learning
  useFeedbackTrigger(userId || undefined);

  // Fetch product details when result changes
  useEffect(() => {
    if (result?.data?.outfits) {
      fetchOutfitItems(result.data.outfits);
    }
  }, [result]);

  const fetchOutfitItems = async (outfits: any[]) => {
    const allItemIds = new Set<string>();
    const allShoesIds = new Set<string>();
    
    console.log('📦 [fetchOutfitItems] Starting to process outfits:', outfits);
    
    outfits.forEach(outfit => {
      console.log('👗 [fetchOutfitItems] Processing outfit:', {
        top_id: outfit.top_id,
        bottom_id: outfit.bottom_id,
        shoes_id: outfit.shoes_id
      });
      
      if (outfit.top_id) allItemIds.add(outfit.top_id);
      if (outfit.bottom_id) allItemIds.add(outfit.bottom_id);
      if (outfit.shoes_id) allShoesIds.add(outfit.shoes_id);
    });

    console.log('🔍 [fetchOutfitItems] Collected IDs:', {
      clothing: Array.from(allItemIds),
      shoes: Array.from(allShoesIds)
    });

    if (allItemIds.size === 0 && allShoesIds.size === 0) {
      console.warn('⚠️ [fetchOutfitItems] No item IDs found to fetch!');
      return;
    }

    // Fetch clothing items from zara_cloth
    const { data: clothingData, error: clothingError } = await supabase
      .from('zara_cloth')
      .select('id, product_name, price, colour, image, images, category')
      .in('id', Array.from(allItemIds));

    // Fetch shoes from shoes table
    let shoesData = null;
    let shoesError = null;
    
    if (allShoesIds.size > 0) {
      console.log('👟 [fetchOutfitItems] Querying shoes table for IDs:', Array.from(allShoesIds));
      const result = await supabase
        .from('shoes')
        .select('id, name, price, color, description, you_might_also_like, brand, category, url')
        .in('id', Array.from(allShoesIds));
      
      shoesData = result.data;
      shoesError = result.error;
      
      console.log('👟 [fetchOutfitItems] Shoes query result:', {
        found: shoesData?.length || 0,
        error: shoesError?.message || 'none',
        sample: shoesData?.[0]
      });
      
      // Normalize shoes data to match zara_cloth structure
      if (shoesData) {
        shoesData = shoesData.map(shoe => ({
          ...shoe,
          product_name: shoe.name,
          colour: Array.isArray(shoe.color) ? shoe.color[0] : (typeof shoe.color === 'string' ? shoe.color : 'Mixed'),
          // Extract first image from you_might_also_like array
          image: Array.isArray(shoe.you_might_also_like) && shoe.you_might_also_like.length > 0
            ? [shoe.you_might_also_like[0]]
            : []
        }));
        console.log('👟 [fetchOutfitItems] Normalized shoes:', shoesData);
      }
    }

    if (clothingError) {
      console.error('❌ Error fetching clothing:', clothingError);
    } else {
      console.log('✅ Fetched clothing items:', clothingData?.length || 0);
    }
    
    if (shoesError) {
      console.error('❌ Error fetching shoes:', shoesError);
    } else {
      console.log('✅ Fetched shoes:', shoesData?.length || 0);
    }

    // Combine both into items map - keep raw data, let LookImage handle extraction
    const itemsMap: Record<string, any> = {};
    
    clothingData?.forEach(item => {
      itemsMap[item.id] = {
        ...item,
        product_name: item.product_name,
        // Keep raw image data - LookImage will handle extraction
        image: item.image || item.images
      };
      console.log('👕 [Clothing] Added item to map:', item.id, item.product_name);
    });

    // Map shoes - normalize field names to match clothing
    shoesData?.forEach(shoe => {
      itemsMap[shoe.id] = {
        ...shoe,
        product_name: shoe.name, // shoes table uses 'name' field
        colour: shoe.color, // shoes table uses 'color' field
        type: 'shoes',
        // Extract first image URL from you_might_also_like array
        image: Array.isArray(shoe.you_might_also_like) && shoe.you_might_also_like.length > 0
          ? [shoe.you_might_also_like[0]]
          : []
      };
      console.log('👟 [Shoes] Added shoe to map:', shoe.id, shoe.name);
    });

    console.log('📊 [fetchOutfitItems] Final items map:', {
      totalItems: Object.keys(itemsMap).length,
      ids: Object.keys(itemsMap)
    });

    setOutfitItems(itemsMap);
  };

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

  const handleFeedback = async (outfitId: string, liked: boolean, outfit: any) => {
    if (!userId) {
      toast({
        title: "נדרש התחברות",
        description: "יש להתחבר כדי לתת פידבק",
        variant: "destructive"
      });
      return;
    }

    if (liked) {
      // Direct like - no dialog needed
      const newFeedback = 'like';
      setFeedback(prev => ({ ...prev, [outfitId]: newFeedback }));

      window.dispatchEvent(new CustomEvent('outfit-feedback', {
        detail: {
          lookId: outfitId,
          liked: true,
          disliked: false,
          lookData: outfit
        }
      }));

      toast({
        title: "👍 אהבתי!",
        description: "הפידבק נשמר וישמש לשיפור ההמלצות הבאות"
      });
    } else {
      // Open dialog for dislike to get detailed feedback
      setFeedbackDialog({ open: true, outfitId, outfit });
      setFeedbackComment("");
    }
  };

  const submitDetailedFeedback = async () => {
    if (!feedbackDialog || !userId) return;

    setAnalyzingFeedback(true);

    try {
      // Analyze the feedback using AI
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-feedback', {
        body: {
          outfit: feedbackDialog.outfit,
          comment: feedbackComment,
          userId
        }
      });

      if (analysisError) throw analysisError;

      console.log('🧠 AI Feedback Analysis:', analysisData);

      // Mark as disliked
      setFeedback(prev => ({ ...prev, [feedbackDialog.outfitId]: 'dislike' }));

      // Dispatch enhanced feedback event with AI insights
      window.dispatchEvent(new CustomEvent('outfit-feedback', {
        detail: {
          lookId: feedbackDialog.outfitId,
          liked: false,
          disliked: true,
          comment: feedbackComment,
          lookData: feedbackDialog.outfit,
          aiInsights: analysisData?.insights // AI-generated insights about what's wrong
        }
      }));

      toast({
        title: "👎 פידבק נשמר בהצלחה",
        description: "ה-AI נתח את ההערה שלך וישפר את ההמלצות הבאות"
      });

      setFeedbackDialog(null);
      setFeedbackComment("");
    } catch (error: any) {
      console.error('❌ Error analyzing feedback:', error);
      toast({
        title: "שגיאה בניתוח הפידבק",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setAnalyzingFeedback(false);
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
                    <div className="space-y-4">
                      {result.data?.outfits?.map((outfit: any, idx: number) => {
                        const topItem = outfitItems[outfit.top_id];
                        const bottomItem = outfitItems[outfit.bottom_id];
                        const shoesItem = outfitItems[outfit.shoes_id];
                        const outfitId = `outfit-${idx}`;
                        const currentFeedback = feedback[outfitId];

                        console.log(`🎨 [Outfit #${idx + 1}] Rendering:`, {
                          outfit_ids: {
                            top: outfit.top_id,
                            bottom: outfit.bottom_id,
                            shoes: outfit.shoes_id
                          },
                          items_found: {
                            top: !!topItem,
                            bottom: !!bottomItem,
                            shoes: !!shoesItem
                          },
                          item_names: {
                            top: topItem?.product_name,
                            bottom: bottomItem?.product_name,
                            shoes: shoesItem?.product_name
                          }
                        });

                        return (
                          <div key={idx} className="bg-card border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-lg">Outfit #{idx + 1}</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-sm bg-primary/10 px-3 py-1 rounded-full">
                                  {outfit.occasion}
                                </span>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant={currentFeedback === 'like' ? 'default' : 'outline'}
                                    onClick={() => handleFeedback(outfitId, true, outfit)}
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={currentFeedback === 'dislike' ? 'destructive' : 'outline'}
                                    onClick={() => handleFeedback(outfitId, false, outfit)}
                                  >
                                    <ThumbsDown className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Product Images */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                              {topItem && (
                                <div className="space-y-1">
                                  <LookImage 
                                    image={topItem.image} 
                                    title={topItem.product_name}
                                    type="top"
                                  />
                                  <p className="text-xs font-medium truncate">{topItem.product_name}</p>
                                  <p className="text-xs text-muted-foreground">₪{topItem.price}</p>
                                </div>
                              )}
                              {bottomItem && (
                                <div className="space-y-1">
                                  <LookImage 
                                    image={bottomItem.image} 
                                    title={bottomItem.product_name}
                                    type="bottom"
                                  />
                                  <p className="text-xs font-medium truncate">{bottomItem.product_name}</p>
                                  <p className="text-xs text-muted-foreground">₪{bottomItem.price}</p>
                                </div>
                              )}
                              {shoesItem && (
                                <div className="space-y-1">
                                  <LookImage 
                                    image={shoesItem.image} 
                                    title={shoesItem.product_name || shoesItem.name || 'נעליים'}
                                    type="shoes"
                                  />
                                  <p className="text-xs font-medium truncate">
                                    {shoesItem.product_name || shoesItem.name || 'נעליים'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">₪{shoesItem.price}</p>
                                </div>
                              )}
                            </div>

                            <p className="text-sm mb-3 text-muted-foreground">{outfit.description}</p>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                              <div className="bg-muted p-2 rounded">
                                <span className="font-medium">Total Price:</span> ${outfit.total_price?.toFixed(2) || 'N/A'}
                              </div>
                              <div className="bg-muted p-2 rounded">
                                <span className="font-medium">Color Story:</span> {outfit.color_story}
                              </div>
                            </div>

                            {outfit.styling_tips && outfit.styling_tips.length > 0 && (
                              <div className="mt-3 bg-muted/50 p-3 rounded">
                                <p className="text-xs font-medium mb-1">💡 Styling Tips:</p>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                  {outfit.styling_tips.map((tip: string, i: number) => (
                                    <li key={i}>• {tip}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })}
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

        {/* Feedback Dialog */}
        <Dialog open={feedbackDialog?.open || false} onOpenChange={(open) => !open && setFeedbackDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>מה לא מתאים בהתאמה?</DialogTitle>
              <DialogDescription>
                תארי במילים שלך מה לא מתאים - ה-AI ינתח את ההערה וישפר את ההמלצות הבאות
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="לדוגמה: הצבעים לא מתאימים, הגזרה לא מחמיאה, יקר מדי, לא מתאים לאירוע..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setFeedbackDialog(null)}>
                  ביטול
                </Button>
                <Button 
                  onClick={submitDetailedFeedback} 
                  disabled={!feedbackComment.trim() || analyzingFeedback}
                >
                  {analyzingFeedback ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      מנתח...
                    </>
                  ) : (
                    'שלח פידבק'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
