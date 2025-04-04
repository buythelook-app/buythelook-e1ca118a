
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EventFilter } from "./EventFilter";
import { BudgetFilter } from "./BudgetFilter";
import { StyleVisualization } from "./StyleVisualization";
import { GenerateOutfitButton } from "./GenerateOutfitButton";
import { useOutfitSuggestions } from "@/hooks/useOutfitSuggestions";
import { useToast } from "@/hooks/use-toast";

export const FilterOptions = () => {
  const navigate = useNavigate();
  const [budget, setBudget] = useState<number>(100);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  
  const { 
    isLoading, 
    outfitSuggestions, 
    handleGenerateNewLooks 
  } = useOutfitSuggestions();

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

      <GenerateOutfitButton 
        isLoading={isLoading} 
        onClick={handleGenerateNewLooks} 
      />
      
      <StyleVisualization outfitSuggestions={outfitSuggestions} />
    </div>
  );
};
