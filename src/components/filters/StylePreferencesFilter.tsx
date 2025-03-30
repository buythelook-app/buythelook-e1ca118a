
import { Button } from "../ui/button";
import { DropdownMenuLabel } from "../ui/dropdown-menu";
import { Style } from "./StyleFilterButton";

const STYLES = [
  { id: "classic", name: "Classic", image: "/lovable-uploads/028933c6-ec95-471c-804c-0aa31a0e1f15.png", description: "Timeless and elegant pieces that never go out of style." },
  { id: "minimalist", name: "Minimalist", image: "/lovable-uploads/553ba2e6-53fd-46dd-82eb-64121072a826.png", description: "Clean lines, neutral colors, high-quality basics." },
  { id: "casual", name: "Casual", image: "/lovable-uploads/6fe5dff3-dfba-447b-986f-7281b45a0703.png", description: "Comfortable everyday wear with a relaxed fit." },
  { id: "sportive", name: "Sportive", image: "/lovable-uploads/b2b5da4b-c967-4791-8832-747541e275be.png", description: "Athletic-inspired pieces with functional design." },
  { id: "elegant", name: "Elegant", image: "/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png", description: "Refined pieces for formal and special occasions." },
  { id: "nordic", name: "Nordic", image: "/lovable-uploads/a1785297-040b-496d-a2fa-af4ecb55207a.png", description: "Scandinavian simplicity with natural elements." },
  { id: "romantic", name: "Romantic", image: "/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png", description: "Soft, feminine styles with delicate details." },
  { id: "boohoo", name: "Boohoo", image: "/lovable-uploads/386cf438-be54-406f-9dbb-6495a8f8bde9.png", description: "Eclectic with a mix of patterns and textures." },
];

// Minimalist wardrobe essentials reference - updated with user's images as inspiration
const MINIMALIST_ESSENTIALS = {
  tops: [
    "Solid black tank top",
    "White button-down shirt",
    "Basic solid t-shirts",
    "Sleeveless black tops",
    "White sleeveless blouse"
  ],
  bottoms: [
    "Brown wrap skirt",
    "Black wide-leg pants",
    "Black tailored trousers",
    "Solid neutral midi skirts",
    "High-waisted linen pants"
  ],
  outerwear: [
    "Structured blazer",
    "Minimal black jacket",
    "Linen overshirt",
    "Simple cardigan"
  ],
  shoes: [
    "Flat leather sandals",
    "Simple black slides",
    "Minimal leather loafers",
    "Ballet flats",
    "Clean leather mules"
  ],
  colors: [
    "Black",
    "White",
    "Brown",
    "Beige",
    "Camel",
    "Navy",
    "Cream"
  ]
};

interface StylePreferencesFilterProps {
  selectedStyle: Style | "All";
  setSelectedStyle: (style: Style | "All") => void;
}

export const StylePreferencesFilter = ({ selectedStyle, setSelectedStyle }: StylePreferencesFilterProps) => {
  // When minimalist is selected, store the essentials in localStorage for later use
  const handleStyleSelect = (style: Style) => {
    setSelectedStyle(style);
    
    if (style === "minimalist") {
      try {
        localStorage.setItem('minimalist-essentials', JSON.stringify(MINIMALIST_ESSENTIALS));
        
        // Also add style examples based on the user's images
        const styleExamples = [
          "/lovable-uploads/ceb94149-085a-410c-b9dd-85947849c228.png",
          "/lovable-uploads/2d38a525-ebca-4ba5-9704-556c80f030c4.png"
        ];
        localStorage.setItem('minimalist-examples', JSON.stringify(styleExamples));
        
        // Store style recommendations
        const recommendations = [
          "Focus on solid colors without patterns",
          "Choose high-quality pieces with simple silhouettes",
          "Pair black tops with brown or neutral bottoms",
          "Use minimal accessories to complete the look",
          "Look for clean lines and avoid embellishments"
        ];
        localStorage.setItem('style-recommendations', JSON.stringify(recommendations));
      } catch (error) {
        console.error("Error storing minimalist essentials:", error);
      }
    }
  };

  return (
    <div className="p-4 bg-netflix-card rounded-lg">
      <DropdownMenuLabel className="text-lg font-semibold mb-4">Style Preferences</DropdownMenuLabel>
      <div className="grid grid-cols-2 gap-4">
        {STYLES.map((style) => (
          <Button
            key={style.id}
            variant={selectedStyle === style.id ? "default" : "outline"}
            className={`flex items-center gap-2 w-full p-3 h-auto ${
              selectedStyle === style.id ? 'bg-netflix-accent text-white' : ''
            } ${style.id === "minimalist" ? 'border-2 border-netflix-accent' : ''}`}
            onClick={() => handleStyleSelect(style.id as Style)}
          >
            <img 
              src={style.image} 
              alt={style.name} 
              className="w-12 h-12 rounded-full object-cover border-2 border-netflix-accent"
            />
            <div className="text-left">
              <span className="text-sm font-medium block">{style.name}</span>
              {style.id === "minimalist" && selectedStyle === style.id && (
                <span className="text-xs opacity-80 mt-1 block">Clean lines, quality basics, solid colors</span>
              )}
            </div>
          </Button>
        ))}
      </div>

      {selectedStyle === "minimalist" && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-netflix-accent mb-2">Minimalist Essentials:</p>
          <div className="text-xs text-gray-300 grid grid-cols-2 gap-x-4 gap-y-1">
            <div>
              <span className="font-semibold block mb-1">Inspiration:</span>
              <div className="flex space-x-2 mt-1">
                <img 
                  src="/lovable-uploads/ceb94149-085a-410c-b9dd-85947849c228.png" 
                  alt="Minimalist style inspiration" 
                  className="w-12 h-12 object-cover rounded"
                />
                <img 
                  src="/lovable-uploads/2d38a525-ebca-4ba5-9704-556c80f030c4.png" 
                  alt="Minimalist style inspiration" 
                  className="w-12 h-12 object-cover rounded"
                />
              </div>
            </div>
            <div>
              <span className="font-semibold block mb-1">Key Pieces:</span>
              <span className="opacity-80">Black top & skirt, White top & wide-leg pants, Flat sandals</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
