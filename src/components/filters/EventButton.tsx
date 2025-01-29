import { Button } from "../ui/button";
import { EventType, EVENT_ICONS } from "./eventTypes";

interface EventButtonProps {
  event: Exclude<EventType, null>;
  selectedEvent: EventType;
  onSelect: (event: EventType) => void;
}

export const EventButton = ({ event, selectedEvent, onSelect }: EventButtonProps) => {
  return (
    <Button 
      variant={selectedEvent === event ? "default" : "outline"} 
      className="p-4"
      onClick={() => onSelect(event)}
    >
      <span className="text-3xl mb-2 block">{EVENT_ICONS[event]}</span>
      <span className="text-sm">{event}</span>
    </Button>
  );
};