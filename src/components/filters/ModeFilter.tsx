import { Button } from "../ui/button";
import { DropdownMenuLabel } from "../ui/dropdown-menu";
import { Mode } from "./StyleFilterButton";

const MODES: Array<{ id: number; name: Mode; icon: string }> = [
  { id: 1, name: "Relaxing", icon: "🌅" },
  { id: 2, name: "Party", icon: "🎉" },
  { id: 3, name: "Work", icon: "💼" },
  { id: 4, name: "Date", icon: "💖" },
  { id: 5, name: "Travel", icon: "✈️" },
  { id: 6, name: "Shopping", icon: "🛍️" },
  { id: 7, name: "Sport", icon: "⚽" },
  { id: 8, name: "Casual", icon: "👕" },
];

interface ModeFilterProps {
  selectedMode: Mode;
  setSelectedMode: (mode: Mode) => void;
}

export const ModeFilter = ({ selectedMode, setSelectedMode }: ModeFilterProps) => {
  return (
    <>
      <DropdownMenuLabel>Mode</DropdownMenuLabel>
      <div className="p-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            key="all"
            variant={selectedMode === "All" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedMode("All")}
            className="w-full"
          >
            All
          </Button>
          {MODES.map((mode) => (
            <Button
              key={mode.id}
              variant={selectedMode === mode.name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMode(mode.name)}
              className="w-full flex items-center gap-2"
            >
              <span>{mode.icon}</span>
              <span>{mode.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};