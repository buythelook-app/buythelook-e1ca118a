import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Square, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { startValidationScheduler, runManualValidation } from "@/scheduler/runTrainerDaily";

export function AutoTrainerController() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [stopScheduler, setStopScheduler] = useState<(() => void) | null>(null);

  const startAutoTraining = () => {
    try {
      const stopFunction = startValidationScheduler();
      setStopScheduler(() => stopFunction);
      setIsRunning(true);
      setLastRun(new Date());
      toast.success("אילוף אוטונומי הופעל - האגנטים יתרגלו כל שעה");
    } catch (error) {
      console.error("Failed to start auto training:", error);
      toast.error("שגיאה בהפעלת האילוף האוטונומי");
    }
  };

  const stopAutoTraining = () => {
    if (stopScheduler) {
      stopScheduler();
      setStopScheduler(null);
    }
    setIsRunning(false);
    toast.info("אילוף אוטונומי הופסק");
  };

  const runManualTraining = async () => {
    try {
      toast.info("מריץ אילוף ידני...");
      const result = await runManualValidation();
      
      if (result.success) {
        setLastRun(new Date());
        toast.success(`אילוף הושלם בהצלחה! ניקוד: ${result.data.summary.successRate}%`);
      } else {
        toast.error("שגיאה באילוף: " + result.error);
      }
    } catch (error) {
      console.error("Manual training error:", error);
      toast.error("שגיאה באילוף ידני");
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          בקר אילוף סטיילסטית AI
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={isRunning ? "default" : "secondary"}>
            {isRunning ? "פעיל" : "כבוי"}
          </Badge>
          {lastRun && (
            <span className="text-sm text-muted-foreground">
              ריצה אחרונה: {lastRun.toLocaleTimeString('he-IL')}
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {!isRunning ? (
            <Button onClick={startAutoTraining} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              הפעל אילוף אוטונומי
            </Button>
          ) : (
            <Button onClick={stopAutoTraining} variant="destructive" className="flex-1">
              <Square className="h-4 w-4 mr-2" />
              עצור אילוף
            </Button>
          )}
          
          <Button onClick={runManualTraining} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            אלף עכשיו
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• אילוף אוטונומי רץ כל שעה</p>
          <p>• בודק ומשפר את האגנטים</p>
          <p>• נותן חוו"ד וניקוד ללוקים</p>
        </div>
      </CardContent>
    </Card>
  );
}