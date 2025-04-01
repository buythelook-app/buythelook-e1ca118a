
import { AspectRatio } from "../ui/aspect-ratio";
import { useState, useEffect } from "react";
import { transformImageUrl } from "@/utils/imageUtils";

interface LookImageProps {
  image: string;
  title: string;
  type?: string;
}

export const LookImage = ({ image, title, type = 'default' }: LookImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [displayImage, setDisplayImage] = useState<string>('/placeholder.svg');
  
  useEffect(() => {
    if (!image) {
      console.log(`[LookImage] No image provided for ${title}, using placeholder`);
      setImageError(true);
      setDisplayImage('/placeholder.svg');
      return;
    }
    
    // Always use placeholder for imgur URLs
    if (image.includes('imgur.com')) {
      console.log(`[LookImage] Using placeholder for imgur URL: ${image}`);
      setImageError(true);
      setDisplayImage('/placeholder.svg');
      return;
    }
    
    try {
      const transformed = transformImageUrl(image);
      console.log(`[LookImage] Transformed URL for ${title}: ${transformed} (original: ${image})`);
      setDisplayImage(transformed);
      // Reset error state when changing image
      setImageError(false);
      setImageLoaded(false);
    } catch (error) {
      console.error(`[LookImage] Error transforming URL: ${error}`);
      setImageError(true);
      setDisplayImage('/placeholder.svg');
    }
  }, [image, title]);

  return (
    <AspectRatio ratio={3/4} className="relative overflow-hidden bg-gray-100">
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-netflix-accent animate-spin"></div>
        </div>
      )}
      
      <img 
        src={imageError ? '/placeholder.svg' : displayImage} 
        alt={title}
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => {
          console.log('[LookImage] Image loaded successfully:', displayImage);
          setImageLoaded(true);
        }}
        onError={() => {
          console.error('[LookImage] Error loading image:', displayImage);
          setImageError(true);
          setImageLoaded(true);
          setDisplayImage('/placeholder.svg');
        }}
      />
      
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 p-4 text-center">
          <span className="text-sm text-gray-500">Image not available</span>
          <span className="text-xs text-gray-400 mt-1">{type}</span>
        </div>
      )}
    </AspectRatio>
  );
};
