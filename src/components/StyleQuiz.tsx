import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { GenderStep } from "./quiz/GenderStep";
import { MeasurementsStep } from "./quiz/MeasurementsStep";
import { BodyShapeStep } from "./quiz/BodyShapeStep";
import { PhotoUploadStep } from "./quiz/PhotoUploadStep";
import { ColorPreferencesStep } from "./quiz/ColorPreferencesStep";
import { useNavigate } from "react-router-dom";

export const StyleQuiz = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: "",
    height: "",
    weight: "",
    waist: "",
    chest: "",
    bodyShape: "",
    photo: null as File | null,
    colorPreferences: [] as string[],
  });

  const handleNext = () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const validateCurrentStep = () => {
    switch (step) {
      case 1:
        return formData.gender !== "";
      case 2:
        return formData.height !== "";
      case 3:
        return formData.weight !== "";
      case 4:
        return formData.waist !== "" && formData.chest !== "";
      case 5:
        return formData.bodyShape !== "";
      case 6:
        return true; // Photo is optional
      case 7:
        return formData.colorPreferences.length > 0;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Quiz completed!",
      description: "We'll prepare your personalized style recommendations.",
    });
    navigate('/suggestions');
  };

  const renderStep = () => {
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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="bg-netflix-card rounded-lg p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-display font-bold">Style Quiz</h1>
              <p className="text-netflix-accent">Step {step} of 7</p>
            </div>
            <div className="w-full bg-netflix-background rounded-full h-2">
              <div
                className="bg-netflix-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 7) * 100}%` }}
              />
            </div>
          </div>

          {renderStep()}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back
              </Button>
            )}
            <div className="ml-auto">
              {step < 7 ? (
                <Button
                  onClick={handleNext}
                  className="bg-netflix-accent hover:bg-netflix-accent/90 flex items-center gap-2"
                >
                  Next
                  <ArrowRight size={16} />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-netflix-accent hover:bg-netflix-accent/90"
                >
                  Complete Quiz
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};