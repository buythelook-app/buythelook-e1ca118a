import { Button } from "../ui/button";
import { DropdownMenuLabel } from "../ui/dropdown-menu";
import { Style } from "./StyleFilterButton";

const STYLES = [
  { id: "classic", name: "Classic", image: "https://images.unsplash.com/photo-1490725263030-1f0521cec8ec?w=500&auto=format" },
  { id: "sportive", name: "Sportive", image: "https://images.unsplash.com/photo-1483721310020-03333e577078?w=500&auto=format" },
  { id: "elegant", name: "Elegant", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format" },
  { id: "minimalist", name: "Minimalist", image: "https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=500&auto=format" },
  { id: "romantic", name: "Romantic", image: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=500&auto=format" },
  { id: "boohoo", name: "Boohoo", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&auto=format" },
];

interface StylePreferencesFilterProps {
  selectedStyle: Style | "All";
  setSelectedStyle: (style: Style | "All") => void;
}

export const StylePreferencesFilter = ({ selectedStyle, setSelectedStyle }: StylePreferencesFilterProps) => {
  return (
    <>
      <DropdownMenuLabel>Style Preferences</DropdownMenuLabel>
      <div className="p-2">
        <div className="grid grid-cols-2 gap-2">
          {STYLES.map((style) => (
            <Button
              key={style.id}
              variant={selectedStyle === style.id ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2 w-full"
              onClick={() => setSelectedStyle(style.id as Style)}
            >
              <img 
                src={style.image} 
                alt={style.name} 
                className="w-8 h-8 rounded-full object-cover"
              />
              {style.name}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};