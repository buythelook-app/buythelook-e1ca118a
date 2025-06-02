
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { LookCanvas } from "@/components/LookCanvas";
import { ThumbsUp, ThumbsDown, Play, Brain, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { AgentResult } from "@/types/outfitAgentTypes";

interface TrainingSession {
  id: string;
  agentResults: AgentResult[];
  userFeedback: {
    agentId: string;
    rating: number;
    comments: string;
    approved: boolean;
  }[];
  timestamp: Date;
}

export default function AgentTrainingPage() {
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [learningStats, setLearningStats] = useState({
    totalSessions: 0,
    improvementRate: 0,
    lastTraining: null as Date | null
  });

  const runAgentSession = async () => {
    setIsRunning(true);
    try {
      toast.info("מריץ סשן אימון עם האייג'נטים...");
      
      // Call the trainer-agent to get results
      const { data, error } = await supabase.functions.invoke('trainer-agent');
      
      if (error) throw error;
      
      const newSession: TrainingSession = {
        id: `session-${Date.now()}`,
        agentResults: data.results || [],
        userFeedback: [],
        timestamp: new Date()
      };
      
      setCurrentSession(newSession);
      toast.success("סשן אימון חדש מוכן לבדיקה!");
      
    } catch (error) {
      console.error('Error running agent session:', error);
      toast.error("שגיאה בהרצת סשן האימון");
    } finally {
      setIsRunning(false);
    }
  };

  const submitFeedback = async (agentId: string, rating: number, comments: string, approved: boolean) => {
    if (!currentSession) return;

    try {
      // Save feedback to database for learning
      const { error } = await supabase
        .from('agent_runs')
        .upsert({
          agent_name: agentId,
          score: rating,
          result: { comments, approved, session_id: currentSession.id },
          timestamp: new Date().toISOString(),
          status: approved ? 'approved' : 'needs_improvement'
        });

      if (error) throw error;

      // Update current session
      const updatedSession = {
        ...currentSession,
        userFeedback: [
          ...currentSession.userFeedback.filter(f => f.agentId !== agentId),
          { agentId, rating, comments, approved }
        ]
      };
      
      setCurrentSession(updatedSession);
      
      toast.success(`פידבק נשמר! האייג'נט ילמד מההערות שלך`);
      
      // Update learning stats
      setLearningStats(prev => ({
        totalSessions: prev.totalSessions + 1,
        improvementRate: prev.improvementRate + (approved ? 1 : -0.5),
        lastTraining: new Date()
      }));

    } catch (error) {
      console.error('Error saving feedback:', error);
      toast.error("שגיאה בשמירת הפידבק");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-purple-600" />
          מרכז אימון אייג'נטים
        </h1>
        <p className="text-gray-600 text-lg">
          הריצי אייג'נטים, תני פידבק, והם ילמדו לשפר את עצמם
        </p>
      </div>

      {/* Learning Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">סשני אימון</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learningStats.totalSessions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              שיפור
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {learningStats.improvementRate > 0 ? '+' : ''}{learningStats.improvementRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">אימון אחרון</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {learningStats.lastTraining ? 
                learningStats.lastTraining.toLocaleString('he-IL') : 
                'עדיין לא התבצע'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Start Training Button */}
      <div className="flex justify-center mb-8">
        <Button 
          onClick={runAgentSession} 
          disabled={isRunning}
          size="lg"
          className="flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              מריץ סשן אימון...
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              הרץ סשן אימון חדש
            </>
          )}
        </Button>
      </div>

      {/* Current Session Results */}
      {currentSession && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">
            תוצאות סשן אימון - {currentSession.timestamp.toLocaleTimeString('he-IL')}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentSession.agentResults
              .filter(result => result.output.top || result.output.bottom || result.output.shoes)
              .map((result, index) => {
                const existingFeedback = currentSession.userFeedback.find(f => f.agentId === result.agent);
                
                return (
                  <AgentTrainingCard 
                    key={index}
                    result={result}
                    existingFeedback={existingFeedback}
                    onSubmitFeedback={submitFeedback}
                  />
                );
              })}
          </div>
          
          {currentSession.userFeedback.length > 0 && (
            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">📚 למידה בתהליך...</h3>
              <p className="text-green-700">
                האייג'נטים לומדים מהפידבק שלך! התובנות שלך נשמרות ויעזרו לשפר המלצות עתידיות.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Training Card Component
interface AgentTrainingCardProps {
  result: AgentResult;
  existingFeedback?: {
    agentId: string;
    rating: number;
    comments: string;
    approved: boolean;
  };
  onSubmitFeedback: (agentId: string, rating: number, comments: string, approved: boolean) => void;
}

function AgentTrainingCard({ result, existingFeedback, onSubmitFeedback }: AgentTrainingCardProps) {
  const [rating, setRating] = useState(existingFeedback?.rating || 5);
  const [comments, setComments] = useState(existingFeedback?.comments || '');
  const [showFeedback, setShowFeedback] = useState(false);

  const formatAgentName = (name: string) => {
    return name.replace(/-/g, ' ').split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getLookItems = (agentOutput: any) => {
    const lookItems = [];
    
    if (agentOutput.top) {
      lookItems.push({
        id: agentOutput.top.id || 'top-item',
        image: agentOutput.top.image,
        type: 'top' as const,
        name: agentOutput.top.product_name || 'Top Item'
      });
    }
    
    if (agentOutput.bottom) {
      lookItems.push({
        id: agentOutput.bottom.id || 'bottom-item',
        image: agentOutput.bottom.image,
        type: 'bottom' as const,
        name: agentOutput.bottom.product_name || 'Bottom Item'
      });
    }
    
    if (agentOutput.shoes) {
      lookItems.push({
        id: agentOutput.shoes.id || 'shoes-item',
        image: agentOutput.shoes.image,
        type: 'shoes' as const,
        name: agentOutput.shoes.product_name || 'Shoes Item'
      });
    }
    
    return lookItems;
  };

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            {formatAgentName(result.agent)}
            <Badge variant="outline">ציון: {result.output.score}/100</Badge>
          </CardTitle>
          
          {existingFeedback && (
            <Badge variant={existingFeedback.approved ? "default" : "destructive"}>
              {existingFeedback.approved ? "אושר" : "דורש שיפור"}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Outfit Display */}
        <div className="flex justify-center">
          <LookCanvas 
            items={getLookItems(result.output)}
            width={250}
            height={350}
          />
        </div>
        
        {/* Feedback Section */}
        {!existingFeedback && (
          <div className="space-y-4">
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFeedback(true)}
                className="flex items-center gap-1"
              >
                <ThumbsUp className="h-4 w-4" />
                תן פידבק
              </Button>
            </div>
            
            {showFeedback && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    דירוג (1-10): {rating}
                  </label>
                  <Slider
                    value={[rating]}
                    onValueChange={(value) => setRating(value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">הערות לשיפור:</label>
                  <Textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="מה עובד טוב? מה צריך לשפר? איך האייג'נט יכול ללמוד?"
                    className="min-h-[80px]"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => onSubmitFeedback(result.agent, rating, comments, true)}
                    className="flex items-center gap-1"
                    size="sm"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    אשר ושמור
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => onSubmitFeedback(result.agent, rating, comments, false)}
                    className="flex items-center gap-1"
                    size="sm"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    דורש שיפור
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {existingFeedback && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>הפידבק שלך:</strong> {existingFeedback.comments}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              דירוג: {existingFeedback.rating}/10
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
