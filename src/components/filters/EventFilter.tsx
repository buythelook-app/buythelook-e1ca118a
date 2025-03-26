
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
      <DialogContent className="max-w-sm p-3">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-base">Select Event & Date</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Event Type</p>
            <div className="grid grid-cols-2 gap-1">
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
              className="w-full text-xs flex items-center justify-center gap-1 h-7 mt-1"
            >
              <span>📅</span> Sync
            </Button>
          </div>
          
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Select Date</p>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="border rounded-md scale-90 origin-top-left -ml-1 -mt-1"
              showOutsideDays={false}
              disabled={(date) => date < new Date()}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
