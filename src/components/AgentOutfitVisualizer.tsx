
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Info } from "lucide-react";
import { OutfitAgentCard } from "./OutfitAgentCard";
import { toast } from "sonner";
import { AgentResult, TrainerAgentResponse } from "@/types/outfitAgentTypes";

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
      
      // Call the trainer-agent Edge Function
      const { data, error } = await supabase.functions.invoke<TrainerAgentResponse>('trainer-agent');
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data || !data.results) {
        throw new Error('Invalid response from trainer agent');
      }

      setResults(data.results);

      // Collect all item IDs from results
      const itemIds: string[] = [];
      data.results.forEach(result => {
        if (result.output.top) itemIds.push(result.output.top);
        if (result.output.bottom) itemIds.push(result.output.bottom);
        if (result.output.shoes) itemIds.push(result.output.shoes);
      });

      // Fetch real item data from zara_cloth table
      if (itemIds.length > 0) {
        const images: Record<string, string> = {};
        
        for (const id of itemIds) {
          try {
            // Extract the type (top, bottom, shoes) and color from the ID
            const match = id.match(/(top|bottom|shoes|coat)-([a-fA-F0-9]+)/);
            
            if (!match) {
              console.error(`Invalid item ID format: ${id}`);
              continue;
            }
            
            const itemType = match[1];
            const colorCode = match[2];
            
            console.log(`Fetching ${itemType} with color code: ${colorCode}`);
            
            // Query for items with matching type and similar color
            const { data: items, error: queryError } = await supabase
              .from('zara_cloth')
              .select('id, image, product_name, product_family')
              .limit(1);
              
            if (queryError) {
              console.error(`Error fetching items for ${id}:`, queryError);
              continue;
            }
            
            if (items && items.length > 0) {
              console.log(`Found item for ${id}:`, items[0]);
              
              // Get the image data from the first item
              const imageData = items[0].image;
              
              // Extract the URL from the JSONB data
              let imageUrl = '';
              
              if (typeof imageData === 'string') {
                // If it's already a string URL
                imageUrl = imageData;
              } else if (Array.isArray(imageData) && imageData.length > 0) {
                // If it's an array of URLs, take the first one
                imageUrl = typeof imageData[0] === 'string' ? imageData[0] : '';
              } else if (imageData && typeof imageData === 'object') {
                // If it's a complex object with a URL field
                if (imageData.urls && Array.isArray(imageData.urls) && imageData.urls.length > 0) {
                  imageUrl = imageData.urls[0];
                } else if (imageData.url) {
                  imageUrl = imageData.url;
                }
              }
              
              // If we couldn't parse the image URL, log an error
              if (!imageUrl) {
                console.error(`Could not extract image URL from data:`, imageData);
                imageUrl = `https://placehold.co/400x600/random?text=${id}`;
              } else {
                console.log(`Successfully extracted image URL: ${imageUrl}`);
              }
              
              images[id] = imageUrl;
            } else {
              // Fallback to placeholder if no match found
              images[id] = `https://placehold.co/400x600/random?text=${id}`;
              console.log(`No database item found for ${id}, using placeholder`);
            }
          } catch (itemError) {
            console.error(`Error processing item ${id}:`, itemError);
            images[id] = `https://placehold.co/400x600/random?text=${id}`;
          }
        }
        
        setItemImages(images);
      }
    } catch (err: any) {
      console.error('Error fetching trainer agent results:', err);
      setError(err.message);
      toast.error('Failed to load agent results');
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
        <h2 className="text-2xl font-bold">AI Agent Outfit Visualizations</h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowImagePath(!showImagePath)} 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
          >
            <Info className="h-4 w-4" />
            {showImagePath ? "Hide Paths" : "Show Paths"}
          </Button>
          <Button 
            onClick={fetchResults} 
            variant="outline" 
            size="sm" 
            disabled={loading}
            className="flex items-center gap-1"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading agent results...</span>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
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
          <p className="text-gray-500">No agent results available</p>
        </div>
      )}
    </div>
  );
}
