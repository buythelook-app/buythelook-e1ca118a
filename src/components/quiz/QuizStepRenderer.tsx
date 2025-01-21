import { useQuizContext } from "./QuizContext";
import { GenderStep } from "./GenderStep";
import { MeasurementsStep } from "./MeasurementsStep";
import { BodyShapeStep } from "./BodyShapeStep";
import { PhotoUploadStep } from "./PhotoUploadStep";
import { ColorPreferencesStep } from "./ColorPreferencesStep";
import { StyleComparisonStep } from "./StyleComparisonStep";

const styleComparisons = [
  {
    style1: { name: "Modern", image: "/placeholder.svg" },
    style2: { name: "Classy", image: "/placeholder.svg" }
  },
  {
    style1: { name: "Boo Hoo", image: "/placeholder.svg" },
    style2: { name: "Nordic", image: "/placeholder.svg" }
  },
  {
    style1: { name: "Sporty", image: "/placeholder.svg" },
    style2: { name: "Elegance", image: "/placeholder.svg" }
  }
];

export const QuizStepRenderer = () => {
  const { step, formData, setFormData } = useQuizContext();

  const handleStyleSelect = (selectedStyle: string) => {
    setFormData(prev => ({
      ...prev,
      stylePreferences: [...prev.stylePreferences, selectedStyle]
    }));
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
      const comparisonIndex = step - 8;
      return (
        <StyleComparisonStep
          style1={styleComparisons[comparisonIndex].style1}
          style2={styleComparisons[comparisonIndex].style2}
          onSelect={handleStyleSelect}
        />
      );
    default:
      return null;
  }
};