
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AgentOutfitVisualizer } from "./AgentOutfitVisualizer";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";

export function AgentSimulationRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const runAgentSimulation = async () => {
    setIsRunning(true);
    try {
      toast.info("מריץ את האייג'נטים...");
      
      // Force refresh the agent visualizer by triggering a state change
      setHasRun(false);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      setHasRun(true);
      
      toast.success("האייג'נטים רצו בהצלחה!");
    } catch (error) {
      console.error('Error running agents:', error);
      toast.error("שגיאה בהרצת האייג'נטים");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Button 
          onClick={runAgentSimulation} 
          disabled={isRunning}
          size="lg"
          className="flex items-center gap-2"
        >
          {isRunning ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Play className="h-5 w-5" />
          )}
          {isRunning ? "מריץ אייג'נטים..." : "הרץ אייג'נטים"}
        </Button>
      </div>
      
      {hasRun && (
        <div className="mt-8">
          <AgentOutfitVisualizer key={Date.now()} />
        </div>
      )}
    </div>
  );
}
