
import { AspectRatio } from "../ui/aspect-ratio";
import { extractZaraImageUrl, extractShoesImageUrl } from "@/utils/imageUtils";
import { useState } from "react";

interface LookImageProps {
  image: string;
  title: string;
  type?: string;
}

export const LookImage = ({ image, title, type }: LookImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use specific shoe image extraction for shoes, general for others
  const imageUrl = type === 'shoes' 
    ? extractShoesImageUrl(image) 
    : extractZaraImageUrl(image);
  
  const handleImageLoad = () => {
    setIsLoading(false);
    console.log(`✅ [LookImage] Successfully loaded ${type || 'item'} image: ${imageUrl}`);
  };
  
  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
    console.error(`❌ [LookImage] Failed to load ${type || 'item'} image: ${imageUrl}`);
  };
  
  return (
    <AspectRatio ratio={3/4} className="relative overflow-hidden bg-gray-100">
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse bg-gray-300 w-full h-full"></div>
        </div>
      )}
      
      {/* Main image */}
      <img 
        src={imageUrl} 
        alt={title}
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      
      {/* Error state with type-specific placeholder */}
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
          <div className="text-4xl mb-2">
            {type === 'shoes' ? '👟' : 
             type === 'dress' ? '👗' : 
             type === 'top' ? '👕' : 
             type === 'bottom' ? '👖' : 
             type === 'outerwear' ? '🧥' : '👔'}
          </div>
          <div className="text-sm text-center px-2">
            {type === 'shoes' ? 'נעליים' : 
             type === 'dress' ? 'שמלה' : 
             type === 'top' ? 'חולצה' : 
             type === 'bottom' ? 'מכנס' : 
             type === 'outerwear' ? 'מעיל' : 'פריט'}
          </div>
        </div>
      )}
    </AspectRatio>
  );
};
