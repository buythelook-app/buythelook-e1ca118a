import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface PhotoUploadStepProps {
  photo: File | null;
  onPhotoChange: (file: File) => void;
}

export const PhotoUploadStep = ({ photo, onPhotoChange }: PhotoUploadStepProps) => {
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
                onPhotoChange(file);
              }
            }}
          />
        </div>
        {photo && (
          <p className="text-netflix-accent">Photo uploaded: {photo.name}</p>
        )}
      </div>
    </div>
  );
};