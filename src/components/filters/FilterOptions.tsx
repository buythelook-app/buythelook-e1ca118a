
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
      // Generate outfit based on user preferences without passing any parameters
      await generateOutfitFromUserPreferences();
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
      
      {/* Four canvas elements for style visualization - 2 per row */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Style Visualization</h3>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <canvas 
                id={`style-canvas-${index}`} 
                className="w-full h-80 object-cover" // Doubled height from h-40 to h-80
                width="200"
                height="320" // Doubled height from 160 to 320
              ></canvas>
              <div className="p-3 text-center">
                <p className="text-sm font-medium">Style Option {index + 1}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
