
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [itemImages, setItemImages] = useState<Record<string, string>>({});
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

      // Collect all item IDs from results
      const itemIds: string[] = [];
      data.results.forEach(result => {
        if (result.output.top) itemIds.push(result.output.top);
        if (result.output.bottom) itemIds.push(result.output.bottom);
        if (result.output.shoes) itemIds.push(result.output.shoes);
        if (result.output.coat) itemIds.push(result.output.coat);
      });

      console.log("מזהי פריטים שנאספו:", itemIds);

      // Fetch real item data from zara_cloth table using the actual IDs
      if (itemIds.length > 0) {
        const images: Record<string, string> = {};
        
        console.log("מחפש פריטים בדאטהבייס עם המזהים:", itemIds);
        
        const { data: itemsData, error: queryError } = await supabase
          .from('zara_cloth')
          .select('id, image, product_name')
          .in('id', itemIds);
          
        if (queryError) {
          console.error('שגיאה בשליפת פריטים:', queryError);
        } else if (itemsData && itemsData.length > 0) {
          console.log(`נמצאו ${itemsData.length} פריטים בדאטהבייס:`, itemsData);
          
          // Map each item ID to its actual image
          itemsData.forEach(item => {
            console.log(`מעבד פריט ${item.id}:`, item.product_name, 'תמונה:', item.image);
            
            const imageUrl = extractZaraImageUrl(item.image);
            
            if (imageUrl && imageUrl !== '/placeholder.svg') {
              images[item.id] = imageUrl;
              console.log(`מיפוי תמונה עבור ${item.id}: ${imageUrl}`);
            } else {
              images[item.id] = '/placeholder.svg';
              console.log(`משתמש בפלייסהולדר עבור ${item.id}, תמונה מקורית:`, item.image);
            }
          });
        } else {
          console.log("לא נמצאו פריטים בדאטהבייס עם המזהים:", itemIds);
        }
        
        setItemImages(images);
        console.log("מיפוי תמונות הושלם:", Object.keys(images).length, "פריטים");
        console.log("מיפוי תמונות מלא:", images);
      }
    } catch (err: any) {
      console.error('שגיאה בטעינת תוצאות האייג\'נט:', err);
      setError(err.message);
      toast.error('שגיאה בטעינת תוצאות האייג\'נט');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Function to create LookCanvas items from agent output
  const getLookItems = (agentOutput: any) => {
    const lookItems = [];
    
    console.log("יוצר פריטי look עבור:", agentOutput);
    console.log("תמונות זמינות:", itemImages);
    
    if (agentOutput.top && itemImages[agentOutput.top]) {
      console.log(`מוסיף top: ${agentOutput.top} עם תמונה: ${itemImages[agentOutput.top]}`);
      lookItems.push({
        id: agentOutput.top,
        image: itemImages[agentOutput.top],
        type: 'top'
      });
    } else {
      console.log(`לא ניתן להוסיף top: ${agentOutput.top}, תמונה זמינה: ${!!itemImages[agentOutput.top]}`);
    }
    
    if (agentOutput.bottom && itemImages[agentOutput.bottom]) {
      console.log(`מוסיף bottom: ${agentOutput.bottom} עם תמונה: ${itemImages[agentOutput.bottom]}`);
      lookItems.push({
        id: agentOutput.bottom,
        image: itemImages[agentOutput.bottom],
        type: 'bottom'
      });
    } else {
      console.log(`לא ניתן להוסיף bottom: ${agentOutput.bottom}, תמונה זמינה: ${!!itemImages[agentOutput.bottom]}`);
    }
    
    if (agentOutput.shoes && itemImages[agentOutput.shoes]) {
      console.log(`מוסיף shoes: ${agentOutput.shoes} עם תמונה: ${itemImages[agentOutput.shoes]}`);
      lookItems.push({
        id: agentOutput.shoes,
        image: itemImages[agentOutput.shoes],
        type: 'shoes'
      });
    } else {
      console.log(`לא ניתן להוסיף shoes: ${agentOutput.shoes}, תמונה זמינה: ${!!itemImages[agentOutput.shoes]}`);
    }
    
    if (agentOutput.coat && itemImages[agentOutput.coat]) {
      console.log(`מוסיף coat: ${agentOutput.coat} עם תמונה: ${itemImages[agentOutput.coat]}`);
      lookItems.push({
        id: agentOutput.coat,
        image: itemImages[agentOutput.coat],
        type: 'coat'
      });
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
          <h3 className="text-lg font-semibold mb-2">מידע דיבוג</h3>
          <p><strong>מספר תוצאות:</strong> {results.length}</p>
          <p><strong>מספר תמונות זמינות:</strong> {Object.keys(itemImages).length}</p>
          <details className="mt-2">
            <summary className="cursor-pointer">הצג מיפוי תמונות</summary>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify(itemImages, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
