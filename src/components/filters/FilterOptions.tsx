
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { EventFilter } from "./EventFilter";
import { BudgetFilter } from "./BudgetFilter";

export const FilterOptions = () => {
  const navigate = useNavigate();
  const [budget, setBudget] = useState<number>(100);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  // 🆕 Load budget from localStorage on component mount
  useEffect(() => {
    try {
      const savedBudget = localStorage.getItem('outfit-budget');
      if (savedBudget) {
        const parsed = JSON.parse(savedBudget);
        setBudget(parsed.budget || 100);
        setIsUnlimited(parsed.isUnlimited || false);
      }
    } catch (error) {
      console.log('Could not load saved budget:', error);
    }
  }, []);

  const handleBudgetChange = (value: number[]) => {
    const newBudget = value[0];
    const newIsUnlimited = newBudget >= 1000;
    
    setBudget(newIsUnlimited ? 1000 : newBudget);
    setIsUnlimited(newIsUnlimited);
    
    // 🆕 Save budget to localStorage for styling agent
    const budgetData = {
      budget: newIsUnlimited ? 1000 : newBudget,
      isUnlimited: newIsUnlimited,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('outfit-budget', JSON.stringify(budgetData));
    console.log('💰 [BUDGET SAVED] Budget data saved to localStorage:', budgetData);
  };

  const handleInputChange = (value: number) => {
    const newIsUnlimited = value >= 1000;
    
    setBudget(newIsUnlimited ? 1000 : value);
    setIsUnlimited(newIsUnlimited);
    
    // 🆕 Save budget to localStorage for styling agent
    const budgetData = {
      budget: newIsUnlimited ? 1000 : value,
      isUnlimited: newIsUnlimited,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('outfit-budget', JSON.stringify(budgetData));
    console.log('💰 [BUDGET SAVED] Budget data saved to localStorage:', budgetData);
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

      <Button 
        onClick={() => navigate('/suggestions')}
        className="bg-netflix-accent hover:bg-netflix-accent/80 w-full"
      >
        View All Suggestions
      </Button>
    </div>
  );
};
