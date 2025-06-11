
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, PlayCircle, Loader2 } from "lucide-react";

export function CronStatusChecker() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkCronStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔍 [DEBUG] Checking cron status...");
      
      // Call the trainer-agent function manually to test
      const { data, error } = await supabase.functions.invoke('trainer-agent', {
        body: { 
          test: true,
          timestamp: new Date().toISOString()
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log("✅ [DEBUG] Cron status check result:", data);
      setStatus(data);
      
    } catch (err: any) {
      console.error('❌ [DEBUG] Error checking cron status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testCronManually = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔍 [DEBUG] Testing cron manually...");
      
      // Call the trainer-agent with cron headers simulation
      const response = await fetch(`https://aqkeprwxxsryropnhfvm.supabase.co/functions/v1/trainer-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2Vwcnd4eHNyeXJvcG5oZnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MzE4MjksImV4cCI6MjA1MzQwNzgyOX0.1nstrLtlahU3kGAu-UrzgOVw6XwyKU6n5H5q4Taqtus`,
          'x-supabase-cron': 'true', // Simulate cron call
        },
        body: JSON.stringify({ 
          manual_test: true,
          timestamp: new Date().toISOString()
        })
      });
      
      const data = await response.json();
      console.log("✅ [DEBUG] Manual cron test result:", data);
      setStatus(data);
      
    } catch (err: any) {
      console.error('❌ [DEBUG] Error testing cron manually:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Trainer Agent Cron Status
        </CardTitle>
        <CardDescription>
          Check if the trainer-agent cron job is configured and running properly (every 15 minutes)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={checkCronStatus} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Check Function Status
          </Button>
          
          <Button 
            onClick={testCronManually} 
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
            Test Cron Manually
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Status Check Result</AlertTitle>
            <AlertDescription className="space-y-2">
              <div className="flex items-center gap-2">
                <span>Success:</span>
                <Badge variant={status.success ? "default" : "destructive"}>
                  {status.success ? "✅ Yes" : "❌ No"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Status:</span>
                <Badge variant="outline">{status.status}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Results Count:</span>
                <Badge variant="secondary">{status.results?.length || 0}</Badge>
              </div>
              {status.isCronCall && (
                <div className="flex items-center gap-2">
                  <span>Cron Call:</span>
                  <Badge variant="default">✅ Detected</Badge>
                </div>
              )}
              {status.timestamp && (
                <div className="text-sm text-gray-500">
                  Timestamp: {status.timestamp}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Cron Schedule:</strong> Every 15 minutes (*/15 * * * *)</p>
          <p><strong>Function Name:</strong> trainer-agent</p>
          <p><strong>Expected Behavior:</strong> Automatically run validation tests and generate agent results every quarter hour</p>
        </div>
      </CardContent>
    </Card>
  );
}
