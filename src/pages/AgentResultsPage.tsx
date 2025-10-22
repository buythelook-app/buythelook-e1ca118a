
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Info, ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { LookCanvas } from "@/components/LookCanvas";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { extractZaraImageUrl } from "@/utils/imageUtils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [likes, setLikes] = useState<Record<string, boolean | null>>({});

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

  const handleRating = (agentName: string, rating: number) => {
    setRatings(prev => ({ ...prev, [agentName]: rating }));
  };

  const handleLike = (agentName: string, isLiked: boolean) => {
    setLikes(prev => ({ ...prev, [agentName]: isLiked }));
  };

  const handleFeedbackChange = (agentName: string, text: string) => {
    setFeedback(prev => ({ ...prev, [agentName]: text }));
  };

  const submitFeedback = async (agentName: string, outfitData: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.id) {
      toast.error("יש להתחבר כדי לשמור פידבק");
      return;
    }
    
    const feedbackData = {
      user_id: user.id,
      look_id: `agent-${agentName}-${Date.now()}`,
      is_liked: likes[agentName] === true,
      is_disliked: likes[agentName] === false,
      comment: feedback[agentName] || null,
      feedback_type: 'agent_outfit_rating',
      look_data: {
        agent: agentName,
        rating: ratings[agentName],
        outfit: outfitData,
        timestamp: new Date().toISOString()
      }
    };

    const { error } = await (supabase as any)
      .from('user_feedback')
      .insert(feedbackData);

    if (error) {
      console.error('Error saving feedback:', error);
      toast.error("נכשל בשמירת הפידבק: " + error.message);
    } else {
      toast.success("הפידבק נשמר! מעבר ללוק הבא...");
      
      // Trigger learning process
      const { feedbackProcessingService } = await import('@/services/feedbackProcessingService');
      await feedbackProcessingService.processFeedback(user?.id || null);
      
      // Remove this agent's result from the list
      setResults(prev => prev.filter(result => result.agent !== agentName));
      
      // Clear feedback state for this agent
      setFeedback(prev => ({ ...prev, [agentName]: '' }));
      setRatings(prev => ({ ...prev, [agentName]: 0 }));
      setLikes(prev => ({ ...prev, [agentName]: null }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6 bg-fashion-glass rounded-2xl p-6">
          <h1 className="text-3xl font-bold fashion-hero-text">Fashion Agent Results</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowImagePath(!showImagePath)}
              title="הצג/הסתר נתיבי תמונות"
              className="bg-fashion-glass hover:bg-accent/20"
            >
              <Info className="h-4 w-4 mr-1" />
              {showImagePath ? "Hide Paths" : "Show Paths"}
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="bg-fashion-glass hover:bg-accent/20">Back</Button>
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
              <Card key={index} className="overflow-hidden bg-fashion-glass fashion-card-hover">
                <CardHeader className="bg-accent/10">
                  <CardTitle className="flex justify-between items-center">
                    <span>{formatAgentName(result.agent)}</span>
                    {result.output.score !== undefined && (
                      <Badge variant={result.output.score > 80 ? "default" : "outline"} className="ml-2">
                        Score: {result.output.score}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {lookItems.length > 0 ? (
                    <>
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

                      {/* Rating & Feedback Section */}
                      <div className="space-y-3 pt-4 border-t border-fashion-primary/20">
                        {/* Star Rating */}
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">דירוג:</Label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRating(result.agent, star)}
                                className="transition-transform hover:scale-110"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= (ratings[result.agent] || 0)
                                      ? 'fill-fashion-accent text-fashion-accent'
                                      : 'text-muted-foreground hover:text-fashion-accent/50'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Like/Dislike */}
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">אהבתי/לא אהבתי:</Label>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={likes[result.agent] === true ? "default" : "outline"}
                              onClick={() => handleLike(result.agent, true)}
                              className={likes[result.agent] === true 
                                ? "bg-gradient-to-r from-fashion-primary to-fashion-accent" 
                                : "border-fashion-primary/20 hover:bg-fashion-primary/10"}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={likes[result.agent] === false ? "default" : "outline"}
                              onClick={() => handleLike(result.agent, false)}
                              className={likes[result.agent] === false 
                                ? "bg-red-500 hover:bg-red-600" 
                                : "border-fashion-primary/20 hover:bg-red-50"}
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Feedback Text */}
                        <div className="space-y-2">
                          <Label htmlFor={`feedback-${result.agent}`} className="text-sm font-medium">
                            הערות נוספות:
                          </Label>
                          <Textarea
                            id={`feedback-${result.agent}`}
                            placeholder="מה דעתך על הלוק הזה? הפידבק שלך עוזר לאייגנטים ללמוד..."
                            value={feedback[result.agent] || ''}
                            onChange={(e) => handleFeedbackChange(result.agent, e.target.value)}
                            className="border-fashion-primary/20 focus:border-fashion-primary"
                            rows={3}
                          />
                        </div>

                        <Button
                          onClick={() => submitFeedback(result.agent, result.output)}
                          disabled={!ratings[result.agent] && likes[result.agent] === null && !feedback[result.agent]}
                          className="w-full bg-gradient-to-r from-fashion-primary to-fashion-accent hover:opacity-90 disabled:opacity-50"
                        >
                          שלח פידבק
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-center items-center h-64 bg-gray-100 rounded-md">
                      <p className="text-gray-500">No outfit items available</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-accent/10 flex justify-between">
                  <div className="text-sm text-muted-foreground">
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
    </div>
  );
}
