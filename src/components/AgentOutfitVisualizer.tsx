
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
      });

      console.log("מזהי פריטים שנאספו:", itemIds);

      // Fetch real item data from zara_cloth table
      if (itemIds.length > 0) {
        const images: Record<string, string> = {};
        
        // Get a sample of items from the database for image mapping
        const { data: sampleItems, error: queryError } = await supabase
          .from('zara_cloth')
          .select('id, image, product_name')
          .limit(50); // Get more items for better variety
          
        if (queryError) {
          console.error('שגיאה בשליפת פריטים:', queryError);
        } else if (sampleItems && sampleItems.length > 0) {
          console.log(`נמצאו ${sampleItems.length} פריטים בדאטהבייס`);
          
          // Map each item ID to a random item from the database
          itemIds.forEach((id, index) => {
            const randomItem = sampleItems[index % sampleItems.length];
            const imageUrl = extractZaraImageUrl(randomItem.image);
            
            if (imageUrl && imageUrl !== '/placeholder.svg') {
              images[id] = imageUrl;
              console.log(`מיפוי תמונה עבור ${id}: ${imageUrl}`);
            } else {
              images[id] = `https://placehold.co/400x600/random?text=${encodeURIComponent(id)}`;
              console.log(`משתמש בפלייסהולדר עבור ${id}`);
            }
          });
        } else {
          console.log("לא נמצאו פריטים בדאטהבייס, משתמש בפלייסהולדרים");
          itemIds.forEach(id => {
            images[id] = `https://placehold.co/400x600/random?text=${encodeURIComponent(id)}`;
          });
        }
        
        setItemImages(images);
        console.log("מיפוי תמונות הושלם:", Object.keys(images).length, "פריטים");
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
    
    if (agentOutput.top && itemImages[agentOutput.top]) {
      lookItems.push({
        id: agentOutput.top,
        image: itemImages[agentOutput.top],
        type: 'top'
      });
    }
    
    if (agentOutput.bottom && itemImages[agentOutput.bottom]) {
      lookItems.push({
        id: agentOutput.bottom,
        image: itemImages[agentOutput.bottom],
        type: 'bottom'
      });
    }
    
    if (agentOutput.shoes && itemImages[agentOutput.shoes]) {
      lookItems.push({
        id: agentOutput.shoes,
        image: itemImages[agentOutput.shoes],
        type: 'shoes'
      });
    }
    
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
    </div>
  );
}
