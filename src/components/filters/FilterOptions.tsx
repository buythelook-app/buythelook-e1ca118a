
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { EventFilter } from "./EventFilter";
import { BudgetFilter } from "./BudgetFilter";
import { generateOutfitFromUserPreferences } from "@/services/api/outfitApi";
import { StyleCanvas } from "../StyleCanvas";

export const FilterOptions = () => {
  const navigate = useNavigate();
  const [budget, setBudget] = useState<number>(100);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [outfitSuggestions, setOutfitSuggestions] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const generateInitialOutfit = async () => {
      try {
        console.log("Generating initial outfit suggestions on home page load");
        const response = await generateOutfitFromUserPreferences();
        console.log("Initial outfit suggestions generated successfully", response);
        
        if (response && response.data && Array.isArray(response.data)) {
          setOutfitSuggestions(response.data);
        }
      } catch (error) {
        console.error("Error generating initial outfit suggestions:", error);
      }
    };
    
    generateInitialOutfit();
  }, []);

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
      const response = await generateOutfitFromUserPreferences();
      
      if (response && response.data && Array.isArray(response.data)) {
        setOutfitSuggestions(response.data);
      }
      
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

  useEffect(() => {
    // Reset and prepare canvases whenever outfit suggestions change
    outfitSuggestions.forEach((_, index) => {
      const canvas = document.getElementById(`style-canvas-${index}`) as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Clear canvas with white background
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    });
  }, [outfitSuggestions]);

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
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Style Visualization</h3>
        <div className="grid grid-cols-2 gap-4">
          {outfitSuggestions.length > 0 ? (
            outfitSuggestions.map((outfit, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <canvas 
                  id={`style-canvas-${index}`} 
                  className="w-full h-80 object-cover"
                  width="300"
                  height="480"
                ></canvas>
                <StyleCanvas 
                  id={`style-canvas-${index}`} 
                  styleType={index} 
                  outfitData={outfit}
                  occasion={outfit.occasion}
                />
                <div className="p-3 text-center">
                  <p className="text-sm font-medium">
                    {outfit.occasion ? outfit.occasion.charAt(0).toUpperCase() + outfit.occasion.slice(1) : `Style Option ${index + 1}`}
                  </p>
                </div>
              </div>
            ))
          ) : (
            Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <canvas 
                  id={`style-canvas-${index}`} 
                  className="w-full h-80 object-cover"
                  width="300"
                  height="480"
                ></canvas>
                <div className="p-3 text-center">
                  <p className="text-sm font-medium">Loading styles...</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
