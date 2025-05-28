
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Info } from "lucide-react";
import { OutfitAgentCard } from "./OutfitAgentCard";
import { toast } from "sonner";
import { AgentResult, TrainerAgentResponse } from "@/types/outfitAgentTypes";
import { extractZaraImageUrl } from "@/utils/imageUtils";

// Helper to format agent names nicely
const formatAgentName = (name: string): string => {
  return name
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function AgentOutfitVisualizer() {
  const [results, setResults] = useState<AgentResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showImagePath, setShowImagePath] = useState<boolean>(false);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("מתחיל לקרוא לאייג'נט הטריינר...");
      
      // Call the trainer-agent Edge Function
      const { data, error } = await supabase.functions.invoke<TrainerAgentResponse>('trainer-agent');
      
      if (error) {
        console.error('שגיאה בקריאה לאייג\'נט הטריינר:', error);
        throw new Error(error.message);
      }
      
      if (!data || !data.results) {
        throw new Error('תגובה לא תקינה מהאייג\'נט הטריינר');
      }

      console.log(`התקבלו ${data.results.length} תוצאות מהאייג'נט`);
      setResults(data.results);

    } catch (err: any) {
      console.error('שגיאה בטעינת תוצאות האייג\'נט:', err);
      setError(err.message);
      toast.error('שגיאה בטעינת תוצאות האייג\'נט');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-load on component mount
    fetchResults();
  }, []);

  // Function to create LookCanvas items from agent output using database items
  const getLookItems = (agentOutput: any) => {
    const lookItems = [];
    
    console.log("יוצר פריטי look עבור:", agentOutput);
    
    if (agentOutput.top) {
      const topItem = {
        id: agentOutput.top.id || 'top-item',
        image: extractZaraImageUrl(agentOutput.top.image),
        type: 'top' as const,
        name: agentOutput.top.product_name || 'Top Item',
        price: agentOutput.top.price ? `$${agentOutput.top.price}` : '$49.99'
      };
      lookItems.push(topItem);
      console.log(`מוסיף top: ${agentOutput.top.id} עם תמונה: ${topItem.image}`);
    }
    
    if (agentOutput.bottom) {
      const bottomItem = {
        id: agentOutput.bottom.id || 'bottom-item',
        image: extractZaraImageUrl(agentOutput.bottom.image),
        type: 'bottom' as const,
        name: agentOutput.bottom.product_name || 'Bottom Item',
        price: agentOutput.bottom.price ? `$${agentOutput.bottom.price}` : '$59.99'
      };
      lookItems.push(bottomItem);
      console.log(`מוסיף bottom: ${agentOutput.bottom.id} עם תמונה: ${bottomItem.image}`);
    }
    
    if (agentOutput.shoes) {
      const shoesItem = {
        id: agentOutput.shoes.id || 'shoes-item',
        image: extractZaraImageUrl(agentOutput.shoes.image),
        type: 'shoes' as const,
        name: agentOutput.shoes.product_name || 'Shoes Item',
        price: agentOutput.shoes.price ? `$${agentOutput.shoes.price}` : '$89.99'
      };
      lookItems.push(shoesItem);
      console.log(`מוסיף shoes: ${agentOutput.shoes.id} עם תמונה: ${shoesItem.image}`);
    }
    
    if (agentOutput.coat) {
      const coatItem = {
        id: agentOutput.coat.id || 'coat-item',
        image: extractZaraImageUrl(agentOutput.coat.image),
        type: 'outerwear' as const,
        name: agentOutput.coat.product_name || 'Coat Item',
        price: agentOutput.coat.price ? `$${agentOutput.coat.price}` : '$129.99'
      };
      lookItems.push(coatItem);
      console.log(`מוסיף coat: ${agentOutput.coat.id} עם תמונה: ${coatItem.image}`);
    }
    
    console.log(`סה"כ פריטי look שנוצרו:`, lookItems.length);
    return lookItems;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">ויזואליזציה של אייג'נטי אופנה</h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowImagePath(!showImagePath)} 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
          >
            <Info className="h-4 w-4" />
            {showImagePath ? "הסתר נתיבים" : "הראה נתיבים"}
          </Button>
          <Button 
            onClick={fetchResults} 
            variant="outline" 
            size="sm" 
            disabled={loading}
            className="flex items-center gap-1"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            רענן
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">טוען תוצאות אייג'נטים...</span>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>שגיאה</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results
            .filter(result => (
              // Only show results with at least one outfit item
              result.output.top || result.output.bottom || result.output.shoes
            ))
            .map((result, index) => {
              const lookItems = getLookItems(result.output);
              
              // Create details object for display with null checks
              const details: Record<string, string> = {};
              if (result.output.top && result.output.top.product_name) {
                details.Top = result.output.top.product_name;
              } else if (result.output.top && result.output.top.id) {
                details.Top = result.output.top.id;
              }
              
              if (result.output.bottom && result.output.bottom.product_name) {
                details.Bottom = result.output.bottom.product_name;
              } else if (result.output.bottom && result.output.bottom.id) {
                details.Bottom = result.output.bottom.id;
              }
              
              if (result.output.shoes && result.output.shoes.product_name) {
                details.Shoes = result.output.shoes.product_name;
              } else if (result.output.shoes && result.output.shoes.id) {
                details.Shoes = result.output.shoes.id;
              }
              
              if (result.output.coat && result.output.coat.product_name) {
                details.Coat = result.output.coat.product_name;
              } else if (result.output.coat && result.output.coat.id) {
                details.Coat = result.output.coat.id;
              }
              
              return (
                <OutfitAgentCard 
                  key={index}
                  agentName={formatAgentName(result.agent)}
                  score={result.output.score}
                  items={lookItems}
                  details={details}
                  showImagePaths={showImagePath}
                />
              );
            })}
        </div>
      )}

      {results.length === 0 && !loading && !error && (
        <div className="py-10 text-center">
          <p className="text-gray-500">אין תוצאות אייג'נטים זמינות</p>
        </div>
      )}
      
      {/* Debug information */}
      {showImagePath && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">מידע דיבוג - פריטים מהדאטהבייס</h3>
          <p><strong>מספר תוצאות:</strong> {results.length}</p>
          <p><strong>שימוש בפריטים מהדאטהבייס:</strong> כן</p>
          <details className="mt-2">
            <summary className="cursor-pointer">הצג תוצאות אייג'נטים</summary>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
