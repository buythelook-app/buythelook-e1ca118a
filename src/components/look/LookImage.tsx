
import { AspectRatio } from "../ui/aspect-ratio";
import { useState, useEffect } from "react";
import { transformImageUrl, getDefaultImageByType } from "@/utils/imageUtils";

interface LookImageProps {
  image: string;
  title: string;
  type?: string;
}

export const LookImage = ({ image, title, type = 'default' }: LookImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  
  useEffect(() => {
    if (!image) {
      console.warn('No image URL provided for', title);
      setImageError(true);
      return;
    }
    
    // Transform the image URL
    const transformedUrl = transformImageUrl(image);
    console.log(`[LookImage] Transformed URL for ${title}:`, transformedUrl, 'Original:', image);
    setImgSrc(transformedUrl);
  }, [image, title]);
  
  // Always use local fallback instead of relying on Imgur
  const fallbackImage = '/placeholder.svg';
  
  // Handle fallback directly
  const handleImageError = () => {
    console.error(`[LookImage] Error loading image for ${title}:`, imgSrc);
    setImageError(true);
    setImageLoaded(true);
  };

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
          <span className="text-xs text-gray-400 mt-1">Using fallback image</span>
        </div>
      )}
      <img 
        src={imageError ? fallbackImage : imgSrc} 
        alt={title}
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => {
          console.log('[LookImage] Image loaded successfully:', imgSrc);
          setImageLoaded(true);
        }}
        onError={handleImageError}
      />
    </AspectRatio>
  );
};
