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
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <span className="mr-2">💰</span>
          Set Budget
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>What's Your Budget?</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 p-4">
          <div className="relative p-6 bg-netflix-card rounded-lg">
            <div className="flex justify-between items-center text-sm mb-6">
              <span className="font-medium bg-netflix-card/50 px-3 py-1 rounded-full">$100</span>
              <span className="font-medium bg-netflix-card/50 px-3 py-1 rounded-full">
                {isUnlimited ? "Money is not an issue" : `$${budget}`}
              </span>
            </div>
            <Slider
              value={[budget]}
              onValueChange={onBudgetChange}
              min={100}
              max={1000}
              step={50}
              className="w-full"
            />
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
                  onInputChange(value);
                }
              }}
              placeholder={isUnlimited ? "Unlimited budget" : "Enter amount"}
              className="bg-netflix-card"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};