
import { AspectRatio } from "../ui/aspect-ratio";
import { useState, useEffect } from "react";
import { transformImageUrl } from "@/utils/imageUtils";

interface LookImageProps {
  image: string;
  title: string;
}

export const LookImage = ({ image, title }: LookImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  
  useEffect(() => {
    const transformedUrl = transformImageUrl(image);
    console.log('Transformed image URL:', transformedUrl, 'Original:', image);
    setImgSrc(transformedUrl);
  }, [image]);
  
  const fallbackImage = '/placeholder-image.jpg';
  
  return (
    <AspectRatio ratio={3/4} className="relative overflow-hidden bg-gray-100">
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-netflix-accent animate-spin"></div>
        </div>
      )}
      <img 
        src={imageError ? fallbackImage : imgSrc} 
        alt={title}
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => {
          console.log('Image loaded successfully:', imgSrc);
          setImageLoaded(true);
        }}
        onError={(e) => {
          console.error(`Error loading image: ${imgSrc}`, e);
          setImageError(true);
          setImageLoaded(true);
        }}
      />
    </AspectRatio>
  );
};
