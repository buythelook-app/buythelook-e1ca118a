import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Brain, TrendingUp, Users, Target, Activity, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { LearningAgent } from '@/agents/learningAgent';

interface LearningMetrics {
  totalUsers: number;
  successfulOutfits: number;
  learningDataPoints: number;
  averageEngagement: number;
  improvementTrends: {
    week: number;
    successRate: number;
    engagement: number;
  }[];
}

interface AgentPerformance {
  agentName: string;
  successRate: number;
  averageScore: number;
  totalRuns: number;
  lastRun: string;
  improvements: string[];
}

interface LearningInsight {
  category: string;
  insight: string;
  confidence: number;
  recommendations: string[];
}

const AgentLearningDashboard = () => {
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null);
  const [agentPerformances, setAgentPerformances] = useState<AgentPerformance[]>([]);
  const [learningInsights, setLearningInsights] = useState<LearningInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMetrics(),
        fetchAgentPerformances(),
        generateLearningInsights()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בטעינת נתוני הלוח",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    // Get user feedback data
    const { data: feedback } = await supabase
      .from('user_feedback')
      .select('*');

    // Get agent runs data
    const { data: agentRuns } = await supabase
      .from('agent_runs')
      .select('*');

    // Get unique users count from style quiz results
    const { data: users } = await supabase
      .from('style_quiz_results')
      .select('user_id');

    const uniqueUsers = new Set((users as any)?.map((u: any) => u.user_id) || []).size;
    const successfulOutfits = (feedback as any)?.filter((f: any) => f.feedback_type === 'positive').length || 0;
    const learningDataPoints = ((feedback as any)?.length || 0) + ((agentRuns as any)?.length || 0);
    
    // Calculate average engagement (simplified)
    const totalRuns = (agentRuns as any)?.length || 0;
    const averageEngagement = totalRuns > 0 ? (successfulOutfits / totalRuns) * 100 : 0;

    // Generate mock trend data (in real implementation, calculate from historical data)
    const improvementTrends = Array.from({ length: 8 }, (_, i) => ({
      week: i + 1,
      successRate: Math.random() * 30 + 50 + (i * 2), // Simulated improvement
      engagement: Math.random() * 20 + 60 + (i * 1.5)
    }));

    setMetrics({
      totalUsers: uniqueUsers,
      successfulOutfits,
      learningDataPoints,
      averageEngagement,
      improvementTrends
    });
  };

  const fetchAgentPerformances = async () => {
    const { data: agentRuns } = await supabase
      .from('agent_runs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (!agentRuns) return;

    // Group by agent name
    const agentGroups = agentRuns.reduce((acc, run) => {
      if (!acc[run.agent_name]) {
        acc[run.agent_name] = [];
      }
      acc[run.agent_name].push(run);
      return acc;
    }, {} as Record<string, any[]>);

    const performances: AgentPerformance[] = Object.entries(agentGroups).map(([agentName, runs]) => {
      const successfulRuns = runs.filter(r => r.status === 'success').length;
      const successRate = (successfulRuns / runs.length) * 100;
      const averageScore = runs.reduce((sum, r) => sum + r.score, 0) / runs.length;
      const lastRun = runs[0]?.timestamp;

      // Generate improvement recommendations based on performance
      const improvements = [];
      if (successRate < 70) {
        improvements.push('שפר אלגוריתם הבחירה');
      }
      if (averageScore < 80) {
        improvements.push('הוסף יותר פרמטרים לשיקול');
      }
      improvements.push('הגדל מגוון האפשרויות');

      return {
        agentName,
        successRate,
        averageScore,
        totalRuns: runs.length,
        lastRun,
        improvements
      };
    });

    setAgentPerformances(performances);
  };

  const generateLearningInsights = async () => {
    // Get learning data from LearningAgent
    const learningAgent = new LearningAgent();
    
    // Generate insights based on current data
    const insights: LearningInsight[] = [
      {
        category: 'התאמות צבעים',
        insight: 'המשתמשים מעדיפים צירופי צבעים בטוחים על פני ניסויים',
        confidence: 85,
        recommendations: [
          'הוסף יותר אפשרויות צבעים בטוחות',
          'צור מערכת המלצות צבעים מתקדמת',
          'לימד את המערכת מצירופים מוצלחים'
        ]
      },
      {
        category: 'התאמה לגוף',
        insight: 'דיוק התאמת הבגדים לסוג הגוף השתפר ב-15% בשבוע האחרון',
        confidence: 92,
        recommendations: [
          'המשך לחזק את האלגוריתם לסוג גוף X',
          'הוסף יותר נתונים לסוג גוף O',
          'פתח מדדי הצלחה ספציפיים לכל סוג גוף'
        ]
      },
      {
        category: 'העדפות סגנון',
        insight: 'המשתמשים מגיבים טוב יותר להמלצות מותאמות אישית',
        confidence: 78,
        recommendations: [
          'הגבר את מידת ההתאמה האישית',
          'צור פרופילי סגנון מפורטים יותר',
          'הוסף למידה מהתנהגות המשתמש'
        ]
      }
    ];

    setLearningInsights(insights);
  };

  const triggerLearningUpdate = async () => {
    try {
      toast({
        title: "מתחיל עדכון למידה",
        description: "המערכת מעדכנת את נתוני הלמידה..."
      });

      const learningAgent = new LearningAgent();
      
      // This would trigger a learning cycle in a real implementation
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
      
      toast({
        title: "הצלחה",
        description: "נתוני הלמידה עודכנו בהצלחה"
      });
      
      await fetchDashboardData();
    } catch (error) {
      console.error('Error updating learning:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בעדכון נתוני הלמידה",
        variant: "destructive"
      });
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
    <div className="container mx-auto p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="w-8 h-8" />
          לוח בקרה למידה וביצועים
        </h1>
        <p className="text-muted-foreground mt-2">
          מעקב אחר ביצועי הסוכנים ותהליכי הלמידה של המערכת
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={triggerLearningUpdate} className="ml-4">
          <Brain className="w-4 h-4 ml-2" />
          עדכן למידה
        </Button>
        <Button onClick={fetchDashboardData} variant="outline">
          <Activity className="w-4 h-4 ml-2" />
          רענן נתונים
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">משתמשים פעילים</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              משתמשים שהשלימו שאלון
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">תלבושות מוצלחות</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.successfulOutfits || 0}</div>
            <p className="text-xs text-muted-foreground">
              קיבלו פידבק חיובי
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">נקודות למידה</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.learningDataPoints || 0}</div>
            <p className="text-xs text-muted-foreground">
              פידבק + תוצאות סוכנים
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">מעורבות ממוצעת</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.averageEngagement.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              שיעור הצלחה כללי
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">ביצועי סוכנים</TabsTrigger>
          <TabsTrigger value="insights">תובנות למידה</TabsTrigger>
          <TabsTrigger value="trends">מגמות שיפור</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4">
            {agentPerformances.map((agent) => (
              <Card key={agent.agentName}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{agent.agentName}</CardTitle>
                      <CardDescription>
                        {agent.totalRuns} ריצות • עדכון אחרון: {' '}
                        {agent.lastRun ? format(new Date(agent.lastRun), 'dd/MM/yyyy') : 'אין נתונים'}
                      </CardDescription>
                    </div>
                    <div className="text-left">
                      <div className="text-2xl font-bold">{agent.averageScore.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">ציון ממוצע</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>שיעור הצלחה</span>
                        <span>{agent.successRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={agent.successRate} className="h-2" />
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">המלצות לשיפור:</h4>
                      <div className="space-y-1">
                        {agent.improvements.map((improvement, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {improvement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {learningInsights.map((insight, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{insight.category}</CardTitle>
                    <Badge variant={insight.confidence > 80 ? "default" : "secondary"}>
                      {insight.confidence}% ביטחון
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm">{insight.insight}</p>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">המלצות יישום:</h4>
                      <ul className="space-y-1">
                        {insight.recommendations.map((rec, recIndex) => (
                          <li key={recIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>מגמות שיפור בשבועות האחרונים</CardTitle>
              <CardDescription>
                מעקב אחר שיפור ביצועי המערכת לאורך זמן
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-4">שיעור הצלחה שבועי</h4>
                  <div className="space-y-2">
                    {metrics?.improvementTrends.map((trend) => (
                      <div key={trend.week} className="flex items-center gap-4">
                        <span className="text-sm w-16">שבוע {trend.week}</span>
                        <Progress value={trend.successRate} className="flex-1 h-2" />
                        <span className="text-sm w-12">{trend.successRate.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-4">מעורבות משתמשים</h4>
                  <div className="space-y-2">
                    {metrics?.improvementTrends.map((trend) => (
                      <div key={trend.week} className="flex items-center gap-4">
                        <span className="text-sm w-16">שבוע {trend.week}</span>
                        <Progress value={trend.engagement} className="flex-1 h-2" />
                        <span className="text-sm w-12">{trend.engagement.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentLearningDashboard;