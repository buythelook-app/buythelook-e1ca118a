
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useState } from "react";

interface BudgetFilterProps {
  budget: number;
  isUnlimited: boolean;
  onBudgetChange: (value: number[]) => void;
  onInputChange: (value: number) => void;
}

export const BudgetFilter = ({ 
  budget, 
  isUnlimited, 
  onBudgetChange, 
  onInputChange 
}: BudgetFilterProps) => {
  const [open, setOpen] = useState(false);

  const handleBudgetChange = (value: number[]) => {
    onBudgetChange(value);
    // לא סוגר את החלון אוטומטית
  };

  const handleInputChange = (value: number) => {
    onInputChange(value);
    // לא סוגר את החלון אוטומטית
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
          <span className="mr-2">💰</span>
          Set Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">What's Your Budget?</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 p-4">
          <div className="relative p-6 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center mb-6">
              <span className="font-medium bg-blue-600 text-white px-3 py-1 rounded-full text-sm">$100</span>
              <span className="font-medium bg-blue-600 text-white px-3 py-1 rounded-full text-sm">$1000</span>
            </div>
            <Slider
              value={[budget]}
              onValueChange={handleBudgetChange}
              min={100}
              max={1000}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between items-center text-xs mt-2 px-1">
              <span className="text-blue-700 font-medium">Min</span>
              <span className="text-blue-700 font-medium">Max</span>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              type="number"
              min="100"
              max="1000"
              value={isUnlimited ? "" : budget}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value)) {
                  handleInputChange(value);
                }
              }}
              placeholder={isUnlimited ? "Unlimited budget" : "Enter amount"}
              className="bg-white border-blue-200 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={() => setOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
