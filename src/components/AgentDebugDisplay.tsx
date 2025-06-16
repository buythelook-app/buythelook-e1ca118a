import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Play } from "lucide-react";
import { stylingAgent } from "@/agents/stylingAgent";

interface DebugInfo {
  filters_applied: string[];
  raw_data: {
    clothing_fetched: number;
    shoes_fetched: number;
    clothing_available: number;
    shoes_available: number;
  };
  categorization: {
    tops: number;
    bottoms: number;
    dresses: number;
    jumpsuits: number;
    outerwear: number;
    shoes_with_valid_images: number;
  };
  filtering_steps: {
    step: string;
    items_before: number;
    items_after: number;
    criteria: string;
  }[];
  items_selected: {
    [key: string]: {
      id: string;
      name: string;
      image: string;
      source: string;
      price?: number;
      image_validation: boolean;
    };
  };
  logic_notes: string[];
  performance: {
    total_time_ms: number;
    image_debug_time_ms?: number;
  };
  outfit_logic?: {
    event_type: string;
    outfit_rules_applied: string[];
    selected_combination: string;
    item_sources: {
      [key: string]: string;
    };
  };
}

export function AgentDebugDisplay() {
  const [debugData, setDebugData] = useState<DebugInfo | null>(null);
  const [agentResult, setAgentResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [outfitLogicExpanded, setOutfitLogicExpanded] = useState(true);

  const runStylingAgent = async () => {
    setLoading(true);
    try {
      // Set up mock data for testing
      const mockStyleData = {
        analysis: {
          bodyShape: 'H',
          styleProfile: 'classic'
        }
      };
      localStorage.setItem('styleAnalysis', JSON.stringify(mockStyleData));
      localStorage.setItem('current-mood', 'elegant');
      localStorage.setItem('current-event', 'evening'); // Test with evening event

      console.log("🎯 [DEBUG] Running NEW OUTFIT LOGIC styling agent...");
      
      const result = await stylingAgent.run('test-user');
      
      console.log("✅ [DEBUG] NEW OUTFIT LOGIC completed:", result);
      
      setAgentResult(result);
      if (result.success && result.data?.debugInfo) {
        setDebugData(result.data.debugInfo);
      }
    } catch (error) {
      console.error("❌ [DEBUG] Error running styling agent:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">🔍 Agent Debug Monitor</h2>
          <p className="text-gray-600">ניטור מפורט של לוגיקת יצירת תלבושות חדשה</p>
        </div>
        <Button onClick={runStylingAgent} disabled={loading} className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          {loading ? "מריץ..." : "הרץ NEW OUTFIT LOGIC"}
        </Button>
      </div>

      {debugData && debugData.outfit_logic && (
        <Collapsible open={outfitLogicExpanded} onOpenChange={setOutfitLogicExpanded}>
          <Card className="border-blue-200 bg-blue-50">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-blue-100">
                <CardTitle className="flex items-center justify-between text-blue-800">
                  🎯 לוגיקת יצירת תלבושות חדשה
                  {outfitLogicExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">סוג אירוע:</h4>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {debugData.outfit_logic.event_type}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">חוקי תלבושת שהופעלו:</h4>
                    <div className="flex flex-wrap gap-2">
                      {debugData.outfit_logic.outfit_rules_applied.map((rule, index) => (
                        <Badge key={index} variant="secondary">{rule}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">צירוף נבחר:</h4>
                    <p className="text-sm bg-white p-2 rounded border">
                      {debugData.outfit_logic.selected_combination}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">מקורות פריטים:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(debugData.outfit_logic.item_sources).map(([item, source]) => (
                        <div key={item} className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                          <span className="font-medium">{item}:</span>
                          <Badge variant={source === 'shoes_table' ? 'default' : 'secondary'}>
                            {source}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {debugData && (
        <div className="grid gap-6">
          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⏱️ ביצועים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">זמן כולל:</span>
                  <Badge variant="outline" className="ml-2">
                    {formatTime(debugData.performance.total_time_ms)}
                  </Badge>
                </div>
                {debugData.performance.image_debug_time_ms && (
                  <div>
                    <span className="font-medium">זמן דיבאג תמונות:</span>
                    <Badge variant="outline" className="ml-2">
                      {formatTime(debugData.performance.image_debug_time_ms)}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Fetching Summary */}
          <Card>
            <CardHeader>
              <CardTitle>📊 שליפת נתונים</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">בגדים (zara_cloth)</h4>
                  <div className="text-sm space-y-1">
                    <div>נשלפו: <Badge>{debugData.raw_data.clothing_fetched}</Badge></div>
                    <div>זמינים: <Badge>{debugData.raw_data.clothing_available}</Badge></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">נעליים (shoes)</h4>
                  <div className="text-sm space-y-1">
                    <div>נשלפו: <Badge>{debugData.raw_data.shoes_fetched}</Badge></div>
                    <div>זמינים: <Badge>{debugData.raw_data.shoes_available}</Badge></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categorization */}
          <Card>
            <CardHeader>
              <CardTitle>🏷️ קטגוריזציה</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-sm">👕 חולצות:</span>
                  <Badge variant="secondary" className="ml-2">{debugData.categorization.tops}</Badge>
                </div>
                <div>
                  <span className="text-sm">👖 מכנסיים:</span>
                  <Badge variant="secondary" className="ml-2">{debugData.categorization.bottoms}</Badge>
                </div>
                <div>
                  <span className="text-sm">👗 שמלות:</span>
                  <Badge variant="secondary" className="ml-2">{debugData.categorization.dresses}</Badge>
                </div>
                <div>
                  <span className="text-sm">🤸 אוברולים:</span>
                  <Badge variant="secondary" className="ml-2">{debugData.categorization.jumpsuits}</Badge>
                </div>
                <div>
                  <span className="text-sm">🧥 מעילים:</span>
                  <Badge variant="secondary" className="ml-2">{debugData.categorization.outerwear}</Badge>
                </div>
                <div>
                  <span className="text-sm">👟 נעליים (תמונות תקינות):</span>
                  <Badge variant="secondary" className="ml-2">{debugData.categorization.shoes_with_valid_images}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtering Steps */}
          <Card>
            <CardHeader>
              <CardTitle>🔍 שלבי סינון</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {debugData.filtering_steps.map((step, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{step.step}</span>
                      <p className="text-sm text-gray-600">{step.criteria}</p>
                    </div>
                    <div className="text-sm">
                      <Badge variant="outline">{step.items_before}</Badge>
                      <span className="mx-2">→</span>
                      <Badge variant="outline">{step.items_after}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Items */}
          <Card>
            <CardHeader>
              <CardTitle>✅ פריטים נבחרים</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {Object.entries(debugData.items_selected).map(([key, item]) => (
                  <div key={key} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{key}</h4>
                      <Badge variant={item.source === 'shoes' ? 'default' : 'secondary'}>
                        {item.source}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div><strong>ID:</strong> {item.id}</div>
                      <div><strong>שם:</strong> {item.name}</div>
                      {item.price && <div><strong>מחיר:</strong> ${item.price}</div>}
                      <div>
                        <strong>תמונה תקינה:</strong>
                        <Badge variant={item.image_validation ? 'default' : 'destructive'} className="ml-2">
                          {item.image_validation ? '✅' : '❌'}
                        </Badge>
                      </div>
                      <div className="break-all">
                        <strong>URL תמונה:</strong>
                        <span className="text-xs ml-2">{item.image}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Logic Notes */}
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <CardTitle className="flex items-center justify-between">
                    📝 הערות לוגיקה
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="space-y-2">
                    {debugData.logic_notes.map((note, index) => (
                      <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                        <span className="font-mono">{note}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Filters Applied */}
          <Card>
            <CardHeader>
              <CardTitle>🎛️ פילטרים שהופעלו</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {debugData.filters_applied.map((filter, index) => (
                  <Badge key={index} variant="outline">{filter}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {agentResult && (
        <Card>
          <CardHeader>
            <CardTitle>📋 תוצאה סופית</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>סטטוס:</strong>
                <Badge variant={agentResult.success ? 'default' : 'destructive'} className="ml-2">
                  {agentResult.success ? 'הצליח' : 'נכשל'}
                </Badge>
              </div>
              {agentResult.success && agentResult.data?.looks && (
                <div>
                  <strong>מספר תלבושות שנוצרו:</strong>
                  <Badge variant="secondary" className="ml-2">
                    {agentResult.data.looks.length}
                  </Badge>
                </div>
              )}
              {agentResult.error && (
                <div className="text-red-600">
                  <strong>שגיאה:</strong> {agentResult.error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!debugData && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">הרץ את ה-Styling Agent כדי לראות מידע דיבאג מפורט עם הלוגיקה החדשה</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
