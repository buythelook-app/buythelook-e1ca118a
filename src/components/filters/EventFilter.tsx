
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
import { EventButton } from "./EventButton";
import { EventType, EVENT_TO_STYLES } from "./eventTypes";

interface EventFilterProps {
  date: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onSyncCalendar: () => void;
}

export const EventFilter = ({ date, onDateSelect, onSyncCalendar }: EventFilterProps) => {
  const [selectedEvent, setSelectedEvent] = useState<EventType>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleEventSelect = (event: EventType) => {
    setSelectedEvent(event);
    
    if (event) {
      const recommendedStyles = EVENT_TO_STYLES[event];
      
      toast({
        title: "Event Style Selected",
        description: `Recommended styles for ${event}: ${recommendedStyles.join(', ')}`,
      });
      
      // Store recommended styles in localStorage for other components to use
      localStorage.setItem('event-recommended-styles', JSON.stringify(recommendedStyles));
      
      // Only close if date is already selected
      if (date) {
        setIsOpen(false);
      }
    }
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    onDateSelect(newDate);
    if (newDate) {
      toast({
        title: "Date Selected",
        description: `Selected date: ${newDate.toLocaleDateString()}`,
      });
      
      // Only close if event is already selected
      if (selectedEvent) {
        setIsOpen(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" onClick={() => setIsOpen(true)}>
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
            {(Object.keys(EVENT_TO_STYLES) as Array<Exclude<EventType, null>>).map((event) => (
              <EventButton
                key={event}
                event={event}
                selectedEvent={selectedEvent}
                onSelect={handleEventSelect}
              />
            ))}
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
