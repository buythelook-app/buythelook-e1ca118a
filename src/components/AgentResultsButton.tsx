
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";

export default function AgentResultsButton() {
  const navigate = useNavigate();

  return (
    <Button 
      onClick={() => navigate('/agent-results')} 
      variant="outline" 
      className="flex items-center gap-2"
    >
      <LayoutDashboard className="h-4 w-4" />
      Agent Results
    </Button>
  );
}
