import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, CheckCircle, Play, RefreshCw, TrendingUp, Eye, Star, ThumbsUp, ThumbsDown, Save, ArrowRight, List } from 'lucide-react';
import { ValidationRunner } from '@/agents/validationRunner';
import { runValidationApi, getValidationStatsApi } from './api/validation/run';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LookImage } from '@/components/look/LookImage';
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
  const [userId, setUserId] = useState<string | null>(null);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<ValidationResult | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showExistingRatings, setShowExistingRatings] = useState(false);
  const [existingRatings, setExistingRatings] = useState<any[]>([]);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
  const [manualRating, setManualRating] = useState({
    overall_rating: 3,
    like_dislike: null as boolean | null,
    body_shape_fit: 3,
    style_alignment: 3,
    occasion_match: 3,
    color_coordination: 3,
    value_for_money: 3,
    creativity: 3,
    must_include_met: [] as string[],
    should_avoid_violated: [] as string[],
    feedback_notes: "",
    what_works: "",
    what_missing: "",
    improvements: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadLatestResults();
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
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
      const result = await runValidationApi();
      
      if (result.success) {
        toast({
          title: "הולידציה הושלמה",
          description: `נבדקו ${result.data?.summary?.totalTests || 'מספר'} מקרי בוחן בהצלחה`,
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

  const handleViewAndRate = (result: ValidationResult) => {
    setSelectedResult(result);
    setCurrentOutfitIndex(0);
    setShowRatingModal(true);
    setShowExistingRatings(false);
    setManualRating({
      overall_rating: 3,
      like_dislike: null,
      body_shape_fit: 3,
      style_alignment: 3,
      occasion_match: 3,
      color_coordination: 3,
      value_for_money: 3,
      creativity: 3,
      must_include_met: [],
      should_avoid_violated: [],
      feedback_notes: "",
      what_works: "",
      what_missing: "",
      improvements: ""
    });
  };

  const handleViewExistingRatings = async (result: ValidationResult) => {
    setSelectedResult(result);
    try {
      console.log('📊 [ValidationDashboard] טוען דירוגים קיימים עבור:', result.test_case_name);
      
      const { data, error } = await supabase
        .from('manual_outfit_ratings')
        .select('*')
        .eq('test_case_name', result.test_case_name)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [ValidationDashboard] שגיאה בטעינת דירוגים:', error);
        throw error;
      }

      console.log('✅ [ValidationDashboard] נטענו דירוגים:', data?.length || 0);
      setExistingRatings(data || []);
      setShowExistingRatings(true);
      
      if (!data || data.length === 0) {
        toast({
          title: "אין דירוגים",
          description: "עדיין לא נשמרו דירוגים למקרה בוחן זה"
        });
      }
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message || "שגיאה בטעינת דירוגים",
        variant: "destructive"
      });
    }
  };

  const handleSaveRating = async () => {
    if (!selectedResult) {
      toast({
        title: "שגיאה",
        description: "לא נבחר תוצאת ולידציה",
        variant: "destructive"
      });
      return;
    }

    if (!userId) {
      toast({
        title: "שגיאה",
        description: "חייב להיות מחובר כדי לשמור דירוג",
        variant: "destructive"
      });
      return;
    }

    try {
      // המרת ISO string ל-timestamp
      const timestampValue = selectedResult.run_timestamp 
        ? new Date(selectedResult.run_timestamp).toISOString().replace('T', ' ').replace('Z', '')
        : new Date().toISOString().replace('T', ' ').replace('Z', '');

      const ratingData = {
        test_case_name: selectedResult.test_case_name,
        run_timestamp: timestampValue,
        outfit_index: currentOutfitIndex,
        user_id: userId,
        ...manualRating
      };

      console.log('💾 [ValidationDashboard] שומר דירוג:', ratingData);

      const { data, error } = await supabase
        .from("manual_outfit_ratings")
        .insert(ratingData)
        .select();

      if (error) {
        console.error('❌ [ValidationDashboard] שגיאה בשמירת דירוג:', error);
        throw error;
      }

      console.log('✅ [ValidationDashboard] דירוג נשמר בהצלחה:', data);

      toast({
        title: "הדירוג נשמר בהצלחה!",
        description: `דירוג ללוק ${currentOutfitIndex + 1} נשמר והסוכנים ילמדו ממנו`
      });

      // איפוס הדירוג לאחר שמירה מוצלחת
      setManualRating({
        overall_rating: 3,
        like_dislike: null,
        body_shape_fit: 3,
        style_alignment: 3,
        occasion_match: 3,
        color_coordination: 3,
        value_for_money: 3,
        creativity: 3,
        must_include_met: [],
        should_avoid_violated: [],
        feedback_notes: "",
        what_works: "",
        what_missing: "",
        improvements: ""
      });

    } catch (error: any) {
      console.error('❌ [ValidationDashboard] Error saving rating:', error);
      toast({
        title: "שגיאה בשמירת דירוג",
        description: error.message || "שגיאה לא ידועה",
        variant: "destructive"
      });
    }
  };

  const handleNextOutfit = () => {
    if (!selectedResult?.actual_output) return;
    const outfits = Array.isArray(selectedResult.actual_output) 
      ? selectedResult.actual_output 
      : [selectedResult.actual_output];
    
    if (currentOutfitIndex < outfits.length - 1) {
      setCurrentOutfitIndex(currentOutfitIndex + 1);
    } else {
      const currentIndex = results.findIndex(r => r.test_case_name === selectedResult.test_case_name);
      if (currentIndex < results.length - 1) {
        handleViewAndRate(results[currentIndex + 1]);
      } else {
        toast({
          title: "סיימת!",
          description: "סיימת לדרג את כל התוצאות"
        });
        setShowRatingModal(false);
      }
    }
  };

  const renderStarRating = (value: number, onChange: (value: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="transition-colors"
          >
            <Star
              className={`w-6 h-6 ${star <= value ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
            />
          </button>
        ))}
      </div>
    );
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
                        <div className="flex gap-2">
                          {getScoreBadge(result.metrics?.overallQuality || 0)}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAndRate(result)}
                          >
                            <Eye className="w-4 h-4 ml-2" />
                            הצג המלצות ודרג
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewExistingRatings(result)}
                          >
                            <List className="w-4 h-4 ml-2" />
                            דירוגים קיימים
                          </Button>
                        </div>
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

      {/* Rating Modal */}
      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>דירוג ידני של המלצות - {selectedResult?.test_case_name}</DialogTitle>
            <DialogDescription>
              צפה בהמלצות הסוכנים ודרג אותן כדי לשפר את המערכת
            </DialogDescription>
          </DialogHeader>

          {selectedResult && (
            <div className="space-y-6">
              {/* A. Input Details */}
              <Card>
                <CardHeader>
                  <CardTitle>פרטי הקלט</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>מבנה גוף</Label>
                    <p className="text-sm text-muted-foreground">{selectedResult.input_data?.bodyShape}</p>
                  </div>
                  <div>
                    <Label>סגנון מועדף</Label>
                    <p className="text-sm text-muted-foreground">{selectedResult.input_data?.stylePreference}</p>
                  </div>
                  <div>
                    <Label>אירוע</Label>
                    <p className="text-sm text-muted-foreground">{selectedResult.input_data?.occasion}</p>
                  </div>
                  <div>
                    <Label>מצב רוח</Label>
                    <p className="text-sm text-muted-foreground">{selectedResult.input_data?.mood}</p>
                  </div>
                  <div>
                    <Label>תקציב</Label>
                    <p className="text-sm text-muted-foreground">₪{selectedResult.input_data?.budget}</p>
                  </div>
                </CardContent>
              </Card>

              {/* B. Outfits from Agents */}
              <Card>
                <CardHeader>
                  <CardTitle>הלוק שהסוכנים יצרו ({currentOutfitIndex + 1})</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedResult.actual_output && (
                    <div className="space-y-4">
                      <div>
                        <Label>תיאור הלוק</Label>
                        <p className="text-sm">{(selectedResult.actual_output as any)?.description || 'אין תיאור'}</p>
                      </div>
                      
                      {(selectedResult.actual_output as any)?.items && (
                        <div>
                          <Label className="text-lg font-semibold">פריטים בלוק</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            {Object.entries((selectedResult.actual_output as any).items || {}).map(([type, item]: [string, any]) => {
                              console.log(`🔍 [ValidationDashboard] פריט ${type}:`, {
                                name: item?.product_name || item?.name,
                                image: item?.image,
                                imageType: typeof item?.image,
                                isArray: Array.isArray(item?.image)
                              });
                              
                              // Extract image URL properly
                              let imageUrl = '';
                              if (item?.image) {
                                if (typeof item.image === 'string') {
                                  imageUrl = item.image;
                                } else if (Array.isArray(item.image) && item.image.length > 0) {
                                  imageUrl = item.image[0];
                                } else if (typeof item.image === 'object' && item.image.url) {
                                  imageUrl = item.image.url;
                                }
                              }
                              
                              return (
                                <Card key={type} className="overflow-hidden">
                                  {imageUrl && (
                                    <LookImage 
                                      image={imageUrl} 
                                      title={item.product_name || item.name || type}
                                      type={type}
                                    />
                                  )}
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="secondary">{type}</Badge>
                                    </div>
                                    {item && (
                                      <div className="space-y-1 text-sm">
                                        <p className="font-semibold line-clamp-2">{item.product_name || item.name || 'לא זמין'}</p>
                                        <p className="text-lg font-bold text-primary">{item.price || 'לא זמין'}</p>
                                        <div className="flex items-center gap-2">
                                          <span className="text-muted-foreground">צבע:</span>
                                          <span className="font-medium">{item.color || item.colour || 'לא זמין'}</span>
                                        </div>
                                        {item.category && (
                                          <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">קטגוריה:</span>
                                            <span className="text-xs">{item.category}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div>
                        <Label>ציון איכות אוטומטי</Label>
                        <p className="text-2xl font-bold">
                          {selectedResult.metrics?.overallQuality 
                            ? (selectedResult.metrics.overallQuality).toFixed(0) + '%'
                            : 'לא זמין'}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* C. Manual Rating System */}
              <Card className="bg-primary/5">
                <CardHeader>
                  <CardTitle>🌟 מערכת דירוג ידנית</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overall Rating */}
                  <div>
                    <Label>דירוג כללי (1-5 כוכבים)</Label>
                    {renderStarRating(manualRating.overall_rating, (value) => 
                      setManualRating({...manualRating, overall_rating: value})
                    )}
                  </div>

                  {/* Like/Dislike */}
                  <div>
                    <Label>לייק/דיסלייק</Label>
                    <div className="flex gap-4 mt-2">
                      <Button
                        variant={manualRating.like_dislike === true ? "default" : "outline"}
                        onClick={() => setManualRating({...manualRating, like_dislike: true})}
                      >
                        <ThumbsUp className="w-4 h-4 ml-2" />
                        אהבתי
                      </Button>
                      <Button
                        variant={manualRating.like_dislike === false ? "default" : "outline"}
                        onClick={() => setManualRating({...manualRating, like_dislike: false})}
                      >
                        <ThumbsDown className="w-4 h-4 ml-2" />
                        לא אהבתי
                      </Button>
                    </div>
                  </div>

                  {/* Detailed Criteria */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">📊 דירוג מפורט לפי קריטריונים</h4>
                    
                    {[
                      { key: 'body_shape_fit', label: '✅ התאמה למבנה גוף' },
                      { key: 'style_alignment', label: '👗 התאמה לסגנון' },
                      { key: 'occasion_match', label: '🎯 התאמה לאירוע' },
                      { key: 'color_coordination', label: '🎨 קואורדינציה של צבעים' },
                      { key: 'value_for_money', label: '💰 שווי תמורה' },
                      { key: 'creativity', label: '🎭 יצירתיות' }
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <Label>{label}</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <Slider
                            value={[manualRating[key as keyof typeof manualRating] as number]}
                            onValueChange={([value]) => 
                              setManualRating({...manualRating, [key]: value})
                            }
                            min={1}
                            max={5}
                            step={1}
                            className="flex-1"
                          />
                          <span className="w-8 text-center font-bold">
                            {manualRating[key as keyof typeof manualRating]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Free Text Feedback */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">📝 הערות חופשיות</h4>
                    
                    <div>
                      <Label>מה טוב בלוק הזה?</Label>
                      <Textarea
                        value={manualRating.what_works}
                        onChange={(e) => setManualRating({...manualRating, what_works: e.target.value})}
                        placeholder="תאר את מה שעובד טוב..."
                      />
                    </div>

                    <div>
                      <Label>מה חסר?</Label>
                      <Textarea
                        value={manualRating.what_missing}
                        onChange={(e) => setManualRating({...manualRating, what_missing: e.target.value})}
                        placeholder="תאר מה חסר..."
                      />
                    </div>

                    <div>
                      <Label>מה לשפר?</Label>
                      <Textarea
                        value={manualRating.improvements}
                        onChange={(e) => setManualRating({...manualRating, improvements: e.target.value})}
                        placeholder="הצעות לשיפור..."
                      />
                    </div>

                    <div>
                      <Label>הערות כלליות</Label>
                      <Textarea
                        value={manualRating.feedback_notes}
                        onChange={(e) => setManualRating({...manualRating, feedback_notes: e.target.value})}
                        placeholder="הערות נוספות..."
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveRating} className="flex-1">
                      <Save className="w-4 h-4 ml-2" />
                      שמור דירוג
                    </Button>
                    <Button onClick={handleNextOutfit} variant="outline" className="flex-1">
                      <ArrowRight className="w-4 h-4 ml-2" />
                      הבא
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* D. Expected Criteria */}
              {selectedResult.expected_criteria && (
                <Card>
                  <CardHeader>
                    <CardTitle>קריטריונים מצופים</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(selectedResult.expected_criteria as any)?.must_include && (
                      <div>
                        <Label>✅ Must Include</Label>
                        <p className="text-sm text-muted-foreground">
                          {JSON.stringify((selectedResult.expected_criteria as any).must_include)}
                        </p>
                      </div>
                    )}
                    {(selectedResult.expected_criteria as any)?.should_avoid && (
                      <div>
                        <Label>❌ Should Avoid</Label>
                        <p className="text-sm text-muted-foreground">
                          {JSON.stringify((selectedResult.expected_criteria as any).should_avoid)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* E. Comparison Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>ניתוח השוואה</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <Label>ציון אוטומטי</Label>
                      <p className="text-2xl font-bold">
                        {selectedResult.metrics?.overallQuality 
                          ? (selectedResult.metrics.overallQuality).toFixed(0) + '%'
                          : '-'}
                      </p>
                    </div>
                    <div className="text-center">
                      <Label>הדירוג שלי</Label>
                      <p className="text-2xl font-bold">
                        {(manualRating.overall_rating * 20).toFixed(0)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <Label>פער</Label>
                      <p className="text-2xl font-bold">
                        {selectedResult.metrics?.overallQuality 
                          ? ((manualRating.overall_rating * 20) - selectedResult.metrics.overallQuality).toFixed(0) + '%'
                          : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Existing Ratings Modal */}
      <Dialog open={showExistingRatings} onOpenChange={setShowExistingRatings}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>דירוגים קיימים - {selectedResult?.test_case_name}</DialogTitle>
            <DialogDescription>
              {existingRatings.length} דירוגים נמצאו עבור מקרה בוחן זה
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {existingRatings.map((rating, index) => (
              <Card key={rating.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">דירוג #{index + 1}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {new Date(rating.created_at).toLocaleDateString('he-IL')} | 
                      {new Date(rating.created_at).toLocaleTimeString('he-IL')}
                    </div>
                  </div>
                  <CardDescription>לוק #{rating.outfit_index + 1}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Overall Rating */}
                  <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Label>דירוג כולל:</Label>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${star <= rating.overall_rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                          />
                        ))}
                      </div>
                    </div>
                    {rating.like_dislike !== null && (
                      <div className="flex items-center gap-2">
                        {rating.like_dislike ? (
                          <>
                            <ThumbsUp className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-green-600">אהבתי</span>
                          </>
                        ) : (
                          <>
                            <ThumbsDown className="w-5 h-5 text-red-600" />
                            <span className="text-sm text-red-600">לא אהבתי</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Detailed Ratings */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { key: 'body_shape_fit', label: 'התאמה למבנה גוף' },
                      { key: 'style_alignment', label: 'התאמה לסגנון' },
                      { key: 'occasion_match', label: 'התאמה לאירוע' },
                      { key: 'color_coordination', label: 'קואורדינציה של צבעים' },
                      { key: 'value_for_money', label: 'תמורה למחיר' },
                      { key: 'creativity', label: 'יצירתיות' }
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs">{label}</Label>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= rating[key] ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Text Feedback */}
                  {(rating.feedback_notes || rating.what_works || rating.what_missing || rating.improvements) && (
                    <div className="space-y-2 pt-2 border-t">
                      {rating.what_works && (
                        <div>
                          <Label className="text-xs font-semibold">✅ מה עובד:</Label>
                          <p className="text-sm text-muted-foreground">{rating.what_works}</p>
                        </div>
                      )}
                      {rating.what_missing && (
                        <div>
                          <Label className="text-xs font-semibold">❌ מה חסר:</Label>
                          <p className="text-sm text-muted-foreground">{rating.what_missing}</p>
                        </div>
                      )}
                      {rating.improvements && (
                        <div>
                          <Label className="text-xs font-semibold">💡 שיפורים:</Label>
                          <p className="text-sm text-muted-foreground">{rating.improvements}</p>
                        </div>
                      )}
                      {rating.feedback_notes && (
                        <div>
                          <Label className="text-xs font-semibold">📝 הערות:</Label>
                          <p className="text-sm text-muted-foreground">{rating.feedback_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {existingRatings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                אין דירוגים קיימים למקרה בוחן זה
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
