import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { useState } from "react";

export const EventSelection = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text p-6">
      <div className="container max-w-md mx-auto">
        <h1 className="text-2xl font-display font-semibold mb-8">Do you have an upcoming event?</h1>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-netflix-card rounded-lg hover:bg-netflix-accent/10 transition-colors">
              <span className="text-3xl mb-2 block">🎂</span>
              <span className="text-sm">Birthday</span>
            </button>
            <button className="p-4 bg-netflix-card rounded-lg hover:bg-netflix-accent/10 transition-colors">
              <span className="text-3xl mb-2 block">💑</span>
              <span className="text-sm">Date Night</span>
            </button>
            <button className="p-4 bg-netflix-card rounded-lg hover:bg-netflix-accent/10 transition-colors">
              <span className="text-3xl mb-2 block">🎉</span>
              <span className="text-sm">Party</span>
            </button>
            <button className="p-4 bg-netflix-card rounded-lg hover:bg-netflix-accent/10 transition-colors">
              <span className="text-3xl mb-2 block">💼</span>
              <span className="text-sm">Work Event</span>
            </button>
          </div>

          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg border border-netflix-card"
          />

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/suggestions')} 
              className="flex-1"
            >
              Skip
            </Button>
            <Button 
              onClick={() => navigate('/suggestions')} 
              className="flex-1"
              disabled={!date}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};