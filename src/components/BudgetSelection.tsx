import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";

export const BudgetSelection = () => {
  const [budget, setBudget] = useState<number>(100);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const navigate = useNavigate();

  const handleBudgetChange = (value: number[]) => {
    if (value[0] >= 1000) {
      setIsUnlimited(true);
      setBudget(1000);
    } else {
      setIsUnlimited(false);
      setBudget(value[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      if (value >= 1000) {
        setIsUnlimited(true);
        setBudget(1000);
      } else {
        setIsUnlimited(false);
        setBudget(value);
      }
    }
  };

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container max-w-md mx-auto">
        <h1 className="text-2xl font-display font-semibold mb-12">What's Your Budget?</h1>
        
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="relative">
              <Slider
                value={[budget]}
                onValueChange={handleBudgetChange}
                min={100}
                max={1000}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between text-sm mt-2">
                <span>$100</span>
                <span className="text-netflix-accent">
                  {isUnlimited ? "Money is not an issue" : `$${budget}`}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="budget-input" className="text-sm text-gray-400">
                Or enter specific amount:
              </label>
              <Input
                id="budget-input"
                type="number"
                min="100"
                max="1000"
                value={isUnlimited ? "" : budget}
                onChange={handleInputChange}
                placeholder={isUnlimited ? "Unlimited budget" : "Enter amount"}
                className="bg-netflix-card border-netflix-accent focus:border-netflix-accent"
              />
            </div>
          </div>

          <Button 
            onClick={() => navigate('/mood')} 
            className="w-full bg-netflix-accent hover:bg-opacity-80"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};