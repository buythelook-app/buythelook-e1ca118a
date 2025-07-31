import { Label } from "@/components/ui/label";

interface ColorPreferencesStepProps {
  selectedColors: string[];
  onColorToggle: (color: string) => void;
}

export const ColorPreferencesStep = ({ selectedColors, onColorToggle }: ColorPreferencesStepProps) => {
  const colorOptions = [
    { value: "warm", label: "Warm Tones", description: "Reds, oranges, yellows" },
    { value: "cool", label: "Cool Tones", description: "Blues, greens, purples" },
    { value: "neutral", label: "Neutrals", description: "Beiges, grays, whites" },
    { value: "bright", label: "Bright Colors", description: "Vibrant and bold" },
    { value: "pastel", label: "Pastels", description: "Soft and muted" },
    { value: "dark", label: "Dark Tones", description: "Black, navy, burgundy" },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-light text-fashion-dark mb-3">
          What colors speak to you?
        </h2>
        <p className="text-fashion-muted">Choose the color palettes that you're naturally drawn to</p>
      </div>
      
      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {colorOptions.map((color) => (
            <div 
              key={color.value} 
              className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-md ${
                selectedColors.includes(color.value) 
                  ? "border-fashion-accent bg-fashion-accent/5 shadow-lg" 
                  : "border-fashion-border hover:border-fashion-accent/50 bg-white"
              }`} 
              onClick={() => onColorToggle(color.value)}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedColors.includes(color.value)
                    ? "border-fashion-accent bg-fashion-accent"
                    : "border-fashion-muted group-hover:border-fashion-accent"
                }`}>
                  {selectedColors.includes(color.value) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <Label 
                    htmlFor={color.value} 
                    className="text-lg font-medium cursor-pointer text-fashion-dark block mb-1"
                  >
                    {color.label}
                  </Label>
                  <p className="text-sm text-fashion-muted">{color.description}</p>
                </div>
              </div>
              
              <input
                type="checkbox"
                id={color.value}
                checked={selectedColors.includes(color.value)}
                onChange={() => onColorToggle(color.value)}
                className="sr-only"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};