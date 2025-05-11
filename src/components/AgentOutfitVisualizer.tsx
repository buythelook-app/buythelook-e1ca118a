
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { OutfitAgentCard } from "./OutfitAgentCard";
import { toast } from "sonner";

// Types for agent results
interface AgentOutfit {
  top?: string;
  bottom?: string;
  shoes?: string;
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

      // Create mock image URLs for demo purposes
      const mockImages: Record<string, string> = {};
      itemIds.forEach((id) => {
        // Generate placeholder images using dummy image service
        mockImages[id] = `https://placehold.co/400x600/random?text=${id}`;
      });

      setItemImages(mockImages);
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
  const getLookItems = (agentOutput: AgentOutfit) => {
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
