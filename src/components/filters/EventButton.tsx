
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
      className="p-1 h-auto flex flex-col items-center"
      onClick={() => onSelect(event)}
    >
      <span className="text-base mb-0.5">{EVENT_ICONS[event]}</span>
      <span className="text-xs">{event}</span>
    </Button>
  );
};
