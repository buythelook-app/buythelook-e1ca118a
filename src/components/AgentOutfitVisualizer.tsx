
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Info } from "lucide-react";
import { OutfitAgentCard } from "./OutfitAgentCard";
import { toast } from "sonner";
import { AgentResult, TrainerAgentResponse } from "@/types/outfitAgentTypes";
import { createLocalOutfitItem } from "@/utils/localImageMapper";

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

  // Function to create LookCanvas items from agent output using local images
  const getLookItems = (agentOutput: any) => {
    const lookItems = [];
    
    console.log("יוצר פריטי look עבור:", agentOutput);
    
    if (agentOutput.top) {
      const topItem = createLocalOutfitItem(agentOutput.top, 'top');
      lookItems.push(topItem);
      console.log(`מוסיף top: ${agentOutput.top} עם תמונה: ${topItem.image}`);
    }
    
    if (agentOutput.bottom) {
      const bottomItem = createLocalOutfitItem(agentOutput.bottom, 'bottom');
      lookItems.push(bottomItem);
      console.log(`מוסיף bottom: ${agentOutput.bottom} עם תמונה: ${bottomItem.image}`);
    }
    
    if (agentOutput.shoes) {
      const shoesItem = createLocalOutfitItem(agentOutput.shoes, 'shoes');
      lookItems.push(shoesItem);
      console.log(`מוסיף shoes: ${agentOutput.shoes} עם תמונה: ${shoesItem.image}`);
    }
    
    if (agentOutput.coat) {
      const coatItem = createLocalOutfitItem(agentOutput.coat, 'top'); // Use 'top' type for coats
      lookItems.push(coatItem);
      console.log(`מוסיף coat: ${agentOutput.coat} עם תמונה: ${coatItem.image}`);
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
              
              // Create details object for display
              const details: Record<string, string> = {};
              if (result.output.top) details.Top = result.output.top;
              if (result.output.bottom) details.Bottom = result.output.bottom;
              if (result.output.shoes) details.Shoes = result.output.shoes;
              if (result.output.coat) details.Coat = result.output.coat;
              
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
          <h3 className="text-lg font-semibold mb-2">מידע דיבוג - תמונות מקומיות</h3>
          <p><strong>מספר תוצאות:</strong> {results.length}</p>
          <p><strong>שימוש בתמונות מקומיות:</strong> כן</p>
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
