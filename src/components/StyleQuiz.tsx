import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, ArrowRight, ArrowLeft } from "lucide-react";

export const StyleQuiz = () => {
  const { toast } = useToast();
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
    // Here you would typically send the data to your backend
    toast({
      title: "Quiz completed!",
      description: "We'll prepare your personalized style recommendations.",
    });
    // You can add navigation logic here
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-semibold mb-6">What's your gender?</h2>
            <RadioGroup
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
              className="flex flex-col space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-semibold mb-6">What's your height?</h2>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Height in cm"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-semibold mb-6">What's your weight?</h2>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Weight in kg"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-semibold mb-6">Your measurements</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="waist">Waist (cm)</Label>
                <Input
                  id="waist"
                  type="number"
                  value={formData.waist}
                  onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                  className="w-full mt-1"
                />
              </div>
              <div>
                <Label htmlFor="chest">Chest (cm)</Label>
                <Input
                  id="chest"
                  type="number"
                  value={formData.chest}
                  onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                  className="w-full mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-semibold mb-6">What's your body shape?</h2>
            <RadioGroup
              value={formData.bodyShape}
              onValueChange={(value) => setFormData({ ...formData, bodyShape: value })}
              className="flex flex-col space-y-4"
            >
              {["hourglass", "pear", "rectangle", "triangle", "oval"].map((shape) => (
                <div key={shape} className="flex items-center space-x-2">
                  <RadioGroupItem value={shape} id={shape} />
                  <Label htmlFor={shape} className="capitalize">{shape}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-semibold mb-6">Upload a photo (optional)</h2>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-full max-w-xs">
                <Label htmlFor="photo" className="cursor-pointer">
                  <div className="border-2 border-dashed border-netflix-accent rounded-lg p-8 text-center hover:bg-netflix-card transition-colors">
                    <Upload className="mx-auto mb-4" />
                    <p>Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                  </div>
                </Label>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, photo: file });
                    }
                  }}
                />
              </div>
              {formData.photo && (
                <p className="text-netflix-accent">Photo uploaded: {formData.photo.name}</p>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-semibold mb-6">Select your color preferences</h2>
            <div className="grid grid-cols-2 gap-4">
              {["warm", "cool", "neutral", "bright", "pastel", "dark"].map((color) => (
                <div key={color} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={color}
                    checked={formData.colorPreferences.includes(color)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          colorPreferences: [...formData.colorPreferences, color],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          colorPreferences: formData.colorPreferences.filter((c) => c !== color),
                        });
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={color} className="capitalize">{color}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-netflix-background text-netflix-text py-8">
      <div className="container max-w-2xl mx-auto px-4">
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