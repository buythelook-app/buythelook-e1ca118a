import { useQuizContext } from "./QuizContext";
import { GenderStep } from "./GenderStep";
import { MeasurementsStep } from "./MeasurementsStep";
import { BodyShapeStep } from "./BodyShapeStep";
import { PhotoUploadStep } from "./PhotoUploadStep";
import { ColorPreferencesStep } from "./ColorPreferencesStep";
import { StyleComparisonStep } from "./StyleComparisonStep";

const allStyles = [
  { name: "Modern", image: "/lovable-uploads/37542411-4b25-4f10-9cc8-782a286409a1.png" },
  { name: "Classy", image: "/lovable-uploads/6b74141f-5751-428f-b484-52cae35335ff.png" },
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
    const stepIndex = step - 8; // Adjust for the first 7 steps
    
    if (currentPreference) {
      // Get remaining styles that haven't been compared yet
      const remainingStyles = allStyles.filter(style => 
        style.name !== currentPreference && 
        !formData.stylePreferences.includes(style.name)
      );
      
      // If we still have styles to compare
      if (remainingStyles.length > 0) {
        return {
          style1: allStyles.find(s => s.name === currentPreference)!,
          style2: remainingStyles[stepIndex % remainingStyles.length]
        };
      }
      
      // If we've compared all styles, show the final preference against a random different style
      const otherStyles = allStyles.filter(s => s.name !== currentPreference);
      return {
        style1: allStyles.find(s => s.name === currentPreference)!,
        style2: otherStyles[Math.floor(Math.random() * otherStyles.length)]
      };
    }
    
    // For first comparison, show first two styles
    return {
      style1: allStyles[0],
      style2: allStyles[1]
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
    case 11:
    case 12:
    case 13:
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
