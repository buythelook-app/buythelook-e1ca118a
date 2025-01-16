import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";

export const BudgetSelection = () => {
  const [budget, setBudget] = useState([50]);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container max-w-md mx-auto">
        <h1 className="text-2xl font-display font-semibold mb-12">What's Your Budget?</h1>
        
        <div className="space-y-12">
          <div className="space-y-4">
            <Slider
              value={budget}
              onValueChange={setBudget}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm">
              <span>$0</span>
              <span>${budget[0]}</span>
              <span>$100</span>
            </div>
          </div>

          <Button 
            onClick={() => navigate('/mood')} 
            className="w-full"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};