import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AIPreviewProps {
  lookImage: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AIPreview = ({ lookImage, isOpen, onClose }: AIPreviewProps) => {
  const [apiKey, setApiKey] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generatePreview = async () => {
    if (!apiKey) {
      toast.error("Please enter your Replicate API key");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/replicate/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${apiKey}`,
        },
        body: JSON.stringify({
          version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
          input: {
            prompt: "Generate a realistic photo of a person wearing the outfit shown in this reference image, maintaining the style and colors",
            image: lookImage,
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 50,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate preview");
      }

      const data = await response.json();
      if (data.output && data.output[0]) {
        setGeneratedImage(data.output[0]);
      }
    } catch (error) {
      toast.error("Failed to generate preview. Please check your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Try On Preview</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!generatedImage ? (
            <>
              <Input
                type="password"
                placeholder="Enter your Replicate API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Button 
                onClick={generatePreview} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Preview"
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <img 
                src={generatedImage} 
                alt="AI Generated Preview" 
                className="w-full rounded-lg"
              />
              <Button onClick={() => setGeneratedImage(null)} variant="outline">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};