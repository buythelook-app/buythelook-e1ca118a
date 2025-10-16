
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Info } from "lucide-react";
import { OutfitAgentCard } from "./OutfitAgentCard";
import { toast } from "sonner";
import { AgentResult, TrainerAgentResponse } from "@/types/outfitAgentTypes";
import { extractZaraImageUrl } from "@/utils/imageUtils";
import CronStatusButton from "./CronStatusButton";

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
  const [userFeedback, setUserFeedback] = useState<Record<string, { isLiked?: boolean, feedback?: string }>>({});
  const [showFeedbackInput, setShowFeedbackInput] = useState<Record<string, boolean>>({});

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔍 [DEBUG] AgentOutfitVisualizer: Starting to fetch results...");
      
      const { data, error } = await supabase.functions.invoke<TrainerAgentResponse>('trainer-agent');
      
      if (error) {
        console.error('❌ [DEBUG] Error calling trainer agent:', error);
        throw new Error(error.message);
      }
      
      if (!data || !data.results) {
        console.error('❌ [DEBUG] Invalid response from trainer agent:', data);
        throw new Error('Invalid response from trainer agent');
      }

      console.log(`✅ [DEBUG] Received ${data.results.length} results from trainer agent`);
      console.log("🔍 [DEBUG] Results data:", data.results);
      setResults(data.results);

    } catch (err: any) {
      console.error('❌ [DEBUG] Error in fetchResults:', err);
      setError(err.message);
      toast.error('Error loading agent results');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (agentName: string, liked: boolean) => {
    setUserFeedback(prev => ({
      ...prev,
      [agentName]: { ...prev[agentName], isLiked: liked }
    }));
    
    // Show feedback input only for dislike
    if (!liked) {
      setShowFeedbackInput(prev => ({ ...prev, [agentName]: true }));
    } else {
      setShowFeedbackInput(prev => ({ ...prev, [agentName]: false }));
      // Dispatch feedback event for learning immediately for likes
      window.dispatchEvent(new CustomEvent('outfit-feedback', {
        detail: { lookId: agentName, liked: true, disliked: false }
      }));
      toast.info('תודה! הלוק נשמר בהעדפות שלך');
    }
  };

  const handleFeedbackSubmit = (agentName: string) => {
    const feedback = userFeedback[agentName]?.feedback || '';
    
    // Dispatch feedback event with comment
    window.dispatchEvent(new CustomEvent('outfit-feedback', {
      detail: { 
        lookId: agentName, 
        liked: false, 
        disliked: true,
        comment: feedback 
      }
    }));
    
    setShowFeedbackInput(prev => ({ ...prev, [agentName]: false }));
    toast.info('תודה על המשוב! נשתמש בו כדי לשפר את ההמלצות');
  };

  useEffect(() => {
    console.log("🔍 [DEBUG] AgentOutfitVisualizer component mounted, auto-loading...");
    fetchResults();
  }, []);

  const getLookItems = (agentOutput: any) => {
    console.log("🔍 [DEBUG] getLookItems: Processing agent output:", agentOutput);
    const lookItems = [];
    
    if (agentOutput.top) {
      const topItem = {
        id: agentOutput.top.id || 'top-item',
        image: extractZaraImageUrl(agentOutput.top.image),
        type: 'top' as const,
        name: agentOutput.top.product_name || 'Top Item',
        price: agentOutput.top.price ? `$${agentOutput.top.price}` : '$49.99',
        url: agentOutput.top.url || `https://www.zara.com/il/en/search?searchTerm=${encodeURIComponent(agentOutput.top.product_name || 'top')}`
      };
      lookItems.push(topItem);
      console.log(`✅ [DEBUG] Added top: ${agentOutput.top.id} with image: ${topItem.image}`);
    }
    
    if (agentOutput.bottom) {
      const bottomItem = {
        id: agentOutput.bottom.id || 'bottom-item',
        image: extractZaraImageUrl(agentOutput.bottom.image),
        type: 'bottom' as const,
        name: agentOutput.bottom.product_name || 'Bottom Item',
        price: agentOutput.bottom.price ? `$${agentOutput.bottom.price}` : '$59.99',
        url: agentOutput.bottom.url || `https://www.zara.com/il/en/search?searchTerm=${encodeURIComponent(agentOutput.bottom.product_name || 'bottom')}`
      };
      lookItems.push(bottomItem);
      console.log(`✅ [DEBUG] Added bottom: ${agentOutput.bottom.id} with image: ${bottomItem.image}`);
    }
    
    // ✅ SHOES FROM "shoes" TABLE ONLY - Updated handling
    if (agentOutput.shoes) {
      console.log(`👠 [SHOES TABLE DEBUG] Processing shoes from "shoes" table:`, agentOutput.shoes);
      
      const shoesItem = {
        id: agentOutput.shoes.name || agentOutput.shoes.id || 'shoes-item',
        image: agentOutput.shoes.url || agentOutput.shoes.image || '/placeholder.svg', // Use url field from shoes table
        type: 'shoes' as const,
        name: agentOutput.shoes.name || 'Shoes Item',
        price: agentOutput.shoes.price ? `$${agentOutput.shoes.price}` : '$89.99',
        url: agentOutput.shoes.url || `https://www.zara.com/il/en/search?searchTerm=${encodeURIComponent(agentOutput.shoes.name || 'shoes')}`
      };
      lookItems.push(shoesItem);
      console.log(`✅ [SHOES TABLE] Added shoes: ${agentOutput.shoes.name} with image: ${shoesItem.image} (from "shoes" table)`);
    }
    
    if (agentOutput.coat) {
      const coatItem = {
        id: agentOutput.coat.id || 'coat-item',
        image: extractZaraImageUrl(agentOutput.coat.image),
        type: 'outerwear' as const,
        name: agentOutput.coat.product_name || 'Coat Item',
        price: agentOutput.coat.price ? `$${agentOutput.coat.price}` : '$129.99',
        url: agentOutput.coat.url || `https://www.zara.com/il/en/search?searchTerm=${encodeURIComponent(agentOutput.coat.product_name || 'coat')}`
      };
      lookItems.push(coatItem);
      console.log(`✅ [DEBUG] Added coat: ${agentOutput.coat.id} with image: ${coatItem.image}`);
    }
    
    console.log(`✅ [DEBUG] Total look items created: ${lookItems.length} (shoes from "shoes" table)`);
    return lookItems;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Fashion Agent Visualization - Shoes from "shoes" Table</h2>
        <div className="flex gap-2">
          <CronStatusButton />
          <Button 
            onClick={() => setShowImagePath(!showImagePath)} 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
          >
            <Info className="h-4 w-4" />
            {showImagePath ? "Hide Debug Info" : "Show Debug Info"}
          </Button>
          <Button 
            onClick={fetchResults} 
            variant="outline" 
            size="sm" 
            disabled={loading}
            className="flex items-center gap-1"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh & Debug
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
              result.output.top || result.output.bottom || result.output.shoes
            ))
            .map((result, index) => {
              console.log(`🔍 [DEBUG] Rendering result ${index}:`, result);
              const lookItems = getLookItems(result.output);
              
              const details: Record<string, string> = {};
              if (result.output.top && typeof result.output.top === 'object' && result.output.top.product_name) {
                details.Top = result.output.top.product_name;
              } else if (result.output.top && typeof result.output.top === 'object' && result.output.top.id) {
                details.Top = result.output.top.id;
              }
              
              if (result.output.bottom && typeof result.output.bottom === 'object' && result.output.bottom.product_name) {
                details.Bottom = result.output.bottom.product_name;
              } else if (result.output.bottom && typeof result.output.bottom === 'object' && result.output.bottom.id) {
                details.Bottom = result.output.bottom.id;
              }
              
              // ✅ ENHANCED SHOES DEBUG INFO
              if (result.output.shoes && typeof result.output.shoes === 'object' && result.output.shoes.name) {
                details.Shoes = `${result.output.shoes.name} (from shoes table)`;
              } else if (result.output.shoes && typeof result.output.shoes === 'object' && result.output.shoes.id) {
                details.Shoes = `${result.output.shoes.id} (from shoes table)`;
              }
              
              if (result.output.coat && typeof result.output.coat === 'object' && result.output.coat.product_name) {
                details.Coat = result.output.coat.product_name;
              } else if (result.output.coat && typeof result.output.coat === 'object' && result.output.coat.id) {
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
                  onLike={handleLike}
                  isLiked={userFeedback[formatAgentName(result.agent)]?.isLiked}
                  showFeedbackInput={showFeedbackInput[formatAgentName(result.agent)]}
                  feedbackValue={userFeedback[formatAgentName(result.agent)]?.feedback || ''}
                  onFeedbackChange={(value) => {
                    const name = formatAgentName(result.agent);
                    setUserFeedback(prev => ({
                      ...prev,
                      [name]: { ...prev[name], feedback: value }
                    }));
                  }}
                  onFeedbackSubmit={() => handleFeedbackSubmit(formatAgentName(result.agent))}
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
      
      {showImagePath && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">🔍 Debug Information - Shoes from "shoes" Table</h3>
          <p><strong>Number of results:</strong> {results.length}</p>
          <p><strong>Shoes source:</strong> "shoes" table only (confirmed)</p>
          <p><strong>Clothing source:</strong> "zara_cloth" table</p>
          <p><strong>Project URL:</strong> https://aqkeprwxxsryropnhfvm.supabase.co</p>
          <p><strong>Check browser console for detailed logs</strong></p>
          <details className="mt-2">
            <summary className="cursor-pointer">Show Raw Agent Results</summary>
            <pre className="mt-2 text-xs overflow-auto bg-white p-2 rounded">
              {JSON.stringify(results, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
