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
    setFormData(prev => ({
      ...prev,
      stylePreferences: [selectedStyle]
    }));
  };

  const getStyleComparison = (step: number) => {
    const currentPreference = formData.stylePreferences[0];
    
    // If we have a current preference, show it against a new option
    if (currentPreference) {
      const remainingStyles = allStyles.filter(style => 
        style.name !== currentPreference && 
        !formData.stylePreferences.includes(style.name)
      );
      
      // If we've shown all options, keep the last preferred style
      if (remainingStyles.length === 0) {
        return {
          style1: allStyles.find(s => s.name === currentPreference)!,
          style2: allStyles.find(s => s.name !== currentPreference)!
        };
      }
      
      // Show current preference against a random new option
      return {
        style1: allStyles.find(s => s.name === currentPreference)!,
        style2: remainingStyles[Math.floor(Math.random() * remainingStyles.length)]
      };
    }
    
    // For first comparison, show two random options
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
