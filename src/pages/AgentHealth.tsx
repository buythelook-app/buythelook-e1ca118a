import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Play } from "lucide-react";
import { runAgentHealthCheck, AgentHealthReport } from "@/agents/diagnostics/agentHealthCheck";

export default function AgentHealthPage() {
  const [report, setReport] = useState<AgentHealthReport | null>(null);
  const [loading, setLoading] = useState(false);

  const runCheck = async () => {
    setLoading(true);
    try {
      toast.info("מריץ בדיקת בריאות לכל האייג'נטים...");
      // Use a stable test user id so localStorage context is consistent
      const res = await runAgentHealthCheck("health-check-user");
      setReport(res);
      res.overallOk ? toast.success("הכל תקין ✅") : toast.warning("נמצאו בעיות לבדיקה ⚠️");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "שגיאה בבדיקת הבריאות");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 bg-fashion-glass rounded-2xl p-6">
          <h1 className="text-2xl font-bold fashion-hero-text">בדיקת בריאות אייג'נטים</h1>
          <p className="text-muted-foreground">מריץ כל אייג'נט לפי תפקידו וגם את הזרימה המתואמת</p>
        </div>

        <div className="flex gap-3 mb-8">
          <Button onClick={runCheck} disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-105 transition-all duration-300">
            <Play className="h-4 w-4" />
            {loading ? "מריץ..." : "הרץ בדיקה"}
          </Button>
          {report && (
            <Badge variant={report.overallOk ? "default" : "destructive"}>
              {report.overallOk ? "תקין" : "בעיות זוהו"}
            </Badge>
          )}
        </div>

      {report && (
        <div className="grid gap-6">
          <Card className="bg-fashion-glass">
            <CardHeader>
              <CardTitle>תוצאות לפי אייג'נט</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.agents.map((a) => (
                <div key={a.name} className="p-3 border rounded">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{a.name}</span>
                        <Badge variant="outline">{a.role}</Badge>
                      </div>
                      {a.error && <div className="text-destructive text-sm">{a.error}</div>}
                    </div>
                    <Badge variant={a.success ? "default" : "destructive"}>
                      {a.success ? "הצליח" : "נכשל"}
                    </Badge>
                  </div>
                  {a.stats && (
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      {Object.entries(a.stats).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between">
                          <span>{k}</span>
                          <span className="font-mono">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-fashion-glass">
            <CardHeader>
              <CardTitle>הרצה מתואמת (AgentCrew)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">סטטוס</span>
                <Badge variant={report.coordinatedRun.success ? "default" : "destructive"}>
                  {report.coordinatedRun.success ? "הצליח" : "נכשל"}
                </Badge>
              </div>
              {report.coordinatedRun.error && (
                <div className="text-destructive text-sm">{report.coordinatedRun.error}</div>
              )}
              {report.coordinatedRun.stats && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {Object.entries(report.coordinatedRun.stats).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span>{k}</span>
                      <span className="font-mono">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!report && !loading && (
        <Card className="mt-6 bg-fashion-glass">
          <CardContent className="py-8 text-center text-muted-foreground">
            לחץ על "הרץ בדיקה" כדי להפיק דו"ח בריאות מפורט לכל האייג'נטים
          </CardContent>
        </Card>
      )}

      <Separator className="my-8" />
      <p className="text-xs text-muted-foreground">ID משתמש לבדיקה: health-check-user • {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
