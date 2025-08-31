
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LookCanvas } from "@/components/LookCanvas";
import { agentCrew } from "@/agents/crew";
import { HomeButton } from "@/components/HomeButton";
import { AutoTrainerController } from "@/components/AutoTrainerController";

interface TrainingSession {
  id: string;
  timestamp: Date;
  outfitData: any;
  userRating: number | null;
  userComments: string;
  approved: boolean | null;
}

export default function AgentTrainingPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [comments, setComments] = useState("");
  const [rating, setRating] = useState<number | null>(null);

  const runAgentSession = async () => {
    setIsRunning(true);
    try {
      // Run the agent crew to generate an outfit
      const result = await agentCrew.run("training-user");
      
      if (result.success && result.data) {
        const newSession: TrainingSession = {
          id: Date.now().toString(),
          timestamp: new Date(),
          outfitData: result.data,
          userRating: null,
          userComments: "",
          approved: null
        };
        
        setCurrentSession(newSession);
        toast.success("Agent session completed successfully");
      } else {
        toast.error("Agent session failed: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error running agent session:", error);
      toast.error("Error running agent session");
    } finally {
      setIsRunning(false);
    }
  };

  const submitFeedback = async (approved: boolean) => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      userRating: rating,
      userComments: comments,
      approved: approved
    };

    // Save to sessions history
    setSessions(prev => [updatedSession, ...prev]);
    
    // TODO: Send feedback to training system
    // This would typically save to a database or training service
    console.log("Training feedback:", {
      sessionId: updatedSession.id,
      outfit: updatedSession.outfitData,
      rating: rating,
      comments: comments,
      approved: approved
    });

    toast.success(approved ? "Outfit approved for training" : "Outfit rejected, feedback saved");
    
    // Reset form
    setCurrentSession(null);
    setComments("");
    setRating(null);
  };

  const firstLook = currentSession?.outfitData?.looks?.[0];
  
  // DEBUG: Log the outfit data structure
  console.log('🔍 [AgentTraining] Current session outfit data:', currentSession?.outfitData);
  console.log('🔍 [AgentTraining] First look:', firstLook);
  console.log('🔍 [AgentTraining] First look items:', firstLook?.items);
  
  const canvasItems = firstLook?.items ? firstLook.items.map((item: any, idx: number) => {
    console.log(`🔍 [AgentTraining] Processing item ${idx}:`, {
      id: item.id,
      name: item.name || item.product_name,
      type: item.type,
      image: item.image,
      hasImage: !!item.image
    });
    
    return {
      id: item.id || `${item.type || 'item'}-${idx}`,
      image: item.image || "/placeholder.svg",
      type: (item.type || 'item'),
      name: item.name || item.product_name || "Item"
    };
  }) : [];
  
  console.log('🔍 [AgentTraining] Canvas items prepared:', canvasItems);

  return (
    <>
      <HomeButton />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">מרכז אילוף סטיילסטית AI</h1>
        
        {/* Auto Training Controller */}
        <div className="mb-8 flex justify-center">
          <AutoTrainerController />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Agent Controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Run Agent Session</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={runAgentSession} 
                  disabled={isRunning}
                  className="w-full"
                >
                  {isRunning ? "Running Agent..." : "Generate New Outfit"}
                </Button>
              </CardContent>
            </Card>

            {/* Current Session Feedback */}
            {currentSession && (
              <Card>
                <CardHeader>
                  <CardTitle>Provide Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Rating (1-5 stars)
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`text-2xl ${
                            rating && star <= rating ? "text-yellow-400" : "text-gray-300"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Comments
                    </label>
                    <Textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Provide feedback about the outfit combination..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => submitFeedback(true)}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      ✓ Approve
                    </Button>
                    <Button
                      onClick={() => submitFeedback(false)}
                      variant="destructive"
                      className="flex-1"
                    >
                      ✗ Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Outfit Display */}
          <div className="space-y-6">
            {currentSession && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Outfit</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Style Profile & Body Structure Info */}
                  <div className="mb-4 space-y-2">
                    {currentSession.outfitData?.styleProfile && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">סגנון:</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {currentSession.outfitData.styleProfile}
                        </span>
                      </div>
                    )}
                    {currentSession.outfitData?.bodyStructure && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">מבנה גוף:</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                          {currentSession.outfitData.bodyStructure}
                        </span>
                      </div>
                    )}
                    {currentSession.outfitData?.score && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">ציון הסטיילסטית:</span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                          {currentSession.outfitData.score}/100
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center mb-4">
                    <LookCanvas items={canvasItems} width={250} height={400} />
                  </div>
                  
                  {(firstLook?.description || currentSession.outfitData?.reasoning) && (
                    <p className="text-sm text-gray-600 mb-2">
                      {firstLook?.description || currentSession.outfitData.reasoning}
                    </p>
                  )}

                  {currentSession.outfitData.recommendations && (
                    <div>
                      <h4 className="font-medium mb-2">Recommendations:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {currentSession.outfitData.recommendations.map((rec: string, idx: number) => (
                          <li key={idx}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Training History */}
        {sessions.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Training History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div 
                    key={session.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div>
                      <span className="text-sm text-gray-500">
                        {session.timestamp.toLocaleString()}
                      </span>
                      {session.userRating && (
                        <span className="ml-2">
                          {"★".repeat(session.userRating)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span 
                        className={`px-2 py-1 rounded text-xs ${
                          session.approved === true ? "bg-green-100 text-green-800" :
                          session.approved === false ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {session.approved === true ? "Approved" : 
                         session.approved === false ? "Rejected" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
