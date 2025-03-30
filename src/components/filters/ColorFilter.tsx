
import { Button } from "../ui/button";
import { DropdownMenuLabel } from "../ui/dropdown-menu";
import { Color } from "./StyleFilterButton";

const COLORS = ["All", "warm & cold", "natural", "monochrome", "highlight", "earth tones"] as const;

interface ColorFilterProps {
  selectedColor: Color;
  setSelectedColor: (color: Color) => void;
}

export const ColorFilter = ({ selectedColor, setSelectedColor }: ColorFilterProps) => {
  return (
    <>
      <DropdownMenuLabel>Colors</DropdownMenuLabel>
      <div className="p-2">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <Button
              key={color}
              variant={selectedColor === color ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedColor(color as Color)}
              className={color === "natural" || color === "earth tones" ? "border-2 border-netflix-accent" : ""}
            >
              {color}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};
