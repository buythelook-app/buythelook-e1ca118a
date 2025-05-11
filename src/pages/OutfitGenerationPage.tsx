
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  AgentOutfit, 
  AgentResult, 
  TrainerAgentResponse,
  OutfitItem,
  ApprovalData
} from "@/types/outfitAgentTypes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { OutfitAgentCard } from "@/components/OutfitAgentCard";
import { Navbar } from "@/components/Navbar";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper to format agent names nicely
const formatAgentName = (name: string): string => {
  return name
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function OutfitGenerationPage() {
  const [results, setResults] = useState<AgentResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [itemImages, setItemImages] = useState<Record<string, string>>({});
  const [approvalData, setApprovalData] = useState<Record<string, ApprovalData>>({});
  const [activeTab, setActiveTab] = useState<string>("all");
  const [savingFeedback, setSavingFeedback] = useState<boolean>(false);

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

      // Load saved approvals
      const { data: savedApprovals, error: approvalsError } = await supabase
        .from('agent_feedback')
        .select('*');

      if (!approvalsError && savedApprovals) {
        const approvalMap: Record<string, ApprovalData> = {};
        savedApprovals.forEach((item: any) => {
          approvalMap[item.agent_name] = {
            agentName: item.agent_name,
            outfitId: item.outfit_id,
            approved: item.approved,
            feedback: item.feedback
          };
        });
        setApprovalData(approvalMap);
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
  const getLookItems = (agentOutput: AgentOutfit): OutfitItem[] => {
    const lookItems: OutfitItem[] = [];
    
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

  // Handle outfit approval
  const handleApprove = async (agentName: string, feedback?: string) => {
    setSavingFeedback(true);
    try {
      const result = results.find(r => formatAgentName(r.agent) === agentName);
      if (!result) {
        throw new Error("Agent result not found");
      }

      // Determine outfit ID based on outfit items
      const outfitId = `${result.output.top || ''}-${result.output.bottom || ''}-${result.output.shoes || ''}`;

      // Save to database
      const { error: saveError } = await supabase
        .from('agent_feedback')
        .upsert({
          agent_name: agentName,
          outfit_id: outfitId,
          approved: true,
          feedback: feedback || null,
          timestamp: new Date().toISOString()
        }, { onConflict: 'agent_name' });

      if (saveError) {
        throw saveError;
      }

      // Update local state
      setApprovalData(prev => ({
        ...prev,
        [agentName]: {
          agentName,
          outfitId,
          approved: true,
          feedback
        }
      }));

      toast.success(`Approved outfit by ${agentName}`);
    } catch (error: any) {
      console.error("Error saving approval:", error);
      toast.error("Failed to save approval");
    } finally {
      setSavingFeedback(false);
    }
  };

  // Handle outfit rejection
  const handleReject = async (agentName: string, feedback?: string) => {
    setSavingFeedback(true);
    try {
      const result = results.find(r => formatAgentName(r.agent) === agentName);
      if (!result) {
        throw new Error("Agent result not found");
      }

      // Determine outfit ID based on outfit items
      const outfitId = `${result.output.top || ''}-${result.output.bottom || ''}-${result.output.shoes || ''}`;

      // Save to database
      const { error: saveError } = await supabase
        .from('agent_feedback')
        .upsert({
          agent_name: agentName,
          outfit_id: outfitId,
          approved: false,
          feedback: feedback || null,
          timestamp: new Date().toISOString()
        }, { onConflict: 'agent_name' });

      if (saveError) {
        throw saveError;
      }

      // Update local state
      setApprovalData(prev => ({
        ...prev,
        [agentName]: {
          agentName,
          outfitId,
          approved: false,
          feedback
        }
      }));

      toast.success(`Rejected outfit by ${agentName}`);
    } catch (error: any) {
      console.error("Error saving rejection:", error);
      toast.error("Failed to save rejection");
    } finally {
      setSavingFeedback(false);
    }
  };

  // Filter results based on active tab
  const filteredResults = activeTab === 'all' 
    ? results 
    : activeTab === 'approved'
      ? results.filter(r => approvalData[formatAgentName(r.agent)]?.approved)
      : activeTab === 'rejected'
        ? results.filter(r => approvalData[formatAgentName(r.agent)]?.approved === false)
        : results.filter(r => !approvalData[formatAgentName(r.agent)]);

  return (
    <div className="min-h-screen bg-netflix-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Fashion AI Agent Results</h1>
          <Button 
            onClick={fetchResults} 
            variant="outline" 
            size="sm" 
            disabled={loading}
            className="flex items-center gap-1"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh Results
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
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Overview</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Top Item</TableHead>
                    <TableHead>Bottom Item</TableHead>
                    <TableHead>Shoes</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => {
                    const formattedName = formatAgentName(result.agent);
                    const approvalInfo = approvalData[formattedName];
                    
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{formattedName}</TableCell>
                        <TableCell>{result.output.top || 'N/A'}</TableCell>
                        <TableCell>{result.output.bottom || 'N/A'}</TableCell>
                        <TableCell>{result.output.shoes || 'N/A'}</TableCell>
                        <TableCell>
                          {result.output.score !== undefined ? (
                            <Badge variant={result.output.score > 80 ? "default" : "outline"}>
                              {result.output.score}
                            </Badge>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          {approvalInfo ? (
                            <Badge variant={approvalInfo.approved ? "success" : "destructive"}>
                              {approvalInfo.approved ? "Approved" : "Rejected"}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <h2 className="text-2xl font-semibold mb-4">Visual Outfits</h2>
            
            <Tabs defaultValue="all" className="mb-6" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Outfits</TabsTrigger>
                <TabsTrigger value="pending">Pending Review</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults
                .filter(result => (
                  // Only show results with at least one outfit item
                  result.output.top || result.output.bottom || result.output.shoes
                ))
                .map((result, index) => {
                  const lookItems = getLookItems(result.output);
                  const formattedName = formatAgentName(result.agent);
                  const approvalInfo = approvalData[formattedName];
                  
                  // Create details object for display
                  const details: Record<string, string> = {};
                  if (result.output.top) details.Top = result.output.top;
                  if (result.output.bottom) details.Bottom = result.output.bottom;
                  if (result.output.shoes) details.Shoes = result.output.shoes;
                  
                  // Include description if available
                  if (result.output.description) {
                    details.Description = result.output.description;
                  }
                  
                  return (
                    <OutfitAgentCard 
                      key={index}
                      agentName={formattedName}
                      score={result.output.score}
                      items={lookItems}
                      details={details}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      isApproved={approvalInfo?.approved}
                      feedback={approvalInfo?.feedback}
                    />
                  );
                })}
            </div>

            {filteredResults.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">No outfits found for the selected filter.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
