
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";

export default function CronStatusButton() {
  const navigate = useNavigate();

  return (
    <Button 
      onClick={() => navigate('/cron-status')} 
      variant="outline" 
      className="flex items-center gap-2"
    >
      <Clock className="h-4 w-4" />
      Cron Status
    </Button>
  );
}
