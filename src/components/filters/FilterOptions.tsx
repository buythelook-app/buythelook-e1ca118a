import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { EventFilter } from "./EventFilter";
import { BudgetFilter } from "./BudgetFilter";
import { generateOutfitFromUserPreferences } from "@/services/api/outfitApi";

export const FilterOptions = () => {
  const navigate = useNavigate();
  const [budget, setBudget] = useState<number>(100);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleBudgetChange = (value: number[]) => {
    if (value[0] >= 1000) {
      setIsUnlimited(true);
      setBudget(1000);
    } else {
      setIsUnlimited(false);
      setBudget(value[0]);
    }
  };

  const handleInputChange = (value: number) => {
    if (value >= 1000) {
      setIsUnlimited(true);
      setBudget(1000);
    } else {
      setIsUnlimited(false);
      setBudget(value);
    }
  };

  const handleSyncCalendar = () => {
    toast({
      title: "Calendar Sync",
      description: "This feature will be available soon!",
    });
  };

  const handleViewSuggestions = async () => {
    setIsLoading(true);
    try {
      // Generate outfit based on user preferences without database check
      await generateOutfitFromUserPreferences(false);
      navigate('/suggestions');
    } catch (error) {
      console.error('Error generating outfit suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate outfit suggestions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EventFilter
          date={date}
          onDateSelect={setDate}
          onSyncCalendar={handleSyncCalendar}
        />
        
        <BudgetFilter
          budget={budget}
          isUnlimited={isUnlimited}
          onBudgetChange={handleBudgetChange}
          onInputChange={handleInputChange}
        />
      </div>

      <Button 
        onClick={handleViewSuggestions}
        className="bg-netflix-accent hover:bg-netflix-accent/80 w-full"
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "View All Suggestions"}
      </Button>
    </div>
  );
};
