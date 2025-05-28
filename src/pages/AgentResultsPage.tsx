
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Info } from "lucide-react";
import { LookCanvas } from "@/components/LookCanvas";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { extractZaraImageUrl } from "@/utils/imageUtils";

// Types for agent results
interface AgentOutfit {
  top?: any;
  bottom?: any;
  shoes?: any;
  score?: number;
}

interface AgentResult {
  agent: string;
  output: AgentOutfit;
}

interface TrainerAgentResponse {
  success: boolean;
  status: string;
  results: AgentResult[];
}

// Helper function to format agent names
const formatAgentName = (name: string): string => {
  return name
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function AgentResultsPage() {
  const [results, setResults] = useState<AgentResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showImagePath, setShowImagePath] = useState<boolean>(false);

  useEffect(() => {
    const fetchTrainerAgentResults = async () => {
      try {
        setLoading(true);
        
        // Call the trainer-agent Edge Function
        const { data, error } = await supabase.functions.invoke<TrainerAgentResponse>('trainer-agent');
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (!data || !data.results) {
          throw new Error('Invalid response from trainer agent');
        }

        setResults(data.results);
        console.log("Agent results loaded:", data.results.length);

      } catch (err: any) {
        console.error('Error fetching trainer agent results:', err);
        setError(err.message);
        toast.error('Failed to load agent results');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerAgentResults();
  }, []);

  // Function to create LookCanvas items from agent output using database items
  const getLookItems = (agentOutput: AgentOutfit) => {
    const lookItems = [];
    
    if (agentOutput.top) {
      const topItem = {
        id: agentOutput.top.id || 'top-item',
        image: extractZaraImageUrl(agentOutput.top.image),
        type: 'top' as const,
        name: agentOutput.top.product_name || 'Top Item',
        price: agentOutput.top.price ? `$${agentOutput.top.price}` : '$49.99'
      };
      lookItems.push(topItem);
      console.log(`Added top item: ${topItem.id} with image: ${topItem.image}`);
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
      console.log(`Added bottom item: ${bottomItem.id} with image: ${bottomItem.image}`);
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
      console.log(`Added shoes item: ${shoesItem.id} with image: ${shoesItem.image}`);
    }
    
    console.log(`Total look items created: ${lookItems.length}`);
    return lookItems;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fashion Agent Results</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowImagePath(!showImagePath)}
            title="הצג/הסתר נתיבי תמונות"
          >
            <Info className="h-4 w-4 mr-1" />
            {showImagePath ? "Hide Paths" : "Show Paths"}
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
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
          {results.map((result, index) => {
            // Filter out non-visual agents or those without proper outfit data
            if (!result.output.top && !result.output.bottom && !result.output.shoes) {
              return null;
            }
            
            const lookItems = getLookItems(result.output);
            
            return (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="flex justify-between items-center">
                    <span>{formatAgentName(result.agent)}</span>
                    {result.output.score !== undefined && (
                      <Badge variant={result.output.score > 80 ? "default" : "outline"} className="ml-2">
                        Score: {result.output.score}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {lookItems.length > 0 ? (
                    <div className="bg-white rounded-md overflow-hidden">
                      <LookCanvas items={lookItems} width={300} height={480} />
                      {showImagePath && (
                        <div className="bg-gray-50 p-2 text-xs text-gray-500 mt-2 rounded">
                          <p className="font-semibold mb-1">Database Image Paths:</p>
                          {lookItems.map((item, i) => (
                            <div key={i} className="truncate">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help">{item.type}: {item.image}</span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs break-all">{item.image}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-64 bg-gray-100 rounded-md">
                      <p className="text-gray-500">No outfit items available</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-gray-50 flex justify-between">
                  <div className="text-sm text-gray-500">
                    {result.output.top && <span className="mr-2">Top: {result.output.top.product_name || result.output.top.id}</span>}
                    {result.output.bottom && <span className="mr-2">Bottom: {result.output.bottom.product_name || result.output.bottom.id}</span>}
                    {result.output.shoes && <span>Shoes: {result.output.shoes.product_name || result.output.shoes.id}</span>}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
