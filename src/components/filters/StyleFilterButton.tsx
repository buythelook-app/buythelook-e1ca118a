import { Filter } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { CategoryFilter } from "./CategoryFilter";
import { StylePreferencesFilter } from "./StylePreferencesFilter";
import { ModeFilter } from "./ModeFilter";
import { ColorFilter } from "./ColorFilter";
import { useNavigate } from "react-router-dom";

interface StyleFilterButtonProps {
  selectedCategory: Category;
  setSelectedCategory: (category: Category) => void;
  selectedStyle: Style | "All";
  setSelectedStyle: (style: Style | "All") => void;
  selectedMode: Mode;
  setSelectedMode: (mode: Mode) => void;
  selectedColor: Color;
  setSelectedColor: (color: Color) => void;
}

export type Category = "New" | "Casual" | "Work" | "Party" | "All";
export type Mode = "All" | "Casual" | "Formal" | "Business" | "Party" | "Sport";
export type Color = "All" | "Black" | "White" | "Blue" | "Red" | "Green" | "Purple" | "Pink";
export type Style = "classic" | "sportive" | "elegant" | "minimalist" | "romantic" | "boohoo";

export const StyleFilterButton = ({
  selectedCategory,
  setSelectedCategory,
  selectedStyle,
  setSelectedStyle,
  selectedMode,
  setSelectedMode,
  selectedColor,
  setSelectedColor,
}: StyleFilterButtonProps) => {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 bg-netflix-card text-netflix-text border-netflix-accent">
        <CategoryFilter
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        
        <DropdownMenuSeparator />
        <StylePreferencesFilter
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
        />

        <DropdownMenuSeparator />
        <ModeFilter
          selectedMode={selectedMode}
          setSelectedMode={setSelectedMode}
        />

        <DropdownMenuSeparator />
        <ColorFilter
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />

        <DropdownMenuSeparator />
        <div className="p-2">
          <Button
            onClick={() => navigate('/budget')}
            className="w-full bg-netflix-accent hover:bg-opacity-80"
          >
            Set Your Budget
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};