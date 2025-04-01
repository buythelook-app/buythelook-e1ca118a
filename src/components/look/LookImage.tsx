
import { AspectRatio } from "../ui/aspect-ratio";
import { useState, useEffect } from "react";
import { getDefaultImageByType } from "@/utils/imageUtils";

interface LookImageProps {
  image: string;
  title: string;
  type?: string;
}

export const LookImage = ({ image, title, type = 'default' }: LookImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Always use local fallback
  const fallbackImage = '/placeholder.svg';
  
  // Handle fallback directly
  const handleImageError = () => {
    console.error(`[LookImage] Error loading image for ${title}:`, image);
    setImageError(true);
    setImageLoaded(true);
  };

  // Log image details
  useEffect(() => {
    console.log(`[LookImage] Rendering ${title} with image:`, image);
    if (!image) {
      console.warn('[LookImage] No image URL provided for', title);
      setImageError(true);
    }
  }, [image, title]);

  return (
    <AspectRatio ratio={3/4} className="relative overflow-hidden bg-gray-100">
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-netflix-accent animate-spin"></div>
        </div>
      )}
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 p-4 text-center">
          <span className="text-sm text-gray-500">Image not available</span>
          <span className="text-xs text-gray-400 mt-1">{type}</span>
        </div>
      )}
      <img 
        src={imageError ? fallbackImage : image} 
        alt={title}
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => {
          console.log('[LookImage] Image loaded successfully:', image);
          setImageLoaded(true);
        }}
        onError={handleImageError}
      />
    </AspectRatio>
  );
};
