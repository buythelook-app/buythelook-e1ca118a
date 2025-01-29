import { useQuizContext } from "./QuizContext";
import { GenderStep } from "./GenderStep";
import { MeasurementsStep } from "./MeasurementsStep";
import { BodyShapeStep } from "./BodyShapeStep";
import { PhotoUploadStep } from "./PhotoUploadStep";
import { ColorPreferencesStep } from "./ColorPreferencesStep";
import { StyleComparisonStep } from "./StyleComparisonStep";

const allStyles = [
  { name: "Modern", image: "/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png" },
  { name: "Classy", image: "/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png" },
  { name: "Boo Hoo", image: "/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png" },
  { name: "Nordic", image: "/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png" },
  { name: "Sporty", image: "/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png" },
  { name: "Elegance", image: "/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png" }
];

export const QuizStepRenderer = () => {
  const { step, formData, setFormData } = useQuizContext();

  const handleStyleSelect = (selectedStyle: string) => {
    const currentPreferences = formData.stylePreferences;
    let newPreferences: string[];

    if (currentPreferences.length === 0) {
      // First selection
      newPreferences = [selectedStyle];
    } else {
      // Keep only the most recently selected style
      newPreferences = [selectedStyle];
    }

    setFormData(prev => ({
      ...prev,
      stylePreferences: newPreferences
    }));
  };

  const getStyleComparison = (step: number) => {
    const previousStyle = formData.stylePreferences[0];
    const remainingStyles = allStyles.filter(style => 
      style.name !== previousStyle && 
      !formData.stylePreferences.includes(style.name)
    );
    
    // If we have a previous selection, show it against a new option
    if (previousStyle && remainingStyles.length > 0) {
      const newStyleOption = remainingStyles[Math.floor(Math.random() * remainingStyles.length)];
      return {
        style1: allStyles.find(s => s.name === previousStyle)!,
        style2: newStyleOption
      };
    }
    
    // For first comparison or if we need new options
    const randomIndex = Math.floor(Math.random() * (allStyles.length - 1));
    return {
      style1: allStyles[randomIndex],
      style2: allStyles[randomIndex + 1]
    };
  };

  switch (step) {
    case 1:
      return (
        <GenderStep
          value={formData.gender}
          onChange={(value) => setFormData({ ...formData, gender: value })}
        />
      );
    case 2:
    case 3:
    case 4:
      return (
        <MeasurementsStep
          height={formData.height}
          weight={formData.weight}
          waist={formData.waist}
          chest={formData.chest}
          onHeightChange={(value) => setFormData({ ...formData, height: value })}
          onWeightChange={(value) => setFormData({ ...formData, weight: value })}
          onWaistChange={(value) => setFormData({ ...formData, waist: value })}
          onChestChange={(value) => setFormData({ ...formData, chest: value })}
          step={step}
        />
      );
    case 5:
      return (
        <BodyShapeStep
          value={formData.bodyShape}
          onChange={(value) => setFormData({ ...formData, bodyShape: value })}
        />
      );
    case 6:
      return (
        <PhotoUploadStep
          photo={formData.photo}
          onPhotoChange={(file) => setFormData({ ...formData, photo: file })}
        />
      );
    case 7:
      return (
        <ColorPreferencesStep
          selectedColors={formData.colorPreferences}
          onColorToggle={(color) => {
            const newColors = formData.colorPreferences.includes(color)
              ? formData.colorPreferences.filter((c) => c !== color)
              : [...formData.colorPreferences, color];
            setFormData({ ...formData, colorPreferences: newColors });
          }}
        />
      );
    case 8:
    case 9:
    case 10:
      const comparison = getStyleComparison(step);
      return (
        <StyleComparisonStep
          style1={comparison.style1}
          style2={comparison.style2}
          onSelect={handleStyleSelect}
        />
      );
    default:
      return null;
  }
};
