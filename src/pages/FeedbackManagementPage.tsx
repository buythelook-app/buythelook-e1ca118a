import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Trash2, RefreshCw, Filter, TrendingUp, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface FeedbackItem {
  id: string;
  user_id: string | null;
  agent_name: string;
  result: any;
  score: number;
  status: string;
  timestamp: string;
  body_type: string | null;
}

interface AgentRun {
  id: string;
  agent_name: string;
  user_id: string;
  result: any;
  score: number;
  status: string;
  timestamp: string;
  body_type: string;
}

const FeedbackManagementPage = () => {
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('feedback');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch feedback data from agent_runs (using as feedback)
      const { data: feedback, error: feedbackError } = await supabase
        .from('agent_runs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (feedbackError) throw feedbackError;

      // Fetch additional agent runs
      const { data: runs, error: runsError } = await supabase
        .from('agent_runs')
        .select('*')
        .eq('status', 'success')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (runsError) throw runsError;

      setFeedbackData((feedback || []) as FeedbackItem[]);
      setAgentRuns((runs || []) as AgentRun[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בטעינת הנתונים",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agent_runs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFeedbackData(prev => prev.filter(item => item.id !== id));
      toast({
        title: "הצלחה",
        description: "הרשומה נמחקה בהצלחה"
      });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה במחיקת הפידבק",
        variant: "destructive"
      });
    }
  };

  const resetAllData = async () => {
    try {
      // Delete all agent runs (used as feedback)
      const { error: feedbackError } = await supabase
        .from('agent_runs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (feedbackError) throw feedbackError;

      setFeedbackData([]);
      setAgentRuns([]);
      
      toast({
        title: "הצלחה",
        description: "כל הנתונים נמחקו בהצלחה"
      });
    } catch (error) {
      console.error('Error resetting data:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה באיפוס הנתונים",
        variant: "destructive"
      });
    }
  };

  const toggleTrainingUsage = async (id: string, currentScore: number) => {
    try {
      const newScore = currentScore > 50 ? 30 : 80; // Toggle between high and low score
      
      const { error } = await supabase
        .from('agent_runs')
        .update({ score: newScore })
        .eq('id', id);

      if (error) throw error;

      setFeedbackData(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, score: newScore }
            : item
        )
      );

      toast({
        title: "הצלחה",
        description: `הציון ${newScore > 50 ? 'הועלה' : 'הופחת'} לאימון`
      });
    } catch (error) {
      console.error('Error updating training usage:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בעדכון סטטוס האימון",
        variant: "destructive"
      });
    }
  };

  const getFeedbackTypeColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'learning_data': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <div className="container mx-auto p-6" dir="rtl">
        <div className="mb-6 bg-fashion-glass rounded-2xl p-6">
          <h1 className="text-3xl font-bold fashion-hero-text">ניהול פידבק ולמידה</h1>
          <p className="text-muted-foreground mt-2">
            נהל פידבק משתמשים ותוצאות סוכנים לשיפור המערכת
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <Button onClick={fetchData} variant="outline" className="bg-fashion-glass hover:bg-accent/20">
            <RefreshCw className="w-4 h-4 ml-2" />
            רענן נתונים
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="bg-destructive/80 hover:bg-destructive">
                <Trash2 className="w-4 h-4 ml-2" />
                איפוס כל הנתונים
              </Button>
            </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
              <AlertDialogDescription>
                פעולה זו תמחק את כל הפידבק ותוצאות הסוכנים. לא ניתן לבטל פעולה זו.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction onClick={resetAllData}>
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3 bg-fashion-glass">
            <TabsTrigger value="feedback">פידבק משתמשים</TabsTrigger>
            <TabsTrigger value="agents">תוצאות סוכנים</TabsTrigger>
            <TabsTrigger value="analytics">אנליטיקה</TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="space-y-4">
            <Card className="bg-fashion-glass">
              <CardHeader>
                <CardTitle>רשומות סוכנים ({feedbackData.length})</CardTitle>
                <CardDescription>
                  כל הרשומות שנוצרו על ידי הסוכנים השונים
                </CardDescription>
              </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackData.map((feedback) => (
                  <Card key={feedback.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getFeedbackTypeColor(feedback.status)}>
                              {feedback.status}
                            </Badge>
                            <Badge variant={feedback.score > 50 ? "default" : "secondary"}>
                              ציון: {feedback.score}
                            </Badge>
                            <Badge variant="outline">{feedback.agent_name}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(feedback.timestamp), 'dd/MM/yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm">סוכן: {feedback.agent_name}</p>
                          {feedback.body_type && (
                            <p className="text-xs text-muted-foreground mt-2">
                              סוג גוף: {feedback.body_type}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleTrainingUsage(feedback.id, feedback.score)}
                          >
                            {feedback.score > 50 ? 'הפחת ציון' : 'העלה ציון'}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>מחק רשומה</AlertDialogTitle>
                                <AlertDialogDescription>
                                  האם אתה בטוח שברצונך למחוק רשומה זו?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>ביטול</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteFeedback(feedback.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {feedbackData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    אין רשומות זמינות
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          <TabsContent value="agents" className="space-y-4">
            <Card className="bg-fashion-glass">
              <CardHeader>
                <CardTitle>תוצאות סוכנים ({agentRuns.length})</CardTitle>
                <CardDescription>
                  כל הריצות וההערכות של הסוכנים השונים
                </CardDescription>
              </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentRuns.map((run) => (
                  <Card key={run.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{run.agent_name}</Badge>
                            <Badge className={getAgentStatusColor(run.status)}>
                              {run.status}
                            </Badge>
                            <Badge variant="secondary">
                              ציון: {run.score}
                            </Badge>
                            {run.body_type && (
                              <Badge variant="outline">{run.body_type}</Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(run.timestamp), 'dd/MM/yyyy HH:mm')}
                            </span>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium">תוצאה:</p>
                            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto max-w-full">
                              {JSON.stringify(run.result, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {agentRuns.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    אין תוצאות סוכנים זמינות
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-fashion-glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">כלל הפידבק</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{feedbackData.length}</div>
                <p className="text-xs text-muted-foreground">
                  פריטי פידבק שנאספו
                </p>
              </CardContent>
            </Card>

              <Card className="bg-fashion-glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">פידבק לאימון</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {feedbackData.filter(f => f.score > 50).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  פריטים בשימוש לאימון
                </p>
              </CardContent>
            </Card>

              <Card className="bg-fashion-glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ריצות סוכנים</CardTitle>
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{agentRuns.length}</div>
                <p className="text-xs text-muted-foreground">
                  כלל הריצות שבוצעו
                </p>
              </CardContent>
            </Card>

              <Card className="bg-fashion-glass">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ציון ממוצע</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agentRuns.length > 0 
                    ? (agentRuns.reduce((sum, run) => sum + run.score, 0) / agentRuns.length).toFixed(1)
                    : '0'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  ציון ביצועים ממוצע
                </p>
              </CardContent>
            </Card>
          </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-fashion-glass">
                <CardHeader>
                  <CardTitle>פיצול סוגי פידבק</CardTitle>
                </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['success', 'failed', 'learning_data'].map(type => {
                    const count = feedbackData.filter(f => f.status === type).length;
                    const percentage = feedbackData.length > 0 ? (count / feedbackData.length * 100).toFixed(1) : '0';
                    return (
                      <div key={type} className="flex justify-between items-center">
                        <span className="capitalize">{type}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{count}</span>
                          <span className="text-sm">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

              <Card className="bg-fashion-glass">
                <CardHeader>
                  <CardTitle>ביצועי סוכנים</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.from(new Set(agentRuns.map(r => r.agent_name))).map(agentName => {
                      const agentRuns_filtered = agentRuns.filter(r => r.agent_name === agentName);
                      const avgScore = agentRuns_filtered.length > 0 
                        ? (agentRuns_filtered.reduce((sum, run) => sum + run.score, 0) / agentRuns_filtered.length).toFixed(1)
                        : '0';
                      return (
                        <div key={agentName} className="flex justify-between items-center">
                          <span>{agentName}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {agentRuns_filtered.length} ריצות
                            </span>
                            <span className="text-sm">ציון: {avgScore}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FeedbackManagementPage;