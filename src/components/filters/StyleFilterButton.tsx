import { Filter } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
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
export type Mode = "All" | "Relaxing" | "Party" | "Work" | "Date" | "Travel" | "Shopping" | "Sport" | "Casual";
export type Color = "All" | "warm & cold" | "natural" | "monochrome" | "highlight";
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
        <Button 
          variant="outline" 
          size="icon"
          className="relative"
        >
          <Filter className="h-4 w-4" />
          {(selectedCategory !== "All" || selectedStyle !== "All" || selectedMode !== "All" || selectedColor !== "All") && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-netflix-accent rounded-full" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[350px] bg-netflix-card text-netflix-text border-netflix-accent p-4"
        align="end"
      >
        <StylePreferencesFilter
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
        />

        <DropdownMenuSeparator className="my-4" />
        
        <CategoryFilter
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <DropdownMenuSeparator className="my-4" />
        
        <ModeFilter
          selectedMode={selectedMode}
          setSelectedMode={setSelectedMode}
        />

        <DropdownMenuSeparator className="my-4" />
        
        <ColorFilter
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />

        <DropdownMenuSeparator className="my-4" />
        
        <Button
          onClick={() => navigate('/budget')}
          className="w-full bg-netflix-accent hover:bg-opacity-80"
        >
          Set Your Budget
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};