
import { AspectRatio } from "../ui/aspect-ratio";
import { useState } from "react";
import { transformImageUrl } from "@/utils/imageUtils";

interface LookImageProps {
  image: string;
  title: string;
}

export const LookImage = ({ image, title }: LookImageProps) => {
  const [imageError, setImageError] = useState(false);
  const transformedImageUrl = transformImageUrl(image);
  const fallbackImage = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158';
  
  return (
    <AspectRatio ratio={3/4} className="relative overflow-hidden">
      <img 
        src={imageError ? fallbackImage : transformedImageUrl} 
        alt={title}
        className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300"
        onError={(e) => {
          console.error(`Error loading image: ${transformedImageUrl}`);
          setImageError(true);
        }}
      />
    </AspectRatio>
  );
};
