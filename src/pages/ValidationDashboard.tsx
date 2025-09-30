import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Play, RefreshCw, TrendingUp } from 'lucide-react';
import { ValidationRunner } from '@/agents/validationRunner';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ValidationMetrics {
  bodyShapeAccuracy: number;
  styleAlignment: number;
  occasionMatch: number;
  moodAlignment: number;
  colorHarmony: number;
  budgetCompliance: number;
  completenessScore: number;
  overallQuality: number;
}

interface ValidationResult {
  test_case_name: string;
  input_data: any;
  expected_criteria: any;
  actual_output: any;
  metrics: ValidationMetrics | any;
  agent_version: string;
  run_timestamp: string;
}

export default function ValidationDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLatestResults();
  }, []);

  const loadLatestResults = async () => {
    try {
      const { data, error } = await supabase
        .from('validation_dataset')
        .select('*')
        .order('run_timestamp', { ascending: false })
        .limit(50);

      if (error) {
        toast({
          title: "שגיאה בטעינת נתונים",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setResults(data || []);
      calculateSummary(data || []);
    } catch (error) {
      console.error('Error loading results:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בטעינת נתוני הולידציה",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data: ValidationResult[]) => {
    if (data.length === 0) {
      setSummary(null);
      return;
    }

    const latestRun = data[0]?.run_timestamp;
    const latestResults = data.filter(r => r.run_timestamp === latestRun);
    
    const totalTests = latestResults.length;
    const successfulTests = latestResults.filter(r => r.metrics?.overallQuality >= 70).length;
    const successRate = totalTests > 0 ? (successfulTests / totalTests) * 100 : 0;
    
    const avgMetrics = latestResults.reduce((acc, result) => {
      const metrics = result.metrics;
      if (!metrics) return acc;
      
      return {
        bodyShapeAccuracy: acc.bodyShapeAccuracy + metrics.bodyShapeAccuracy,
        styleAlignment: acc.styleAlignment + metrics.styleAlignment,
        occasionMatch: acc.occasionMatch + metrics.occasionMatch,
        moodAlignment: acc.moodAlignment + metrics.moodAlignment,
        colorHarmony: acc.colorHarmony + metrics.colorHarmony,
        budgetCompliance: acc.budgetCompliance + metrics.budgetCompliance,
        completenessScore: acc.completenessScore + metrics.completenessScore,
        overallQuality: acc.overallQuality + metrics.overallQuality
      };
    }, {
      bodyShapeAccuracy: 0,
      styleAlignment: 0,
      occasionMatch: 0,
      moodAlignment: 0,
      colorHarmony: 0,
      budgetCompliance: 0,
      completenessScore: 0,
      overallQuality: 0
    });

    Object.keys(avgMetrics).forEach(key => {
      avgMetrics[key as keyof typeof avgMetrics] /= totalTests;
    });

    setSummary({
      totalTests,
      successfulTests,
      failedTests: totalTests - successfulTests,
      successRate,
      timestamp: latestRun,
      metrics: avgMetrics
    });
  };

  const runValidation = async () => {
    setIsRunning(true);
    toast({
      title: "מתחיל הרצת ולידציה",
      description: "הולידציה מתחילה, זה יכול לקחת מספר דקות..."
    });

    try {
      const runner = new ValidationRunner();
      const result = await runner.runFullValidation();
      
      if (result.success) {
        toast({
          title: "הולידציה הושלמה",
          description: `נבדקו ${result.data?.summary.totalTests} מקרי בוחן בהצלחה`,
        });
        await loadLatestResults();
      } else {
        toast({
          title: "שגיאה בהולידציה",
          description: result.error || "שגיאה לא ידועה",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה בהרצת הולידציה",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge variant="default" className="bg-green-100 text-green-800">מעולה</Badge>;
    if (score >= 60) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">טוב</Badge>;
    return <Badge variant="destructive">דורש שיפור</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>טוען נתוני הולידציה...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ניהול הולידציה</h1>
          <p className="text-muted-foreground">ניהול ומעקב אחר ביצועי סוכני AI</p>
        </div>
        <Button 
          onClick={runValidation} 
          disabled={isRunning}
          className="flex items-center space-x-2"
        >
          {isRunning ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          <span>{isRunning ? 'מריץ הולידציה...' : 'הרץ הולידציה'}</span>
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">סה"כ בדיקות</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalTests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">בדיקות מוצלחות</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.successfulTests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">בדיקות כושלות</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.failedTests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">אחוז הצלחה</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(summary.successRate)}`}>
                {summary.successRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Metrics */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>מדדי ביצועים מפורטים</CardTitle>
            <CardDescription>
              נתונים מההרצה האחרונה - {new Date(summary.timestamp).toLocaleString('he-IL')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>התאמה למבנה גוף</span>
                  <span className={`font-bold ${getScoreColor(summary.metrics.bodyShapeAccuracy)}`}>
                    {summary.metrics.bodyShapeAccuracy.toFixed(1)}%
                  </span>
                </div>
                <Progress value={summary.metrics.bodyShapeAccuracy} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>התאמה לסגנון</span>
                  <span className={`font-bold ${getScoreColor(summary.metrics.styleAlignment)}`}>
                    {summary.metrics.styleAlignment.toFixed(1)}%
                  </span>
                </div>
                <Progress value={summary.metrics.styleAlignment} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>התאמה לאירוע</span>
                  <span className={`font-bold ${getScoreColor(summary.metrics.occasionMatch)}`}>
                    {summary.metrics.occasionMatch.toFixed(1)}%
                  </span>
                </div>
                <Progress value={summary.metrics.occasionMatch} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>התאמה למצב רוח</span>
                  <span className={`font-bold ${getScoreColor(summary.metrics.moodAlignment)}`}>
                    {summary.metrics.moodAlignment.toFixed(1)}%
                  </span>
                </div>
                <Progress value={summary.metrics.moodAlignment} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>הרמוניה בצבעים</span>
                  <span className={`font-bold ${getScoreColor(summary.metrics.colorHarmony)}`}>
                    {summary.metrics.colorHarmony.toFixed(1)}%
                  </span>
                </div>
                <Progress value={summary.metrics.colorHarmony} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>עמידה בתקציב</span>
                  <span className={`font-bold ${getScoreColor(summary.metrics.budgetCompliance)}`}>
                    {summary.metrics.budgetCompliance.toFixed(1)}%
                  </span>
                </div>
                <Progress value={summary.metrics.budgetCompliance} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">תוצאות אחרונות</TabsTrigger>
          <TabsTrigger value="details">פרטים מלאים</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>תוצאות הולידציה אחרונות</CardTitle>
              <CardDescription>50 התוצאות האחרונות מבסיס הנתונים</CardDescription>
            </CardHeader>
            <CardContent>
              {results.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">שם המקרה</TableHead>
                      <TableHead className="text-right">מבנה גוף</TableHead>
                      <TableHead className="text-right">סגנון</TableHead>
                      <TableHead className="text-right">אירוע</TableHead>
                      <TableHead className="text-right">ציון כולל</TableHead>
                      <TableHead className="text-right">סטטוס</TableHead>
                      <TableHead className="text-right">תאריך</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.slice(0, 20).map((result) => (
                      <TableRow key={result.test_case_name}>
                        <TableCell className="font-medium">{result.test_case_name}</TableCell>
                        <TableCell>{result.input_data?.bodyShape}</TableCell>
                        <TableCell>{result.input_data?.stylePreference}</TableCell>
                        <TableCell>{result.input_data?.occasion}</TableCell>
                        <TableCell className={getScoreColor(result.metrics?.overallQuality || 0)}>
                          {result.metrics?.overallQuality?.toFixed(1) || 'N/A'}%
                        </TableCell>
                        <TableCell>
                          {getScoreBadge(result.metrics?.overallQuality || 0)}
                        </TableCell>
                        <TableCell>
                          {new Date(result.run_timestamp).toLocaleDateString('he-IL')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  אין תוצאות זמינות. הרץ הולידציה כדי לראות תוצאות.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>פרטים מלאים</CardTitle>
              <CardDescription>מידע מפורט על כל מקרה בוחן</CardDescription>
            </CardHeader>
            <CardContent>
              {results.length > 0 ? (
                <div className="space-y-4">
                  {results.slice(0, 10).map((result) => (
                    <Card key={result.test_case_name} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{result.test_case_name}</h4>
                        {getScoreBadge(result.metrics?.overallQuality || 0)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">מבנה גוף:</span>
                          <div>{result.input_data?.bodyShape}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">סגנון:</span>
                          <div>{result.input_data?.stylePreference}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">אירוע:</span>
                          <div>{result.input_data?.occasion}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">תקציב:</span>
                          <div>₪{result.input_data?.budget}</div>
                        </div>
                      </div>
                      {result.metrics && (
                        <div className="mt-3 pt-3 border-t grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div>גוף: {result.metrics.bodyShapeAccuracy.toFixed(0)}%</div>
                          <div>סגנון: {result.metrics.styleAlignment.toFixed(0)}%</div>
                          <div>אירוע: {result.metrics.occasionMatch.toFixed(0)}%</div>
                          <div>צבעים: {result.metrics.colorHarmony.toFixed(0)}%</div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  אין תוצאות זמינות. הרץ הולידציה כדי לראות תוצאות.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}