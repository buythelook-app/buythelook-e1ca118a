import { Button } from "../ui/button";
import { DropdownMenuLabel } from "../ui/dropdown-menu";
import { Style } from "./StyleFilterButton";

const STYLES = [
  { id: "classic", name: "Classic", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
  { id: "sportive", name: "Sportive", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
  { id: "elegant", name: "Elegant", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
  { id: "minimalist", name: "Minimalist", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
  { id: "romantic", name: "Romantic", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
  { id: "boohoo", name: "Boohoo", image: "/lovable-uploads/68407ade-0be5-4bc3-ab8a-300ad5130380.png" },
];

interface StylePreferencesFilterProps {
  selectedStyle: Style | "All";
  setSelectedStyle: (style: Style | "All") => void;
}

export const StylePreferencesFilter = ({ selectedStyle, setSelectedStyle }: StylePreferencesFilterProps) => {
  return (
    <div className="p-4 bg-netflix-card rounded-lg">
      <DropdownMenuLabel className="text-lg font-semibold mb-4">Style Preferences</DropdownMenuLabel>
      <div className="grid grid-cols-2 gap-4">
        {STYLES.map((style) => (
          <Button
            key={style.id}
            variant={selectedStyle === style.id ? "default" : "outline"}
            className={`flex items-center gap-2 w-full p-4 ${
              selectedStyle === style.id ? 'bg-netflix-accent text-white' : ''
            }`}
            onClick={() => setSelectedStyle(style.id as Style)}
          >
            <img 
              src={style.image} 
              alt={style.name} 
              className="w-12 h-12 rounded-full object-cover border-2 border-netflix-accent"
            />
            <span className="text-sm font-medium">{style.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};