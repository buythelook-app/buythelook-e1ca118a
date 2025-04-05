
import { useEffect, useState } from "react";
import { transformImageUrl } from "@/utils/imageUtils";

interface LookImageProps {
  image: string;
  title: string;
  height?: number;
}

export const LookImage = ({ image, title, height = 400 }: LookImageProps) => {
  const [displayImage, setDisplayImage] = useState<string>('/placeholder.svg');
  
  useEffect(() => {
    try {
      // Special handling for URLs that need transformation
      if (image.startsWith('canvas-') || !image || image.includes('supabase')) {
        console.log(`[LookImage] Using placeholder for unrecognized URL pattern: ${image}`);
        setDisplayImage('/placeholder.svg');
      } else {
        const transformedUrl = transformImageUrl(image);
        console.log(`[LookImage] Transformed URL for ${title}: ${transformedUrl} (original: ${image})`);
        setDisplayImage(transformedUrl);
      }
    } catch (error) {
      console.error(`[LookImage] Error processing image for ${title}:`, error);
      setDisplayImage('/placeholder.svg');
    }
  }, [image, title]);

  // Log when image is loaded successfully
  const handleImageLoad = () => {
    console.log(`[LookImage] Image loaded successfully: ${displayImage}`);
  };

  return (
    <div 
      className="bg-gray-100 overflow-hidden relative"
      style={{ height: `${height}px` }}
    >
      <img 
        src={displayImage} 
        alt={title}
        className="w-full h-full object-cover object-center"
        onLoad={handleImageLoad}
        onError={() => {
          console.error(`[LookImage] Error loading image for ${title}, falling back to placeholder`);
          setDisplayImage('/placeholder.svg');
        }}
      />
    </div>
  );
};
