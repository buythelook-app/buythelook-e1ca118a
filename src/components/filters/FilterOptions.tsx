import { useState } from "react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Slider } from "../ui/slider";
import { Input } from "../ui/input";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useToast } from "../ui/use-toast";

export const FilterOptions = () => {
  const navigate = useNavigate();
  const [budget, setBudget] = useState<number>(100);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
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

  const handleSyncCalendar = () => {
    toast({
      title: "Calendar Sync",
      description: "This feature will be available soon!",
    });
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mood Filter */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <span className="mr-2">😊</span>
              Select Mood
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>How are you feeling today?</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 p-4">
              <Button variant="outline" className="p-4">
                <span className="text-3xl mb-2 block">😊</span>
                <span className="text-sm">Happy</span>
              </Button>
              <Button variant="outline" className="p-4">
                <span className="text-3xl mb-2 block">😴</span>
                <span className="text-sm">Tired</span>
              </Button>
              <Button variant="outline" className="p-4">
                <span className="text-3xl mb-2 block">🤔</span>
                <span className="text-sm">Confused</span>
              </Button>
              <Button variant="outline" className="p-4">
                <span className="text-3xl mb-2 block">😎</span>
                <span className="text-sm">Cool</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Event Filter */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <span className="mr-2">📅</span>
              Select Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Do you have an upcoming event?</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="p-4">
                  <span className="text-3xl mb-2 block">🎂</span>
                  <span className="text-sm">Birthday</span>
                </Button>
                <Button variant="outline" className="p-4">
                  <span className="text-3xl mb-2 block">💑</span>
                  <span className="text-sm">Date Night</span>
                </Button>
                <Button variant="outline" className="p-4">
                  <span className="text-3xl mb-2 block">🎉</span>
                  <span className="text-sm">Party</span>
                </Button>
                <Button variant="outline" className="p-4">
                  <span className="text-3xl mb-2 block">💼</span>
                  <span className="text-sm">Work Event</span>
                </Button>
              </div>
              
              <Button
                variant="outline"
                onClick={handleSyncCalendar}
                className="w-full flex items-center justify-center gap-2"
              >
                <span>📅</span> Sync with My Calendar
              </Button>

              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Budget Filter */}
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
                  onValueChange={handleBudgetChange}
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
                      if (value >= 1000) {
                        setIsUnlimited(true);
                        setBudget(1000);
                      } else {
                        setIsUnlimited(false);
                        setBudget(value);
                      }
                    }
                  }}
                  placeholder={isUnlimited ? "Unlimited budget" : "Enter amount"}
                  className="bg-netflix-card"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* View All Suggestions Button - Now positioned below all filters */}
      <Button 
        onClick={() => navigate('/suggestions')}
        className="bg-netflix-accent hover:bg-netflix-accent/80 w-full"
      >
        View All Suggestions
      </Button>
    </div>
  );
};