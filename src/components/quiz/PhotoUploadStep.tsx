
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { useState } from "react";

interface PhotoUploadStepProps {
  photo: File | null;
  onPhotoChange: (file: File) => void;
}

export const PhotoUploadStep = ({ photo, onPhotoChange }: PhotoUploadStepProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediately update UI with the selected file
    onPhotoChange(file);
    
    // Skip actual upload if file is too large (optional optimization)
    if (file.size > 10 * 1024 * 1024) {
      console.warn("File is larger than 10MB, skipping upload");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create a FormData object for the file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Use the XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      // Set up progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });
      
      // Set up completion handler
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('Upload successful');
          setIsUploading(false);
        } else {
          console.error('Upload failed', xhr.statusText);
          setIsUploading(false);
        }
      });
      
      // Set up error handler
      xhr.addEventListener('error', () => {
        console.error('Upload failed');
        setIsUploading(false);
      });
      
      // Open and send the request
      xhr.open('POST', 'https://bc0cf4d7-9a35-4a65-b424-9d5ecd554d30.lovableproject.com/upload');
      xhr.send(formData);
      
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-display font-semibold mb-6">Upload a photo (optional)</h2>
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <div className="w-full max-w-xs">
          <Label htmlFor="photo" className="cursor-pointer">
            <div className={`border-2 border-dashed ${isUploading ? 'border-gray-400' : 'border-netflix-accent'} rounded-lg p-8 text-center hover:bg-netflix-card transition-colors`}>
              <Upload className="mx-auto mb-4" />
              <p>{isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}</p>
              <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
              
              {isUploading && (
                <div className="w-full mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-netflix-accent transition-all duration-300 ease-in-out" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{uploadProgress}% uploaded</p>
                </div>
              )}
            </div>
          </Label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
        {photo && !isUploading && (
          <div className="text-center">
            <p className="text-netflix-accent">Photo uploaded: {photo.name}</p>
            <img 
              src={URL.createObjectURL(photo)} 
              alt="Preview" 
              className="mt-2 max-h-48 rounded-md object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
};
