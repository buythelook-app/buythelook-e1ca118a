import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useState } from "react";
import { useToast } from "../ui/use-toast";
import { Style } from "./StyleFilterButton";

interface EventFilterProps {
  date: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onSyncCalendar: () => void;
}

type EventType = "birthday" | "dateNight" | "party" | "workEvent" | null;

// Define the record type without including null
type EventStylesRecord = Record<Exclude<EventType, null>, Style[]>;

const EVENT_TO_STYLES: EventStylesRecord = {
  birthday: ["classic"],
  dateNight: ["romantic"],
  party: ["romantic", "boohoo", "minimalist"],
  workEvent: ["classic", "minimalist", "classic"],
};

export const EventFilter = ({ date, onDateSelect, onSyncCalendar }: EventFilterProps) => {
  const [selectedEvent, setSelectedEvent] = useState<EventType>(null);
  const { toast } = useToast();

  const handleEventSelect = async (event: EventType) => {
    setSelectedEvent(event);
    
    // Get recommended styles for the event
    const recommendedStyles = event ? EVENT_TO_STYLES[event] : [];
    
    // Call the AI model endpoint with the event and recommended styles
    try {
      const response = await fetch('https://preview--ai-bundle-construct-20.lovable.app/api/style-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          recommendedStyles,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get style recommendations');
      }

      const data = await response.json();
      
      toast({
        title: "Event Style Selected",
        description: `Recommended styles for ${event}: ${recommendedStyles.join(', ')}`,
      });
    } catch (error) {
      console.error('Error getting style recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to get style recommendations. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    onDateSelect(newDate);
    if (newDate) {
      toast({
        title: "Date Selected",
        description: `Selected date: ${newDate.toLocaleDateString()}`,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <span className="mr-2">📅</span>
          {selectedEvent ? `${selectedEvent} - ${date?.toLocaleDateString() || 'Select Date'}` : 'Select Event'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Do you have an upcoming event?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant={selectedEvent === "birthday" ? "default" : "outline"} 
              className="p-4"
              onClick={() => handleEventSelect("birthday")}
            >
              <span className="text-3xl mb-2 block">🎂</span>
              <span className="text-sm">Birthday</span>
            </Button>
            <Button 
              variant={selectedEvent === "dateNight" ? "default" : "outline"} 
              className="p-4"
              onClick={() => handleEventSelect("dateNight")}
            >
              <span className="text-3xl mb-2 block">💑</span>
              <span className="text-sm">Date Night</span>
            </Button>
            <Button 
              variant={selectedEvent === "party" ? "default" : "outline"} 
              className="p-4"
              onClick={() => handleEventSelect("party")}
            >
              <span className="text-3xl mb-2 block">🎉</span>
              <span className="text-sm">Party</span>
            </Button>
            <Button 
              variant={selectedEvent === "workEvent" ? "default" : "outline"} 
              className="p-4"
              onClick={() => handleEventSelect("workEvent")}
            >
              <span className="text-3xl mb-2 block">💼</span>
              <span className="text-sm">Work Event</span>
            </Button>
          </div>
          
          <Button
            variant="outline"
            onClick={onSyncCalendar}
            className="w-full flex items-center justify-center gap-2"
          >
            <span>📅</span> Sync with My Calendar
          </Button>

          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className="rounded-md border"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};