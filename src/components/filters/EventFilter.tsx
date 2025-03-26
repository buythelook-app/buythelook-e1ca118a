
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useState, useEffect } from "react";
import { useToast } from "../ui/use-toast";
import { EventButton } from "./EventButton";
import { EventType, EVENT_TO_STYLES } from "./eventTypes";
import { useNavigate } from "react-router-dom";

interface EventFilterProps {
  date: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onSyncCalendar: () => void;
}

export const EventFilter = ({ date, onDateSelect, onSyncCalendar }: EventFilterProps) => {
  const [selectedEvent, setSelectedEvent] = useState<EventType>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Add an effect to handle navigation when both date and event are selected
  useEffect(() => {
    if (selectedEvent && date) {
      // Store the selected event in localStorage for the lookService to use
      localStorage.setItem('selected-event', selectedEvent);
      
      // Close dialog and navigate to suggestions
      setIsOpen(false);
      setTimeout(() => navigate('/suggestions'), 300);
    }
  }, [selectedEvent, date, navigate]);

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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" onClick={() => setIsOpen(true)}>
          <span className="mr-2">📅</span>
          {selectedEvent ? `${selectedEvent} - ${date?.toLocaleDateString() || 'Select Date'}` : 'Select Event'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[650px] p-4">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-base">Select Event & Date</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Event Type</p>
            <div className="grid grid-cols-2 gap-2">
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
              className="w-full text-xs flex items-center justify-center gap-1 h-8 mt-2"
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
              className="border rounded-md scale-95 origin-top-left"
              showOutsideDays={false}
              disabled={(date) => date < new Date()}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
