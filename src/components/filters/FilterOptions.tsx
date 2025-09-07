
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { EventFilter } from "./EventFilter";
import { BudgetFilter } from "./BudgetFilter";
import { Style } from "./StyleFilterButton";

export const FilterOptions = () => {
  const navigate = useNavigate();
  const [budget, setBudget] = useState<number>(100);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedStyle, setSelectedStyle] = useState<Style | "All">("All");
  const { toast } = useToast();

  // 🆕 Load budget and style from localStorage on component mount
  useEffect(() => {
    try {
      const savedBudget = localStorage.getItem('outfit-budget');
      if (savedBudget) {
        const parsed = JSON.parse(savedBudget);
        setBudget(parsed.budget || 100);
        setIsUnlimited(parsed.isUnlimited || false);
      }
      
      // Load style from styleAnalysis
      const styleAnalysis = localStorage.getItem('styleAnalysis');
      if (styleAnalysis) {
        const parsed = JSON.parse(styleAnalysis);
        setSelectedStyle(parsed.analysis?.styleProfile || "All");
      }
    } catch (error) {
      console.log('Could not load saved data:', error);
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

  const handleStyleChange = (style: Style | "All") => {
    setSelectedStyle(style);
    
    // Update styleAnalysis in localStorage (for recommendations only)
    try {
      const styleAnalysis = localStorage.getItem('styleAnalysis');
      if (styleAnalysis) {
        const parsed = JSON.parse(styleAnalysis);
        parsed.analysis.styleProfile = style;
        localStorage.setItem('styleAnalysis', JSON.stringify(parsed));
        console.log('🎨 [FilterOptions] Updated current style preference to:', style);
        
        // DO NOT update originalQuizStyle - that stays the same for the header
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('styleAnalysisChanged'));
        
        // Show user feedback
        toast({
          title: "Style Filter Applied",
          description: `Showing ${style} style recommendations. Your original quiz style is preserved.`,
        });
      }
    } catch (error) {
      console.log('Could not save style preference:', error);
    }
  };

  const handleSyncCalendar = () => {
    toast({
      title: "Calendar Sync",
      description: "This feature will be available soon!",
    });
  };

  return (
    <div className="space-y-4 mb-8">
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
        className="bg-blue-600 hover:bg-blue-700 w-full text-white"
      >
        View All Suggestions
      </Button>
    </div>
  );
};
