import { Button } from "../ui/button";
import { DropdownMenuLabel } from "../ui/dropdown-menu";
import { Mode } from "./StyleFilterButton";

const MODES = ["All", "Casual", "Formal", "Business", "Party", "Sport"];

interface ModeFilterProps {
  selectedMode: Mode;
  setSelectedMode: (mode: Mode) => void;
}

export const ModeFilter = ({ selectedMode, setSelectedMode }: ModeFilterProps) => {
  return (
    <>
      <DropdownMenuLabel>Mode</DropdownMenuLabel>
      <div className="p-2">
        <div className="flex flex-wrap gap-2">
          {MODES.map((mode) => (
            <Button
              key={mode}
              variant={selectedMode === mode ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMode(mode as Mode)}
            >
              {mode}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};